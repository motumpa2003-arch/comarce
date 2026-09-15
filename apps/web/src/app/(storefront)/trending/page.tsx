import type { Metadata } from "next";
import { EDITORIAL, img } from "@obsidian/data";
import { HubPage } from "@/components/commerce/hub-page";
import type { SearchParamsInput } from "@/lib/catalog-params";
import { compact, number } from "@/lib/format";

export const metadata: Metadata = {
  title: "Trending",
  description: "What everyone is looking at this week.",
};

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  return (
    <HubPage
      searchParams={await searchParams}
      basePath="/trending"
      crumb="Trending"
      eyebrow="Moving fast"
      title="Trending now"
      tone="obsidian"
      image={img(EDITORIAL.heroStreet, 1900, 900)}
      slice={(query) => ({
        ...query,
        sort: query.sort ?? "popularity",
        inStock: query.inStock ?? true,
      })}
      description={() =>
        "Ranked on views, wishlist saves and sales over the last seven days. Everything here is in stock — a trending product you cannot buy is just an advert."
      }
      stats={(result) => [
        { value: compact(result.items.reduce((n, p) => n + p.views, 0)), label: "Views this week" },
        {
          value: compact(result.items.reduce((n, p) => n + p.wishlistCount, 0)),
          label: "Wishlist saves",
        },
        { value: number(result.total), label: "In stock now" },
      ]}
      emptyTitle="Nothing trending matches those filters"
      emptyDescription="Trending is computed on the last seven days of activity. Try clearing a filter."
    />
  );
}
