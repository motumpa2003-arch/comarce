import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Badge, Card, Progress, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Purchase orders" };

export default async function AdminPurchaseOrdersPage() {
  const db = await currentStore();

  const open = db.purchaseOrders.filter((po) => ["sent", "partial"].includes(po.status));
  const committed = open.reduce((n, po) => n + po.total, 0);
  const incomingUnits = open.reduce(
    (n, po) => n + po.items.reduce((m, item) => m + (item.quantity - item.received), 0),
    0,
  );

  return (
    <>
      <AdminPageHeader
        title="Purchase orders"
        description="Inbound stock from suppliers. Receiving a line adds a purchase movement to the ledger and increments on-hand at the destination location."
        breadcrumbs={[{ label: "Inventory" }, { label: "Purchase orders" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New purchase order
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open orders" value={number(open.length)} hint="Sent or partially received" />
        <Stat label="Committed spend" value={money(committed)} hint="On open POs" />
        <Stat label="Units incoming" value={number(incomingUnits)} />
        <Stat label="Suppliers" value={number(db.suppliers.filter((s) => s.status === "active").length)} />
      </div>

      <Card padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">All purchase orders</h2>
        </div>
        <ul className="divide-y divide-line">
          {db.purchaseOrders.map((po) => {
            const supplier = db.suppliers.find((s) => s.id === po.supplierId);
            const warehouse = db.warehouses.find((w) => w.id === po.warehouseId);
            const ordered = po.items.reduce((n, i) => n + i.quantity, 0);
            const received = po.items.reduce((n, i) => n + i.received, 0);
            const progress = ordered ? (received / ordered) * 100 : 0;

            return (
              <li key={po.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[12.5px]">
                      <span className="font-mono font-medium text-ink">{po.reference}</span>
                      <Badge
                        tone={
                          po.status === "received"
                            ? "success"
                            : po.status === "partial"
                              ? "progress"
                              : po.status === "sent"
                                ? "info"
                                : po.status === "cancelled"
                                  ? "danger"
                                  : "neutral"
                        }
                        size="xs"
                      >
                        {po.status}
                      </Badge>
                    </p>
                    <p className="mt-1.5 text-[12.5px] text-ink">{supplier?.name ?? "Unknown supplier"}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      Into {warehouse?.name ?? po.warehouseId} · {supplier?.paymentTerms} · lead time{" "}
                      {supplier?.leadTimeDays} days
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-semibold tabular-nums text-ink">{money(po.total)}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {money(po.subtotal)} + {money(po.tax)} tax + {money(po.shipping)} freight
                    </p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      Expected {formatDate(po.expectedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5">
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-ink-muted">
                      {number(received)} of {number(ordered)} units received
                    </span>
                    <span className="tabular-nums text-ink">{Math.round(progress)}%</span>
                  </div>
                  <Progress
                    className="mt-1.5"
                    value={progress}
                    tone={progress === 100 ? "success" : "primary"}
                    height={5}
                  />
                </div>

                <table className="mt-4 w-full text-left text-[11.5px]">
                  <thead>
                    <tr className="border-b border-line text-ink-muted">
                      <th className="pb-1.5 font-medium">Line</th>
                      <th className="pb-1.5 text-right font-medium">Ordered</th>
                      <th className="pb-1.5 text-right font-medium">Received</th>
                      <th className="pb-1.5 text-right font-medium">Unit cost</th>
                      <th className="pb-1.5 text-right font-medium">Line total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {po.items.map((item) => (
                      <tr key={item.variantId}>
                        <td className="py-1.5 pr-3 text-ink">{item.name}</td>
                        <td className="py-1.5 text-right tabular-nums text-ink-muted">{item.quantity}</td>
                        <td className="py-1.5 text-right tabular-nums text-ink-muted">{item.received}</td>
                        <td className="py-1.5 text-right tabular-nums text-ink-muted">{money(item.unitCost)}</td>
                        <td className="py-1.5 text-right tabular-nums text-ink">
                          {money(item.quantity * item.unitCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {["sent", "partial"].includes(po.status) && (
                  <div className="mt-4 flex gap-2">
                    <button type="button" className={buttonClasses("primary", "xs")}>
                      Receive stock
                    </button>
                    <button type="button" className={buttonClasses("outline", "xs")}>
                      Email supplier
                    </button>
                  </div>
                )}
              </li>
            );
          })}
          {db.purchaseOrders.length === 0 && (
            <li className="px-5 py-12 text-center text-[12.5px] text-ink-muted">No purchase orders raised.</li>
          )}
        </ul>
      </Card>
    </>
  );
}
