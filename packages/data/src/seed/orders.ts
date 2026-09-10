import {
  ORDER_HAPPY_PATH,
  ORDER_STATUS_META,
  RETURN_REASON_LABELS,
  fulfilmentStatusFor,
  generateOrderNumber,
  generateTrackingNumber,
  getTaxClass,
  major,
  paymentStatusFor,
  percentOf,
  type Coupon,
  type Customer,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrderStatusEvent,
  type Payment,
  type PaymentMethodKind,
  type Product,
  type Refund,
  type ReturnReason,
  type ReturnRequest,
  type ReturnStatus,
  type Shipment,
} from "@obsidian/commerce";
import { Rng } from "../rng";

const CARRIERS = [
  { name: "Bluedart Express", service: "Surface Priority" },
  { name: "Delhivery", service: "Express Parcel" },
  { name: "Ecom Express", service: "Standard" },
  { name: "XpressBees", service: "Next Day" },
  { name: "Obsidian Fleet", service: "Same Day Metro" },
];

const SHIPPING_METHOD_NAMES = ["Standard Delivery", "Express Delivery", "Same Day", "Store Pickup"];

export interface BuildOrdersInput {
  storeId: string;
  products: Product[];
  customers: Customer[];
  coupons: Coupon[];
  warehouseIds: string[];
  count: number;
  referenceDate: Date;
}

export interface OrdersBundle {
  orders: Order[];
  payments: Payment[];
  shipments: Shipment[];
  returns: ReturnRequest[];
  refunds: Refund[];
}

export function buildOrders({
  storeId,
  products,
  customers,
  coupons,
  warehouseIds,
  count,
  referenceDate,
}: BuildOrdersInput): OrdersBundle {
  const rng = new Rng(`${storeId}:orders`);
  const sellable = products.filter((p) => p.status === "active" && p.variants.length > 0);
  const buyers = customers.filter((c) => c.ordersCount > 0);
  if (!sellable.length || !buyers.length) {
    return { orders: [], payments: [], shipments: [], returns: [], refunds: [] };
  }

  const orders: Order[] = [];
  const payments: Payment[] = [];
  const shipments: Shipment[] = [];
  const returns: ReturnRequest[] = [];
  const refunds: Refund[] = [];

  for (let i = 0; i < count; i++) {
    const customer = rng.pick(buyers);
    const id = `ord_${storeId}_${String(i + 1).padStart(5, "0")}`;
    const orderNumber = generateOrderNumber(i * 7919 + 13);

    const status = rng.weighted<OrderStatus>([
      ["delivered", 75],
      ["processing", 3],
      ["packed", 2],
      ["shipped", 2],
      ["out_for_delivery", 1],
      ["cancelled", 5],
      ["return_requested", 2],
      ["return_approved", 1],
      ["returned", 1],
      ["refund_pending", 1],
      ["refunded", 2],
      ["pending", 2],
      ["payment_pending", 2],
      ["confirmed", 1],
    ]);

    // Older orders for terminal states, recent ones for in-flight states.
    const daysAgo: [number, number] =
      status === "delivered" ? [3, 300]
      : ["pending", "payment_pending", "confirmed", "processing"].includes(status) ? [0, 3]
      : ["packed", "shipped", "out_for_delivery"].includes(status) ? [1, 7]
      : [5, 180];
    const createdAt = rng.pastDate(referenceDate, daysAgo[0], daysAgo[1]);

    /* ------------------------------ Items ----------------------------- */
    const lineCount = rng.weighted([[1, 45], [2, 28], [3, 16], [4, 8], [5, 3]]);
    const chosen = rng.sample(sellable, lineCount);
    const items: OrderItem[] = chosen.map((product, index) => {
      const variant = rng.pick(product.variants);
      const quantity = rng.weighted([[1, 72], [2, 18], [3, 7], [4, 3]]);
      const unitPrice = variant.price;
      const lineTotal = unitPrice * quantity;
      const taxRate = getTaxClass(product.taxClassId).rate;
      const returnWindow = new Date(createdAt);
      returnWindow.setDate(returnWindow.getDate() + 30);
      return {
        id: `oi_${id}_${index}`,
        orderId: id,
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        slug: product.slug,
        brandName: undefined,
        variantTitle: variant.title,
        options: variant.options,
        image: variant.image ?? product.media[0]?.url ?? "",
        sku: variant.sku,
        quantity,
        unitPrice,
        compareAtPrice: variant.compareAtPrice,
        discount: 0,
        tax: Math.round(lineTotal - lineTotal / (1 + taxRate / 100)),
        total: lineTotal,
        warehouseId: warehouseIds.length ? rng.pick(warehouseIds) : undefined,
        fulfilmentStatus: fulfilmentStatusFor(status),
        returnable: true,
        returnWindowEndsAt: returnWindow.toISOString(),
      };
    });

    const subtotal = items.reduce((n, item) => n + item.total, 0);

    /* ----------------------------- Money ------------------------------ */
    const usesCoupon = rng.bool(0.34) && coupons.length > 0;
    const coupon = usesCoupon ? rng.pick(coupons) : undefined;
    let discount = 0;
    if (coupon) {
      if (coupon.type === "percentage") discount = percentOf(subtotal, coupon.value);
      else if (coupon.type === "fixed") discount = Math.min(coupon.value, subtotal);
      if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
    }
    discount = Math.min(discount, Math.round(subtotal * 0.6));

    const shippingMethod = rng.weighted([
      [SHIPPING_METHOD_NAMES[0]!, 62],
      [SHIPPING_METHOD_NAMES[1]!, 24],
      [SHIPPING_METHOD_NAMES[2]!, 8],
      [SHIPPING_METHOD_NAMES[3]!, 6],
    ]);
    const afterDiscount = subtotal - discount;
    const shipping =
      shippingMethod === "Store Pickup" ? 0
      : shippingMethod === "Express Delivery" ? major(199)
      : shippingMethod === "Same Day" ? major(349)
      : afterDiscount >= major(999) ? 0 : major(99);

    const total = afterDiscount + shipping;
    const tax = items.reduce((n, item) => n + item.tax, 0);

    const paymentMethod = rng.weighted<PaymentMethodKind>([
      ["upi", 42],
      ["card", 24],
      ["cod", 16],
      ["netbanking", 8],
      ["wallet", 6],
      ["bnpl", 4],
    ]);
    const paymentStatus = paymentStatusFor(status, status === "payment_pending" ? "pending" : "paid");

    /* --------------------------- Timeline ----------------------------- */
    const timeline = buildTimeline(status, createdAt, rng, customer.addresses[0]?.city ?? "Bengaluru");
    const deliveredEvent = timeline.find((e) => e.status === "delivered");
    const estimatedDelivery = new Date(createdAt);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (shippingMethod === "Same Day" ? 1 : shippingMethod === "Express Delivery" ? 3 : 5));

    const shippingAddress = customer.addresses[0] ?? {
      id: `addr_${id}`,
      label: "home" as const,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      line1: "12, Residency Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560025",
      country: "India",
      isDefaultShipping: true,
      isDefaultBilling: true,
    };

    const refundedAmount = ["refunded"].includes(status) ? total : status === "refund_pending" ? Math.round(total * 0.6) : 0;

    const order: Order = {
      id,
      storeId,
      orderNumber,
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      items,
      itemCount: items.reduce((n, item) => n + item.quantity, 0),
      status,
      paymentStatus,
      fulfilmentStatus: fulfilmentStatusFor(status),
      subtotal,
      discount,
      couponCode: coupon?.code,
      shipping,
      tax,
      total,
      refundedAmount,
      currency: "INR",
      paymentMethod,
      paymentReference: `pay_${orderNumber.slice(-8)}${rng.int(100, 999)}`,
      shippingAddress,
      billingAddress: shippingAddress,
      shippingMethod,
      estimatedDeliveryAt: estimatedDelivery.toISOString(),
      deliveredAt: deliveredEvent?.createdAt,
      timeline,
      warehouseId: items[0]?.warehouseId,
      channel: rng.weighted([["web", 52], ["mobile", 41], ["pos", 4], ["marketplace", 3]]),
      tags: rng.sample(["priority", "gift", "corporate", "first-order", "repeat"], rng.int(0, 2)),
      note: rng.bool(0.12) ? "Please call before delivery." : undefined,
      giftMessage: rng.bool(0.06) ? "Happy birthday — hope you love this!" : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: (timeline[timeline.length - 1]?.createdAt ?? createdAt.toISOString()),
    };

    orders.push(order);

    /* --------------------------- Payments ----------------------------- */
    const fee = paymentMethod === "cod" ? 0 : Math.round(total * 0.021);
    payments.push({
      id: `pay_${id}`,
      storeId,
      orderId: id,
      orderNumber,
      amount: total,
      currency: "INR",
      method: paymentMethod,
      gateway: paymentMethod === "cod" ? "cod" : rng.bool(0.8) ? "razorpay" : "stripe",
      status:
        paymentStatus === "paid" ? "captured"
        : paymentStatus === "refunded" ? "refunded"
        : paymentStatus === "failed" ? "failed"
        : "pending",
      reference: order.paymentReference,
      fee,
      netAmount: total - fee,
      createdAt: createdAt.toISOString(),
    });

    /* --------------------------- Shipments ---------------------------- */
    if (["shipped", "out_for_delivery", "delivered", "returned", "refunded", "return_requested", "return_approved"].includes(status)) {
      const carrier = rng.pick(CARRIERS);
      const shippedEvent = timeline.find((e) => e.status === "shipped");
      const shippedAt = shippedEvent ? new Date(shippedEvent.createdAt) : createdAt;
      const shipmentId = `shp_${id}`;
      shipments.push({
        id: shipmentId,
        storeId,
        orderId: id,
        orderNumber,
        carrier: carrier.name,
        service: carrier.service,
        trackingNumber: generateTrackingNumber(i * 104729 + 7),
        trackingUrl: `https://track.obsidian.dev/${generateTrackingNumber(i * 104729 + 7)}`,
        status:
          status === "delivered" ? "delivered"
          : status === "out_for_delivery" ? "out_for_delivery"
          : ["returned", "refunded"].includes(status) ? "delivered"
          : "in_transit",
        weightGrams: items.reduce((n, item) => n + item.quantity * 450, 0),
        cost: major(rng.int(45, 320)),
        shippedAt: shippedAt.toISOString(),
        estimatedDeliveryAt: estimatedDelivery.toISOString(),
        deliveredAt: deliveredEvent?.createdAt,
        events: timeline
          .filter((e) => ["shipped", "out_for_delivery", "delivered"].includes(e.status))
          .map((e) => ({ label: e.label, location: e.location ?? "In network", createdAt: e.createdAt })),
      });
      order.shipmentId = shipmentId;
    }

    /* ---------------------------- Returns ----------------------------- */
    if (["return_requested", "return_approved", "returned", "refund_pending", "refunded"].includes(status)) {
      const returnedItems = rng.sample(items, rng.int(1, items.length));
      const refundAmount = returnedItems.reduce((n, item) => n + item.total, 0);
      const reason = rng.pick(Object.keys(RETURN_REASON_LABELS) as ReturnReason[]);
      const returnStatus: ReturnStatus =
        status === "return_requested" ? "requested"
        : status === "return_approved" ? "pickup_scheduled"
        : status === "returned" ? "inspecting"
        : status === "refund_pending" ? "refund_initiated"
        : "completed";

      const requestedAt = new Date(createdAt);
      requestedAt.setDate(requestedAt.getDate() + rng.int(4, 20));

      returns.push({
        id: `ret_${id}`,
        storeId,
        orderId: id,
        orderNumber,
        customerId: customer.id,
        customerName: order.customerName,
        items: returnedItems.map((item) => ({
          orderItemId: item.id,
          productId: item.productId,
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          amount: item.total,
        })),
        reason,
        comment: RETURN_REASON_LABELS[reason] ?? "",
        resolution: rng.weighted([["refund", 62], ["exchange", 26], ["store_credit", 12]]),
        status: returnStatus,
        refundAmount,
        images: [],
        timeline: buildReturnTimeline(returnStatus, requestedAt),
        createdAt: requestedAt.toISOString(),
        updatedAt: requestedAt.toISOString(),
      });

      if (["refund_pending", "refunded"].includes(status)) {
        const completedAt = new Date(requestedAt);
        completedAt.setDate(completedAt.getDate() + rng.int(2, 7));
        refunds.push({
          id: `rfd_${id}`,
          storeId,
          orderId: id,
          orderNumber,
          amount: refundAmount,
          reason: RETURN_REASON_LABELS[reason] ?? "Customer return",
          method: rng.weighted([["original", 78], ["store_credit", 16], ["bank_transfer", 6]]),
          status: status === "refunded" ? "completed" : "processing",
          createdAt: requestedAt.toISOString(),
          completedAt: status === "refunded" ? completedAt.toISOString() : undefined,
        });
      }
    }
  }

  orders.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return { orders, payments, shipments, returns, refunds };
}

/* ------------------------------ Timelines --------------------------- */

function buildTimeline(status: OrderStatus, createdAt: Date, rng: Rng, city: string): OrderStatusEvent[] {
  const events: OrderStatusEvent[] = [];
  let cursor = new Date(createdAt);
  let index = 0;

  const push = (s: OrderStatus, location?: string, actor = "System") => {
    events.push({
      id: `evt_${index++}`,
      status: s,
      label: ORDER_STATUS_META[s].label,
      description: ORDER_STATUS_META[s].description,
      location,
      createdAt: cursor.toISOString(),
      actor,
    });
  };

  const advance = (minHours: number, maxHours: number) => {
    cursor = new Date(cursor.getTime() + rng.int(minHours, maxHours) * 3600000);
  };

  push("pending", undefined, "Customer");

  if (status === "pending") return events;

  if (status === "payment_pending") {
    advance(1, 4);
    push("payment_pending");
    return events;
  }

  advance(0, 2);
  push("confirmed");
  if (status === "confirmed") return events;

  if (status === "cancelled") {
    advance(2, 24);
    push("cancelled", undefined, rng.bool(0.6) ? "Customer" : "Merchant");
    return events;
  }

  const targetIndex = ORDER_HAPPY_PATH.indexOf(
    ["return_requested", "return_approved", "returned", "refund_pending", "refunded"].includes(status)
      ? "delivered"
      : status,
  );

  for (let i = 1; i <= Math.max(targetIndex, 0); i++) {
    const step = ORDER_HAPPY_PATH[i]!;
    advance(...stepDuration(step));
    push(step, stepLocation(step, city));
  }

  if (["return_requested", "return_approved", "returned", "refund_pending", "refunded"].includes(status)) {
    advance(48, 240);
    push("return_requested", undefined, "Customer");
    if (status === "return_requested") return events;
    advance(4, 24);
    push("return_approved", undefined, "Merchant");
    if (status === "return_approved") return events;
    advance(24, 96);
    push("returned", "Return hub");
    if (status === "returned") return events;
    advance(4, 24);
    push("refund_pending");
    if (status === "refund_pending") return events;
    advance(24, 120);
    push("refunded");
  }

  return events;
}

function stepDuration(step: OrderStatus): [number, number] {
  switch (step) {
    case "processing":
      return [2, 12];
    case "packed":
      return [3, 16];
    case "shipped":
      return [4, 24];
    case "out_for_delivery":
      return [12, 60];
    case "delivered":
      return [2, 10];
    default:
      return [1, 6];
  }
}

function stepLocation(step: OrderStatus, city: string): string | undefined {
  switch (step) {
    case "processing":
    case "packed":
      return "Bengaluru Fulfilment Centre";
    case "shipped":
      return "Bengaluru Sorting Hub";
    case "out_for_delivery":
      return `${city} Local Facility`;
    case "delivered":
      return city;
    default:
      return undefined;
  }
}

function buildReturnTimeline(status: ReturnStatus, requestedAt: Date) {
  const order: ReturnStatus[] = [
    "requested",
    "approved",
    "pickup_scheduled",
    "in_transit",
    "inspecting",
    "refund_initiated",
    "completed",
  ];
  const labels: Record<ReturnStatus, string> = {
    requested: "Return requested",
    approved: "Return approved",
    rejected: "Return rejected",
    pickup_scheduled: "Pickup scheduled",
    in_transit: "In transit to warehouse",
    inspecting: "Quality check in progress",
    refund_initiated: "Refund initiated",
    completed: "Refund completed",
  };
  const cutoff = order.indexOf(status);
  return order.slice(0, cutoff + 1).map((s, i) => {
    const at = new Date(requestedAt);
    at.setDate(at.getDate() + i);
    return { status: s, label: labels[s], createdAt: at.toISOString() };
  });
}
