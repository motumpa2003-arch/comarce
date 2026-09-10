import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileText, Plus } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { number, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const db = await currentStore();
  const pages = [db.homePage, ...db.pages];

  return (
    <>
      <AdminPageHeader
        title="Pages"
        description="Static and policy pages, each built from the same section renderers as the home page."
        breadcrumbs={[{ label: "Storefront" }, { label: "Pages" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New page
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pages" value={number(pages.length)} />
        <Stat label="Published" value={number(pages.filter((p) => p.status === "published").length)} />
        <Stat label="Policy pages" value={number(pages.filter((p) => p.type === "policy").length)} />
        <Stat label="Sections in use" value={number(pages.reduce((n, p) => n + p.sections.length, 0))} />
      </div>

      <Card padded={false}>
        <table className="w-full text-left text-[12.5px]">
          <thead className="border-b border-line bg-muted/50">
            <tr>
              {["Page", "Type", "Sections", "SEO title", "Status", "Updated", ""].map((header) => (
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
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-muted/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{page.title}</p>
                      <p className="text-[11px] text-ink-muted">
                        {page.slug === "home" ? "/" : `/pages/${page.slug}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <Badge tone="outline" size="xs">
                    {titleCase(page.type)}
                  </Badge>
                </td>
                <td className="px-5 py-3 tabular-nums text-ink-muted">{page.sections.length}</td>
                <td className="px-5 py-3">
                  <p className="max-w-[280px] truncate text-ink-muted">{page.seo.title ?? "—"}</p>
                </td>
                <td className="px-5 py-3">
                  <Badge tone={page.status === "published" ? "success" : "warning"} size="xs">
                    {page.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-ink-muted">{relativeTime(page.updatedAt)}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={page.slug === "home" ? "/" : `/pages/${page.slug}`}
                    target="_blank"
                    className="inline-grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                    aria-label={`View ${page.title}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
