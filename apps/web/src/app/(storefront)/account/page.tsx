import Link from "next/link";
import { ArrowRight, Award, Heart, MapPin, Package, RotateCcw, Ticket } from "lucide-react";
import {
  getActiveCoupons,
  getCustomerOrders,
  getDemoCustomer,
  getRecommendations,
  LOYALTY_TIERS,
} from "@obsidian/data";
import { ORDER_STATUS_META } from "@obsidian/commerce";
import { Badge, Card, Progress } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { OrderCard } from "@/components/account/order-card";
import { ProductRail } from "@/components/commerce/product-rail";
import { toCardList } from "@/lib/product-view";
import { formatDate, money, number, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export default async function AccountOverviewPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);
  const orders = getCustomerOrders(db.store.id, customer.id);
  const openOrders = orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.status));
  const recent = orders.slice(0, 2);
  const returns = db.returns.filter((r) => r.customerId === customer.id);
  const coupons = getActiveCoupons(db.store.id).slice(0, 3);

  const tier = LOYALTY_TIERS.find((t) => t.key === customer.loyaltyTier)!;
  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(tier) + 1];
  const tierProgress = nextTier
    ? Math.min(100, ((customer.lifetimeValue - tier.minSpend) / (nextTier.minSpend - tier.minSpend)) * 100)
    : 100;

  const forYou = getRecommendations(db.store.id, "for_you", {
    purchasedIds: orders.flatMap((o) => o.items.map((i) => i.productId)),
    limit: 10,
  });

  return (
    <div className="space-y-9">
      {/* Quick tiles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickTile
          href="/account/orders"
          icon={<Package className="h-4 w-4" />}
          label="Open orders"
          value={number(openOrders.length)}
          hint={openOrders[0] ? ORDER_STATUS_META[openOrders[0].status].label : "Nothing in transit"}
        />
        <QuickTile
          href="/account/rewards"
          icon={<Award className="h-4 w-4" />}
          label="Loyalty points"
          value={number(customer.loyaltyPoints)}
          hint={`Worth ${money(customer.loyaltyPoints * 100)}`}
        />
        <QuickTile
          href="/wishlist"
          icon={<Heart className="h-4 w-4" />}
          label="Wishlist"
          value="View"
          hint="Saved for later"
        />
        <QuickTile
          href="/account/addresses"
          icon={<MapPin className="h-4 w-4" />}
          label="Addresses"
          value={number(customer.addresses.length)}
          hint="Manage delivery"
        />
      </div>

      {/* Loyalty */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Loyalty programme
            </p>
            <h2 className="mt-1.5 font-display text-[24px] leading-none text-ink">{tier.name} member</h2>
            <p className="mt-2 text-[12.5px] text-ink-muted">
              Lifetime spend {money(customer.lifetimeValue)} · earning {tier.pointsMultiplier}× points
            </p>
          </div>
          <span
            className="grid h-12 w-12 place-items-center rounded-full text-[13px] font-semibold"
            style={{ backgroundColor: `${tier.color}22`, color: tier.color }}
          >
            {tier.name.charAt(0)}
          </span>
        </div>

        {nextTier && (
          <div className="mt-5">
            <div className="flex items-baseline justify-between text-[11.5px]">
              <span className="text-ink-muted">{tier.name}</span>
              <span className="text-ink-muted">
                {money(Math.max(0, nextTier.minSpend - customer.lifetimeValue))} to {nextTier.name}
              </span>
            </div>
            <Progress className="mt-2" value={tierProgress} tone="accent" />
          </div>
        )}

        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          {tier.perks.map((perk) => (
            <li key={perk} className="text-[12px] text-ink-muted">
              · {perk}
            </li>
          ))}
        </ul>
      </Card>

      {/* Recent orders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display display-case text-[20px] text-ink">Recent orders</h2>
          <Link
            href="/account/orders"
            className="group inline-flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        {recent.length ? (
          <div className="space-y-4">
            {recent.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <p className="text-[13px] text-ink-muted">No orders yet.</p>
            <ButtonLink href="/shop" className="mt-4">
              Start shopping
            </ButtonLink>
          </Card>
        )}
      </section>

      {/* Returns + coupons */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
              <RotateCcw className="h-3.5 w-3.5" />
              Returns & refunds
            </h3>
          </div>
          {returns.length ? (
            <ul className="divide-y divide-line">
              {returns.slice(0, 3).map((request) => (
                <li key={request.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-ink">#{request.orderNumber}</p>
                    <p className="text-[11.5px] text-ink-muted">
                      {request.items.length} item{request.items.length === 1 ? "" : "s"} ·{" "}
                      {relativeTime(request.createdAt)}
                    </p>
                  </div>
                  <Badge tone={request.status === "completed" ? "success" : "warning"} size="xs">
                    {request.status.replace(/_/g, " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-[12.5px] text-ink-muted">No returns in progress.</p>
          )}
        </Card>

        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
              <Ticket className="h-3.5 w-3.5" />
              Coupons for you
            </h3>
          </div>
          <ul className="divide-y divide-line">
            {coupons.map((coupon) => (
              <li key={coupon.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink">{coupon.title}</p>
                  <p className="truncate text-[11.5px] text-ink-muted">
                    Expires {formatDate(coupon.endsAt)}
                  </p>
                </div>
                <Badge tone="accent" size="xs">
                  {coupon.code}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {forYou.length > 0 && (
        <section className="border-t border-line pt-9">
          <ProductRail
            eyebrow="Picked for you"
            title="Based on what you buy"
            products={toCardList(forYou, db)}
            ctaHref="/shop"
          />
        </section>
      )}
    </div>
  );
}

function QuickTile({
  href,
  icon,
  label,
  value,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-colors hover:border-ink/25"
    >
      <p className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="mt-2.5 font-display text-[24px] leading-none text-ink">{value}</p>
      <p className="mt-1.5 truncate text-[11.5px] text-ink-muted">{hint}</p>
    </Link>
  );
}
