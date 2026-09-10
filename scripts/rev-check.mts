const { getPlans, getSubscriptions, listAllStores } = await import("../packages/data/src/repositories.ts");

const plans = new Map(getPlans().map((p) => [p.id, p]));
const subs = new Map(getSubscriptions().map((s) => [s.storeId, s]));
const rows = listAllStores().map((s) => {
  const plan = plans.get(s.planId)!;
  const sub = subs.get(s.id);
  const mrr = sub ? (sub.interval === "annual" ? Math.round(sub.amount / 12) : sub.amount) : 0;
  return {
    name: s.name,
    plan: plan.name,
    status: s.status,
    ordersLimit: plan.limits.monthlyOrders,
    orders: s.metrics.orders,
    aovRs: Math.round(s.metrics.averageOrderValue / 100),
    gmvCr: +(s.metrics.gmv / 1e9).toFixed(2),
    takeCr: +((s.metrics.gmv * plan.transactionFeeBps) / 10000 / 1e9).toFixed(3),
    mrrRs: +(mrr / 100).toFixed(2),
  };
});
rows.sort((a, b) => b.gmvCr - a.gmvCr);
console.table(rows);
const gmv = rows.reduce((n, r) => n + r.gmvCr, 0);
const take = rows.reduce((n, r) => n + r.takeCr, 0);
const mrr = rows.reduce((n, r) => n + r.mrrRs, 0);
console.log({ gmvCr: +gmv.toFixed(2), takeCr: +take.toFixed(2), mrrRs: +mrr.toFixed(2), overLimit: rows.filter(r=>r.orders>r.ordersLimit).length });
