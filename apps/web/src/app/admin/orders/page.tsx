import type { Metadata } from "next";
import { Download, Printer } from "lucide-react";
import { ORDER_STATUS_META } from "@obsidian/commerce";
import { Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrdersTable } from "@/components/admin/orders-table";
import { money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const db = await currentStore();

  const rows = db.orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    itemCount: order.itemCount,
    total: order.total,
    status: order.status,
    statusLabel: ORDER_STATUS_META[order.status].label,
    statusTone: ORDER_STATUS_META[order.status].tone,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    fulfilmentStatus: order.fulfilmentStatus,
    channel: order.channel,
    city: order.shippingAddress.city,
    createdAt: order.createdAt,
    couponCode: order.couponCode,
    image: order.items[0]?.image ?? "",
  }));

  const awaiting = rows.filter((r) =>
    ["pending", "payment_pending", "confirmed", "processing"].includes(r.status),
  );
  const toShip = rows.filter((r) => r.status === "packed");
  const revenue = rows
    .filter((r) => !["cancelled", "refunded"].includes(r.status))
    .reduce((n, r) => n + r.total, 0);

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description={`${number(db.orders.length)} orders on record. Statuses follow a strict state machine — illegal transitions are rejected, not silently applied.`}
        breadcrumbs={[{ label: "Orders" }, { label: "All orders" }]}
        actions={
          <>
            <button type="button" className={buttonClasses("outline", "sm")}>
              <Printer className="h-3.5 w-3.5" />
              Print packing slips
            </button>
            <button type="button" className={buttonClasses("outline", "sm")}>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Awaiting action" value={number(awaiting.length)} hint="Confirm or start processing" />
        <Stat label="Ready to ship" value={number(toShip.length)} hint="Packed, awaiting carrier" />
        <Stat label="Net revenue" value={money(revenue)} hint="Excludes cancelled and refunded" />
        <Stat
          label="Returns open"
          value={number(db.returns.filter((r) => !["completed", "rejected"].includes(r.status)).length)}
          hint="Needing a decision"
        />
      </div>

      <OrdersTable rows={rows} />
    </>
  );
}
