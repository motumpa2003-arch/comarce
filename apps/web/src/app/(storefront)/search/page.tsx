import type { Metadata } from "next";
import Link from "next/link";
import { queryCatalog, suggestCatalog } from "@obsidian/data";
import { Container } from "@obsidian/ui";
import { CatalogView } from "@/components/commerce/catalog-view";
import { parseCatalogParams, type SearchParamsInput } from "@/lib/catalog-params";
import { currentStore } from "@/lib/tenant";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<Metadata> {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  return { title: q ? `Search: ${q}` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const params = await searchParams;
  const db = await currentStore();
  const { view, ...query } = parseCatalogParams(params);
  const result = queryCatalog(db.store.id, query);

  const term = query.q ?? "";
  // When nothing matches, offer the closest catalogue entities as a next step.
  const alternatives = result.total === 0 && term ? suggestCatalog(db.store.id, term.split(" ")[0] ?? term, 6) : [];

  return (
    <CatalogView
      db={db}
      result={result}
      basePath={`/search?q=${encodeURIComponent(term)}`}
      searchParams={params}
      view={view}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      emptyTitle={`No results for “${term}”`}
      emptyDescription="Check the spelling, remove a filter, or try one of the suggestions below."
      header={
        <div className="border-b border-line bg-ivory">
          <Container className="py-9">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Search results</p>
            <h1 className="mt-2.5 font-display display-case text-[30px] leading-tight text-ink sm:text-[38px]">
              {term ? `“${term}”` : "Search the catalogue"}
            </h1>
            <p className="mt-2.5 text-[13px] text-ink-muted">
              {result.total.toLocaleString("en-IN")} matching product{result.total === 1 ? "" : "s"}
              {term ? " — ranked by relevance, then by how well they sell." : "."}
            </p>

            {alternatives.length > 0 && (
              <div className="mt-6">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Did you mean
                </p>
                <div className="flex flex-wrap gap-2">
                  {alternatives.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] text-ink transition-colors hover:border-ink/35"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </div>
      }
    />
  );
}
