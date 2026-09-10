import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCollectionBySlug, queryCatalog } from "@obsidian/data";
import { Container, Rule } from "@obsidian/ui";
import { CatalogView } from "@/components/commerce/catalog-view";
import { parseCatalogParams, type SearchParamsInput } from "@/lib/catalog-params";
import { currentStore, currentStoreId } from "@/lib/tenant";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(await currentStoreId(), slug);
  if (!collection) return { title: "Collection not found" };
  return { title: collection.name, description: collection.description };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const db = await currentStore();
  const collection = getCollectionBySlug(db.store.id, slug);
  if (!collection) notFound();

  const { view, ...query } = parseCatalogParams(search);
  const result = queryCatalog(db.store.id, {
    ...query,
    collectionIds: [collection.id, ...(query.collectionIds ?? [])],
  });

  return (
    <CatalogView
      db={db}
      result={result}
      basePath={`/collection/${collection.slug}`}
      searchParams={search}
      view={view}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Collections", href: "/collections" },
        { label: collection.name },
      ]}
      header={
        <div className="relative isolate overflow-hidden bg-obsidian text-inverse">
          <Image src={collection.image} alt="" fill priority sizes="100vw" className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-obsidian/35" />
          <Container className="relative flex min-h-[380px] flex-col justify-end py-14">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Collection</p>
            <h1 className="mt-3 max-w-2xl font-display text-[40px] leading-[1.02] text-inverse sm:text-[58px]">
              {collection.name}
            </h1>
            <Rule className="mt-6" />
            <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-inverse/70">{collection.description}</p>
            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-inverse/50">
              <span>{result.total} pieces</span>
              <span>{collection.headline}</span>
              {collection.endsAt && <span>Until {formatDate(collection.endsAt)}</span>}
            </div>
          </Container>
        </div>
      }
    />
  );
}
