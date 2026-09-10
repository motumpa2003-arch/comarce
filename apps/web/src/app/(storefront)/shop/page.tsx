import type { Metadata } from "next";
import { queryCatalog } from "@obsidian/data";
import { Container, Rule } from "@obsidian/ui";
import { CatalogView } from "@/components/commerce/catalog-view";
import { parseCatalogParams, type SearchParamsInput } from "@/lib/catalog-params";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Shop all",
  description: "Browse the full catalogue across every category.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const params = await searchParams;
  const db = await currentStore();
  const { view, ...query } = parseCatalogParams(params);
  const result = queryCatalog(db.store.id, query);

  return (
    <CatalogView
      db={db}
      result={result}
      basePath="/shop"
      searchParams={params}
      view={view}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop all" }]}
      header={
        <div className="border-b border-line bg-ivory">
          <Container className="py-10 sm:py-12">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">
              {db.store.name}
            </p>
            <h1 className="mt-3 font-display display-case text-[34px] leading-none text-ink sm:text-[46px]">
              Shop everything
            </h1>
            <Rule className="mt-5" />
            <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
              {result.total.toLocaleString("en-IN")} products across {db.categories.filter((c) => c.level === 0).length}{" "}
              categories and {db.brands.length} brands. Filter by anything the merchant has defined — the facets below
              come from the catalogue, not from hard-coded fields.
            </p>
          </Container>
        </div>
      }
    />
  );
}
