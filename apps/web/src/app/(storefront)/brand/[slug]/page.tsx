import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Star } from "lucide-react";
import { getBrandBySlug, queryCatalog } from "@obsidian/data";
import { Container, Rule } from "@obsidian/ui";
import { CatalogView } from "@/components/commerce/catalog-view";
import { parseCatalogParams, type SearchParamsInput } from "@/lib/catalog-params";
import { currentStore, currentStoreId } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(await currentStoreId(), slug);
  if (!brand) return { title: "Brand not found" };
  return { title: brand.name, description: brand.description };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const db = await currentStore();
  const brand = getBrandBySlug(db.store.id, slug);
  if (!brand) notFound();

  const { view, ...query } = parseCatalogParams(search);
  const result = queryCatalog(db.store.id, { ...query, brandIds: [brand.id] });

  return (
    <CatalogView
      db={db}
      result={result}
      basePath={`/brand/${brand.slug}`}
      searchParams={search}
      view={view}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: brand.name }]}
      header={
        <div className="relative isolate overflow-hidden bg-obsidian text-inverse">
          {brand.cover && (
            <Image src={brand.cover} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/40" />
          <Container className="relative py-14 sm:py-16">
            <div className="flex flex-wrap items-end gap-8">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-[var(--radius-card)] border border-accent/30 bg-white/[0.06] backdrop-blur">
                <span className="font-display text-[19px] tracking-[0.14em] text-accent">
                  {brand.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Brand</p>
                <h1 className="mt-2 font-display text-[38px] leading-none text-inverse sm:text-[50px]">
                  {brand.name}
                </h1>
                <Rule className="mt-5" />
                <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-inverse/70">{brand.description}</p>
                <div className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[11.5px] text-inverse/55">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    {brand.origin}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-accent" />
                    {brand.rating.toFixed(1)} average rating
                  </span>
                  <span>{result.total} products</span>
                </div>
              </div>
            </div>
          </Container>
        </div>
      }
    />
  );
}
