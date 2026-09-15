import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Flame, Percent, Tag, Timer } from "lucide-react";
import { getActiveCoupons, getDealProducts, queryCatalog } from "@obsidian/data";
import { Badge, Container, Rule, Section, SectionHeading } from "@obsidian/ui";
import { CountdownTimer } from "@/components/storefront/sections/countdown";
import { ProductGrid } from "@/components/commerce/product-card";
import { ProductRail } from "@/components/commerce/product-rail";
import { toCardList } from "@/lib/product-view";
import { formatDate, money } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Deals",
  description: "Live discounts, flash sales and coupon codes across every category.",
};

export default async function DealsPage() {
  const db = await currentStore();
  const deals = getDealProducts(db.store.id, 24);
  const biggest = deals.slice(0, 6);
  const coupons = getActiveCoupons(db.store.id).slice(0, 6);
  const promotions = db.promotions.filter((p) => p.status === "active").slice(0, 4);

  const clearance = queryCatalog(db.store.id, { onSale: true, sort: "discount", pageSize: 12 });

  return (
    <>
      {/* Hero */}
      <div className="relative isolate overflow-hidden bg-obsidian text-inverse">
        {promotions[0]?.banner && (
          <Image src={promotions[0].banner} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/30" />
        <Container className="relative py-14 sm:py-20">
          <p className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">
            <Flame className="h-3.5 w-3.5" />
            Limited time
          </p>
          <h1 className="mt-4 font-display display-case text-[clamp(34px,6vw,60px)] leading-[1.02] text-inverse">
            Deals of the <span className="text-accent">season</span>
          </h1>
          <Rule className="mt-6" />
          <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-inverse/70">
            {deals.length}+ products discounted right now, with coupon codes stacking on top. Prices update as stock
            moves.
          </p>
          <div className="mt-9">
            <CountdownTimer hours={62} />
          </div>
        </Container>
      </div>

      {/* Coupons */}
      <Section tone="ivory" spacing="tight">
        <Container>
          <SectionHeading eyebrow="Coupon codes" title="Apply at checkout" size="sm" />
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="relative flex items-center gap-4 overflow-hidden rounded-[var(--radius-card)] border border-dashed border-line bg-surface p-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                  {coupon.type === "free_shipping" ? <Tag className="h-4 w-4" /> : <Percent className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-ink">{coupon.title}</p>
                  <p className="mt-0.5 line-clamp-2x text-[11.5px] leading-snug text-ink-muted">
                    {coupon.description}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px] text-ink-muted">
                    <Timer className="h-3 w-3" />
                    Ends {formatDate(coupon.endsAt)}
                    {coupon.minimumSpend ? ` · min ${money(coupon.minimumSpend)}` : ""}
                  </p>
                </div>
                <Badge tone="obsidian" className="shrink-0">
                  {coupon.code}
                </Badge>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Biggest discounts */}
      <Section tone="surface" spacing="default">
        <Container>
          <SectionHeading
            eyebrow="Biggest markdowns"
            title="Up to 40% off"
            description="Sorted by discount depth. Stock is limited and not replenished."
          />
          <div className="mt-9">
            <ProductGrid products={toCardList(biggest, db)} columns={3} priorityCount={3} />
          </div>
        </Container>
      </Section>

      {/* Promotions */}
      {promotions.length > 0 && (
        <Section tone="muted" spacing="tight">
          <Container>
            <SectionHeading eyebrow="Running now" title="Store promotions" size="sm" />
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {promotions.map((promotion) => (
                <Link
                  key={promotion.id}
                  href="/shop?avail=on_sale"
                  className="group relative aspect-[21/9] overflow-hidden rounded-[var(--radius-card)]"
                >
                  {promotion.banner && (
                    <Image
                      src={promotion.banner}
                      alt=""
                      fill
                      sizes="(min-width:640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 to-obsidian/30" />
                  <div className="absolute inset-0 flex flex-col justify-center p-6">
                    <Badge tone="accent" size="xs" className="w-fit">
                      {promotion.kind.replace(/_/g, " ")}
                    </Badge>
                    <p className="mt-2.5 font-display display-case text-[22px] leading-tight text-inverse">
                      {promotion.name}
                    </p>
                    <p className="mt-1.5 max-w-xs text-[12px] text-inverse/70">{promotion.description}</p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-accent">
                      Ends {formatDate(promotion.endsAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Clearance rail */}
      {clearance.items.length > 0 && (
        <Section tone="surface" spacing="default">
          <Container>
            <ProductRail
              eyebrow="Final markdowns"
              title="Clearance"
              products={toCardList(clearance.items, db)}
              ctaHref="/shop?avail=on_sale&sort=discount"
              ctaLabel="Shop all deals"
            />
          </Container>
        </Section>
      )}
    </>
  );
}
