import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Printer } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { formatDate, money, number, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Shipments" };

const STATUS_TONE: Record<string, "info" | "progress" | "success" | "danger" | "neutral"> = {
  label_created: "neutral",
  picked_up: "info",
  in_transit: "progress",
  out_for_delivery: "progress",
  delivered: "success",
  exception: "danger",
};

export default async function AdminShipmentsPage() {
  const db = await currentStore();

  const inTransit = db.shipments.filter((s) => !["delivered", "exception"].includes(s.status));
  const shippingCost = db.shipments.reduce((n, s) => n + s.cost, 0);

  const byCarrier = [...new Set(db.shipments.map((s) => s.carrier))]
    .map((carrier) => ({
      label: carrier,
      value: db.shipments.filter((s) => s.carrier === carrier).length,
    }))
    .sort((a, b) => b.value - a.value);

  const delivered = db.shipments.filter((s) => s.deliveredAt);
  const avgDays =
    delivered.length > 0
      ? (
          delivered.reduce(
            (n, s) => n + (Date.parse(s.deliveredAt!) - Date.parse(s.shippedAt)) / 86_400_000,
            0,
          ) / delivered.length
        ).toFixed(1)
      : "—";

  return (
    <>
      <AdminPageHeader
        title="Shipments"
        description="Carrier handovers and tracking. A shipment is created automatically the moment an order moves to Shipped."
        breadcrumbs={[{ label: "Orders" }, { label: "Shipments" }]}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Printer className="h-3.5 w-3.5" />
            Print labels
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="In transit" value={number(inTransit.length)} hint="Not yet delivered" />
        <Stat label="Shipments" value={number(db.shipments.length)} hint="All time" />
        <Stat label="Shipping spend" value={money(shippingCost)} hint="Carrier charges" />
        <Stat label="Average transit" value={`${avgDays} days`} hint="Dispatch to delivery" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">All shipments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  {["Order", "Carrier", "Tracking", "Status", "Weight", "Cost", "Shipped", "ETA"].map((header) => (
                    <th
                      key={header}
                      className="whitespace-nowrap px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {db.shipments.slice(0, 40).map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/orders/${shipment.orderId}`} className="font-medium text-ink hover:text-primary">
                        #{shipment.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-ink">{shipment.carrier}</p>
                      <p className="text-[11px] text-ink-muted">{shipment.service}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <a
                        href={shipment.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-ink underline underline-offset-4"
                      >
                        {shipment.trackingNumber}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={STATUS_TONE[shipment.status] ?? "neutral"} size="xs">
                        {titleCase(shipment.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-ink-muted">
                      {(shipment.weightGrams / 1000).toFixed(2)} kg
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-ink-muted">{money(shipment.cost)}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{relativeTime(shipment.shippedAt)}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{formatDate(shipment.estimatedDeliveryAt)}</td>
                  </tr>
                ))}
                {db.shipments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-ink-muted">
                      No shipments yet. Ship an order to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Carrier mix</h2>
            <RankedBars rows={byCarrier} format="number" color={SERIES[2]} />
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Configured rates</h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Standard</dt>
                <dd className="text-ink">Free above ₹999, else ₹99</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Express</dt>
                <dd className="text-ink">₹199</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Same day</dt>
                <dd className="text-ink">₹349, metros</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Store pickup</dt>
                <dd className="text-ink">Free</dd>
              </div>
            </dl>
            <Link href="/admin/settings/shipping" className={buttonClasses("outline", "xs", true, "mt-4")}>
              Edit shipping rates
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
