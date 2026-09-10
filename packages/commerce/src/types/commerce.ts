import type { CurrencyCode, ID, ISODate, Money } from "./primitives";
import type { Address } from "./customer";

/* ------------------------------- Cart ------------------------------- */

export interface CartLine {
  id: string;
  productId: ID;
  variantId: ID;
  slug: string;
  name: string;
  brandName?: string;
  variantTitle: string;
  options: Record<string, string>;
  image: string;
  unitPrice: Money;
  compareAtPrice?: Money;
  quantity: number;
  maxQuantity: number;
  /** Personalisation / gifting extras captured on the PDP. */
  giftWrap?: boolean;
  giftMessage?: string;
  personalization?: string;
  addedAt: ISODate;
}

export interface CartTotals {
  subtotal: Money;
  savings: Money;
  discount: Money;
  loyaltyDiscount: Money;
  storeCreditApplied: Money;
  shipping: Money;
  giftWrapFee: Money;
  taxableAmount: Money;
  tax: Money;
  taxBreakdown: { label: string; rate: number; amount: Money }[];
  total: Money;
  itemCount: number;
  freeShippingThreshold: Money;
  freeShippingRemaining: Money;
  currency: CurrencyCode;
}

/* ------------------------------ Coupons ----------------------------- */

export type CouponType =
  | "percentage"
  | "fixed"
  | "free_shipping"
  | "buy_x_get_y"
  | "tiered";

export interface Coupon {
  id: ID;
  storeId: ID;
  code: string;
  title: string;
  description: string;
  type: CouponType;
  /** Percent (0-100) or minor-unit amount, depending on type. */
  value: number;
  minimumSpend?: Money;
  maximumDiscount?: Money;
  buyQuantity?: number;
  getQuantity?: number;
  appliesTo: "all" | "category" | "brand" | "collection" | "product";
  appliesToIds: ID[];
  customerEligibility: "all" | "new" | "vip" | "specific";
  eligibleCustomerIds?: ID[];
  usageLimit?: number;
  usagePerCustomer?: number;
  usedCount: number;
  stackable: boolean;
  startsAt: ISODate;
  endsAt: ISODate;
  status: "active" | "scheduled" | "expired" | "disabled";
  createdAt: ISODate;
}

export type PromotionKind =
  | "flash_sale"
  | "seasonal"
  | "bundle"
  | "bogo"
  | "spend_save"
  | "clearance";

export interface Promotion {
  id: ID;
  storeId: ID;
  name: string;
  kind: PromotionKind;
  description: string;
  banner?: string;
  discountPercent?: number;
  spendThreshold?: Money;
  saveAmount?: Money;
  productIds: ID[];
  categoryIds: ID[];
  startsAt: ISODate;
  endsAt: ISODate;
  status: "active" | "scheduled" | "ended";
  revenue: Money;
  ordersInfluenced: number;
}

export interface GiftCard {
  id: ID;
  storeId: ID;
  code: string;
  initialValue: Money;
  balance: Money;
  issuedTo?: string;
  status: "active" | "redeemed" | "expired";
  expiresAt: ISODate;
  createdAt: ISODate;
}

/* ------------------------------ Orders ------------------------------ */

export type OrderStatus =
  | "pending"
  | "payment_pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "return_approved"
  | "returned"
  | "refund_pending"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "failed";

export type FulfilmentStatus =
  | "unfulfilled"
  | "partially_fulfilled"
  | "fulfilled"
  | "returned";

export type PaymentMethodKind =
  | "upi"
  | "card"
  | "netbanking"
  | "wallet"
  | "cod"
  | "bnpl"
  | "bank_transfer"
  | "store_credit"
  | "gift_card";

export interface OrderItem {
  id: ID;
  orderId: ID;
  productId: ID;
  variantId: ID;
  name: string;
  slug: string;
  brandName?: string;
  variantTitle: string;
  options: Record<string, string>;
  image: string;
  sku: string;
  quantity: number;
  unitPrice: Money;
  compareAtPrice?: Money;
  discount: Money;
  tax: Money;
  total: Money;
  warehouseId?: ID;
  fulfilmentStatus: FulfilmentStatus;
  returnable: boolean;
  returnWindowEndsAt?: ISODate;
}

export interface OrderStatusEvent {
  id: ID;
  status: OrderStatus;
  label: string;
  description: string;
  location?: string;
  createdAt: ISODate;
  actor: string;
}

export interface Order {
  id: ID;
  storeId: ID;
  orderNumber: string;
  customerId: ID;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  items: OrderItem[];
  itemCount: number;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;

  subtotal: Money;
  discount: Money;
  couponCode?: string;
  shipping: Money;
  tax: Money;
  total: Money;
  refundedAmount: Money;
  currency: CurrencyCode;

  paymentMethod: PaymentMethodKind;
  paymentReference: string;

  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: string;
  estimatedDeliveryAt: ISODate;
  deliveredAt?: ISODate;

  timeline: OrderStatusEvent[];
  shipmentId?: ID;
  warehouseId?: ID;

  channel: "web" | "mobile" | "pos" | "marketplace";
  tags: string[];
  note?: string;
  giftMessage?: string;

  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ----------------------------- Payments ----------------------------- */

export interface Payment {
  id: ID;
  storeId: ID;
  orderId: ID;
  orderNumber: string;
  amount: Money;
  currency: CurrencyCode;
  method: PaymentMethodKind;
  gateway: "razorpay" | "stripe" | "cod" | "internal";
  status: "pending" | "authorized" | "captured" | "failed" | "refunded";
  reference: string;
  fee: Money;
  netAmount: Money;
  createdAt: ISODate;
}

export interface Refund {
  id: ID;
  storeId: ID;
  orderId: ID;
  orderNumber: string;
  amount: Money;
  reason: string;
  method: "original" | "store_credit" | "bank_transfer";
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: ISODate;
  completedAt?: ISODate;
}

/* ------------------------------ Returns ----------------------------- */

export type ReturnReason =
  | "size_fit"
  | "damaged"
  | "wrong_item"
  | "not_as_described"
  | "quality"
  | "changed_mind"
  | "late_delivery";

export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "pickup_scheduled"
  | "in_transit"
  | "inspecting"
  | "refund_initiated"
  | "completed";

export interface ReturnRequest {
  id: ID;
  storeId: ID;
  orderId: ID;
  orderNumber: string;
  customerId: ID;
  customerName: string;
  items: {
    orderItemId: ID;
    productId: ID;
    name: string;
    image: string;
    quantity: number;
    amount: Money;
  }[];
  reason: ReturnReason;
  comment: string;
  resolution: "refund" | "exchange" | "store_credit";
  status: ReturnStatus;
  refundAmount: Money;
  images: string[];
  timeline: { status: ReturnStatus; label: string; createdAt: ISODate }[];
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ----------------------------- Shipping ----------------------------- */

export interface ShippingMethodOption {
  id: string;
  name: string;
  description: string;
  price: Money;
  minDays: number;
  maxDays: number;
  icon: string;
}

export interface ShippingZone {
  id: ID;
  storeId: ID;
  name: string;
  regions: string[];
  rates: {
    id: ID;
    name: string;
    type: "flat" | "weight" | "price" | "free";
    price: Money;
    minValue?: number;
    maxValue?: number;
  }[];
}

export interface Shipment {
  id: ID;
  storeId: ID;
  orderId: ID;
  orderNumber: string;
  carrier: string;
  service: string;
  trackingNumber: string;
  trackingUrl: string;
  status:
    | "label_created"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "exception";
  weightGrams: number;
  cost: Money;
  shippedAt: ISODate;
  estimatedDeliveryAt: ISODate;
  deliveredAt?: ISODate;
  events: { label: string; location: string; createdAt: ISODate }[];
}

/* -------------------------------- Tax ------------------------------- */

export interface TaxClass {
  id: string;
  name: string;
  /** Rate as a percentage, e.g. 18 for 18% GST. */
  rate: number;
  description: string;
  hsnPrefix?: string;
}
