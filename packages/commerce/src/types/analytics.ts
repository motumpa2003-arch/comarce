import type { ID, ISODate, Money } from "./primitives";

export interface MetricPoint {
  date: string;
  revenue: Money;
  orders: number;
  visitors: number;
  addToCart: number;
  checkouts: number;
  conversions: number;
}

export interface KpiSummary {
  revenue: Money;
  revenueDelta: number;
  orders: number;
  ordersDelta: number;
  customers: number;
  customersDelta: number;
  averageOrderValue: Money;
  averageOrderValueDelta: number;
  conversionRate: number;
  conversionRateDelta: number;
  unitsSold: number;
  unitsSoldDelta: number;
  grossProfit: Money;
  grossProfitDelta: number;
  refundRate: number;
  refundRateDelta: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  rate: number;
}

export interface ChannelBreakdown {
  channel: string;
  sessions: number;
  orders: number;
  revenue: Money;
  share: number;
}

export interface TopEntity {
  id: ID;
  name: string;
  image?: string;
  meta?: string;
  units: number;
  revenue: Money;
  delta: number;
}

export interface ProductAnalytics {
  productId: ID;
  views: number;
  uniqueVisitors: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
  revenue: Money;
  returns: number;
  wishlistAdds: number;
}

export interface PlatformKpi {
  mrr: Money;
  mrrDelta: number;
  arr: Money;
  gmv: Money;
  gmvDelta: number;
  activeStores: number;
  activeStoresDelta: number;
  trialStores: number;
  churnRate: number;
  churnDelta: number;
  netRevenueRetention: number;
  platformOrders: number;
  platformCustomers: number;
  takeRate: Money;
}

export interface CohortRow {
  cohort: string;
  size: number;
  retention: number[];
}

export interface AnalyticsEvent {
  id: ID;
  storeId: ID;
  sessionId: string;
  name:
    | "page_view"
    | "product_view"
    | "search"
    | "add_to_cart"
    | "remove_from_cart"
    | "checkout_started"
    | "checkout_completed"
    | "wishlist_add";
  properties: Record<string, string | number>;
  createdAt: ISODate;
}
