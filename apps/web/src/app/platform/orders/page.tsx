import type { Metadata } from "next";
import { Download } from "lucide-react";
import { getPlans, listAllStores, listStoreDatabases } from "@obsidian/data";
import { Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, RankedBars, SERIES } from "@/components/admin/charts";
import { PlatformOrdersTable, type PlatformOrderRow } from "@/components/platform/platform-orders-table";
import { money, moneyShort, number, percent } from "@/lib/format";

export const metadata: Metadata = { title: "Orders" };

export default function PlatformOrdersPage() {
  const stores = listAllStores();
  const plans = getPlans();
  const seeded = listStoreDatabases();

  const storeName = new Map(stores.map((s) => [s.id, s.name]));
  const feeByPlan = new Map(plans.map((p) => [p.id, p.transactionFeeBps]));
  const planOf = new Map(stores.map((s) => [s.id, s.planId]));

  // Every seeded tenant's order book, flattened. Ghost tenants have counters
  // but no line-level records, so they are deliberately absent here rather than
  // padded with orders that do not exist.
  const rows: PlatformOrderRow[] = seeded
    .flatMap((db) =>
      db.orders.map((order) => {
        const bps = feeByPlan.get(planOf.get(db.store.id) ?? "") ?? 0;
        return {
          id: order.id,
          storeId: db.store.id,
          storeName: storeName.get(db.store.id) ?? db.store.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          total: order.total,
          fee: Math.round((order.total * bps) / 10_000 / 100) * 100,
          refunded: order.refundedAmount,
          createdAt: order.createdAt,
        };
      }),
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const gmv = rows.reduce((n, r) => n + r.total, 0);
  const fees = rows.reduce((n, r) => n + r.fee, 0);
  const refunded = rows.reduce((n, r) => n + r.refunded, 0);
  const failed = rows.filter((r) => r.paymentStatus === "failed").length;

  const byStore = seeded
    .map((db) => ({
      label: storeName.get(db.store.id) ?? db.store.id,
      value: db.orders.reduce((n, o) => n + o.total, 0),
    }))
    .sort((a, b) => b.value - a.value);

  const byMethod = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.paymentMethod] = (acc[row.paymentMethod] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label: label.replace("_", " "), value }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Every order across every tenant with a seeded catalogue, and the transaction fee the platform earned on each. Operators read this book; only the merchant can act on an individual order."
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Orders" value={number(rows.length)} hint={`Across ${seeded.length} tenants`} />
        <Stat label="GMV" value={money(gmv)} />
        <Stat label="Platform fees" value={money(fees)} hint={`${percent((fees / Math.max(1, gmv)) * 100, 2)} effective`} />
        <Stat
          label="Refunded"
          value={money(refunded)}
          hint={`${percent((refunded / Math.max(1, gmv)) * 100, 2)} of GMV`}
          invertDelta
        />
      </div>

      {failed > 0 && (
        <Card className="mt-5 border-warning/40 bg-warning/[0.05]">
          <p className="text-[12.5px] leading-relaxed text-ink">
            <span className="font-medium">{number(failed)} payments failed.</span>{" "}
            <span className="text-ink-muted">
              Failure clustered on one tenant usually means a gateway credential problem rather than genuine
              declines — filter by payment status below to check.
            </span>
          </p>
        </Card>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Order book</h2>
          </div>
          <div className="p-4">
            <PlatformOrdersTable rows={rows} />
          </div>
        </Card>

        <aside className="space-y-4">
          <ChartFrame title="GMV by tenant" description="All time, seeded tenants" height={220}>
            <RankedBars rows={byStore} format="moneyShort" color={SERIES[0]} />
          </ChartFrame>

          <ChartFrame title="Payment method" description="Order count" height={220}>
            <RankedBars rows={byMethod} format="number" color={SERIES[2]} />
          </ChartFrame>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Fee calculation</h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              Each order is charged its own tenant&rsquo;s plan rate, not a blended average — so a Starter store on
              2.00% and an Enterprise store on 0.40% are both correct in the same table. Fees are shown gross of
              refunds; the refunded column is what came back.
            </p>
            <p className="mt-3 text-[12px] text-ink-muted">
              Total fees at gross: <span className="font-medium text-ink">{moneyShort(fees)}</span>
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
