import type { CurrencyCode, ID, ISODate, Money } from "./primitives";

/** Industry presets drive attribute sets, demo catalogue and default theme. */
export type Industry =
  | "fashion"
  | "electronics"
  | "beauty"
  | "home"
  | "furniture"
  | "sports"
  | "grocery"
  | "jewelry"
  | "books"
  | "pets"
  | "general";

export type StoreStatus = "active" | "trial" | "paused" | "suspended" | "closed";

export interface Store {
  id: ID;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  industry: Industry;
  status: StoreStatus;
  logoText: string;
  logoMark: string;
  ownerId: ID;
  planId: ID;
  currency: CurrencyCode;
  country: string;
  locale: string;
  timezone: string;
  domain: string;
  customDomain?: string;
  themeId: ID;
  supportEmail: string;
  supportPhone: string;
  createdAt: ISODate;
  /** Rolled-up counters kept denormalised for dashboards. */
  metrics: StoreMetrics;
  features: StoreFeatureFlags;
}

export interface StoreMetrics {
  gmv: Money;
  orders: number;
  customers: number;
  products: number;
  conversionRate: number;
  averageOrderValue: Money;
}

export interface StoreFeatureFlags {
  marketplace: boolean;
  loyalty: boolean;
  subscriptions: boolean;
  aiAssistant: boolean;
  multiWarehouse: boolean;
  b2b: boolean;
}

export type PermissionKey =
  | "products.read" | "products.write" | "products.delete"
  | "orders.read" | "orders.write" | "orders.refund"
  | "inventory.read" | "inventory.write"
  | "customers.read" | "customers.write"
  | "marketing.read" | "marketing.write"
  | "content.read" | "content.write"
  | "analytics.read"
  | "finance.read" | "finance.write"
  | "settings.read" | "settings.write"
  | "staff.read" | "staff.write"
  | "platform.admin";

export type StaffRole =
  | "owner"
  | "admin"
  | "manager"
  | "product_manager"
  | "warehouse_manager"
  | "support"
  | "marketing"
  | "accountant";

export interface StoreMember {
  id: ID;
  storeId: ID;
  userId: ID;
  name: string;
  email: string;
  avatar: string;
  role: StaffRole;
  permissions: PermissionKey[];
  status: "active" | "invited" | "disabled";
  lastActiveAt: ISODate;
  createdAt: ISODate;
}

export interface PlatformUser {
  id: ID;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  type: "merchant" | "staff" | "platform" | "customer";
  storeIds: ID[];
  mfaEnabled: boolean;
  createdAt: ISODate;
  lastLoginAt: ISODate;
}

export interface Plan {
  id: ID;
  name: string;
  slug: string;
  tagline: string;
  monthlyPrice: Money;
  annualPrice: Money;
  currency: CurrencyCode;
  transactionFeeBps: number;
  popular: boolean;
  limits: PlanLimits;
  features: string[];
}

export interface PlanLimits {
  products: number;
  staff: number;
  monthlyOrders: number;
  storageGb: number;
  warehouses: number;
  customDomain: boolean;
  apiAccess: boolean;
  advancedAnalytics: boolean;
  abandonedCart: boolean;
  marketplace: boolean;
}

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "paused";

export interface Subscription {
  id: ID;
  storeId: ID;
  planId: ID;
  status: SubscriptionStatus;
  interval: "monthly" | "annual";
  amount: Money;
  currency: CurrencyCode;
  startedAt: ISODate;
  currentPeriodEnd: ISODate;
  trialEndsAt?: ISODate;
  cancelledAt?: ISODate;
  seats: number;
}

export interface UsageMetric {
  storeId: ID;
  metric: "products" | "orders" | "staff" | "storage" | "api_calls";
  used: number;
  limit: number;
  period: string;
}

export interface AuditLogEntry {
  id: ID;
  storeId: ID | null;
  actorId: ID;
  actorName: string;
  actorType: "merchant" | "platform" | "system" | "customer";
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  userAgent: string;
  severity: "info" | "warning" | "critical";
  createdAt: ISODate;
  metadata?: Record<string, string | number | boolean>;
}

export interface ApiKey {
  id: ID;
  storeId: ID;
  name: string;
  prefix: string;
  scopes: PermissionKey[];
  lastUsedAt?: ISODate;
  createdAt: ISODate;
  revokedAt?: ISODate;
}

export type WebhookTopic =
  | "order.created" | "order.updated" | "order.fulfilled" | "order.cancelled"
  | "payment.succeeded" | "payment.failed" | "refund.created"
  | "product.created" | "product.updated" | "inventory.updated"
  | "customer.created" | "review.created";

export interface Webhook {
  id: ID;
  storeId: ID;
  url: string;
  topics: WebhookTopic[];
  status: "active" | "paused" | "failing";
  secretPrefix: string;
  deliveries24h: number;
  failures24h: number;
  createdAt: ISODate;
}
