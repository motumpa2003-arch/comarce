import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CreditCard,
  ExternalLink,
  MapPin,
  Package,
  Printer,
  RotateCcw,
  Tag,
  Truck,
  User,
} from "lucide-react";
import {
  ORDER_HAPPY_PATH,
  ORDER_STATUS_META,
  RETURN_STATUS_META,
  nextStatuses,
  primaryAction,
} from "@obsidian/commerce";
import { getOrderById, getReturnForOrder, getShipmentForOrder } from "@obsidian/data";
import { Badge, Card, Separator, buttonClasses, cn } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { formatDate, formatDateTime, money, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const db = await currentStore();
  const order = getOrderById(db.store.id, id);
  return { title: order ? `Order #${order.orderNumber}` : "Order" };
}

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await currentStore();
  const order = getOrderById(db.store.id, id);
  if (!order) notFound();

  const meta = ORDER_STATUS_META[order.status];
  const action = primaryAction(order.status);
  const transitions = nextStatuses(order.status);
  const shipment = getShipmentForOrder(db.store.id, order.id);
  const returnRequest = getReturnForOrder(db.store.id, order.id);
  const payment = db.payments.find((p) => p.orderId === order.id);
  const customer = db.customers.find((c) => c.id === order.customerId);
  const warehouse = db.warehouses.find((w) => w.id === order.warehouseId);
  const step = ORDER_HAPPY_PATH.indexOf(order.status);

  return (
    <>
      <AdminPageHeader
        title={`Order #${order.orderNumber}`}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{formatDateTime(order.createdAt)}</span>
            <span className="text-ink-muted/50">·</span>
            <span>
              {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
            </span>
            <span className="text-ink-muted/50">·</span>
            <span className="capitalize">{order.channel}</span>
            {order.tags.map((tag) => (
              <Badge key={tag} tone="outline" size="xs">
                {tag}
              </Badge>
            ))}
          </span>
        }
        breadcrumbs={[
          { label: "Orders", href: "/admin/orders" },
          { label: `#${order.orderNumber}` },
        ]}
        actions={
          <>
            <Link
              href={`/api/orders/${order.id}/invoice`}
              target="_blank"
              className={buttonClasses("outline", "sm")}
            >
              <Printer className="h-3.5 w-3.5" />
              Invoice
            </Link>
            <OrderStatusControl
              orderId={order.id}
              orderNumber={order.orderNumber}
              status={order.status}
              statusLabel={meta.label}
              primary={action}
              transitions={transitions.map((next) => ({
                value: next,
                label: ORDER_STATUS_META[next].label,
              }))}
            />
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          {/* Fulfilment progress */}
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Truck className="h-3.5 w-3.5" />
                Fulfilment
              </h2>
              <div className="flex items-center gap-2">
                <Badge tone={meta.tone} dot>
                  {meta.label}
                </Badge>
                <Badge tone={order.fulfilmentStatus === "fulfilled" ? "success" : "neutral"} size="xs">
                  {titleCase(order.fulfilmentStatus)}
                </Badge>
              </div>
            </div>

            {step >= 0 ? (
              <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {ORDER_HAPPY_PATH.map((happyStep, index) => {
                  const done = index <= step;
                  return (
                    <li key={happyStep}>
                      <span className={cn("block h-1 rounded-full", done ? "bg-primary" : "bg-line")} />
                      <p
                        className={cn(
                          "mt-2 text-[10px] uppercase tracking-[0.07em]",
                          done ? "font-medium text-ink" : "text-ink-muted",
                        )}
                      >
                        {ORDER_STATUS_META[happyStep].label}
                      </p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="rounded-[var(--radius-sm)] bg-muted px-4 py-3 text-[12.5px] text-ink-muted">
                {meta.description}
              </p>
            )}

            {shipment && (
              <dl className="mt-5 grid gap-4 border-t border-line pt-4 text-[12.5px] sm:grid-cols-4">
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Carrier</dt>
                  <dd className="mt-1 text-ink">{shipment.carrier}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Service</dt>
                  <dd className="mt-1 text-ink">{shipment.service}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Tracking</dt>
                  <dd className="mt-1">
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-ink underline underline-offset-4"
                    >
                      {shipment.trackingNumber}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Weight</dt>
                  <dd className="mt-1 text-ink">{(shipment.weightGrams / 1000).toFixed(2)} kg</dd>
                </div>
              </dl>
            )}
          </Card>

          {/* Items */}
          <Card padded={false}>
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Package className="h-3.5 w-3.5" />
                Items
              </h2>
              {warehouse && (
                <span className="text-[11.5px] text-ink-muted">
                  Fulfilling from {warehouse.name} ({warehouse.code})
                </span>
              )}
            </div>
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  <th className="px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                    Product
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                    Unit
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                    Qty
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                    Tax
                  </th>
                  <th className="px-5 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-[4px] bg-muted">
                          {item.image && (
                            <Image src={item.image} alt="" fill sizes="36px" className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/product/${item.slug}`}
                            target="_blank"
                            className="truncate font-medium text-ink hover:text-primary"
                          >
                            {item.name}
                          </Link>
                          <p className="truncate text-[11px] text-ink-muted">
                            {item.variantTitle !== "Default" ? `${item.variantTitle} · ` : ""}
                            {item.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-muted">{money(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">{item.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-muted">{money(item.tax)}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums text-ink">{money(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-2 border-t border-line px-5 py-4 text-[12.5px]">
              <Row label="Subtotal" value={money(order.subtotal)} />
              {order.discount > 0 && (
                <Row
                  label={order.couponCode ? `Discount (${order.couponCode})` : "Discount"}
                  value={`− ${money(order.discount)}`}
                  tone="success"
                />
              )}
              <Row label="Shipping" value={order.shipping === 0 ? "Free" : money(order.shipping)} />
              <Row label="Tax (included)" value={money(order.tax)} muted />
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-[18px] font-semibold tabular-nums text-ink">{money(order.total)}</span>
              </div>
              {order.refundedAmount > 0 && (
                <Row label="Refunded" value={money(order.refundedAmount)} tone="danger" />
              )}
            </div>
          </Card>

          {/* Return */}
          {returnRequest && (
            <Card padded={false}>
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Return request
                </h2>
                <Badge tone={RETURN_STATUS_META[returnRequest.status].tone} size="xs">
                  {RETURN_STATUS_META[returnRequest.status].label}
                </Badge>
              </div>
              <div className="p-5 text-[12.5px]">
                <dl className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Reason</dt>
                    <dd className="mt-1 text-ink">{titleCase(returnRequest.reason)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Resolution</dt>
                    <dd className="mt-1 capitalize text-ink">{returnRequest.resolution.replace("_", " ")}</dd>
                  </div>
                  <div>
                    <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Refund value</dt>
                    <dd className="mt-1 font-medium text-ink">{money(returnRequest.refundAmount)}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-ink-muted">{returnRequest.comment}</p>
                <ul className="mt-4 space-y-1.5">
                  {returnRequest.items.map((item) => (
                    <li key={item.orderItemId} className="flex justify-between gap-3 text-ink-muted">
                      <span className="truncate">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="shrink-0 tabular-nums">{money(item.amount)}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/admin/returns"
                  className={buttonClasses("outline", "sm", false, "mt-5")}
                >
                  Manage in returns queue
                </Link>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Timeline</h2>
            </div>
            <ol className="space-y-5 p-5 pl-9">
              {[...order.timeline].reverse().map((event, index) => (
                <li key={event.id} className="relative border-l border-line pl-5">
                  <span
                    className={cn(
                      "absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 bg-surface",
                      index === 0 ? "border-primary" : "border-line",
                    )}
                  />
                  <p className="text-[12.5px] font-medium text-ink">{event.label}</p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">{event.description}</p>
                  <p className="mt-1 text-[11px] text-ink-muted">
                    {formatDateTime(event.createdAt)}
                    {event.location ? ` · ${event.location}` : ""} · by {event.actor}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <User className="h-3.5 w-3.5" />
                Customer
              </h2>
            </div>
            <div className="p-5 text-[12.5px]">
              {customer ? (
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="font-medium text-ink hover:text-primary"
                >
                  {order.customerName}
                </Link>
              ) : (
                <p className="font-medium text-ink">{order.customerName}</p>
              )}
              <p className="mt-1 text-ink-muted">{order.customerEmail}</p>
              <p className="text-ink-muted">{order.customerPhone}</p>
              {customer && (
                <dl className="mt-4 space-y-2 border-t border-line pt-3">
                  <Row label="Lifetime value" value={money(customer.lifetimeValue)} />
                  <Row label="Orders" value={String(customer.ordersCount)} />
                  <Row label="Loyalty tier" value={titleCase(customer.loyaltyTier)} />
                  <Row label="Segments" value={customer.segments.map(titleCase).join(", ") || "—"} />
                </dl>
              )}
            </div>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <CreditCard className="h-3.5 w-3.5" />
                Payment
              </h2>
            </div>
            <div className="p-5 text-[12.5px]">
              <div className="flex items-center gap-2">
                <Badge tone={order.paymentStatus === "paid" ? "success" : "warning"} size="xs">
                  {order.paymentStatus.replace(/_/g, " ")}
                </Badge>
                <span className="uppercase text-ink">{order.paymentMethod}</span>
              </div>
              <dl className="mt-3 space-y-2">
                <Row label="Reference" value={order.paymentReference} />
                {payment && (
                  <>
                    <Row label="Gateway" value={titleCase(payment.gateway)} />
                    <Row label="Gateway fee" value={money(payment.fee)} />
                    <Row label="Net settled" value={money(payment.netAmount)} />
                  </>
                )}
              </dl>
            </div>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <MapPin className="h-3.5 w-3.5" />
                Addresses
              </h2>
            </div>
            <div className="divide-y divide-line text-[12.5px]">
              <div className="p-5">
                <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Shipping</p>
                <p className="mt-2 font-medium text-ink">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="mt-1 leading-relaxed text-ink-muted">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                  <br />
                  {order.shippingAddress.phone}
                </p>
                <p className="mt-2 text-[11.5px] text-ink-muted">
                  {order.shippingMethod} · ETA {formatDate(order.estimatedDeliveryAt)}
                </p>
              </div>
              <div className="p-5">
                <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Billing</p>
                <p className="mt-2 leading-relaxed text-ink-muted">
                  {order.billingAddress.line1}
                  <br />
                  {order.billingAddress.city}, {order.billingAddress.state}{" "}
                  {order.billingAddress.postalCode}
                </p>
              </div>
            </div>
          </Card>

          {(order.note || order.giftMessage) && (
            <Card>
              <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Tag className="h-3.5 w-3.5" />
                Notes
              </h2>
              {order.note && <p className="mt-3 text-[12.5px] text-ink-muted">{order.note}</p>}
              {order.giftMessage && (
                <p className="mt-3 rounded-[var(--radius-sm)] bg-muted p-3 text-[12.5px] italic text-ink-muted">
                  “{order.giftMessage}”
                </p>
              )}
            </Card>
          )}

          <p className="px-1 text-[11px] text-ink-muted">
            Last updated {relativeTime(order.updatedAt)}
          </p>
        </aside>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  tone,
  muted,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd
        className={cn(
          "truncate text-right tabular-nums",
          tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : muted ? "text-ink-muted" : "text-ink",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
