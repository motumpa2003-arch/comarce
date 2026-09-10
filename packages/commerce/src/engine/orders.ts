import type {
  FulfilmentStatus,
  Order,
  OrderStatus,
  PaymentStatus,
  ReturnStatus,
} from "../types/commerce";

export interface OrderStatusMeta {
  key: OrderStatus;
  label: string;
  description: string;
  /** Tailwind-ready semantic tone consumed by the Badge component. */
  tone: "neutral" | "info" | "progress" | "success" | "warning" | "danger";
  /** Position in the happy-path timeline; -1 for exception states. */
  step: number;
  terminal: boolean;
}

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  pending: {
    key: "pending",
    label: "Pending",
    description: "Order created, awaiting confirmation.",
    tone: "neutral",
    step: 0,
    terminal: false,
  },
  payment_pending: {
    key: "payment_pending",
    label: "Payment pending",
    description: "Waiting for payment to be captured.",
    tone: "warning",
    step: 0,
    terminal: false,
  },
  confirmed: {
    key: "confirmed",
    label: "Confirmed",
    description: "Payment received and order confirmed.",
    tone: "info",
    step: 1,
    terminal: false,
  },
  processing: {
    key: "processing",
    label: "Processing",
    description: "Items are being picked at the warehouse.",
    tone: "progress",
    step: 2,
    terminal: false,
  },
  packed: {
    key: "packed",
    label: "Packed",
    description: "Order packed and ready for carrier pickup.",
    tone: "progress",
    step: 3,
    terminal: false,
  },
  shipped: {
    key: "shipped",
    label: "Shipped",
    description: "Handed over to the delivery partner.",
    tone: "progress",
    step: 4,
    terminal: false,
  },
  out_for_delivery: {
    key: "out_for_delivery",
    label: "Out for delivery",
    description: "Arriving today with the delivery agent.",
    tone: "progress",
    step: 5,
    terminal: false,
  },
  delivered: {
    key: "delivered",
    label: "Delivered",
    description: "Order delivered successfully.",
    tone: "success",
    step: 6,
    terminal: true,
  },
  cancelled: {
    key: "cancelled",
    label: "Cancelled",
    description: "Order cancelled before dispatch.",
    tone: "danger",
    step: -1,
    terminal: true,
  },
  return_requested: {
    key: "return_requested",
    label: "Return requested",
    description: "Customer raised a return request.",
    tone: "warning",
    step: -1,
    terminal: false,
  },
  return_approved: {
    key: "return_approved",
    label: "Return approved",
    description: "Return approved, pickup scheduled.",
    tone: "warning",
    step: -1,
    terminal: false,
  },
  returned: {
    key: "returned",
    label: "Returned",
    description: "Items received back at the warehouse.",
    tone: "warning",
    step: -1,
    terminal: false,
  },
  refund_pending: {
    key: "refund_pending",
    label: "Refund pending",
    description: "Refund initiated to the original method.",
    tone: "warning",
    step: -1,
    terminal: false,
  },
  refunded: {
    key: "refunded",
    label: "Refunded",
    description: "Refund settled to the customer.",
    tone: "danger",
    step: -1,
    terminal: true,
  },
};

export const ORDER_HAPPY_PATH: OrderStatus[] = [
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

/** Legal transitions. Everything not listed here is rejected by the engine. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["payment_pending", "confirmed", "cancelled"],
  payment_pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "returned"],
  out_for_delivery: ["delivered", "shipped"],
  delivered: ["return_requested"],
  cancelled: ["refund_pending"],
  return_requested: ["return_approved", "delivered"],
  return_approved: ["returned"],
  returned: ["refund_pending"],
  refund_pending: ["refunded"],
  refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from];
}

/** Suggested primary action a merchant should take from the orders table. */
export function primaryAction(status: OrderStatus): { label: string; next: OrderStatus } | null {
  const map: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
    pending: { label: "Confirm order", next: "confirmed" },
    payment_pending: { label: "Mark as paid", next: "confirmed" },
    confirmed: { label: "Start processing", next: "processing" },
    processing: { label: "Mark packed", next: "packed" },
    packed: { label: "Ship order", next: "shipped" },
    shipped: { label: "Out for delivery", next: "out_for_delivery" },
    out_for_delivery: { label: "Mark delivered", next: "delivered" },
    return_requested: { label: "Approve return", next: "return_approved" },
    return_approved: { label: "Mark received", next: "returned" },
    returned: { label: "Initiate refund", next: "refund_pending" },
    refund_pending: { label: "Complete refund", next: "refunded" },
  };
  return map[status] ?? null;
}

export function paymentStatusFor(status: OrderStatus, current: PaymentStatus): PaymentStatus {
  if (status === "refunded") return "refunded";
  if (status === "refund_pending") return "partially_refunded";
  if (status === "cancelled") return current === "paid" ? "refunded" : "failed";
  if (ORDER_HAPPY_PATH.includes(status)) return current === "pending" ? "paid" : current;
  return current;
}

export function fulfilmentStatusFor(status: OrderStatus): FulfilmentStatus {
  if (["shipped", "out_for_delivery", "delivered"].includes(status)) return "fulfilled";
  if (["returned", "refunded"].includes(status)) return "returned";
  if (status === "packed") return "partially_fulfilled";
  return "unfulfilled";
}

export function progressPercent(status: OrderStatus): number {
  const meta = ORDER_STATUS_META[status];
  if (meta.step < 0) return 100;
  return Math.round((meta.step / (ORDER_HAPPY_PATH.length)) * 100);
}

export function isCancellable(order: Order): boolean {
  return ["pending", "payment_pending", "confirmed", "processing"].includes(order.status);
}

export function isReturnable(order: Order, now = new Date()): boolean {
  if (order.status !== "delivered" || !order.deliveredAt) return false;
  const deadline = new Date(order.deliveredAt);
  deadline.setDate(deadline.getDate() + 30);
  return now <= deadline;
}

export function isTrackable(order: Order): boolean {
  return ["packed", "shipped", "out_for_delivery", "delivered"].includes(order.status);
}

/* ------------------------------ Returns ----------------------------- */

export const RETURN_STATUS_META: Record<ReturnStatus, { label: string; tone: OrderStatusMeta["tone"]; step: number }> = {
  requested: { label: "Requested", tone: "warning", step: 0 },
  approved: { label: "Approved", tone: "info", step: 1 },
  rejected: { label: "Rejected", tone: "danger", step: -1 },
  pickup_scheduled: { label: "Pickup scheduled", tone: "info", step: 2 },
  in_transit: { label: "In transit", tone: "progress", step: 3 },
  inspecting: { label: "Quality check", tone: "progress", step: 4 },
  refund_initiated: { label: "Refund initiated", tone: "progress", step: 5 },
  completed: { label: "Completed", tone: "success", step: 6 },
};

export const RETURN_REASON_LABELS: Record<string, string> = {
  size_fit: "Size or fit issue",
  damaged: "Arrived damaged",
  wrong_item: "Wrong item delivered",
  not_as_described: "Not as described",
  quality: "Quality not as expected",
  changed_mind: "Changed my mind",
  late_delivery: "Delivered too late",
};

/* --------------------------- Order numbers -------------------------- */

export function generateOrderNumber(seed: number): string {
  return `OD${(100000000 + (seed % 899999999)).toString()}`;
}

export function generateTrackingNumber(seed: number): string {
  return `BLR${(10000000 + (seed % 89999999)).toString()}IN`;
}
