import type { Metadata } from "next";
import { Download, FileSpreadsheet } from "lucide-react";
import { Card, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ImportWizard } from "@/components/admin/import-wizard";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Import products" };

export default async function ProductImportPage() {
  const db = await currentStore();

  // Offer the store's own attribute keys as mapping targets, so the importer is
  // as category-agnostic as the catalogue it writes into.
  const attributeTargets = db.attributes
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((attribute) => ({ key: `attr.${attribute.key}`, label: `${attribute.label} (attribute)` }));

  return (
    <>
      <AdminPageHeader
        title="Import products"
        description="Upload a CSV, map its columns to catalogue fields, then review what would change before anything is written. Nothing is committed until the dry run looks right."
        breadcrumbs={[{ label: "Catalog" }, { label: "Products", href: "/admin/products" }, { label: "Import" }]}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Download template
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <ImportWizard attributeTargets={attributeTargets} />

        <aside className="space-y-4">
          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              What the file needs
            </h2>
            <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-ink-muted">
              <li>
                <span className="font-medium text-ink">sku</span> — required, and the key we match on. A row whose
                SKU already exists updates that product rather than creating a duplicate.
              </li>
              <li>
                <span className="font-medium text-ink">name, price, category</span> — required on new products
                only.
              </li>
              <li>
                <span className="font-medium text-ink">price</span> — in rupees, with or without a decimal. We
                store minor units, so 1299 and 1299.00 are the same thing.
              </li>
              <li>
                <span className="font-medium text-ink">attr.*</span> — anything else maps to one of this store’s
                attribute definitions. Unmapped columns are ignored, never guessed at.
              </li>
            </ul>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Why a dry run</h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              A bad import is far harder to undo than to prevent. The dry run tells you exactly how many products
              would be created, updated and skipped, and shows every row that failed validation with the reason —
              before a single write happens.
            </p>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Large files</h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              Above 5,000 rows the import runs in the background and emails you when it finishes. You can close this
              page — the job is not tied to the tab.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
