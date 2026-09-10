import type { Metadata } from "next";
import { getActiveCoupons, getRecommendations } from "@obsidian/data";
import { Breadcrumb, Container, Section } from "@obsidian/ui";
import { ProductRail } from "@/components/commerce/product-rail";
import { CartPageView } from "@/components/storefront/cart-page-view";
import { toCardList } from "@/lib/product-view";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Your bag" };

export default async function CartPage() {
  const db = await currentStore();
  const offers = getActiveCoupons(db.store.id)
    .filter((c) => c.customerEligibility === "all")
    .slice(0, 4)
    .map((c) => ({ code: c.code, title: c.title }));

  const recommended = getRecommendations(db.store.id, "trending", { limit: 10 });

  return (
    <>
      <div className="border-b border-line bg-muted">
        <Container className="py-3.5">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Your bag" }]} />
        </Container>
      </div>

      <Section tone="surface" spacing="none" className="py-9 sm:py-12">
        <Container>
          <h1 className="mb-8 font-display display-case text-[30px] leading-none text-ink sm:text-[40px]">
            Your bag
          </h1>
          <CartPageView offers={offers} />
        </Container>
      </Section>

      <Section tone="muted" spacing="default">
        <Container>
          <ProductRail
            eyebrow="Before you go"
            title="You may also like"
            products={toCardList(recommended, db)}
            ctaHref="/shop"
          />
        </Container>
      </Section>
    </>
  );
}
