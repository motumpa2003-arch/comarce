import {
  ORDER_STATUS_META,
  RETURN_REASON_LABELS,
  SHIPPING_METHODS,
  canTransition,
  fulfilmentStatusFor,
  generateOrderNumber,
  generateTrackingNumber,
  getTaxClass,
  paymentStatusFor,
  priceCart,
  type Address,
  type CartLine,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrderStatusEvent,
  type PaymentMethodKind,
  type Product,
  type ReturnReason,
  type ReturnRequest,
} from "@obsidian/commerce";
import { SEED_NOW, getDatabase, type StoreDatabase } from "./database";
import { getStoreDb } from "./repositories";
import { hashString } from "./rng";

/**
 * Write path for the demo.
 *
 * The seeded database is an in-process singleton, so these mutations behave
 * like a real backend for the length of a session: an order placed on the
 * storefront shows up in the merchant admin, moves through the state machine,
 * and draws down inventory. Swap this module for Prisma writes and the rest of
 * the application does not change.
 */

/** Monotonic clock for records created during the session. */
function now(): Date {
  const real = new Date();
  // Keep session records after the seeded ones so ordering stays sensible.
  return real > SEED_NOW ? real : new Date(SEED_NOW.getTime() + 60_000);
}

export interface PlaceOrderInput {
  storeId: string;
  lines: CartLine[];
  customerId?: string;
  contact: { name: string; email: string; phone: string };
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethodId: string;
  paymentMethod: PaymentMethodKind;
  couponCode?: string | null;
  loyaltyPointsRedeemed?: number;
  useStoreCredit?: boolean;
  giftMessage?: string;
  note?: string;
  channel?: Order["channel"];
}

export interface PlaceOrderResult {
  order: Order;
  paymentReference: string;
}

export function placeOrder(input: PlaceOrderInput): PlaceOrderResult {
  const db = getStoreDb(input.storeId);
  const timestamp = now();

  const coupon = input.couponCode
    ? db.coupons.find((c) => c.code.toUpperCase() === input.couponCode!.toUpperCase())
    : undefined;

  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === input.shippingMethodId) ?? SHIPPING_METHODS[0]!;
  const customer = input.customerId ? db.customers.find((c) => c.id === input.customerId) : undefined;

  const totals = priceCart({
    lines: input.lines,
    coupon,
    shippingMethod,
    loyaltyPointsRedeemed: input.loyaltyPointsRedeemed,
    storeCredit: input.useStoreCredit ? (customer?.storeCredit ?? 0) : 0,
    customerSegments: customer?.segments,
    customerId: customer?.id,
  });

  const sequence = db.orders.length + 1;
  const id = `ord_${db.store.id}_live_${sequence}_${timestamp.getTime().toString(36)}`;
  const orderNumber = generateOrderNumber(hashString(id));

  const items: OrderItem[] = input.lines.map((line, index) => {
    const product = db.products.find((p) => p.id === line.productId);
    const taxRate = getTaxClass(product?.taxClassId).rate;
    const lineTotal = line.unitPrice * line.quantity;
    const returnWindow = new Date(timestamp);
    returnWindow.setDate(returnWindow.getDate() + 30);
    return {
      id: `oi_${id}_${index}`,
      orderId: id,
      productId: line.productId,
      variantId: line.variantId,
      name: line.name,
      slug: line.slug,
      brandName: line.brandName,
      variantTitle: line.variantTitle,
      options: line.options,
      image: line.image,
      sku: product?.variants.find((v) => v.id === line.variantId)?.sku ?? product?.sku ?? "",
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      compareAtPrice: line.compareAtPrice,
      discount: 0,
      tax: Math.round(lineTotal - lineTotal / (1 + taxRate / 100)),
      total: lineTotal,
      warehouseId: db.warehouses[0]?.id,
      fulfilmentStatus: "unfulfilled",
      returnable: true,
      returnWindowEndsAt: returnWindow.toISOString(),
    };
  });

  const estimatedDelivery = new Date(timestamp);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + shippingMethod.maxDays);

  const paymentReference = `pay_${orderNumber.slice(-8)}${(timestamp.getTime() % 900) + 100}`;
  const confirmed = input.paymentMethod !== "cod";

  const timeline: OrderStatusEvent[] = [
    event("pending", timestamp, "Customer"),
    ...(confirmed ? [event("confirmed", new Date(timestamp.getTime() + 60_000))] : []),
  ];

  const status: OrderStatus = confirmed ? "confirmed" : "pending";

  const order: Order = {
    id,
    storeId: db.store.id,
    orderNumber,
    customerId: customer?.id ?? "cus_guest",
    customerName: input.contact.name,
    customerEmail: input.contact.email,
    customerPhone: input.contact.phone,
    items,
    itemCount: items.reduce((n, item) => n + item.quantity, 0),
    status,
    paymentStatus: confirmed ? "paid" : "pending",
    fulfilmentStatus: "unfulfilled",
    subtotal: totals.subtotal,
    discount: totals.discount + totals.loyaltyDiscount + totals.storeCreditApplied,
    couponCode: coupon?.code,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    refundedAmount: 0,
    currency: "INR",
    paymentMethod: input.paymentMethod,
    paymentReference,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress ?? input.shippingAddress,
    shippingMethod: shippingMethod.name,
    estimatedDeliveryAt: estimatedDelivery.toISOString(),
    timeline,
    warehouseId: db.warehouses[0]?.id,
    channel: input.channel ?? "web",
    tags: customer ? [] : ["guest"],
    note: input.note,
    giftMessage: input.giftMessage,
    createdAt: timestamp.toISOString(),
    updatedAt: timestamp.toISOString(),
  };

  db.orders.unshift(order);

  db.payments.unshift({
    id: `pay_${id}`,
    storeId: db.store.id,
    orderId: id,
    orderNumber,
    amount: order.total,
    currency: "INR",
    method: input.paymentMethod,
    gateway: input.paymentMethod === "cod" ? "cod" : "razorpay",
    status: confirmed ? "captured" : "pending",
    reference: paymentReference,
    fee: input.paymentMethod === "cod" ? 0 : Math.round(order.total * 0.021),
    netAmount: order.total - (input.paymentMethod === "cod" ? 0 : Math.round(order.total * 0.021)),
    createdAt: timestamp.toISOString(),
  });

  drawDownInventory(db, order);
  bumpAggregates(db, order, customer?.id);

  db.merchantNotifications.unshift({
    id: `ntf_live_${id}`,
    storeId: db.store.id,
    audience: "merchant",
    event: "order_created",
    title: "New order received",
    body: `Order #${orderNumber} — ${order.itemCount} item${order.itemCount > 1 ? "s" : ""}, ₹${Math.round(order.total / 100).toLocaleString("en-IN")}.`,
    icon: "shopping-bag",
    actionUrl: `/admin/orders/${id}`,
    read: false,
    createdAt: timestamp.toISOString(),
    category: "orders",
  });

  if (coupon) coupon.usedCount += 1;

  return { order, paymentReference };
}

function event(status: OrderStatus, at: Date, actor = "System"): OrderStatusEvent {
  return {
    id: `evt_${status}_${at.getTime()}`,
    status,
    label: ORDER_STATUS_META[status].label,
    description: ORDER_STATUS_META[status].description,
    createdAt: at.toISOString(),
    actor,
  };
}

function drawDownInventory(db: StoreDatabase, order: Order) {
  for (const item of order.items) {
    const product = db.products.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    if (product && variant) {
      variant.stock = Math.max(0, variant.stock - item.quantity);
      product.totalStock = product.variants.reduce((n, v) => n + v.stock, 0);
      product.unitsSold += item.quantity;
    }

    const record = db.inventory.find((r) => r.variantId === item.variantId && r.onHand > 0);
    if (record) {
      const before = record.onHand;
      record.onHand = Math.max(0, record.onHand - item.quantity);
      record.updatedAt = order.createdAt;
      db.movements.unshift({
        id: `mv_${order.id}_${item.id}`,
        storeId: db.store.id,
        variantId: item.variantId,
        productId: item.productId,
        warehouseId: record.warehouseId,
        delta: -item.quantity,
        balanceAfter: before,
        reason: "sale",
        referenceType: "order",
        referenceId: order.orderNumber,
        actorName: "Storefront",
        createdAt: order.createdAt,
      });
    }
  }
}

function bumpAggregates(db: StoreDatabase, order: Order, customerId?: string) {
  db.store.metrics.orders += 1;
  db.store.metrics.gmv += order.total;
  db.store.metrics.averageOrderValue = Math.round(db.store.metrics.gmv / db.store.metrics.orders);

  const today = order.createdAt.slice(0, 10);
  const point = db.metrics.find((m) => m.date === today);
  if (point) {
    point.orders += 1;
    point.revenue += order.total;
    point.conversions += 1;
  }

  if (!customerId) return;
  const customer = db.customers.find((c) => c.id === customerId);
  if (!customer) return;
  customer.ordersCount += 1;
  customer.lifetimeValue += order.total;
  customer.averageOrderValue = Math.round(customer.lifetimeValue / customer.ordersCount);
  customer.lastOrderAt = order.createdAt;
  customer.loyaltyPoints += Math.round(order.total / 10000);
}

/* --------------------------- Order operations ----------------------- */

export function advanceOrderStatus(
  storeId: string,
  orderId: string,
  next: OrderStatus,
  actor = "Merchant",
): { ok: true; order: Order } | { ok: false; error: string } {
  const db = getStoreDb(storeId);
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (!canTransition(order.status, next)) {
    return { ok: false, error: `Cannot move an order from ${order.status} to ${next}.` };
  }

  const timestamp = now();
  order.status = next;
  order.paymentStatus = paymentStatusFor(next, order.paymentStatus);
  order.fulfilmentStatus = fulfilmentStatusFor(next);
  order.updatedAt = timestamp.toISOString();
  order.timeline = [...order.timeline, event(next, timestamp, actor)];
  for (const item of order.items) item.fulfilmentStatus = order.fulfilmentStatus;

  if (next === "delivered") order.deliveredAt = timestamp.toISOString();

  if (next === "shipped" && !order.shipmentId) {
    const shipmentId = `shp_${order.id}`;
    const tracking = generateTrackingNumber(hashString(order.id));
    db.shipments.unshift({
      id: shipmentId,
      storeId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      carrier: "Delhivery",
      service: "Express Parcel",
      trackingNumber: tracking,
      trackingUrl: `https://track.obsidian.dev/${tracking}`,
      status: "in_transit",
      weightGrams: order.items.reduce((n, i) => n + i.quantity * 450, 0),
      cost: 12000,
      shippedAt: timestamp.toISOString(),
      estimatedDeliveryAt: order.estimatedDeliveryAt,
      events: [{ label: "Shipped", location: "Bengaluru Sorting Hub", createdAt: timestamp.toISOString() }],
    });
    order.shipmentId = shipmentId;
  }

  if (next === "refunded" || next === "cancelled") {
    order.refundedAmount = order.total;
    restockOrder(db, order);
  }

  return { ok: true, order };
}

function restockOrder(db: StoreDatabase, order: Order) {
  for (const item of order.items) {
    const product = db.products.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    if (!product || !variant) continue;
    variant.stock += item.quantity;
    product.totalStock = product.variants.reduce((n, v) => n + v.stock, 0);
    db.movements.unshift({
      id: `mv_restock_${order.id}_${item.id}`,
      storeId: db.store.id,
      variantId: item.variantId,
      productId: item.productId,
      warehouseId: item.warehouseId ?? db.warehouses[0]?.id ?? "",
      delta: item.quantity,
      balanceAfter: variant.stock,
      reason: "return",
      referenceType: "order",
      referenceId: order.orderNumber,
      actorName: "System",
      createdAt: now().toISOString(),
    });
  }
}

export function cancelOrder(storeId: string, orderId: string, actor = "Customer") {
  return advanceOrderStatus(storeId, orderId, "cancelled", actor);
}

/* ------------------------------ Returns ----------------------------- */

export interface CreateReturnInput {
  storeId: string;
  orderId: string;
  itemIds: string[];
  reason: ReturnReason;
  comment: string;
  resolution: "refund" | "exchange" | "store_credit";
}

export function createReturn(
  input: CreateReturnInput,
): { ok: true; request: ReturnRequest } | { ok: false; error: string } {
  const db = getStoreDb(input.storeId);
  const order = db.orders.find((o) => o.id === input.orderId);
  if (!order) return { ok: false, error: "Order not found." };
  if (order.status !== "delivered") {
    return { ok: false, error: "Only delivered orders can be returned." };
  }

  const items = order.items.filter((i) => input.itemIds.includes(i.id));
  if (!items.length) return { ok: false, error: "Select at least one item to return." };

  const timestamp = now();
  const request: ReturnRequest = {
    id: `ret_${order.id}`,
    storeId: input.storeId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    customerName: order.customerName,
    items: items.map((item) => ({
      orderItemId: item.id,
      productId: item.productId,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      amount: item.total,
    })),
    reason: input.reason,
    comment: input.comment || (RETURN_REASON_LABELS[input.reason] ?? ""),
    resolution: input.resolution,
    status: "requested",
    refundAmount: items.reduce((n, item) => n + item.total, 0),
    images: [],
    timeline: [{ status: "requested", label: "Return requested", createdAt: timestamp.toISOString() }],
    createdAt: timestamp.toISOString(),
    updatedAt: timestamp.toISOString(),
  };

  db.returns = [request, ...db.returns.filter((r) => r.orderId !== order.id)];
  advanceOrderStatus(input.storeId, order.id, "return_requested", "Customer");
  return { ok: true, request };
}

/* ----------------------------- Catalogue ---------------------------- */

export function updateProduct(
  storeId: string,
  productId: string,
  patch: Partial<Pick<Product, "name" | "status" | "price" | "compareAtPrice" | "shortDescription" | "description">>,
): { ok: true; product: Product } | { ok: false; error: string } {
  const db = getStoreDb(storeId);
  const product = db.products.find((p) => p.id === productId);
  if (!product) return { ok: false, error: "Product not found." };
  Object.assign(product, patch, { updatedAt: now().toISOString() });
  return { ok: true, product };
}

export function adjustInventory(
  storeId: string,
  variantId: string,
  warehouseId: string,
  delta: number,
  note: string,
  actorName = "Merchant",
): { ok: true; onHand: number } | { ok: false; error: string } {
  const db = getStoreDb(storeId);
  const record = db.inventory.find((r) => r.variantId === variantId && r.warehouseId === warehouseId);
  if (!record) return { ok: false, error: "No inventory record for that variant and location." };

  const before = record.onHand;
  record.onHand = Math.max(0, record.onHand + delta);
  record.updatedAt = now().toISOString();

  const product = db.products.find((p) => p.id === record.productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (product && variant) {
    variant.stock = Math.max(0, variant.stock + delta);
    product.totalStock = product.variants.reduce((n, v) => n + v.stock, 0);
  }

  db.movements.unshift({
    id: `mv_adj_${variantId}_${Date.now()}`,
    storeId,
    variantId,
    productId: record.productId,
    warehouseId,
    delta,
    balanceAfter: before,
    reason: "adjustment",
    referenceType: "manual",
    note,
    actorName,
    createdAt: now().toISOString(),
  });

  return { ok: true, onHand: record.onHand };
}

/* ---------------------------- Theme editor -------------------------- */

export function updateTheme(storeId: string, patch: Partial<StoreDatabase["theme"]>) {
  const db = getStoreDb(storeId);
  db.theme = { ...db.theme, ...patch, updatedAt: now().toISOString() };
  return db.theme;
}

export function reorderHomeSections(storeId: string, sectionIds: string[]) {
  const db = getStoreDb(storeId);
  const order = new Map(sectionIds.map((id, index) => [id, index]));
  db.homePage.sections = db.homePage.sections
    .map((section) => ({ ...section, position: order.get(section.id) ?? section.position }))
    .sort((a, b) => a.position - b.position);
  return db.homePage;
}

export function toggleHomeSection(storeId: string, sectionId: string, visible: boolean) {
  const db = getStoreDb(storeId);
  const section = db.homePage.sections.find((s) => s.id === sectionId);
  if (section) section.visible = visible;
  return db.homePage;
}

/** Session-scoped reset so a demo can be put back to a known state. */
export function resetDatabase() {
  delete (globalThis as { __obsidianDb?: unknown }).__obsidianDb;
  return getDatabase();
}
