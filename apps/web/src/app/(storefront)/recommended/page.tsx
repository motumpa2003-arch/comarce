import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { getRecommendations } from "@obsidian/data";
import { Container, Section } from "@obsidian/ui";
import { HubHeader } from "@/components/commerce/hub-header";
import { ProductGrid } from "@/components/commerce/product-card";
import { ProductRail } from "@/components/commerce/product-rail";
import { RecentlyViewedRail } from "@/components/commerce/recently-viewed-rail";
import { toCardList } from "@/lib/product-view";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Recommended for you",
  description: "Picks drawn from what you have browsed, saved and bought.",
};

export default async function RecommendedPage() {
  const db = await currentStore();

  const forYou = toCardList(getRecommendations(db.store.id, "for_you", { limit: 12 }), db);
  const trending = toCardList(getRecommendations(db.store.id, "trending", { limit: 12 }), db);
  const popular = toCardList(getRecommendations(db.store.id, "popular", { limit: 12 }), db);
  const alsoBought = toCardList(getRecommendations(db.store.id, "also_bought", { limit: 12 }), db);

  return (
    <>
      <HubHeader
        eyebrow="Picked for you"
        title="Recommended"
        description="Four different signals, kept separate rather than blended into one opaque feed: what suits your browsing, what is moving this week, what sells consistently, and what people bought alongside your recent orders."
        stats={[
          { value: "4", label: "Signals used" },
          { value: "Daily", label: "Refresh" },
          { value: "On-device", label: "Browsing history" },
        ]}
      />

      <Section tone="surface" spacing="default">
        <Container>
          <div className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-line bg-muted p-4">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              Your browsing history stays in this browser and is never sent anywhere. The rails below are computed
              from catalogue signals; the recently-viewed rail at the bottom is the only one that reads your own
              history, and it resolves on your device.
            </p>
          </div>
          <ProductGrid products={forYou} />
        </Container>
      </Section>

      <Section tone="ivory" spacing="default">
        <Container>
          <ProductRail
            products={trending}
            eyebrow="Moving this week"
            title="Trending now"
            ctaLabel="See all"
            ctaHref="/trending"
          />
        </Container>
      </Section>

      <Section tone="surface" spacing="default">
        <Container>
          <ProductRail
            products={popular}
            eyebrow="Consistently chosen"
            title="Popular across the store"
            ctaLabel="See bestsellers"
            ctaHref="/bestsellers"
          />
        </Container>
      </Section>

      <Section tone="ivory" spacing="default">
        <Container>
          <ProductRail
            products={alsoBought}
            eyebrow="Bought together"
            title="People also bought"
            ctaLabel="Shop all"
            ctaHref="/shop"
          />
        </Container>
      </Section>

      <RecentlyViewedRail title="Recently viewed" eyebrow="Your history" />
    </>
  );
}
