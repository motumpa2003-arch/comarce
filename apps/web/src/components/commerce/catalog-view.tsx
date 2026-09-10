import { PackageSearch } from "lucide-react";
import type { CatalogResult, SortKey } from "@obsidian/commerce";
import type { StoreDatabase } from "@obsidian/data";
import { Breadcrumb, Container, EmptyState, PAGE_TOKEN, Pagination, Section } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductGrid } from "./product-card";
import { ProductList } from "./product-row";
import { AppliedFilterChips, FilterPanel, MobileFilterSheet } from "./filter-panel";
import { CatalogToolbar } from "./catalog-toolbar";
import { appliedFilters, buildCatalogHref, type SearchParamsInput } from "@/lib/catalog-params";
import { toCardList } from "@/lib/product-view";

export interface CatalogViewProps {
  db: StoreDatabase;
  result: CatalogResult;
  basePath: string;
  searchParams: SearchParamsInput;
  view: "grid" | "list";
  breadcrumbs?: { label: string; href?: string }[];
  /** Rendered above the toolbar — hero banner, category chips, etc. */
  header?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function CatalogView({
  db,
  result,
  basePath,
  searchParams,
  view,
  breadcrumbs,
  header,
  emptyTitle = "No products match those filters",
  emptyDescription = "Try removing a filter or widening the price range.",
}: CatalogViewProps) {
  const params = toURLSearchParams(searchParams);

  const facetLabels = Object.fromEntries(
    result.facets.map((facet) => [
      facet.key,
      { label: facet.label, values: Object.fromEntries(facet.values.map((v) => [v.value, v.label])) },
    ]),
  );

  const chips = appliedFilters(params, {
    brands: db.brands,
    categories: db.categories,
    facetLabels,
  });

  const cards = toCardList(result.items, db);
  const columns = view === "grid" ? (db.theme.layout.productGridColumns as 3 | 4 | 5) : 4;

  return (
    <>
      {header}

      <Section tone="surface" spacing="none" className="py-8 sm:py-10">
        <Container>
          {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-5" />}

          <div className="lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-10">
            <aside className="hidden lg:block">
              <div className="sticky top-[168px] max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <FilterPanel facets={result.facets} basePath={basePath} priceRange={result.priceRange} />
              </div>
            </aside>

            <div className="min-w-0">
              <CatalogToolbar
                basePath={basePath}
                total={result.total}
                page={result.page}
                pageSize={result.pageSize}
                activeSort={(searchParamValue(searchParams, "sort") as SortKey) ?? "featured"}
                view={view}
                appliedCount={result.appliedCount}
              />

              {chips.length > 0 && (
                <div className="mt-4">
                  <AppliedFilterChips chips={chips} basePath={basePath} />
                </div>
              )}

              <div className="mt-7">
                {result.items.length === 0 ? (
                  <EmptyState
                    icon={<PackageSearch className="h-6 w-6" />}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={<ButtonLink href={basePath}>Clear filters</ButtonLink>}
                    className="rounded-[var(--radius-card)] border border-dashed border-line"
                  />
                ) : view === "list" ? (
                  <ProductList products={cards} />
                ) : (
                  <ProductGrid products={cards} columns={columns} priorityCount={4} />
                )}
              </div>

              {result.pageCount > 1 && (
                <Pagination
                  className="mt-12"
                  page={result.page}
                  pageCount={result.pageCount}
                  hrefTemplate={buildCatalogHref(basePath, params, { page: PAGE_TOKEN })}
                />
              )}
            </div>
          </div>
        </Container>
      </Section>

      <MobileFilterSheet
        facets={result.facets}
        basePath={basePath}
        priceRange={result.priceRange}
        total={result.total}
      />
    </>
  );
}

function toURLSearchParams(input: SearchParamsInput): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    params.set(key, Array.isArray(value) ? value.join(",") : value);
  }
  return params;
}

function searchParamValue(input: SearchParamsInput, key: string): string | undefined {
  const value = input[key];
  return Array.isArray(value) ? value[0] : value;
}
