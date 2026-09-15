import type { Metadata } from "next";
import { EDITORIAL, img } from "@obsidian/data";
import { HubPage } from "@/components/commerce/hub-page";
import type { SearchParamsInput } from "@/lib/catalog-params";
import { number } from "@/lib/format";

export const metadata: Metadata = {
  title: "Flash sale",
  description: "The steepest discounts on the platform, while stock lasts.",
};

export default async function FlashSalePage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  return (
    <HubPage
      searchParams={await searchParams}
      basePath="/flash-sale"
      crumb="Flash sale"
      eyebrow="Ends soon"
      title="Flash"
      accent="sale"
      tone="obsidian"
      image={img(EDITORIAL.heroStore, 1900, 900)}
      slice={(query) => ({
        ...query,
        onSale: true,
        sort: query.sort ?? "discount",
        inStock: query.inStock ?? true,
      })}
      description={(result) =>
        `${number(result.total)} products reduced, deepest discount first. Stock is live — when a size sells out it leaves this page rather than staying up as a tease.`
      }
      stats={(result) => {
        const deepest = result.items.reduce((best, product) => {
          if (!product.compareAtPrice || product.compareAtPrice <= product.price) return best;
          const cut = Math.round((1 - product.price / product.compareAtPrice) * 100);
          return Math.max(best, cut);
        }, 0);
        return [
          { value: number(result.total), label: "Reduced now" },
          { value: `${deepest}%`, label: "Deepest cut" },
          { value: "Live", label: "Stock check" },
        ];
      }}
      emptyTitle="Nothing on flash sale matches those filters"
      emptyDescription="Flash stock moves quickly. Try clearing a filter, or browse the deals hub."
    />
  );
}
