import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, MapPin, Plus, Star } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Brands" };

export default async function AdminBrandsPage() {
  const db = await currentStore();

  const revenueByBrand = new Map<string, number>();
  for (const order of db.orders) {
    if (["cancelled", "refunded"].includes(order.status)) continue;
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product?.brandId) continue;
      revenueByBrand.set(product.brandId, (revenueByBrand.get(product.brandId) ?? 0) + item.total);
    }
  }

  const rows = [...db.brands]
    .map((brand) => ({ brand, revenue: revenueByBrand.get(brand.id) ?? 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <>
      <AdminPageHeader
        title="Brands"
        description="Every brand carries the industries it sells into, so the catalogue never assigns a jewellery house to a running shoe."
        breadcrumbs={[{ label: "Catalog" }, { label: "Brands" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New brand
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Brands" value={number(db.brands.length)} />
        <Stat label="Featured" value={number(db.brands.filter((b) => b.featured).length)} />
        <Stat label="Countries" value={number(new Set(db.brands.map((b) => b.origin.split(", ")[1])).size)} />
        <Stat
          label="Average rating"
          value={(db.brands.reduce((n, b) => n + b.rating, 0) / Math.max(1, db.brands.length)).toFixed(1)}
        />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-muted/50">
              <tr>
                {["Brand", "Industries", "Origin", "Products", "Revenue", "Rating", ""].map((header) => (
                  <th
                    key={header}
                    className="whitespace-nowrap px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ brand, revenue }) => (
                <tr key={brand.id} className="hover:bg-muted/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-obsidian text-[10px] font-bold tracking-wider text-accent">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{brand.name}</p>
                        <p className="truncate text-[11px] text-ink-muted">/{brand.slug}</p>
                      </div>
                      {brand.featured && (
                        <Badge tone="accent" size="xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {brand.industries.map((industry) => (
                        <Badge key={industry} tone="outline" size="xs" className="capitalize">
                          {industry}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <MapPin className="h-3 w-3" />
                      {brand.origin}
                    </span>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-ink">{number(brand.productCount)}</td>
                  <td className="px-5 py-3 font-medium tabular-nums text-ink">{money(revenue)}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-ink-muted">
                      <Star className="h-3 w-3 text-accent" />
                      {brand.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/brand/${brand.slug}`}
                      target="_blank"
                      className="inline-grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                      aria-label={`View ${brand.name}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
