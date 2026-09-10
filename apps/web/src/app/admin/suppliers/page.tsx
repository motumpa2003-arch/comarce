import type { Metadata } from "next";
import { Mail, Phone, Plus, Star } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Suppliers" };

export default async function AdminSuppliersPage() {
  const db = await currentStore();

  const spendBySupplier = new Map<string, number>();
  for (const po of db.purchaseOrders) {
    if (po.status === "cancelled") continue;
    spendBySupplier.set(po.supplierId, (spendBySupplier.get(po.supplierId) ?? 0) + po.total);
  }

  const rows = [...db.suppliers]
    .map((supplier) => ({ supplier, spend: spendBySupplier.get(supplier.id) ?? 0 }))
    .sort((a, b) => b.spend - a.spend);

  const avgLeadTime = Math.round(
    db.suppliers.reduce((n, s) => n + s.leadTimeDays, 0) / Math.max(1, db.suppliers.length),
  );

  return (
    <>
      <AdminPageHeader
        title="Suppliers"
        description="Who you buy from, on what terms, and how long they take. Lead time feeds the replenishment suggestions on the inventory page."
        breadcrumbs={[{ label: "Inventory" }, { label: "Suppliers" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            Add supplier
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Suppliers" value={number(db.suppliers.length)} hint={`${db.suppliers.filter((s) => s.status === "active").length} active`} />
        <Stat label="Total spend" value={money([...spendBySupplier.values()].reduce((n, v) => n + v, 0))} />
        <Stat label="Average lead time" value={`${avgLeadTime} days`} />
        <Stat label="Open POs" value={number(db.suppliers.reduce((n, s) => n + s.openPurchaseOrders, 0))} />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-muted/50">
              <tr>
                {["Supplier", "Contact", "Country", "Terms", "Lead time", "Open POs", "Spend", "Rating", "Status"].map(
                  (header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ supplier, spend }) => (
                <tr key={supplier.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{supplier.name}</p>
                    <p className="text-[11px] text-ink-muted">{supplier.contactName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                      <Mail className="h-3 w-3" />
                      {supplier.email}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                      <Phone className="h-3 w-3" />
                      {supplier.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{supplier.country}</td>
                  <td className="px-4 py-3 text-ink-muted">{supplier.paymentTerms}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-muted">{supplier.leadTimeDays} days</td>
                  <td className="px-4 py-3 tabular-nums text-ink">{supplier.openPurchaseOrders}</td>
                  <td className="px-4 py-3 font-medium tabular-nums text-ink">{money(spend)}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-ink-muted">
                      <Star className="h-3 w-3 text-accent" />
                      {supplier.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={supplier.status === "active" ? "success" : "neutral"} size="xs">
                      {supplier.status}
                    </Badge>
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
