import type { Metadata } from "next";
import { FileText, Percent } from "lucide-react";
import { TAX_CLASSES } from "@obsidian/commerce";
import { Badge, Card, Stat, Switch, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { money, number, percent } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Taxes" };

export default async function AdminTaxesPage() {
  const db = await currentStore();

  const productsByClass = TAX_CLASSES.map((taxClass) => ({
    taxClass,
    products: db.products.filter((p) => p.taxClassId === taxClass.id).length,
  }));

  const settled = db.orders.filter((o) => !["cancelled", "refunded"].includes(o.status));
  const taxCollected = settled.reduce((n, o) => n + o.tax, 0);
  const taxableValue = settled.reduce((n, o) => n + o.total, 0) - taxCollected;

  // Intra-state orders split into CGST + SGST; inter-state carry IGST.
  const intraState = settled.filter((o) => o.shippingAddress.state === "Karnataka");
  const interState = settled.filter((o) => o.shippingAddress.state !== "Karnataka");
  const intraTax = intraState.reduce((n, o) => n + o.tax, 0);
  const interTax = interState.reduce((n, o) => n + o.tax, 0);

  return (
    <>
      <AdminPageHeader
        title="Taxes"
        description="Indian GST is quoted inclusive of the displayed price; the invoice extracts the component rather than adding it on top. Each product carries a tax class."
        breadcrumbs={[{ label: "Finance" }, { label: "Taxes" }]}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <FileText className="h-3.5 w-3.5" />
            GSTR-1 export
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Tax collected" value={money(taxCollected)} hint={`${number(settled.length)} settled orders`} />
        <Stat label="Taxable value" value={money(taxableValue)} hint="Ex-tax revenue" />
        <Stat
          label="Effective rate"
          value={taxableValue > 0 ? percent((taxCollected / taxableValue) * 100, 2) : "—"}
          hint="Blended across classes"
        />
        <Stat label="Tax classes" value={number(TAX_CLASSES.length)} hint="Configured" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Percent className="h-3.5 w-3.5" />
                Tax classes
              </h2>
            </div>
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  {["Class", "Rate", "HSN prefix", "Applies to", "Products"].map((header, index) => (
                    <th
                      key={header}
                      className={
                        index === 4
                          ? "px-5 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                          : "px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                      }
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {productsByClass.map(({ taxClass, products }) => (
                  <tr key={taxClass.id} className="hover:bg-muted/50">
                    <td className="px-5 py-3 font-medium text-ink">{taxClass.name}</td>
                    <td className="px-5 py-3">
                      <Badge tone={taxClass.rate === 0 ? "neutral" : "info"} size="xs">
                        {taxClass.rate}%
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-ink-muted">
                      {taxClass.hsnPrefix ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{taxClass.description}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">{number(products)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Liability by place of supply</h2>
            </div>
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  {["Supply type", "Components", "Orders", "Tax"].map((header, index) => (
                    <th
                      key={header}
                      className={
                        index >= 2
                          ? "px-5 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                          : "px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                      }
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="px-5 py-3 text-ink">Intra-state (Karnataka)</td>
                  <td className="px-5 py-3 text-ink-muted">CGST 9% + SGST 9%</td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink-muted">{number(intraState.length)}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums text-ink">{money(intraTax)}</td>
                </tr>
                <tr>
                  <td className="px-5 py-3 text-ink">Inter-state</td>
                  <td className="px-5 py-3 text-ink-muted">IGST 18%</td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink-muted">{number(interState.length)}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums text-ink">{money(interTax)}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Tax settings</h2>
            <div className="mt-4 space-y-4">
              <Switch
                defaultChecked
                label="Prices include tax"
                description="Displayed prices are inclusive; the invoice extracts the component."
              />
              <Switch
                defaultChecked
                label="Charge tax on shipping"
                description="Apply the order's blended rate to delivery charges."
              />
              <Switch
                defaultChecked
                label="Show HSN codes on invoices"
                description="Required for B2B invoices above ₹50,000."
              />
              <Switch label="Collect customer GSTIN" description="Enables input-credit invoices for businesses." />
            </div>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Registration</h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">GSTIN</dt>
                <dd className="font-mono text-ink">29ABCDE1234F1Z5</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">State</dt>
                <dd className="text-ink">Karnataka (29)</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Filing</dt>
                <dd className="text-ink">Monthly, GSTR-1 / 3B</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">PAN</dt>
                <dd className="font-mono text-ink">ABCDE1234F</dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </>
  );
}
