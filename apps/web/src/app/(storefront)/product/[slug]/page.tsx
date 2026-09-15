import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getProductQuestions,
  getProductReviews,
  getRecommendations,
  getStoreDb,
} from "@obsidian/data";
import { Breadcrumb, Container, Section } from "@obsidian/ui";
import { ProductPurchase } from "@/components/commerce/product-purchase";
import { ProductRail } from "@/components/commerce/product-rail";
import { ProductTabsPanel } from "@/components/commerce/product-tabs-panel";
import { RecentlyViewedRail } from "@/components/commerce/recently-viewed-rail";
import { FrequentlyBoughtTogether } from "@/components/commerce/frequently-bought";
import { toProductDetail } from "@/lib/product-detail";
import { toCardList } from "@/lib/product-view";
import { currentStore, currentStoreId } from "@/lib/tenant";
import { TrustBar } from "@/components/storefront/sections";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(await currentStoreId(), slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seo.title ?? product.name,
    description: product.seo.description ?? product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.media[0]?.url ? [product.media[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const storeId = await currentStoreId();
  const product = getProductBySlug(storeId, slug);
  if (!product) notFound();

  const db = await currentStore();
  const detail = toProductDetail(product, getStoreDb(storeId));
  const reviews = getProductReviews(storeId, product.id, 40);
  const questions = getProductQuestions(storeId, product.id);

  const similar = getRecommendations(storeId, "similar", { seedProductId: product.id, limit: 10 });
  const completeTheLook = getRecommendations(storeId, "complete_the_look", { seedProductId: product.id, limit: 8 });
  const bundle = getRecommendations(storeId, "frequently_bought_together", { seedProductId: product.id, limit: 2 });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...(detail.parentCategory
      ? [{ label: detail.parentCategory.name, href: `/category/${detail.parentCategory.slug}` }]
      : []),
    ...(detail.category ? [{ label: detail.category.name, href: `/category/${detail.category.slug}` }] : []),
    { label: detail.name },
  ];

  return (
    <>
      <div className="border-b border-line bg-muted">
        <Container className="py-3.5">
          <Breadcrumb items={breadcrumbs} />
        </Container>
      </div>

      <Section tone="surface" spacing="none" className="py-8 sm:py-12">
        <Container>
          <ProductPurchase detail={detail} />
        </Container>
      </Section>

      <TrustBar tone="muted" />

      <Section tone="surface" spacing="default">
        <Container>
          <ProductTabsPanel detail={detail} reviews={reviews} questions={questions} />
        </Container>
      </Section>

      {bundle.length > 0 && (
        <Section tone="muted" spacing="tight">
          <Container>
            <FrequentlyBoughtTogether
              anchor={{
                id: detail.id,
                slug: detail.slug,
                name: detail.name,
                image: detail.media[0]?.url ?? "",
                price: detail.price,
                variantId: detail.defaultVariantId,
                variantTitle: detail.variants.find((v) => v.id === detail.defaultVariantId)?.title ?? "Default",
                options: detail.variants.find((v) => v.id === detail.defaultVariantId)?.options ?? {},
              }}
              suggestions={toCardList(bundle, db)}
            />
          </Container>
        </Section>
      )}

      {similar.length > 0 && (
        <Section tone="surface" spacing="default">
          <Container>
            <ProductRail
              eyebrow="You may also like"
              title="Similar products"
              products={toCardList(similar, db)}
              ctaHref={detail.category ? `/category/${detail.category.slug}` : "/shop"}
            />
          </Container>
        </Section>
      )}

      {completeTheLook.length > 0 && (
        <Section tone="muted" spacing="default">
          <Container>
            <ProductRail
              eyebrow="Styled with it"
              title="Complete the look"
              products={toCardList(completeTheLook, db)}
              ctaHref="/shop"
            />
          </Container>
        </Section>
      )}

      <RecentlyViewedRail excludeId={detail.id} eyebrow="Pick up where you left off" />
    </>
  );
}
