import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Plus, Users } from "lucide-react";
import { Badge, Card, Progress, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { money, number, percent } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Segments" };

const SEGMENTS: {
  key: string;
  name: string;
  description: string;
  rule: string;
}[] = [
  { key: "new", name: "New customers", description: "Signed up, ordered at most once.", rule: "orders ≤ 1" },
  { key: "repeat", name: "Repeat buyers", description: "Two or more orders placed.", rule: "orders ≥ 2" },
  { key: "vip", name: "VIP", description: "Ten or more orders, high lifetime value.", rule: "orders ≥ 10" },
  { key: "high_value", name: "High value", description: "Lifetime value above ₹60,000.", rule: "LTV > ₹60,000" },
  { key: "at_risk", name: "At risk", description: "Repeat buyer whose cadence has slipped.", rule: "no order in 60 days" },
  { key: "inactive", name: "Inactive", description: "No order in the last six months.", rule: "no order in 180 days" },
  { key: "coupon_led", name: "Coupon-led", description: "Most orders used a discount code.", rule: "coupon rate > 50%" },
];

export default async function AdminSegmentsPage() {
  const db = await currentStore();
  const customers = db.customers;
  const totalLtv = customers.reduce((n, c) => n + c.lifetimeValue, 0);

  const rows = SEGMENTS.map((segment) => {
    const members = customers.filter((c) => c.segments.includes(segment.key as never));
    const ltv = members.reduce((n, c) => n + c.lifetimeValue, 0);
    return {
      ...segment,
      members: members.length,
      ltv,
      share: customers.length ? (members.length / customers.length) * 100 : 0,
      revenueShare: totalLtv ? (ltv / totalLtv) * 100 : 0,
      avgLtv: members.length ? Math.round(ltv / members.length) : 0,
      optedIn: members.filter((c) => c.marketingOptIn).length,
    };
  }).sort((a, b) => b.members - a.members);

  return (
    <>
      <AdminPageHeader
        title="Segments"
        description="Behavioural cohorts recomputed from order history. Campaigns and coupon eligibility both target segments rather than hand-picked lists."
        breadcrumbs={[{ label: "Customers" }, { label: "Segments" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New segment
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Customers" value={number(customers.length)} />
        <Stat label="Segments" value={number(rows.length)} hint="Auto-computed" />
        <Stat
          label="VIP revenue share"
          value={percent(rows.find((r) => r.key === "vip")?.revenueShare ?? 0)}
          hint="Of total lifetime value"
        />
        <Stat
          label="Win-back opportunity"
          value={money(rows.find((r) => r.key === "inactive")?.ltv ?? 0)}
          hint="LTV sitting in inactive"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          {rows.map((segment) => (
            <Card key={segment.key}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-ink">
                    <Users className="h-3.5 w-3.5 text-ink-muted" />
                    {segment.name}
                    <Badge tone="outline" size="xs">
                      {segment.rule}
                    </Badge>
                  </h2>
                  <p className="mt-1.5 text-[12px] text-ink-muted">{segment.description}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/customers?segment=${segment.key}`}
                    className={buttonClasses("outline", "xs")}
                  >
                    View members
                  </Link>
                  <button type="button" className={buttonClasses("ghost", "xs")}>
                    <Mail className="h-3.5 w-3.5" />
                    Campaign
                  </button>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Members</dt>
                  <dd className="mt-0.5 text-[17px] font-semibold tabular-nums text-ink">
                    {number(segment.members)}
                  </dd>
                  <Progress className="mt-1.5" value={segment.share} height={4} />
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Lifetime value</dt>
                  <dd className="mt-0.5 text-[17px] font-semibold tabular-nums text-ink">{money(segment.ltv)}</dd>
                  <Progress className="mt-1.5" value={segment.revenueShare} tone="accent" height={4} />
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Average LTV</dt>
                  <dd className="mt-0.5 text-[17px] font-semibold tabular-nums text-ink">
                    {money(segment.avgLtv)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Reachable</dt>
                  <dd className="mt-0.5 text-[17px] font-semibold tabular-nums text-ink">
                    {number(segment.optedIn)}
                  </dd>
                  <p className="mt-0.5 text-[10.5px] text-ink-muted">opted in to marketing</p>
                </div>
              </dl>
            </Card>
          ))}
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Members by segment</h2>
            <RankedBars
              rows={rows.map((r) => ({ label: r.name, value: r.members }))}
              format="number"
              color={SERIES[0]}
            />
          </Card>

          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Revenue by segment</h2>
            <RankedBars
              rows={rows.map((r) => ({ label: r.name, value: r.ltv }))}
              format="moneyShort"
              color={SERIES[1]}
            />
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">How segments work</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              Membership is derived, not assigned. A customer can belong to several segments at once — a VIP is also
              a repeat buyer and, usually, high value. Rules recompute whenever an order lands.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
