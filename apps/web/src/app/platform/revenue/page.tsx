import type { Metadata } from "next";
import { Download } from "lucide-react";
import {
  aggregateMrr,
  buildPlatformKpi,
  buildPlatformSeries,
  getPlans,
  getSubscriptions,
  listAllStores,
  listStoreDatabases,
} from "@obsidian/data";
import { Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, MultiLineChart, RankedBars, SERIES } from "@/components/admin/charts";
import { money, moneyShort, number, percent } from "@/lib/format";

export const metadata: Metadata = { title: "Revenue" };

export default function PlatformRevenuePage() {
  const stores = listAllStores();
  const seeded = listStoreDatabases();
  const subscriptions = getSubscriptions();
  const plans = getPlans();

  const metricsByStore = new Map(seeded.map((db) => [db.store.id, db.metrics]));
  const kpi = buildPlatformKpi(stores, subscriptions, plans);
  const series = buildPlatformSeries(metricsByStore, 180);

  // Platform revenue has two components: subscription MRR and the take rate on GMV.
  const takeRateByPlan = plans.map((plan) => {
    const planStores = stores.filter((s) => s.planId === plan.id);
    const gmv = planStores.reduce((n, s) => n + s.metrics.gmv, 0);
    return {
      plan,
      stores: planStores.length,
      gmv,
      take: Math.round((gmv * plan.transactionFeeBps) / 10_000),
      mrr: aggregateMrr(subscriptions.filter((s) => s.planId === plan.id)),
    };
  });

  // kpi.gmv and kpi.takeRate are computed from the same per-store counters and
  // plan fees as the table below, so the cards and the breakdown always agree.
  const totalTake = kpi.takeRate;
  const totalPlatformRevenue = kpi.mrr + totalTake;

  const gmvByStore = [...stores]
    .sort((a, b) => b.metrics.gmv - a.metrics.gmv)
    .slice(0, 10)
    .map((store) => ({ label: store.name, value: store.metrics.gmv }));

  return (
    <>
      <AdminPageHeader
        title="Revenue"
        description="Platform revenue is subscription MRR plus the transaction fee on merchant GMV. Both are shown separately — mixing them hides which lever is actually working."
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Export board pack
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Platform revenue"
          value={money(totalPlatformRevenue)}
          hint="MRR plus take rate"
        />
        <Stat label="Subscription MRR" value={money(kpi.mrr)} delta={kpi.mrrDelta} hint={`${money(kpi.arr)} ARR`} />
        <Stat label="Take rate revenue" value={money(totalTake)} hint="On 30-day GMV" />
        <Stat
          label="Merchant GMV"
          value={money(kpi.gmv)}
          delta={kpi.gmvDelta}
          hint={`${percent((totalTake / Math.max(1, kpi.gmv)) * 100, 2)} effective take`}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Net revenue retention" value={percent(kpi.netRevenueRetention)} hint="Trailing 12 months" />
        <Stat label="Churn rate" value={percent(kpi.churnRate)} delta={kpi.churnDelta} invertDelta />
        <Stat
          label="ARPA"
          value={money(Math.round(kpi.mrr / Math.max(1, kpi.activeStores)))}
          hint="Average revenue per account"
        />
        <Stat
          label="Platform orders"
          value={number(kpi.platformOrders)}
          hint="Last 30 days, all tenants"
        />
      </div>

      <div className="mt-5 space-y-4">
        <ChartFrame
          title="Merchant GMV"
          description="Aggregated daily GMV across every tenant, last 180 days"
          height={300}
          legend={[
            { label: "GMV (₹ lakh)", color: SERIES[0] },
            { label: "Orders", color: SERIES[2] },
          ]}
          footer="Both series are counts on one axis — GMV is expressed in lakh so the scales are comparable without a second y-axis."
        >
          <MultiLineChart
            height={300}
            format="number"
            data={series.map((point) => ({
              date: point.date,
              gmvLakh: Math.round(point.gmv / 10_000_000),
              orders: point.orders,
            }))}
            series={[
              { key: "gmvLakh", label: "GMV (₹ lakh)" },
              { key: "orders", label: "Orders" },
            ]}
          />
        </ChartFrame>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Revenue by plan</h2>
            </div>
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  {["Plan", "Stores", "Fee", "GMV", "Take", "MRR", "Total"].map((header, index) => (
                    <th
                      key={header}
                      className={
                        index >= 1
                          ? "px-4 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                          : "px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                      }
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {takeRateByPlan.map((row) => (
                  <tr key={row.plan.id} className="hover:bg-muted/50">
                    <td className="px-5 py-2.5 font-medium text-ink">{row.plan.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">{number(row.stores)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
                      {percent(row.plan.transactionFeeBps / 100, 2)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
                      {moneyShort(row.gmv)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">{moneyShort(row.take)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">{moneyShort(row.mrr)}</td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-ink">
                      {moneyShort(row.take + row.mrr)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink/15 bg-muted/40">
                  <td className="px-5 py-2.5 font-semibold text-ink">Total</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">
                    {number(takeRateByPlan.reduce((n, r) => n + r.stores, 0))}
                  </td>
                  <td className="px-4 py-2.5" />
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">
                    {moneyShort(takeRateByPlan.reduce((n, r) => n + r.gmv, 0))}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">
                    {moneyShort(totalTake)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">
                    {moneyShort(kpi.mrr)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-ink">
                    {moneyShort(totalPlatformRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>

          <ChartFrame title="GMV by store" description="Top ten tenants, last 30 days" height={280}>
            <RankedBars rows={gmvByStore} format="moneyShort" color={SERIES[0]} />
          </ChartFrame>
        </div>
      </div>
    </>
  );
}
