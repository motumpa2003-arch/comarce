import type { Metadata } from "next";
import { EDITORIAL, img } from "@obsidian/data";
import { HubPage } from "@/components/commerce/hub-page";
import type { SearchParamsInput } from "@/lib/catalog-params";
import { number } from "@/lib/format";

export const metadata: Metadata = {
  title: "Gift guide",
  description: "Curated gifts by price band, so you can stop scrolling.",
};

export default async function GiftGuidePage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  return (
    <HubPage
      searchParams={await searchParams}
      basePath="/gift-guide"
      crumb="Gift guide"
      eyebrow="Give something meant"
      title="The gift"
      accent="guide"
      tone="obsidian"
      image={img(EDITORIAL.heroCouple, 1900, 900)}
      slice={(query) => ({
        ...query,
        sort: query.sort ?? "popularity",
        minRating: query.minRating ?? 4,
        inStock: query.inStock ?? true,
      })}
      description={(result) =>
        `Every one of these ${number(result.total)} products is rated four stars or better by people who actually bought it. Filter by price band below, then add a gift message and wrap at checkout.`
      }
      stats={() => [
        { value: "4.0+", label: "Minimum rating" },
        { value: "30 days", label: "Returns window" },
        { value: "Free", label: "Gift message" },
      ]}
      emptyTitle="No gifts match those filters"
      emptyDescription="Every gift here is rated four stars or better. Try widening the price band."
    />
  );
}
