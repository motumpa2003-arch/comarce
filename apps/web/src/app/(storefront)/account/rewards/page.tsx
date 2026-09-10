import type { Metadata } from "next";
import { Award, Gift, Share2, Star, TrendingUp } from "lucide-react";
import { getCustomerOrders, getDemoCustomer, LOYALTY_TIERS } from "@obsidian/data";
import { Badge, Card, Progress, cn } from "@obsidian/ui";
import { formatDate, money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Rewards" };

export default async function RewardsPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);
  const orders = getCustomerOrders(db.store.id, customer.id);

  const tier = LOYALTY_TIERS.find((t) => t.key === customer.loyaltyTier)!;
  const tierIndex = LOYALTY_TIERS.indexOf(tier);
  const nextTier = LOYALTY_TIERS[tierIndex + 1];

  // Derive a ledger from the customer's real order history.
  const ledger = [
    ...orders.slice(0, 6).map((order) => ({
      id: order.id,
      label: `Order #${order.orderNumber}`,
      points: Math.round((order.total / 10000) * tier.pointsMultiplier),
      date: order.createdAt,
      reason: "purchase" as const,
    })),
    {
      id: "birthday",
      label: "Birthday bonus",
      points: 250,
      date: customer.createdAt,
      reason: "birthday" as const,
    },
    {
      id: "review",
      label: "Review reward",
      points: 50,
      date: customer.lastSeenAt,
      reason: "review" as const,
    },
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display display-case text-[26px] leading-none text-ink">Rewards</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Earn on everything you buy. Points never expire while your account is active.
        </p>
      </div>

      {/* Balance */}
      <Card tone="obsidian" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-accent">Points balance</p>
            <p className="mt-2 font-display text-[46px] leading-none text-inverse">
              {number(customer.loyaltyPoints)}
            </p>
            <p className="mt-2 text-[12.5px] text-inverse/60">
              Worth {money(customer.loyaltyPoints * 100)} at checkout
            </p>
          </div>
          <div className="text-right">
            <Badge tone="accent">{tier.name} member</Badge>
            <p className="mt-2 text-[12px] text-inverse/60">Earning {tier.pointsMultiplier}× points</p>
          </div>
        </div>

        {nextTier && (
          <div className="relative mt-7">
            <div className="flex items-baseline justify-between text-[11.5px] text-inverse/60">
              <span>{tier.name}</span>
              <span>
                {money(Math.max(0, nextTier.minSpend - customer.lifetimeValue))} more to reach {nextTier.name}
              </span>
            </div>
            <Progress
              className="mt-2"
              tone="accent"
              value={Math.min(
                100,
                ((customer.lifetimeValue - tier.minSpend) / (nextTier.minSpend - tier.minSpend)) * 100,
              )}
            />
          </div>
        )}
      </Card>

      {/* Tiers */}
      <section>
        <h2 className="mb-4 font-display display-case text-[20px] text-ink">Membership tiers</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LOYALTY_TIERS.map((entry, index) => {
            const current = entry.key === tier.key;
            const unlocked = index <= tierIndex;
            return (
              <Card
                key={entry.key}
                className={cn(
                  "flex flex-col",
                  current && "border-ink ring-1 ring-ink",
                  !unlocked && "opacity-70",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full text-[12px] font-semibold"
                    style={{ backgroundColor: `${entry.color}22`, color: entry.color }}
                  >
                    {entry.name.charAt(0)}
                  </span>
                  {current && (
                    <Badge tone="obsidian" size="xs">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="mt-3 text-[15px] font-medium text-ink">{entry.name}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {entry.minSpend === 0 ? "From your first order" : `${money(entry.minSpend)} lifetime spend`}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {entry.perks.map((perk) => (
                    <li key={perk} className="flex gap-2 text-[12px] text-ink-muted">
                      <Star className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Earn more */}
      <section>
        <h2 className="mb-4 font-display display-case text-[20px] text-ink">Ways to earn</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <EarnTile
            icon={<TrendingUp className="h-4 w-4" />}
            title="Shop"
            points={`${tier.pointsMultiplier} pt per ₹100`}
            hint="Credited when the order is delivered"
          />
          <EarnTile
            icon={<Star className="h-4 w-4" />}
            title="Write a review"
            points="50 pts"
            hint="Verified purchases, once per product"
          />
          <EarnTile
            icon={<Share2 className="h-4 w-4" />}
            title="Refer a friend"
            points="400 pts"
            hint="When their first order ships"
          />
        </div>
      </section>

      {/* Ledger */}
      <section>
        <h2 className="mb-4 font-display display-case text-[20px] text-ink">Points activity</h2>
        <Card padded={false}>
          <ul className="divide-y divide-line">
            {ledger.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-ink-muted">
                    {entry.reason === "purchase" ? (
                      <Award className="h-3.5 w-3.5" />
                    ) : entry.reason === "birthday" ? (
                      <Gift className="h-3.5 w-3.5" />
                    ) : (
                      <Star className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-ink">{entry.label}</p>
                    <p className="text-[11.5px] text-ink-muted">{formatDate(entry.date)}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[13px] font-medium tabular-nums text-success">
                  +{number(entry.points)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

function EarnTile({
  icon,
  title,
  points,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  points: string;
  hint: string;
}) {
  return (
    <Card>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
      <p className="mt-3 text-[13.5px] font-medium text-ink">{title}</p>
      <p className="mt-1 font-display text-[19px] text-accent">{points}</p>
      <p className="mt-1 text-[11.5px] text-ink-muted">{hint}</p>
    </Card>
  );
}
