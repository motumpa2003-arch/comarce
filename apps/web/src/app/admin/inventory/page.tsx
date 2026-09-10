import type { Metadata } from "next";
import { AlertTriangle, Download, PackageMinus } from "lucide-react";
import { reorderSuggestions, summariseStock } from "@obsidian/commerce";
import { getLowStockRecords } from "@obsidian/data";
import { Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InventoryTable } from "@/components/admin/inventory-table";
import { money, number, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const db = await currentStore();

  // One row per variant per location — that is the unit stock is actually held in.
  const rows = db.inventory.map((record) => {
    const product = db.products.find((p) => p.id === record.productId);
    const variant = product?.variants.find((v) => v.id === record.variantId);
    const warehouse = db.warehouses.find((w) => w.id === record.warehouseId);
    const available = Math.max(0, record.onHand - record.reserved);
    return {
      id: record.id,
      productId: record.productId,
      variantId: record.variantId,
      warehouseId: record.warehouseId,
      product: product?.name ?? "Unknown",
      image: product?.media[0]?.url ?? "",
      variantTitle: variant?.title ?? "—",
      sku: variant?.sku ?? product?.sku ?? "—",
      warehouse: warehouse?.name ?? record.warehouseId,
      warehouseCode: warehouse?.code ?? "",
      bin: record.binLocation ?? "—",
      onHand: record.onHand,
      reserved: record.reserved,
      available,
      incoming: record.incoming,
      reorderPoint: record.reorderPoint,
      costValue: available * (variant?.costPrice ?? Math.round((variant?.price ?? 0) * 0.55)),
      updatedAt: record.updatedAt,
      state: available === 0 ? "out" : available <= record.reorderPoint ? "low" : "ok",
    };
  });

  const lowStock = getLowStockRecords(db.store.id);
  const suggestions = reorderSuggestions(db.inventory).slice(0, 8);
  const totalUnits = rows.reduce((n, r) => n + r.onHand, 0);
  const totalValue = rows.reduce((n, r) => n + r.costValue, 0);
  const reserved = rows.reduce((n, r) => n + r.reserved, 0);

  const movements = db.movements.slice(0, 12).map((movement) => {
    const product = db.products.find((p) => p.id === movement.productId);
    const variant = product?.variants.find((v) => v.id === movement.variantId);
    const warehouse = db.warehouses.find((w) => w.id === movement.warehouseId);
    return {
      id: movement.id,
      delta: movement.delta,
      reason: movement.reason,
      product: product?.name ?? "Unknown",
      variant: variant?.title ?? "",
      warehouse: warehouse?.code ?? "",
      actorName: movement.actorName,
      reference: movement.referenceId,
      createdAt: movement.createdAt,
    };
  });

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        description="Stock is held per variant per location. Every change writes a movement to the ledger, so a discrepancy can always be traced back to an order, transfer or adjustment."
        breadcrumbs={[{ label: "Inventory" }, { label: "Stock" }]}
        actions={
          <>
            <button type="button" className={buttonClasses("outline", "sm")}>
              <Download className="h-3.5 w-3.5" />
              Export stock
            </button>
            <button type="button" className={buttonClasses("primary", "sm")}>
              <PackageMinus className="h-3.5 w-3.5" />
              Bulk adjust
            </button>
          </>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Units on hand" value={number(totalUnits)} hint={`${number(reserved)} reserved`} />
        <Stat label="Stock value" value={money(totalValue)} hint="At cost price" />
        <Stat
          label="At or below reorder"
          value={number(lowStock.length)}
          hint="Variants needing a purchase order"
        />
        <Stat
          label="Locations"
          value={number(db.warehouses.filter((w) => w.status === "active").length)}
          hint={`${db.warehouses.length} configured`}
        />
      </div>

      {suggestions.length > 0 && (
        <Card className="mb-5" padded={false}>
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            <h2 className="text-[12.5px] font-semibold text-ink">Replenishment suggestions</h2>
            <span className="text-[11.5px] text-ink-muted">
              Derived from reorder point and reorder quantity
            </span>
          </div>
          <ul className="divide-y divide-line">
            {suggestions.map((suggestion) => {
              const product = db.products.find((p) => p.id === suggestion.record.productId);
              const variant = product?.variants.find((v) => v.id === suggestion.record.variantId);
              const stock = summariseStock([suggestion.record]);
              return (
                <li key={suggestion.record.id} className="flex flex-wrap items-center gap-4 px-5 py-3">
                  <span
                    className={
                      suggestion.urgency === "critical"
                        ? "w-16 shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-danger"
                        : suggestion.urgency === "high"
                          ? "w-16 shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-warning"
                          : "w-16 shrink-0 text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted"
                    }
                  >
                    {suggestion.urgency}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] text-ink">{product?.name ?? "Unknown"}</p>
                    <p className="truncate text-[11px] text-ink-muted">
                      {variant?.title} · {variant?.sku} · {stock.label}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] tabular-nums text-ink-muted">
                    order {number(suggestion.suggestedQuantity)} units
                  </span>
                  <button type="button" className={buttonClasses("outline", "xs")}>
                    Create PO
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <InventoryTable
        rows={rows}
        warehouses={db.warehouses.map((w) => ({ id: w.id, name: w.name, code: w.code }))}
      />

      <Card className="mt-5" padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">Inventory ledger</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Most recent movements across every variant and location.
          </p>
        </div>
        <ul className="divide-y divide-line">
          {movements.map((movement) => (
            <li key={movement.id} className="flex flex-wrap items-center gap-4 px-5 py-2.5 text-[12px]">
              <span
                className={
                  movement.delta >= 0
                    ? "w-12 shrink-0 font-semibold tabular-nums text-success"
                    : "w-12 shrink-0 font-semibold tabular-nums text-danger"
                }
              >
                {movement.delta >= 0 ? "+" : ""}
                {movement.delta}
              </span>
              <span className="w-24 shrink-0 text-ink">{titleCase(movement.reason)}</span>
              <span className="min-w-0 flex-1 truncate text-ink-muted">
                {movement.product}
                {movement.variant ? ` · ${movement.variant}` : ""}
              </span>
              <span className="w-20 shrink-0 text-ink-muted">{movement.warehouse}</span>
              <span className="w-32 shrink-0 truncate text-ink-muted">
                {movement.reference ?? movement.actorName}
              </span>
              <span className="w-24 shrink-0 text-right text-ink-muted">{relativeTime(movement.createdAt)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
