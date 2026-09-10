import type { Metadata } from "next";
import { ChevronRight, GripVertical, Plus } from "lucide-react";
import { Badge, Card, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Navigation" };

export default async function AdminNavigationPage() {
  const db = await currentStore();

  return (
    <>
      <AdminPageHeader
        title="Navigation"
        description="Menus are data, not markup. The mega menu, footer columns and mobile drawer all read from these records, so a merchant can restructure the shop without a developer."
        breadcrumbs={[{ label: "Storefront" }, { label: "Navigation" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New menu
          </button>
        }
      />

      <div className="space-y-4">
        {db.menus.map((menu) => (
          <Card key={menu.id} padded={false}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div>
                <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                  {menu.name}
                  <Badge tone="outline" size="xs">
                    {menu.handle}
                  </Badge>
                </h2>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {menu.items.length} top-level item{menu.items.length === 1 ? "" : "s"} ·{" "}
                  {menu.items.reduce((n, item) => n + (item.children?.length ?? 0), 0)} children
                </p>
              </div>
              <button type="button" className={buttonClasses("outline", "xs")}>
                Add item
              </button>
            </div>

            <ul className="divide-y divide-line">
              {menu.items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-center gap-3 px-5 py-3">
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-muted/60" />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-ink">
                        {item.label}
                        {item.badge && (
                          <Badge tone="sale" size="xs">
                            {item.badge}
                          </Badge>
                        )}
                      </p>
                      <p className="truncate text-[11.5px] text-ink-muted">{item.href}</p>
                    </div>
                    {item.children && item.children.length > 0 && (
                      <span className="shrink-0 text-[11px] text-ink-muted">
                        {item.children.length} children
                      </span>
                    )}
                    <button type="button" className={buttonClasses("ghost", "xs")}>
                      Edit
                    </button>
                  </div>

                  {item.children && item.children.length > 0 && (
                    <ul className="border-t border-line bg-muted/40">
                      {item.children.slice(0, 8).map((child) => (
                        <li key={child.id} className="flex items-center gap-3 px-5 py-2 pl-12">
                          <ChevronRight className="h-3 w-3 shrink-0 text-ink-muted/60" />
                          <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{child.label}</span>
                          <span className="shrink-0 text-[11px] text-ink-muted">{child.href}</span>
                          {child.children && child.children.length > 0 && (
                            <span className="shrink-0 text-[10.5px] text-ink-muted">
                              +{child.children.length}
                            </span>
                          )}
                        </li>
                      ))}
                      {item.children.length > 8 && (
                        <li className="px-5 py-2 pl-12 text-[11px] text-ink-muted">
                          and {item.children.length - 8} more
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
