import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const db = await currentStore();

  return (
    <>
      <AdminPageHeader
        title="Collections"
        description="Merchandising groups that cut across categories. Manual collections hold a pick list; smart collections follow rules and update themselves."
        breadcrumbs={[{ label: "Catalog" }, { label: "Collections" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New collection
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Collections" value={number(db.collections.length)} />
        <Stat
          label="Featured"
          value={number(db.collections.filter((c) => c.featured).length)}
          hint="Shown in navigation"
        />
        <Stat
          label="Products assigned"
          value={number(db.collections.reduce((n, c) => n + c.productIds.length, 0))}
        />
        <Stat label="Smart collections" value={number(db.collections.filter((c) => c.type === "smart").length)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {db.collections.map((collection) => (
          <Card key={collection.id} padded={false} className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-muted">
              <Image src={collection.image} alt="" fill sizes="360px" className="object-cover" />
              <div className="absolute right-3 top-3 flex gap-1.5">
                {collection.featured && (
                  <Badge tone="accent" size="xs">
                    Featured
                  </Badge>
                )}
                <Badge tone="obsidian" size="xs" className="capitalize">
                  {collection.type}
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-[13.5px] font-semibold text-ink">{collection.name}</h2>
              <p className="mt-1 line-clamp-2x text-[12px] leading-snug text-ink-muted">{collection.headline}</p>
              <dl className="mt-3 space-y-1.5 text-[11.5px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-muted">Products</dt>
                  <dd className="tabular-nums text-ink">{number(collection.productIds.length)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-muted">Handle</dt>
                  <dd className="truncate text-ink-muted">/{collection.slug}</dd>
                </div>
                {collection.endsAt && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-ink-muted">Ends</dt>
                    <dd className="text-ink-muted">{formatDate(collection.endsAt)}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex gap-1.5">
                <button type="button" className={buttonClasses("outline", "xs", true)}>
                  Edit
                </button>
                <Link
                  href={`/collection/${collection.slug}`}
                  target="_blank"
                  className={buttonClasses("ghost", "xs")}
                  aria-label={`View ${collection.name}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
