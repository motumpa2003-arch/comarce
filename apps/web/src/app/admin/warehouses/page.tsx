import type { Metadata } from "next";
import { MapPin, Plus, Store, Truck, Warehouse as WarehouseIcon } from "lucide-react";
import { Badge, Card, Progress, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { money, number, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Warehouses" };

const TYPE_ICON = {
  warehouse: WarehouseIcon,
  retail_store: Store,
  dropship: Truck,
  "3pl": Truck,
} as const;

export default async function AdminWarehousesPage() {
  const db = await currentStore();

  const stats = db.warehouses.map((warehouse) => {
    const records = db.inventory.filter((r) => r.warehouseId === warehouse.id);
    const units = records.reduce((n, r) => n + r.onHand, 0);
    const value = records.reduce((n, r) => {
      const product = db.products.find((p) => p.id === r.productId);
      const variant = product?.variants.find((v) => v.id === r.variantId);
      return n + r.onHand * (variant?.costPrice ?? Math.round((variant?.price ?? 0) * 0.55));
    }, 0);
    const orders = db.orders.filter((o) => o.warehouseId === warehouse.id).length;
    return { warehouse, units, value, skus: records.length, orders };
  });

  const totalUnits = stats.reduce((n, s) => n + s.units, 0);
  const totalValue = stats.reduce((n, s) => n + s.value, 0);

  return (
    <>
      <AdminPageHeader
        title="Warehouses"
        description="Fulfilment locations. Orders are routed to the nearest location that can serve the whole quantity, which is why stock is held per location rather than as one number."
        breadcrumbs={[{ label: "Inventory" }, { label: "Warehouses" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            Add location
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Locations" value={number(db.warehouses.length)} hint={`${db.warehouses.filter((w) => w.status === "active").length} active`} />
        <Stat label="Units held" value={number(totalUnits)} />
        <Stat label="Stock value" value={money(totalValue)} hint="At cost" />
        <Stat
          label="Pickup points"
          value={number(db.warehouses.filter((w) => w.supportsPickup).length)}
          hint="Offer store pickup"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ warehouse, units, value, skus, orders }) => {
          const Icon = TYPE_ICON[warehouse.type];
          const utilisation = warehouse.capacityUnits
            ? Math.round((warehouse.usedUnits / warehouse.capacityUnits) * 100)
            : 0;
          return (
            <Card key={warehouse.id} padded={false}>
              <div className="flex items-start gap-3 border-b border-line p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[13px] font-semibold text-ink">{warehouse.name}</h2>
                    {warehouse.isDefault && (
                      <Badge tone="info" size="xs">
                        Default
                      </Badge>
                    )}
                    <Badge tone={warehouse.status === "active" ? "success" : "neutral"} size="xs">
                      {warehouse.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {warehouse.code} · {titleCase(warehouse.type)}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                  {warehouse.address.line1}
                  <br />
                  {warehouse.address.city}, {warehouse.address.state} {warehouse.address.postalCode}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                  <div>
                    <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">SKUs</dt>
                    <dd className="mt-0.5 font-medium tabular-nums text-ink">{number(skus)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Units</dt>
                    <dd className="mt-0.5 font-medium tabular-nums text-ink">{number(units)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Value</dt>
                    <dd className="mt-0.5 font-medium tabular-nums text-ink">{money(value)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Orders</dt>
                    <dd className="mt-0.5 font-medium tabular-nums text-ink">{number(orders)}</dd>
                  </div>
                </dl>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-ink-muted">Capacity used</span>
                    <span className="tabular-nums text-ink">{utilisation}%</span>
                  </div>
                  <Progress
                    className="mt-1.5"
                    value={utilisation}
                    tone={utilisation > 85 ? "danger" : utilisation > 70 ? "warning" : "primary"}
                    height={5}
                  />
                  <p className="mt-1.5 text-[10.5px] text-ink-muted">
                    {number(warehouse.usedUnits)} of {number(warehouse.capacityUnits)} units
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {warehouse.fulfilsOnline && (
                    <Badge tone="outline" size="xs">
                      Fulfils online
                    </Badge>
                  )}
                  {warehouse.supportsPickup && (
                    <Badge tone="outline" size="xs">
                      Store pickup
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
