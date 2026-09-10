import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, getProductAnalyticsFor, getStoreDb } from "@obsidian/data";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductEditor } from "@/components/admin/product-editor";
import { currentStore } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const db = await currentStore();
  const product = getProductById(db.store.id, id);
  return { title: product ? product.name : "Product" };
}

export default async function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await currentStore();
  const product = getProductById(db.store.id, id);
  if (!product) notFound();

  const category = db.categories.find((c) => c.id === product.categoryId);
  const brand = db.brands.find((b) => b.id === product.brandId);
  const inventory = db.inventory.filter((r) => r.productId === product.id);
  const analytics = getProductAnalyticsFor(db.store.id, product.id);
  const reviews = db.reviews.filter((r) => r.productId === product.id).slice(0, 5);
  const movements = db.movements.filter((m) => m.productId === product.id).slice(0, 8);

  return (
    <>
      <AdminPageHeader
        title={product.name}
        description={`${product.sku} · ${category?.name ?? "Uncategorised"}${brand ? ` · ${brand.name}` : ""}`}
        breadcrumbs={[
          { label: "Catalog" },
          { label: "Products", href: "/admin/products" },
          { label: product.name },
        ]}
      />

      <ProductEditor
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          status: product.status,
          productType: product.productType,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          costPrice: product.costPrice,
          sku: product.sku,
          barcode: product.barcode,
          taxClassId: product.taxClassId,
          trackInventory: product.trackInventory,
          allowBackorder: product.allowBackorder,
          shippingRequired: product.shippingRequired,
          weight: product.weight,
          dimensions: product.dimensions,
          media: product.media.map((m) => ({ url: m.url, alt: m.alt })),
          tags: product.tags,
          flags: { ...product.flags } as Record<string, boolean>,
          seo: product.seo,
          highlights: product.highlights,
          categoryId: product.categoryId,
          brandId: product.brandId,
          collectionIds: product.collectionIds,
          variantAttributeKeys: product.variantAttributeKeys,
          attributes: product.attributes,
          variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            title: v.title,
            options: v.options,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            costPrice: v.costPrice,
            stock: v.stock,
            reservedStock: v.reservedStock,
            barcode: v.barcode,
            status: v.status,
          })),
          storefrontHref: `/product/${product.slug}`,
        }}
        options={{
          categories: db.categories.map((c) => ({ id: c.id, name: c.name, level: c.level })),
          brands: db.brands.map((b) => ({ id: b.id, name: b.name })),
          collections: db.collections.map((c) => ({ id: c.id, name: c.name })),
          attributes: db.attributes.map((a) => ({
            key: a.key,
            label: a.label,
            inputType: a.inputType,
            unit: a.unit,
            variantDefining: a.variantDefining,
            options: a.options?.map((o) => ({ value: o.value, label: o.label, swatch: o.swatch })) ?? [],
          })),
          warehouses: db.warehouses.map((w) => ({ id: w.id, name: w.name, code: w.code })),
        }}
        inventory={inventory.map((r) => ({
          id: r.id,
          variantId: r.variantId,
          warehouseId: r.warehouseId,
          onHand: r.onHand,
          reserved: r.reserved,
          incoming: r.incoming,
          reorderPoint: r.reorderPoint,
          binLocation: r.binLocation,
        }))}
        analytics={analytics}
        reviews={reviews.map((r) => ({
          id: r.id,
          customerName: r.customerName,
          rating: r.rating,
          title: r.title,
          body: r.body,
          status: r.status,
          createdAt: r.createdAt,
        }))}
        movements={movements.map((m) => ({
          id: m.id,
          delta: m.delta,
          reason: m.reason,
          actorName: m.actorName,
          createdAt: m.createdAt,
          referenceId: m.referenceId,
        }))}
      />
    </>
  );
}
