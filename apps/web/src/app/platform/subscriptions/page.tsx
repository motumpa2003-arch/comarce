import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { getPlans, getSubscriptions, listAllStores, monthlyMrr } from "@obsidian/data";
import { Badge, Card, Stat } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { formatDate, money, number, relativeTime, titleCase } from "@/lib/format";

export const metadata: Metadata = { title: "Subscriptions" };

export default function PlatformSubscriptionsPage() {
  const subscriptions = getSubscriptions();
  const stores = listAllStores();
  const plans = getPlans();

  const rows = subscriptions
    .map((subscription) => {
      const store = stores.find((s) => s.id === subscription.storeId);
      const plan = plans.find((p) => p.id === subscription.planId);
      const mrr = monthlyMrr(subscription);
      return { subscription, store, plan, mrr };
    })
    .sort((a, b) => b.mrr - a.mrr);

  const active = rows.filter((r) => r.subscription.status === "active");
  const trialing = rows.filter((r) => r.subscription.status === "trialing");
  const pastDue = rows.filter((r) => r.subscription.status === "past_due");
  const cancelled = rows.filter((r) => r.subscription.status === "cancelled");

  const mrr = [...active, ...trialing].reduce((n, r) => n + r.mrr, 0);
  const atRisk = pastDue.reduce((n, r) => n + r.mrr, 0);

  const byStatus = ["active", "trialing", "past_due", "paused", "cancelled"].map((status) => ({
    label: titleCase(status.replace("_", " ")),
    value: rows.filter((r) => r.subscription.status === status).length,
  }));

  return (
    <>
      <AdminPageHeader
        title="Subscriptions"
        description="Billing state for every tenant. Past-due subscriptions keep the storefront live through a dunning window, then suspend."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="MRR" value={money(mrr)} hint={`${number(active.length + trialing.length)} paying or trialing`} />
        <Stat label="Trials" value={number(trialing.length)} hint="Converting or expiring" />
        <Stat label="At risk" value={money(atRisk)} hint={`${number(pastDue.length)} past due`} />
        <Stat label="Cancelled" value={number(cancelled.length)} hint="All time" />
      </div>

      {pastDue.length > 0 && (
        <Card className="mt-5 border-danger/40 bg-danger/[0.04]" padded={false}>
          <div className="flex items-center gap-2 border-b border-danger/25 px-5 py-3">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <h2 className="text-[12.5px] font-semibold text-danger">
              {pastDue.length} subscription{pastDue.length === 1 ? "" : "s"} past due · {money(atRisk)} at risk
            </h2>
          </div>
          <ul className="divide-y divide-danger/15">
            {pastDue.map(({ subscription, store, plan, mrr: amount }) => (
              <li key={subscription.id} className="flex flex-wrap items-center gap-4 px-5 py-3 text-[12.5px]">
                <Link
                  href={`/platform/stores/${subscription.storeId}`}
                  className="min-w-0 flex-1 truncate font-medium text-ink hover:text-primary"
                >
                  {store?.name ?? subscription.storeId}
                </Link>
                <span className="shrink-0 text-ink-muted">{plan?.name}</span>
                <span className="shrink-0 tabular-nums text-ink">{money(amount)}/mo</span>
                <span className="shrink-0 text-ink-muted">
                  due {formatDate(subscription.currentPeriodEnd)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">All subscriptions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  {["Store", "Plan", "Status", "Interval", "MRR", "Seats", "Started", "Renews"].map(
                    (header, index) => (
                      <th
                        key={header}
                        className={
                          index >= 4
                            ? "whitespace-nowrap px-4 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                            : "whitespace-nowrap px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                        }
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ subscription, store, plan, mrr: amount }) => (
                  <tr key={subscription.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/platform/stores/${subscription.storeId}`}
                        className="flex items-center gap-2.5"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[4px] bg-obsidian text-[9px] font-bold text-accent">
                          {store?.logoMark ?? "??"}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-ink">
                            {store?.name ?? subscription.storeId}
                          </span>
                          <span className="block truncate text-[10.5px] capitalize text-ink-muted">
                            {store?.industry}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone="outline" size="xs">
                        {plan?.name ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        tone={
                          subscription.status === "active"
                            ? "success"
                            : subscription.status === "trialing"
                              ? "info"
                              : subscription.status === "past_due"
                                ? "danger"
                                : subscription.status === "paused"
                                  ? "warning"
                                  : "neutral"
                        }
                        size="xs"
                      >
                        {subscription.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 capitalize text-ink-muted">{subscription.interval}</td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-ink">{money(amount)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">{subscription.seats}</td>
                    <td className="px-4 py-2.5 text-right text-ink-muted">
                      {formatDate(subscription.startedAt)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-ink-muted">
                      {subscription.status === "cancelled" && subscription.cancelledAt
                        ? `cancelled ${relativeTime(subscription.cancelledAt)}`
                        : relativeTime(subscription.currentPeriodEnd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">By status</h2>
            <RankedBars rows={byStatus} format="number" color={SERIES[2]} />
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Dunning policy</h2>
            <ol className="mt-3 space-y-1.5 text-[12px] text-ink-muted">
              <li>1. Retry on day 1, 3 and 7</li>
              <li>2. Email the owner on each failure</li>
              <li>3. Warn in the admin from day 3</li>
              <li>4. Suspend the storefront on day 14</li>
              <li>5. Data retained for 30 days after suspension</li>
            </ol>
          </Card>
        </aside>
      </div>
    </>
  );
}
