import type { Metadata } from "next";
import { getRecommendations } from "@obsidian/data";
import { Container, Section } from "@obsidian/ui";
import { HubHeader } from "@/components/commerce/hub-header";
import { ProductRail } from "@/components/commerce/product-rail";
import { RecentlyViewedGrid } from "@/components/storefront/recently-viewed-grid";
import { toCardList } from "@/lib/product-view";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Recently viewed",
  description: "The products you have looked at, kept on this device.",
};

export default async function RecentlyViewedPage() {
  const db = await currentStore();
  const popular = toCardList(getRecommendations(db.store.id, "popular", { limit: 12 }), db);

  return (
    <>
      <HubHeader
        eyebrow="Your history"
        title="Recently viewed"
        description="The last twenty products you opened, newest first. This list lives in your browser — it is not tied to your account and never leaves this device, so clearing it here clears it everywhere it is used."
      />

      <RecentlyViewedGrid />

      <Section tone="ivory" spacing="default">
        <Container>
          <ProductRail
            products={popular}
            eyebrow="If you are starting fresh"
            title="Popular across the store"
            ctaLabel="Shop all"
            ctaHref="/shop"
          />
        </Container>
      </Section>
    </>
  );
}
