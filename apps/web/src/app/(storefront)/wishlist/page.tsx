import type { Metadata } from "next";
import { getRecommendations } from "@obsidian/data";
import { Breadcrumb, Container, Section } from "@obsidian/ui";
import { WishlistView } from "@/components/storefront/wishlist-view";
import { ProductRail } from "@/components/commerce/product-rail";
import { toCardList } from "@/lib/product-view";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const db = await currentStore();
  const popular = getRecommendations(db.store.id, "popular", { limit: 10 });

  return (
    <>
      <div className="border-b border-line bg-muted">
        <Container className="py-3.5">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
        </Container>
      </div>

      <Section tone="surface" spacing="none" className="py-9 sm:py-12">
        <Container>
          <WishlistView />
        </Container>
      </Section>

      <Section tone="muted" spacing="default">
        <Container>
          <ProductRail
            eyebrow="Popular right now"
            title="Might be worth saving"
            products={toCardList(popular, db)}
            ctaHref="/shop"
          />
        </Container>
      </Section>
    </>
  );
}
