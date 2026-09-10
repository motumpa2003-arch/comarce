import type { Metadata } from "next";
import { Award, Gift, Share2, Star } from "lucide-react";
import { LOYALTY_TIERS } from "@obsidian/data";
import { Badge, Card, Progress, Stat, Switch, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { money, number, percent } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Loyalty" };

export default async function AdminLoyaltyPage() {
  const db = await currentStore();
  const customers = db.customers;

  const tierRows = LOYALTY_TIERS.map((tier) => {
    const members = customers.filter((c) => c.loyaltyTier === tier.key);
    return {
      tier,
      members: members.length,
      revenue: members.reduce((n, c) => n + c.lifetimeValue, 0),
      points: members.reduce((n, c) => n + c.loyaltyPoints, 0),
      avgLtv: members.length ? Math.round(members.reduce((n, c) => n + c.lifetimeValue, 0) / members.length) : 0,
    };
  });

  const totalPoints = customers.reduce((n, c) => n + c.loyaltyPoints, 0);
  const liability = totalPoints * 100;
  const storeCredit = customers.reduce((n, c) => n + c.storeCredit, 0);
  const enrolled = customers.filter((c) => c.loyaltyPoints > 0).length;

  return (
    <>
      <AdminPageHeader
        title="Loyalty"
        description="Tiers, points and store credit. Points are a real balance-sheet liability, so the outstanding value is shown alongside the programme metrics."
        breadcrumbs={[{ label: "Marketing" }, { label: "Loyalty" }]}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            Programme settings
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Enrolled members"
          value={number(enrolled)}
          hint={`${percent((enrolled / Math.max(1, customers.length)) * 100)} of customers`}
        />
        <Stat label="Points outstanding" value={number(totalPoints)} hint={`${money(liability)} liability`} />
        <Stat label="Store credit issued" value={money(storeCredit)} hint="Redeemable at checkout" />
        <Stat
          label="VIP share of revenue"
          value={percent(
            (customers.filter((c) => c.segments.includes("vip")).reduce((n, c) => n + c.lifetimeValue, 0) /
              Math.max(1, customers.reduce((n, c) => n + c.lifetimeValue, 0))) *
              100,
          )}
          hint="Gold and Black tiers"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Award className="h-3.5 w-3.5" />
                Tiers
              </h2>
            </div>
            <ul className="divide-y divide-line">
              {tierRows.map(({ tier, members, revenue, points, avgLtv }) => (
                <li key={tier.key} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold"
                        style={{ backgroundColor: `${tier.color}22`, color: tier.color }}
                      >
                        {tier.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-ink">{tier.name}</p>
                        <p className="mt-0.5 text-[11.5px] text-ink-muted">
                          {tier.minSpend === 0 ? "From the first order" : `${money(tier.minSpend)} lifetime spend`} ·{" "}
                          {tier.pointsMultiplier}× points
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {tier.perks.map((perk) => (
                            <li key={perk} className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                              <Star className="h-3 w-3 text-accent" />
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <dl className="flex shrink-0 flex-wrap gap-x-6 gap-y-2 text-[12px]">
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">Members</dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-ink">{number(members)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">Avg LTV</dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-ink">{money(avgLtv)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">Revenue</dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-ink">{money(revenue)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">Points</dt>
                        <dd className="mt-0.5 font-medium tabular-nums text-ink">{number(points)}</dd>
                      </div>
                    </dl>
                  </div>

                  <Progress
                    className="mt-4"
                    value={(members / Math.max(1, customers.length)) * 100}
                    tone="accent"
                    height={4}
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Members by tier</h2>
            <RankedBars
              rows={tierRows.map((row) => ({ label: row.tier.name, value: row.members }))}
              format="number"
              color={SERIES[0]}
            />
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Earning rules</h2>
            <div className="mt-4 space-y-4">
              <Switch defaultChecked label="Points on purchase" description="1 point per ₹100, multiplied by tier." />
              <Switch defaultChecked label="Review reward" description="50 points for a verified review." />
              <Switch defaultChecked label="Referral reward" description="400 points when a referral's first order ships." />
              <Switch defaultChecked label="Birthday bonus" description="250 points on the customer's birthday." />
              <Switch label="Points expiry" description="Currently off — points never expire." />
            </div>
          </Card>

          <Card tone="muted">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
              <Gift className="h-3.5 w-3.5 text-accent" />
              Redemption
            </h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Point value</dt>
                <dd className="text-ink">₹1 per point</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Minimum redemption</dt>
                <dd className="text-ink">100 points</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Max per order</dt>
                <dd className="text-ink">50% of basket</dd>
              </div>
            </dl>
          </Card>

          <Card tone="muted">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
              <Share2 className="h-3.5 w-3.5 text-accent" />
              Referrals
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              Give ₹400, get ₹400. The referred customer&rsquo;s code applies automatically at checkout; the referrer
              is credited when the order ships.
            </p>
            <Badge tone="success" size="xs" className="mt-3">
              Active
            </Badge>
          </Card>
        </aside>
      </div>
    </>
  );
}
