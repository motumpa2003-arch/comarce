import Link from "next/link";
import { ArrowRight, Building2, IndianRupee, TrendingUp, Users } from "lucide-react";
import {
  aggregateMrr,
  buildPlatformKpi,
  buildPlatformSeries,
  getPlans,
  getPlatformAuditLog,
  getSubscriptions,
  listAllStores,
  listStoreDatabases,
} from "@obsidian/data";
import { Badge, Card, Stat } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, MultiLineChart, RankedBars, SERIES } from "@/components/admin/charts";
import { formatDate, money, moneyShort, number, percent, relativeTime, titleCase } from "@/lib/format";

export default function PlatformOverviewPage() {
  const stores = listAllStores();
  const seeded = listStoreDatabases();
  const subscriptions = getSubscriptions();
  const plans = getPlans();
  const audit = getPlatformAuditLog();

  const metricsByStore = new Map(seeded.map((db) => [db.store.id, db.metrics]));
  const kpi = buildPlatformKpi(stores, subscriptions, plans);
  const series = buildPlatformSeries(metricsByStore, 90);

  const planMix = plans.map((plan) => ({
    label: plan.name,
    value: subscriptions.filter((s) => s.planId === plan.id && ["active", "trialing"].includes(s.status)).length,
  }));

  const mrrByPlan = plans.map((plan) => ({
    label: plan.name,
    value: aggregateMrr(subscriptions.filter((s) => s.planId === plan.id)),
  }));

  const topStores = [...stores]
    .sort((a, b) => b.metrics.gmv - a.metrics.gmv)
    .slice(0, 8);

  const needsAttention = stores.filter((s) => ["suspended", "paused"].includes(s.status));
  const trials = subscriptions.filter((s) => s.status === "trialing");
  const pastDue = subscriptions.filter((s) => s.status === "past_due");

  const industryMix = [...new Set(stores.map((s) => s.industry))]
    .map((industry) => ({
      label: titleCase(industry),
      value: stores.filter((s) => s.industry === industry).length,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <AdminPageHeader
        title="Platform overview"
        description={`${stores.length} tenants on Obsidian Commerce. Every figure here is aggregated across stores — no tenant's data is ever read from another tenant's context.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Monthly recurring revenue"
          value={money(kpi.mrr)}
          delta={kpi.mrrDelta}
          hint={`${money(kpi.arr)} ARR`}
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <Stat
          label="Platform GMV"
          value={money(kpi.gmv)}
          delta={kpi.gmvDelta}
          hint={`Take rate ${money(kpi.takeRate)}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <Stat
          label="Active stores"
          value={number(kpi.activeStores)}
          delta={kpi.activeStoresDelta}
          hint={`${number(kpi.trialStores)} on trial`}
          icon={<Building2 className="h-4 w-4" />}
        />
        <Stat
          label="Churn rate"
          value={percent(kpi.churnRate)}
          delta={kpi.churnDelta}
          invertDelta
          hint={`NRR ${percent(kpi.netRevenueRetention)}`}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Platform orders" value={number(kpi.platformOrders)} hint="Last 30 days" />
        <Stat label="End customers" value={number(kpi.platformCustomers)} hint="Across all tenants" />
        <Stat label="Trials in flight" value={number(trials.length)} hint="Converting or expiring" />
        <Stat label="Past due" value={number(pastDue.length)} hint="Payment retry in progress" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <ChartFrame
          title="Platform GMV and orders"
          description="Aggregated across every tenant, last 90 days"
          height={300}
          legend={[
            { label: "GMV (₹)", color: SERIES[0] },
            { label: "Orders", color: SERIES[2] },
          ]}
          footer="GMV is merchant sales volume; platform revenue is subscription plus take rate."
        >
          {/* GMV is in paise and orders are counts — scale GMV to lakhs so both
              share one axis honestly rather than reaching for a second scale. */}
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

        <div className="space-y-4">
          <ChartFrame title="MRR by plan" description="Normalised to monthly" height={140}>
            <RankedBars rows={mrrByPlan} format="moneyShort" color={SERIES[0]} />
          </ChartFrame>
          <ChartFrame title="Stores by plan" description="Active and trialing" height={140}>
            <RankedBars rows={planMix} format="number" color={SERIES[2]} />
          </ChartFrame>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card padded={false}>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Top stores by GMV</h2>
            <Link
              href="/platform/stores"
              className="group inline-flex items-center gap-1 text-[11.5px] text-ink-muted transition-colors hover:text-ink"
            >
              All stores
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-muted/50">
              <tr>
                {["Store", "Plan", "Status", "Orders", "GMV", "AOV"].map((header, index) => (
                  <th
                    key={header}
                    className={
                      index >= 3
                        ? "px-4 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                        : "px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                    }
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {topStores.map((store) => (
                <tr key={store.id} className="hover:bg-muted/50">
                  <td className="px-4 py-2.5">
                    <Link href={`/platform/stores/${store.id}`} className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[4px] bg-obsidian text-[9px] font-bold text-accent">
                        {store.logoMark}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{store.name}</span>
                        <span className="block truncate text-[10.5px] capitalize text-ink-muted">
                          {store.industry}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone="outline" size="xs">
                      {titleCase(store.planId.replace("plan_", ""))}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge
                      tone={
                        store.status === "active"
                          ? "success"
                          : store.status === "trial"
                            ? "info"
                            : store.status === "suspended"
                              ? "danger"
                              : "warning"
                      }
                      size="xs"
                    >
                      {store.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
                    {number(store.metrics.orders)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums text-ink">
                    {moneyShort(store.metrics.gmv)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">
                    {moneyShort(store.metrics.averageOrderValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-4">
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Needs attention</h2>
            </div>
            <ul className="divide-y divide-line">
              {needsAttention.map((store) => (
                <li key={store.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[4px] bg-obsidian text-[9px] font-bold text-accent">
                    {store.logoMark}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/platform/stores/${store.id}`}
                      className="truncate text-[12px] text-ink hover:text-primary"
                    >
                      {store.name}
                    </Link>
                    <p className="text-[10.5px] text-ink-muted">
                      {titleCase(store.planId.replace("plan_", ""))} · {number(store.metrics.orders)} orders
                    </p>
                  </div>
                  <Badge tone={store.status === "suspended" ? "danger" : "warning"} size="xs">
                    {store.status}
                  </Badge>
                </li>
              ))}
              {needsAttention.length === 0 && (
                <li className="px-5 py-8 text-center text-[12px] text-ink-muted">
                  Every tenant is healthy.
                </li>
              )}
            </ul>
          </Card>

          <ChartFrame title="Industry mix" description="Tenants by vertical" height={180}>
            <RankedBars rows={industryMix} format="number" color={SERIES[3]} />
          </ChartFrame>
        </div>
      </div>

      <Card className="mt-4" padded={false}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">Recent platform activity</h2>
          <Link
            href="/platform/audit-logs"
            className="group inline-flex items-center gap-1 text-[11.5px] text-ink-muted transition-colors hover:text-ink"
          >
            Full audit log
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {audit.slice(0, 8).map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center gap-4 px-5 py-2.5 text-[12px]">
              <Badge
                tone={
                  entry.severity === "critical" ? "danger" : entry.severity === "warning" ? "warning" : "neutral"
                }
                size="xs"
                className="w-20 justify-center"
              >
                {entry.severity}
              </Badge>
              <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-ink">
                {entry.action}
              </code>
              <span className="min-w-0 flex-1 truncate text-ink-muted">
                {entry.actorName} · {entry.resource} {entry.resourceId}
              </span>
              <span className="shrink-0 font-mono text-[10.5px] text-ink-muted">{entry.ip}</span>
              <span className="w-28 shrink-0 text-right text-ink-muted">{relativeTime(entry.createdAt)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line px-5 py-2.5 text-[11px] text-ink-muted">
          Oldest entry {formatDate(audit[audit.length - 1]?.createdAt ?? new Date().toISOString())}
        </div>
      </Card>
    </>
  );
}
