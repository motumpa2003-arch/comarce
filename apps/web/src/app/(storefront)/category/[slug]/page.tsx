import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getStoreDb, queryCatalog } from "@obsidian/data";
import { Container } from "@obsidian/ui";
import { CatalogView } from "@/components/commerce/catalog-view";
import { CategoryTile } from "@/components/commerce/category-tile";
import { parseCatalogParams, type SearchParamsInput } from "@/lib/catalog-params";
import { currentStore, currentStoreId } from "@/lib/tenant";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(await currentStoreId(), slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.seo.title ?? category.name,
    description: category.seo.description ?? category.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const db = await currentStore();
  const category = getCategoryBySlug(db.store.id, slug);
  if (!category) notFound();

  const { view, ...query } = parseCatalogParams(search);
  const result = queryCatalog(db.store.id, {
    ...query,
    categoryIds: [category.id, ...(query.categoryIds ?? [])],
  });

  const parent = category.parentId ? getStoreDb(db.store.id).categories.find((c) => c.id === category.parentId) : undefined;
  const siblings = db.categories.filter((c) => c.parentId === (category.parentId ?? category.id) && c.id !== category.id);
  const children = db.categories.filter((c) => c.parentId === category.id);
  const chips = children.length ? children : siblings;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(parent ? [{ label: parent.name, href: `/category/${parent.slug}` }] : []),
    { label: category.name },
  ];

  return (
    <CatalogView
      db={db}
      result={result}
      basePath={`/category/${category.slug}`}
      searchParams={search}
      view={view}
      breadcrumbs={breadcrumbs}
      emptyTitle={`Nothing in ${category.name} matches those filters`}
      header={
        <>
          <div className="relative isolate overflow-hidden bg-obsidian text-inverse">
            <Image
              src={category.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/75 to-obsidian/20" />
            <Container className="relative py-14 sm:py-20">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">
                {parent?.name ?? "Category"}
              </p>
              <h1 className="mt-3 font-display text-[38px] leading-none text-inverse sm:text-[56px]">
                {category.name}
              </h1>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-inverse/70">{category.description}</p>
              <p className="mt-6 text-[11.5px] uppercase tracking-[0.16em] text-inverse/50">
                {result.total.toLocaleString("en-IN")} products
              </p>
            </Container>
          </div>

          {chips.length > 0 && (
            <div className="border-b border-line bg-surface">
              <Container className="no-scrollbar flex items-start gap-5 overflow-x-auto py-5">
                <Link
                  href={`/category/${(parent ?? category).slug}`}
                  className="group shrink-0 text-center"
                >
                  <div className="grid h-[72px] w-[72px] place-items-center rounded-full border border-ink bg-ink text-[11px] font-medium uppercase tracking-[0.06em] text-inverse">
                    All
                  </div>
                  <p className="mt-2.5 max-w-[76px] text-[11.5px] font-medium leading-snug text-ink">
                    {(parent ?? category).name}
                  </p>
                </Link>
                {chips.map((child) => (
                  <CategoryTile
                    key={child.id}
                    category={child}
                    className="w-[76px]"
                    circleClassName="h-[72px] w-[72px]"
                    imageSizes="72px"
                  />
                ))}
              </Container>
            </div>
          )}
        </>
      }
    />
  );
}
