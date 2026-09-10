import type { ID, ISODate, Money } from "./primitives";

/* ------------------------------ Reviews ----------------------------- */

export interface Review {
  id: ID;
  storeId: ID;
  productId: ID;
  productName: string;
  productImage: string;
  customerId: ID;
  customerName: string;
  customerAvatar: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  images: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  reportCount: number;
  status: "pending" | "approved" | "rejected" | "flagged";
  merchantReply?: { body: string; author: string; createdAt: ISODate };
  attributes?: Record<string, string>;
  createdAt: ISODate;
}

export interface ProductQuestion {
  id: ID;
  storeId: ID;
  productId: ID;
  customerName: string;
  question: string;
  answers: {
    id: ID;
    body: string;
    author: string;
    authorType: "merchant" | "customer";
    helpfulCount: number;
    createdAt: ISODate;
  }[];
  createdAt: ISODate;
}

/* --------------------------- Notifications -------------------------- */

export type NotificationChannel = "email" | "sms" | "whatsapp" | "push" | "in_app";

export type NotificationEvent =
  | "order_created"
  | "payment_success"
  | "payment_failed"
  | "order_shipped"
  | "order_delivered"
  | "return_approved"
  | "low_stock"
  | "new_customer"
  | "review_received"
  | "abandoned_cart"
  | "price_drop"
  | "back_in_stock"
  | "campaign";

export interface AppNotification {
  id: ID;
  storeId: ID;
  audience: "customer" | "merchant";
  recipientId?: ID;
  event: NotificationEvent;
  title: string;
  body: string;
  icon: string;
  actionUrl?: string;
  read: boolean;
  createdAt: ISODate;
  category: "orders" | "offers" | "updates" | "inventory" | "system";
}

/* ----------------------------- Campaigns ---------------------------- */

export interface Campaign {
  id: ID;
  storeId: ID;
  name: string;
  channel: NotificationChannel;
  subject: string;
  preview: string;
  segmentKey: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  scheduledAt?: ISODate;
  sentAt?: ISODate;
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: Money;
  createdAt: ISODate;
}

export interface AutomationRule {
  id: ID;
  storeId: ID;
  name: string;
  trigger:
    | "cart_abandoned"
    | "order_placed"
    | "order_delivered"
    | "customer_created"
    | "low_stock"
    | "birthday"
    | "browse_abandoned";
  delayMinutes: number;
  actions: { type: "email" | "sms" | "push" | "whatsapp" | "discount"; template: string }[];
  status: "active" | "paused";
  runs30d: number;
  revenue30d: Money;
  conversionRate: number;
}

/* ------------------------------ Support ----------------------------- */

export interface SupportTicket {
  id: ID;
  storeId: ID;
  reference: string;
  customerId: ID;
  customerName: string;
  customerEmail: string;
  subject: string;
  category: "order" | "payment" | "product" | "shipping" | "return" | "account" | "other";
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "pending" | "resolved" | "closed";
  assigneeName?: string;
  orderNumber?: string;
  messages: {
    id: ID;
    author: string;
    authorType: "customer" | "agent";
    body: string;
    createdAt: ISODate;
  }[];
  createdAt: ISODate;
  updatedAt: ISODate;
  firstResponseMinutes?: number;
}
