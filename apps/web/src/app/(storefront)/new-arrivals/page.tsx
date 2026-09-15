import type { Metadata } from "next";
import { HubPage } from "@/components/commerce/hub-page";
import type { SearchParamsInput } from "@/lib/catalog-params";
import { number } from "@/lib/format";

export const metadata: Metadata = {
  title: "New arrivals",
  description: "Everything that landed in the last thirty days, across every category.",
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  return (
    <HubPage
      searchParams={await searchParams}
      basePath="/new-arrivals"
      crumb="New arrivals"
      eyebrow="Just landed"
      title="New arrivals"
      slice={(query) => ({
        ...query,
        flags: [...(query.flags ?? []), "isNew" as const],
        sort: query.sort ?? "newest",
      })}
      description={(result) =>
        `${number(result.total)} pieces added in the last thirty days, newest first. The top of this page changes every week.`
      }
      stats={(result) => [
        { value: number(result.total), label: "New this month" },
        { value: number(new Set(result.items.map((p) => p.categoryId)).size), label: "Categories" },
        {
          value: number(new Set(result.items.map((p) => p.brandId).filter(Boolean)).size),
          label: "Brands",
        },
      ]}
      emptyTitle="Nothing new matches those filters"
      emptyDescription="New arrivals rotate weekly. Try widening the filters, or check back on Thursday."
    />
  );
}
