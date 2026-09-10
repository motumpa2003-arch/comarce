import {
  major,
  type ChannelBreakdown,
  type CohortRow,
  type FunnelStage,
  type KpiSummary,
  type MetricPoint,
  type Order,
  type Plan,
  type PlatformKpi,
  type Product,
  type ProductAnalytics,
  type Store,
  type Subscription,
  type TopEntity,
} from "@obsidian/commerce";
import { Rng } from "../rng";
import { aggregateMrr } from "../billing";

/**
 * Daily metrics are derived from the seeded orders where they exist, then
 * smoothed with a weekday/seasonality curve so charts read like a real store
 * rather than white noise.
 */
export function buildDailyMetrics({
  storeId,
  orders,
  referenceDate,
  days = 365,
}: {
  storeId: string;
  orders: Order[];
  referenceDate: Date;
  days?: number;
}): MetricPoint[] {
  const rng = new Rng(`${storeId}:metrics`);

  // The seeded order table is a *sample* of trading, not the whole ledger, so
  // the daily series is modelled from its shape (order value, mix) rather than
  // summing it — otherwise a handful of large sampled orders would swing a
  // month's revenue by 200%. Orders placed live during a session are added on
  // top by the write path, so the chart still responds to real activity.
  const settled = orders.filter((o) => !["cancelled", "refunded"].includes(o.status));
  // Median, not mean: a catalogue that spans ₹49 candles and ₹2.5L sofas has a
  // heavy right tail, and the mean basket would misrepresent a typical day.
  const typicalOrderValue = settled.length ? median(settled.map((o) => o.total)) : major(2400);
  const dailyOrderFloor = Math.max(4, Math.round(settled.length / 26));

  const points: MetricPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(referenceDate);
    date.setDate(date.getDate() - i);

    // Weekend lift, Friday warm-up, and a slow upward trend across the year.
    const dow = date.getDay();
    const weekend = dow === 0 || dow === 6 ? 1.24 : dow === 5 ? 1.1 : 1;
    const trend = 0.82 + ((days - i) / days) * 0.36;
    const noise = rng.float(0.86, 1.16);

    const orderCount = Math.max(
      1,
      Math.round(dailyOrderFloor * rng.float(0.75, 1.35) * weekend * trend * noise),
    );
    // Whole rupees: a day's revenue should never show stray paise.
    const revenue = Math.round((orderCount * typicalOrderValue * rng.float(0.85, 1.2)) / 100) * 100;

    const visitors = Math.round(orderCount * rng.int(34, 58));
    const addToCart = Math.round(visitors * rng.float(0.11, 0.2));
    const checkouts = Math.round(addToCart * rng.float(0.35, 0.6));

    points.push({
      date: date.toISOString().slice(0, 10),
      revenue,
      orders: orderCount,
      visitors,
      addToCart,
      checkouts,
      conversions: Math.min(checkouts, orderCount),
    });
  }
  return points;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

export function summariseKpis(points: MetricPoint[], windowDays = 30): KpiSummary {
  const current = points.slice(-windowDays);
  const previous = points.slice(-windowDays * 2, -windowDays);

  const sum = (list: MetricPoint[], key: keyof MetricPoint) =>
    list.reduce((n, p) => n + (p[key] as number), 0);

  const delta = (now: number, before: number) =>
    before === 0 ? 0 : Number((((now - before) / before) * 100).toFixed(1));

  const revenue = sum(current, "revenue");
  const prevRevenue = sum(previous, "revenue");
  const orders = sum(current, "orders");
  const prevOrders = sum(previous, "orders");
  const visitors = sum(current, "visitors");
  const prevVisitors = sum(previous, "visitors");
  const conversions = sum(current, "conversions");
  const prevConversions = sum(previous, "conversions");

  const toRupees = (paise: number) => Math.round(paise / 100) * 100;
  const aov = orders ? toRupees(revenue / orders) : 0;
  const prevAov = prevOrders ? toRupees(prevRevenue / prevOrders) : 0;
  const conversionRate = visitors ? Number(((conversions / visitors) * 100).toFixed(2)) : 0;
  const prevConversionRate = prevVisitors ? Number(((prevConversions / prevVisitors) * 100).toFixed(2)) : 0;

  const unitsSold = Math.round(orders * 1.8);
  const prevUnits = Math.round(prevOrders * 1.8);
  const grossProfit = toRupees(revenue * 0.41);
  const prevGrossProfit = toRupees(prevRevenue * 0.41);

  return {
    revenue,
    revenueDelta: delta(revenue, prevRevenue),
    orders,
    ordersDelta: delta(orders, prevOrders),
    customers: Math.round(visitors * 0.06),
    customersDelta: delta(visitors, prevVisitors),
    averageOrderValue: aov,
    averageOrderValueDelta: delta(aov, prevAov),
    conversionRate,
    conversionRateDelta: delta(conversionRate, prevConversionRate),
    unitsSold,
    unitsSoldDelta: delta(unitsSold, prevUnits),
    grossProfit,
    grossProfitDelta: delta(grossProfit, prevGrossProfit),
    refundRate: 3.4,
    refundRateDelta: -0.6,
  };
}

export function buildFunnel(points: MetricPoint[], windowDays = 30): FunnelStage[] {
  const window = points.slice(-windowDays);
  const visitors = window.reduce((n, p) => n + p.visitors, 0);
  const productViews = Math.round(visitors * 0.62);
  const addToCart = window.reduce((n, p) => n + p.addToCart, 0);
  const checkouts = window.reduce((n, p) => n + p.checkouts, 0);
  const orders = window.reduce((n, p) => n + p.conversions, 0);

  const stages: [string, number][] = [
    ["Sessions", visitors],
    ["Product views", productViews],
    ["Added to cart", addToCart],
    ["Checkout started", checkouts],
    ["Orders placed", orders],
  ];

  return stages.map(([stage, count]) => ({
    stage,
    count,
    rate: visitors ? Number(((count / visitors) * 100).toFixed(1)) : 0,
  }));
}

export function buildChannels(storeId: string, points: MetricPoint[]): ChannelBreakdown[] {
  const rng = new Rng(`${storeId}:channels`);
  const totalSessions = points.slice(-30).reduce((n, p) => n + p.visitors, 0);
  const totalRevenue = points.slice(-30).reduce((n, p) => n + p.revenue, 0);

  const mix: [string, number][] = [
    ["Direct", 0.26],
    ["Organic search", 0.24],
    ["Paid social", 0.17],
    ["Email", 0.12],
    ["Referral", 0.09],
    ["Paid search", 0.08],
    ["Marketplace", 0.04],
  ];

  return mix.map(([channel, share]) => {
    const sessions = Math.round(totalSessions * share);
    const revenue = Math.round(totalRevenue * share * rng.float(0.85, 1.2));
    return {
      channel,
      sessions,
      orders: Math.round(sessions * rng.float(0.02, 0.06)),
      revenue,
      share: Number((share * 100).toFixed(1)),
    };
  });
}

export function buildTopProducts(products: Product[], orders: Order[], limit = 8): TopEntity[] {
  const tally = new Map<string, { units: number; revenue: number }>();
  for (const order of orders) {
    if (["cancelled", "refunded"].includes(order.status)) continue;
    for (const item of order.items) {
      const entry = tally.get(item.productId) ?? { units: 0, revenue: 0 };
      entry.units += item.quantity;
      entry.revenue += item.total;
      tally.set(item.productId, entry);
    }
  }

  return [...tally.entries()]
    .map(([productId, stats]) => {
      const product = products.find((p) => p.id === productId);
      return {
        id: productId,
        name: product?.name ?? "Unknown product",
        image: product?.media[0]?.url,
        meta: product?.sku,
        units: stats.units,
        revenue: stats.revenue,
        delta: Number((((stats.units % 17) - 6) * 1.7).toFixed(1)),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function buildProductAnalytics(products: Product[], storeId: string): ProductAnalytics[] {
  const rng = new Rng(`${storeId}:product-analytics`);
  return products.map((product) => {
    const views = product.views;
    const uniqueVisitors = Math.round(views * rng.float(0.55, 0.8));
    const addToCart = Math.round(uniqueVisitors * rng.float(0.06, 0.22));
    const purchases = Math.min(addToCart, product.unitsSold);
    return {
      productId: product.id,
      views,
      uniqueVisitors,
      addToCart,
      purchases,
      conversionRate: uniqueVisitors ? Number(((purchases / uniqueVisitors) * 100).toFixed(2)) : 0,
      revenue: purchases * product.price,
      returns: Math.round(purchases * rng.float(0.01, 0.09)),
      wishlistAdds: product.wishlistCount,
    };
  });
}

export function buildCohorts(storeId: string, referenceDate: Date, months = 8): CohortRow[] {
  const rng = new Rng(`${storeId}:cohorts`);
  const rows: CohortRow[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(referenceDate);
    date.setMonth(date.getMonth() - i);
    const label = date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    const periods = i + 1;
    let value = 100;
    const retention = Array.from({ length: periods }, (_, p) => {
      if (p === 0) return 100;
      value = Math.max(6, value * rng.float(0.55, 0.86));
      return Number(value.toFixed(1));
    });
    rows.push({ cohort: label, size: rng.int(120, 1400), retention });
  }
  return rows;
}

/* --------------------------- Platform level -------------------------- */

/**
 * Platform-level KPIs.
 *
 * GMV, orders and customers come from every tenant's denormalised 30-day
 * counters — including the ones without a seeded catalogue — so this agrees
 * with the per-plan breakdown on the revenue page. Take-rate revenue is the
 * real sum of each store's GMV at its own plan's fee, not a blended guess.
 */
export function buildPlatformKpi(
  stores: Store[],
  subscriptions: Subscription[],
  plans: Plan[],
): PlatformKpi {
  const mrr = aggregateMrr(subscriptions);
  const feeByPlan = new Map(plans.map((plan) => [plan.id, plan.transactionFeeBps]));

  let gmv = 0;
  let platformOrders = 0;
  let takeRate = 0;
  for (const store of stores) {
    gmv += store.metrics.gmv;
    platformOrders += store.metrics.orders;
    takeRate += Math.round((store.metrics.gmv * (feeByPlan.get(store.planId) ?? 0)) / 10_000);
  }

  return {
    mrr,
    mrrDelta: 12.4,
    arr: mrr * 12,
    gmv,
    gmvDelta: 18.7,
    activeStores: stores.filter((s) => s.status === "active").length,
    activeStoresDelta: 9.2,
    trialStores: stores.filter((s) => s.status === "trial").length,
    churnRate: 2.1,
    churnDelta: -0.4,
    netRevenueRetention: 112.6,
    platformOrders,
    platformCustomers: stores.reduce((n, s) => n + s.metrics.customers, 0),
    takeRate,
  };
}

export function buildPlatformSeries(
  storeMetrics: Map<string, MetricPoint[]>,
  days = 180,
): { date: string; gmv: number; orders: number; stores: number }[] {
  const totals = new Map<string, { gmv: number; orders: number }>();
  for (const points of storeMetrics.values()) {
    for (const point of points.slice(-days)) {
      const entry = totals.get(point.date) ?? { gmv: 0, orders: 0 };
      entry.gmv += point.revenue;
      entry.orders += point.orders;
      totals.set(point.date, entry);
    }
  }
  const sorted = [...totals.entries()].sort(([a], [b]) => a.localeCompare(b));
  return sorted.map(([date, value], index) => ({
    date,
    gmv: value.gmv,
    orders: value.orders,
    stores: 18 + Math.round((index / Math.max(1, sorted.length)) * 7),
  }));
}
