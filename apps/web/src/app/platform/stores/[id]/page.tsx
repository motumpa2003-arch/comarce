import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Globe, Pause, ShieldAlert } from "lucide-react";
import {
  getPlans,
  getPlatformUsers,
  getSubscriptions,
  listAllStores,
  listStoreDatabases,
  monthlyMrr,
  summariseKpis,
} from "@obsidian/data";
import { Badge, Card, Progress, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, RankedBars, RevenueAreaChart, SERIES } from "@/components/admin/charts";
import { StoreImpersonateButton } from "@/components/platform/store-impersonate-button";
import { formatDate, money, number, percent, titleCase } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const store = listAllStores().find((s) => s.id === id);
  return { title: store ? store.name : "Store" };
}

export default async function PlatformStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = listAllStores().find((s) => s.id === id);
  if (!store) notFound();

  const subscription = getSubscriptions().find((s) => s.storeId === store.id);
  const plan = getPlans().find((p) => p.id === store.planId);
  const owner = getPlatformUsers().find((u) => u.id === store.ownerId);
  const seeded = listStoreDatabases().find((db) => db.store.id === store.id);

  const kpis = seeded ? summariseKpis(seeded.metrics, 30) : null;
  const mrr = subscription ? monthlyMrr(subscription) : 0;

  // Usage against the plan's entitlements — the basis for an upgrade nudge.
  const usage = plan
    ? [
        { label: "Products", used: store.metrics.products, limit: plan.limits.products },
        { label: "Monthly orders", used: store.metrics.orders, limit: plan.limits.monthlyOrders },
        { label: "Staff seats", used: seeded?.staff.length ?? 1, limit: plan.limits.staff },
        { label: "Warehouses", used: seeded?.warehouses.length ?? 1, limit: plan.limits.warehouses },
      ]
    : [];

  const categoryMix = seeded
    ? seeded.categories
        .filter((c) => c.level === 0)
        .map((category) => ({ label: category.name, value: category.productCount }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)
    : [];

  return (
    <>
      <AdminPageHeader
        title={store.name}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              {store.customDomain ?? store.domain}
            </span>
            <span className="capitalize">{store.industry}</span>
            <span>Joined {formatDate(store.createdAt)}</span>
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
          </span>
        }
        breadcrumbs={[{ label: "Stores", href: "/platform/stores" }, { label: store.name }]}
        actions={
          <>
            {seeded && <StoreImpersonateButton storeId={store.id} storeName={store.name} />}
            <Link
              href={`https://${store.domain}`}
              className={buttonClasses("outline", "sm")}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visit storefront
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="MRR" value={money(mrr)} hint={`${plan?.name ?? "—"} · ${subscription?.interval ?? "—"}`} />
        <Stat label="GMV (30d)" value={money(store.metrics.gmv)} hint={`${number(store.metrics.orders)} orders`} />
        <Stat label="End customers" value={number(store.metrics.customers)} />
        <Stat
          label="Conversion"
          value={percent(store.metrics.conversionRate, 2)}
          hint={`AOV ${money(store.metrics.averageOrderValue)}`}
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {seeded && kpis ? (
            <ChartFrame
              title="Store revenue"
              description={`Daily revenue, last 90 days · ${money(kpis.revenue)} in the last 30`}
              height={280}
            >
              <RevenueAreaChart data={seeded.metrics.slice(-90)} height={280} />
            </ChartFrame>
          ) : (
            <Card className="py-14 text-center">
              <p className="text-[13px] text-ink-muted">
                This tenant exists as a SaaS record only — no demo catalogue was seeded for it, so there is no
                store-level revenue series to chart.
              </p>
            </Card>
          )}

          {usage.length > 0 && (
            <Card>
              <h2 className="text-[12.5px] font-semibold text-ink">Plan usage</h2>
              <p className="mt-1 text-[12px] text-ink-muted">
                Entitlements come from the {plan?.name} plan. Crossing a limit blocks the action rather than
                silently over-serving.
              </p>
              <ul className="mt-4 space-y-3.5">
                {usage.map((row) => {
                  const share = Math.min(100, (row.used / Math.max(1, row.limit)) * 100);
                  return (
                    <li key={row.label}>
                      <div className="flex items-baseline justify-between text-[12px]">
                        <span className="text-ink">{row.label}</span>
                        <span className="tabular-nums text-ink-muted">
                          {number(row.used)} / {row.limit >= 1_000_000 ? "unlimited" : number(row.limit)}
                        </span>
                      </div>
                      <Progress
                        className="mt-1.5"
                        value={share}
                        tone={share > 85 ? "danger" : share > 65 ? "warning" : "primary"}
                        height={5}
                      />
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {categoryMix.length > 0 && (
            <Card>
              <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Catalogue by category</h2>
              <RankedBars rows={categoryMix} format="number" color={SERIES[0]} />
            </Card>
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Subscription</h2>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <Row label="Plan" value={plan?.name ?? "—"} />
              <Row label="Status" value={titleCase(subscription?.status ?? "none")} />
              <Row label="Interval" value={titleCase(subscription?.interval ?? "—")} />
              <Row label="Amount" value={subscription ? money(subscription.amount) : "—"} />
              <Row label="Transaction fee" value={plan ? `${(plan.transactionFeeBps / 100).toFixed(2)}%` : "—"} />
              <Row label="Seats" value={String(subscription?.seats ?? "—")} />
              <Row
                label="Renews"
                value={subscription ? formatDate(subscription.currentPeriodEnd) : "—"}
              />
              {subscription?.trialEndsAt && (
                <Row label="Trial ends" value={formatDate(subscription.trialEndsAt)} />
              )}
              {subscription?.cancelledAt && (
                <Row label="Cancelled" value={formatDate(subscription.cancelledAt)} />
              )}
            </dl>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" className={buttonClasses("outline", "xs", true)}>
                Change plan
              </button>
              <button type="button" className={buttonClasses("ghost", "xs", true)}>
                Issue credit note
              </button>
            </div>
          </Card>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Owner</h2>
            {owner ? (
              <dl className="mt-3 space-y-2 text-[12.5px]">
                <Row label="Name" value={owner.name} />
                <Row label="Email" value={owner.email} />
                <Row label="Phone" value={owner.phone} />
                <Row label="MFA" value={owner.mfaEnabled ? "Enabled" : "Not enabled"} />
                <Row label="Last login" value={formatDate(owner.lastLoginAt)} />
              </dl>
            ) : (
              <p className="mt-2 text-[12.5px] text-ink-muted">No owner record.</p>
            )}
          </Card>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Feature flags</h2>
            <ul className="mt-3 space-y-2 text-[12.5px]">
              {Object.entries(store.features).map(([feature, enabled]) => (
                <li key={feature} className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">{titleCase(feature)}</span>
                  <Badge tone={enabled ? "success" : "neutral"} size="xs">
                    {enabled ? "On" : "Off"}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-danger">
              <ShieldAlert className="h-3.5 w-3.5" />
              Operator actions
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              Suspension takes the storefront offline immediately and is written to the platform audit log with your
              operator id.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" className={buttonClasses("outline", "xs", true)}>
                <Pause className="h-3.5 w-3.5" />
                Pause store
              </button>
              <button type="button" className={buttonClasses("ghost", "xs", true, "text-danger")}>
                Suspend for policy breach
              </button>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="truncate text-right text-ink">{value}</dd>
    </div>
  );
}
