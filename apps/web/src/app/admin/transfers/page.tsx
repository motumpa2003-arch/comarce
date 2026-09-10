import type { Metadata } from "next";
import { ArrowRight, Plus } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, number, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Stock transfers" };

export default async function AdminTransfersPage() {
  const db = await currentStore();

  const inTransit = db.transfers.filter((t) => t.status === "in_transit");
  const unitsMoving = inTransit.reduce((n, t) => n + t.totalUnits, 0);

  return (
    <>
      <AdminPageHeader
        title="Stock transfers"
        description="Move units between locations. Each transfer writes a transfer_out movement at the origin and a transfer_in at the destination, so the ledger always balances."
        breadcrumbs={[{ label: "Inventory" }, { label: "Transfers" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New transfer
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="In transit" value={number(inTransit.length)} hint={`${number(unitsMoving)} units moving`} />
        <Stat label="Total transfers" value={number(db.transfers.length)} />
        <Stat label="Received" value={number(db.transfers.filter((t) => t.status === "received").length)} />
        <Stat label="Draft" value={number(db.transfers.filter((t) => t.status === "draft").length)} />
      </div>

      <Card padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">All transfers</h2>
        </div>
        <ul className="divide-y divide-line">
          {db.transfers.map((transfer) => {
            const from = db.warehouses.find((w) => w.id === transfer.fromWarehouseId);
            const to = db.warehouses.find((w) => w.id === transfer.toWarehouseId);
            const received = transfer.items.reduce((n, i) => n + i.received, 0);
            return (
              <li key={transfer.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[12.5px]">
                      <span className="font-mono font-medium text-ink">{transfer.reference}</span>
                      <Badge
                        tone={
                          transfer.status === "received"
                            ? "success"
                            : transfer.status === "in_transit"
                              ? "progress"
                              : transfer.status === "cancelled"
                                ? "danger"
                                : "neutral"
                        }
                        size="xs"
                      >
                        {transfer.status.replace("_", " ")}
                      </Badge>
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-ink">
                      <span>{from?.code ?? transfer.fromWarehouseId}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                      <span>{to?.code ?? transfer.toWarehouseId}</span>
                    </p>
                    <p className="mt-1 text-[11.5px] text-ink-muted">
                      {from?.name} → {to?.name}
                    </p>
                  </div>

                  <dl className="flex shrink-0 flex-wrap gap-x-6 gap-y-2 text-[12px]">
                    <div>
                      <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Lines</dt>
                      <dd className="mt-0.5 tabular-nums text-ink">{transfer.itemCount}</dd>
                    </div>
                    <div>
                      <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Units</dt>
                      <dd className="mt-0.5 tabular-nums text-ink">
                        {received}/{transfer.totalUnits}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Created</dt>
                      <dd className="mt-0.5 text-ink-muted">{relativeTime(transfer.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Expected</dt>
                      <dd className="mt-0.5 text-ink-muted">{formatDate(transfer.expectedAt)}</dd>
                    </div>
                    {transfer.status === "in_transit" && (
                      <button type="button" className={buttonClasses("outline", "xs", false, "self-end")}>
                        Receive
                      </button>
                    )}
                  </dl>
                </div>

                <ul className="mt-3 space-y-1">
                  {transfer.items.map((item) => {
                    const product = db.products.find((p) => p.id === item.productId);
                    const variant = product?.variants.find((v) => v.id === item.variantId);
                    return (
                      <li
                        key={item.variantId}
                        className="flex items-center justify-between gap-3 text-[11.5px] text-ink-muted"
                      >
                        <span className="min-w-0 truncate">
                          {product?.name ?? "Unknown"}
                          {variant ? ` · ${variant.title}` : ""}
                        </span>
                        <span className="shrink-0 tabular-nums">
                          {item.received}/{item.quantity} units
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
          {db.transfers.length === 0 && (
            <li className="px-5 py-12 text-center text-[12.5px] text-ink-muted">No transfers recorded.</li>
          )}
        </ul>
      </Card>
    </>
  );
}
