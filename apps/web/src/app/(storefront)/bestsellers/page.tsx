import type { Metadata } from "next";
import { HubPage } from "@/components/commerce/hub-page";
import type { SearchParamsInput } from "@/lib/catalog-params";
import { compact, number } from "@/lib/format";

export const metadata: Metadata = {
  title: "Bestsellers",
  description: "The products our customers keep coming back for.",
};

export default async function BestsellersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  return (
    <HubPage
      searchParams={await searchParams}
      basePath="/bestsellers"
      crumb="Bestsellers"
      eyebrow="Proven picks"
      title="Bestsellers"
      slice={(query) => ({
        ...query,
        flags: [...(query.flags ?? []), "bestseller" as const],
        sort: query.sort ?? "popularity",
      })}
      description={(result) =>
        `Ranked on units actually shipped, not on what we would like to sell. ${number(result.total)} products qualify right now.`
      }
      stats={(result) => [
        { value: number(result.total), label: "Qualifying products" },
        { value: compact(result.items.reduce((n, p) => n + p.unitsSold, 0)), label: "Units shipped" },
        {
          value: (
            result.items.reduce((n, p) => n + p.rating.average, 0) / Math.max(1, result.items.length)
          ).toFixed(1),
          label: "Average rating",
        },
      ]}
      emptyTitle="No bestsellers match those filters"
      emptyDescription="Bestseller status is earned on sales volume. Clear a filter to see the full list."
    />
  );
}
