import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  CreditCard,
  Download,
  HelpCircle,
  MapPin,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react";
import {
  ORDER_HAPPY_PATH,
  ORDER_STATUS_META,
  RETURN_STATUS_META,
  isCancellable,
  isReturnable,
} from "@obsidian/commerce";
import { getOrderById, getReturnForOrder, getShipmentForOrder } from "@obsidian/data";
import { Badge, Breadcrumb, Card, Separator, cn } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { OrderActions } from "@/components/account/order-actions";
import { formatDate, formatDateTime, money, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const db = await currentStore();
  const order = getOrderById(db.store.id, id);
  return { title: order ? `Order #${order.orderNumber}` : "Order" };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await currentStore();
  const order = getOrderById(db.store.id, id);
  if (!order) notFound();

  const shipment = getShipmentForOrder(db.store.id, order.id);
  const returnRequest = getReturnForOrder(db.store.id, order.id);
  const meta = ORDER_STATUS_META[order.status];
  const currentStep = ORDER_HAPPY_PATH.indexOf(order.status);

  return (
    <div>
      <Breadcrumb
        className="mb-5"
        items={[
          { label: "Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
          { label: `#${order.orderNumber}` },
        ]}
      />

      <Link
        href="/account/orders"
        className="mb-5 inline-flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink-muted hover:text-ink"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display display-case text-[26px] leading-none text-ink">
            Order #{order.orderNumber}
          </h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            Placed {formatDate(order.createdAt)} · {order.itemCount} item{order.itemCount === 1 ? "" : "s"} ·{" "}
            {money(order.total)}
          </p>
        </div>
        <Badge tone={meta.tone} dot>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {/* ---------------------------- Tracking --------------------------- */}
          <Card padded={false}>
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                <Truck className="h-3.5 w-3.5" />
                Tracking
              </h2>
              {shipment && (
                <a
                  href={shipment.trackingUrl}
                  className="text-[11.5px] font-medium text-ink underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  {shipment.carrier} · {shipment.trackingNumber}
                </a>
              )}
            </div>

            <div className="p-5">
              {currentStep >= 0 && (
                <ol className="mb-7 hidden grid-cols-6 gap-2 sm:grid">
                  {ORDER_HAPPY_PATH.map((step, index) => {
                    const done = index <= currentStep;
                    return (
                      <li key={step} className="relative">
                        <span
                          className={cn(
                            "block h-1 rounded-full transition-colors",
                            done ? "bg-primary" : "bg-line",
                          )}
                        />
                        <p
                          className={cn(
                            "mt-2 text-[10.5px] uppercase tracking-[0.08em]",
                            done ? "font-medium text-ink" : "text-ink-muted",
                          )}
                        >
                          {ORDER_STATUS_META[step].label}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              )}

              <ol className="relative space-y-6 border-l border-line pl-6">
                {[...order.timeline].reverse().map((event, index) => (
                  <li key={event.id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[29px] grid h-[18px] w-[18px] place-items-center rounded-full border-2 bg-surface",
                        index === 0 ? "border-primary" : "border-line",
                      )}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 rounded-full", index === 0 ? "bg-primary" : "bg-line")}
                      />
                    </span>
                    <p className="text-[13px] font-medium text-ink">{event.label}</p>
                    <p className="mt-0.5 text-[12px] text-ink-muted">{event.description}</p>
                    <p className="mt-1 text-[11px] text-ink-muted">
                      {formatDateTime(event.createdAt)}
                      {event.location ? ` · ${event.location}` : ""} · {event.actor}
                    </p>
                  </li>
                ))}
              </ol>

              {order.status !== "delivered" && !["cancelled", "refunded"].includes(order.status) && (
                <p className="mt-6 rounded-[var(--radius-sm)] bg-muted px-4 py-3 text-[12.5px] text-ink-muted">
                  Estimated delivery <span className="font-medium text-ink">{formatDate(order.estimatedDeliveryAt)}</span>
                  {" — "}
                  {relativeTime(order.estimatedDeliveryAt)}
                </p>
              )}
            </div>
          </Card>

          {/* ----------------------------- Return ---------------------------- */}
          {returnRequest && (
            <Card padded={false}>
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Return request
                </h2>
                <Badge tone={RETURN_STATUS_META[returnRequest.status].tone} size="xs">
                  {RETURN_STATUS_META[returnRequest.status].label}
                </Badge>
              </div>
              <div className="p-5">
                <p className="text-[13px] text-ink">
                  {returnRequest.items.length} item{returnRequest.items.length === 1 ? "" : "s"} ·{" "}
                  {money(returnRequest.refundAmount)} · {returnRequest.resolution.replace("_", " ")}
                </p>
                <p className="mt-1 text-[12.5px] text-ink-muted">{returnRequest.comment}</p>
                <ol className="mt-4 space-y-2">
                  {returnRequest.timeline.map((step) => (
                    <li key={step.status} className="flex items-center gap-2.5 text-[12.5px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-ink">{step.label}</span>
                      <span className="text-ink-muted">{formatDate(step.createdAt)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Card>
          )}

          {/* ------------------------------ Items ---------------------------- */}
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                <Package className="h-3.5 w-3.5" />
                Items in this order
              </h2>
            </div>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 p-5">
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative aspect-[3/4] w-[76px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted"
                  >
                    {item.image && <Image src={item.image} alt="" fill sizes="76px" className="object-cover" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${item.slug}`} className="text-[13.5px] text-ink hover:text-primary">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-[11.5px] text-ink-muted">
                      {item.variantTitle !== "Default" ? `${item.variantTitle} · ` : ""}SKU {item.sku}
                    </p>
                    <p className="mt-1 text-[11.5px] text-ink-muted">Qty {item.quantity}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-[11.5px] font-medium text-ink underline underline-offset-4"
                      >
                        Buy it again
                      </Link>
                      {order.status === "delivered" && (
                        <Link
                          href={`/product/${item.slug}#reviews`}
                          className="text-[11.5px] font-medium text-ink underline underline-offset-4"
                        >
                          Write a review
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[13.5px] font-medium tabular-nums text-ink">{money(item.total)}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">incl. {money(item.tax)} GST</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ------------------------------ Sidebar --------------------------- */}
        <aside className="space-y-4">
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Payment summary</h2>
            </div>
            <div className="space-y-2.5 p-5 text-[13px]">
              <Row label="Subtotal" value={money(order.subtotal)} />
              {order.discount > 0 && (
                <Row
                  label={order.couponCode ? `Discount (${order.couponCode})` : "Discount"}
                  value={`− ${money(order.discount)}`}
                  tone="success"
                />
              )}
              <Row label="Delivery" value={order.shipping === 0 ? "Free" : money(order.shipping)} />
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-ink">Total</span>
                <span className="font-display text-[22px] tabular-nums text-ink">{money(order.total)}</span>
              </div>
              {order.refundedAmount > 0 && (
                <Row label="Refunded" value={money(order.refundedAmount)} tone="danger" />
              )}
              <p className="pt-1 text-[11px] text-ink-muted">Includes {money(order.tax)} GST</p>
            </div>
            <div className="border-t border-line px-5 py-4">
              <p className="flex items-center gap-2 text-[12.5px] text-ink">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                {order.paymentMethod.toUpperCase()}
                <Badge tone={order.paymentStatus === "paid" ? "success" : "warning"} size="xs">
                  {order.paymentStatus.replace(/_/g, " ")}
                </Badge>
              </p>
              <p className="mt-1 text-[11px] text-ink-muted">Ref {order.paymentReference}</p>
            </div>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                <MapPin className="h-3.5 w-3.5" />
                Delivery address
              </h2>
            </div>
            <div className="p-5 text-[12.5px] leading-relaxed text-ink-muted">
              <p className="font-medium text-ink">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="mt-1">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
            </div>
          </Card>

          <OrderActions
            orderId={order.id}
            orderNumber={order.orderNumber}
            cancellable={isCancellable(order)}
            returnable={isReturnable(order) && !returnRequest}
          />

          <div className="space-y-2">
            <ButtonLink href={`/api/orders/${order.id}/invoice`} variant="outline" fullWidth>
              <Download className="h-4 w-4" />
              Download invoice
            </ButtonLink>
            <ButtonLink href="/account/support" variant="ghost" fullWidth>
              <HelpCircle className="h-4 w-4" />
              Need help with this order?
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-ink-muted">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-ink",
        )}
      >
        {value}
      </span>
    </div>
  );
}
