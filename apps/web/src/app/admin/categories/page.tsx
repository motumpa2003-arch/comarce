import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ExternalLink, Plus } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const db = await currentStore();
  const parents = db.categories.filter((c) => c.level === 0);

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="The taxonomy behind navigation, filters and SEO. Each top-level category carries an industry, which decides which attribute set its products inherit."
        breadcrumbs={[{ label: "Catalog" }, { label: "Categories" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New category
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Top-level" value={number(parents.length)} hint="Shown in the mega menu" />
        <Stat label="Sub-categories" value={number(db.categories.length - parents.length)} />
        <Stat label="Industries covered" value={number(new Set(db.categories.map((c) => c.industry)).size)} />
        <Stat
          label="Attribute definitions"
          value={number(db.attributes.length)}
          hint="Driving the storefront facets"
        />
      </div>

      <div className="space-y-4">
        {parents.map((parent) => {
          const children = db.categories.filter((c) => c.parentId === parent.id);
          return (
            <Card key={parent.id} padded={false}>
              <div className="flex flex-wrap items-center gap-4 border-b border-line p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                  <Image src={parent.image} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[14px] font-semibold text-ink">{parent.name}</h2>
                    <Badge tone="info" size="xs" className="capitalize">
                      {parent.industry}
                    </Badge>
                    {parent.featured && (
                      <Badge tone="accent" size="xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2x text-[12px] text-ink-muted">{parent.description}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    /{parent.slug} · {number(parent.productCount)} products · {children.length} sub-categories
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Link
                    href={`/category/${parent.slug}`}
                    target="_blank"
                    className={buttonClasses("ghost", "xs")}
                    aria-label={`View ${parent.name} on the storefront`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <button type="button" className={buttonClasses("outline", "xs")}>
                    Edit
                  </button>
                </div>
              </div>

              <ul className="divide-y divide-line">
                {children.map((child) => (
                  <li key={child.id} className="flex items-center gap-3 px-4 py-2.5">
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-muted/60" />
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-[3px] bg-muted">
                      <Image src={child.image} alt="" fill sizes="32px" className="object-cover" />
                    </div>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{child.name}</span>
                    <span className="shrink-0 text-[11.5px] text-ink-muted">/{child.slug}</span>
                    <span className="w-20 shrink-0 text-right text-[12px] tabular-nums text-ink-muted">
                      {number(child.productCount)} items
                    </span>
                    <Link
                      href={`/category/${child.slug}`}
                      target="_blank"
                      className="shrink-0 text-ink-muted transition-colors hover:text-ink"
                      aria-label={`View ${child.name}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                ))}
                {children.length === 0 && (
                  <li className="px-4 py-6 text-center text-[12px] text-ink-muted">No sub-categories.</li>
                )}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}
