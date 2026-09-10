import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download, Plus, Upload } from "lucide-react";
import { discountPercent } from "@obsidian/commerce";
import { Badge, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductsTable } from "@/components/admin/products-table";
import { money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const db = await currentStore();

  const rows = db.products.map((product) => {
    const category = db.categories.find((c) => c.id === product.categoryId);
    const brand = db.brands.find((b) => b.id === product.brandId);
    const available = product.variants.reduce((n, v) => n + Math.max(0, v.stock - v.reservedStock), 0);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.media[0]?.url ?? "",
      sku: product.sku,
      brand: brand?.name ?? "—",
      category: category?.name ?? "—",
      industry: product.industry,
      status: product.status,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      discount: discountPercent(product.price, product.compareAtPrice),
      variants: product.variants.length,
      stock: available,
      unitsSold: product.unitsSold,
      rating: product.rating.average,
      ratingCount: product.rating.count,
      updatedAt: product.updatedAt,
    };
  });

  const active = rows.filter((r) => r.status === "active").length;
  const outOfStock = rows.filter((r) => r.stock === 0).length;
  const inventoryValue = db.products.reduce(
    (n, p) => n + p.variants.reduce((m, v) => m + v.stock * (v.costPrice ?? Math.round(v.price * 0.55)), 0),
    0,
  );

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${number(db.products.length)} products across ${db.categories.filter((c) => c.level === 1).length} categories. Attributes and variants are defined per store — nothing here is hard-coded to one industry.`}
        breadcrumbs={[{ label: "Catalog" }, { label: "Products" }]}
        actions={
          <>
            <button className={buttonClasses("outline", "sm")} type="button">
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </button>
            <button className={buttonClasses("outline", "sm")} type="button">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <Link href="/admin/products/new" className={buttonClasses("primary", "sm")}>
              <Plus className="h-3.5 w-3.5" />
              New product
            </Link>
          </>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active products" value={number(active)} hint={`${db.products.length - active} draft or archived`} />
        <Stat label="Variants" value={number(db.products.reduce((n, p) => n + p.variants.length, 0))} hint="Across all products" />
        <Stat label="Out of stock" value={number(outOfStock)} hint="Needs replenishment" />
        <Stat label="Inventory value" value={money(inventoryValue)} hint="At cost price" />
      </div>

      <ProductsTable
        rows={rows}
        categories={[...new Set(rows.map((r) => r.category))].sort()}
        brands={[...new Set(rows.map((r) => r.brand))].sort()}
      />
    </>
  );
}
