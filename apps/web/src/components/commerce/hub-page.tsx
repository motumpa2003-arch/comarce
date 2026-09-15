import type { CatalogQuery, CatalogResult } from "@obsidian/commerce";
import { queryCatalog } from "@obsidian/data";
import { CatalogView } from "@/components/commerce/catalog-view";
import { HubHeader } from "@/components/commerce/hub-header";
import { parseCatalogParams, type SearchParamsInput } from "@/lib/catalog-params";
import { currentStore } from "@/lib/tenant";

export interface HubPageProps {
  searchParams: SearchParamsInput;
  basePath: string;
  crumb: string;
  eyebrow: string;
  title: string;
  accent?: string;
  tone?: "ivory" | "obsidian";
  image?: string;
  emptyTitle: string;
  emptyDescription: string;
  /**
   * The slice this hub is about, merged over the shopper's own filters so
   * their choices layer on top instead of replacing the hub's identity.
   */
  slice: (query: CatalogQuery) => CatalogQuery;
  description: (result: CatalogResult) => string;
  stats?: (result: CatalogResult) => { value: string; label: string }[];
}

/**
 * Every discovery hub — new arrivals, bestsellers, trending, gift guide,
 * flash sale — is the same catalogue view with a different pre-applied slice
 * and masthead. Sharing the body keeps filtering, sorting, pagination and the
 * empty state identical across all of them, which is the point: a shopper who
 * learns the controls once has learned them everywhere.
 */
export async function HubPage({
  searchParams,
  basePath,
  crumb,
  eyebrow,
  title,
  accent,
  tone = "ivory",
  image,
  emptyTitle,
  emptyDescription,
  slice,
  description,
  stats,
}: HubPageProps) {
  const db = await currentStore();
  const { view, ...query } = parseCatalogParams(searchParams);
  const result = queryCatalog(db.store.id, slice(query));

  return (
    <CatalogView
      db={db}
      result={result}
      basePath={basePath}
      searchParams={searchParams}
      view={view}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: crumb }]}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      header={
        <HubHeader
          eyebrow={eyebrow}
          title={title}
          accent={accent}
          tone={tone}
          image={image}
          description={description(result)}
          stats={stats?.(result)}
        />
      }
    />
  );
}
