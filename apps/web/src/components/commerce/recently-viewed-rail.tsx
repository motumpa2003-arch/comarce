"use client";

import * as React from "react";
import { Skeleton } from "@obsidian/ui";
import type { ProductCardData } from "@/lib/product-view";
import { useHydrated, useRecentlyViewed } from "@/store/shopper";
import { ProductRail } from "./product-rail";

/**
 * Recently-viewed lives in browser storage, so the rail resolves its products
 * client-side once the store has hydrated.
 */
export function RecentlyViewedRail({
  excludeId,
  title = "Recently viewed",
  eyebrow,
}: {
  excludeId?: string;
  title?: string;
  eyebrow?: string;
}) {
  const ids = useRecentlyViewed((s) => s.ids);
  const hydrated = useHydrated();
  const [items, setItems] = React.useState<ProductCardData[] | null>(null);

  const relevant = React.useMemo(
    () => ids.filter((id) => id !== excludeId).slice(0, 10),
    [ids, excludeId],
  );

  React.useEffect(() => {
    if (!hydrated || relevant.length === 0) {
      setItems([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/recommendations?strategy=recently_viewed&ids=${relevant.join(",")}&limit=10`)
      .then((res) => res.json())
      .then((data) => !cancelled && setItems(data.items ?? []))
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [hydrated, relevant]);

  if (!hydrated || items === null) {
    if (relevant.length === 0) return null;
    return (
      <div>
        <Skeleton className="mb-7 h-7 w-56" />
        <div className="flex gap-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="w-[260px] shrink-0">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="mt-3 h-3 w-24" />
              <Skeleton className="mt-2 h-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return <ProductRail products={items} title={title} eyebrow={eyebrow} ctaHref="/shop" ctaLabel="Shop all" />;
}
