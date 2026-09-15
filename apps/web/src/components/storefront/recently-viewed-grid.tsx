"use client";

import * as React from "react";
import { History, Trash2 } from "lucide-react";
import { Button, Container, EmptyState, Section, Skeleton, useToast } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductGrid } from "@/components/commerce/product-card";
import type { ProductCardData } from "@/lib/product-view";
import { useHydrated, useRecentlyViewed } from "@/store/shopper";

/**
 * The full recently-viewed page body. History lives in browser storage, so the
 * products are resolved client-side once the persisted store has hydrated —
 * rendering the server's empty state first keeps the first paint honest.
 */
export function RecentlyViewedGrid() {
  const ids = useRecentlyViewed((s) => s.ids);
  const clear = useRecentlyViewed((s) => s.clear);
  const hydrated = useHydrated();
  const { toast } = useToast();
  const [items, setItems] = React.useState<ProductCardData[] | null>(null);

  const key = ids.join(",");

  React.useEffect(() => {
    if (!hydrated) return;
    if (!key) {
      setItems([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/recommendations?strategy=recently_viewed&ids=${key}&limit=20`)
      .then((res) => res.json())
      .then((data) => !cancelled && setItems(data.items ?? []))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [hydrated, key]);

  if (!hydrated || items === null) {
    return (
      <Section tone="surface" spacing="default">
        <Container>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="mt-3 h-3 w-20" />
                <Skeleton className="mt-2 h-4 w-36" />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    );
  }

  if (items.length === 0) {
    return (
      <Section tone="surface" spacing="default">
        <Container>
          <EmptyState
            icon={<History className="h-6 w-6" />}
            title="No browsing history yet"
            description="Products you open will appear here, newest first, for as long as you keep this browser's storage."
            action={<ButtonLink href="/shop">Start browsing</ButtonLink>}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section tone="surface" spacing="default">
      <Container>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12.5px] text-ink-muted">
            {items.length} product{items.length === 1 ? "" : "s"}, newest first.
          </p>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              clear();
              setItems([]);
              toast({ title: "History cleared", description: "Nothing was sent anywhere — it only existed here." });
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear history
          </Button>
        </div>
        <ProductGrid products={items} />
      </Container>
    </Section>
  );
}
