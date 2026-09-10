import Image from "next/image";
import Link from "next/link";
import { MapPin, Truck } from "lucide-react";
import { ORDER_HAPPY_PATH, ORDER_STATUS_META, type Order } from "@obsidian/commerce";
import { Badge, Card, cn } from "@obsidian/ui";
import { formatDate, formatDateTime, money } from "@/lib/format";

export function OrderTrackingResult({ order }: { order: Order }) {
  const meta = ORDER_STATUS_META[order.status];
  const currentStep = ORDER_HAPPY_PATH.indexOf(order.status);

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-muted px-5 py-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Order</p>
          <p className="text-[15px] font-medium text-ink">#{order.orderNumber}</p>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Placed {formatDate(order.createdAt)} · {order.itemCount} item{order.itemCount === 1 ? "" : "s"} ·{" "}
            {money(order.total)}
          </p>
        </div>
        <Badge tone={meta.tone} dot>
          {meta.label}
        </Badge>
      </div>

      <div className="p-5">
        {currentStep >= 0 && (
          <ol className="mb-8 hidden grid-cols-6 gap-2 sm:grid">
            {ORDER_HAPPY_PATH.map((step, index) => (
              <li key={step}>
                <span className={cn("block h-1 rounded-full", index <= currentStep ? "bg-primary" : "bg-line")} />
                <p
                  className={cn(
                    "mt-2 text-[10px] uppercase tracking-[0.08em]",
                    index <= currentStep ? "font-medium text-ink" : "text-ink-muted",
                  )}
                >
                  {ORDER_STATUS_META[step].label}
                </p>
              </li>
            ))}
          </ol>
        )}

        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_240px]">
          <ol className="relative space-y-5 border-l border-line pl-6">
            {[...order.timeline].reverse().map((event, index) => (
              <li key={event.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[29px] grid h-[18px] w-[18px] place-items-center rounded-full border-2 bg-surface",
                    index === 0 ? "border-primary" : "border-line",
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", index === 0 ? "bg-primary" : "bg-line")} />
                </span>
                <p className="text-[13px] font-medium text-ink">{event.label}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {formatDateTime(event.createdAt)}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
              </li>
            ))}
          </ol>

          <div className="space-y-4">
            <div className="rounded-[var(--radius-card)] border border-line p-4">
              <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <Truck className="h-3.5 w-3.5 text-primary" />
                Delivery
              </p>
              <p className="mt-2 text-[13px] text-ink">{order.shippingMethod}</p>
              <p className="mt-1 text-[11.5px] text-ink-muted">
                Estimated {formatDate(order.estimatedDeliveryAt)}
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-line p-4">
              <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Address
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
                {order.shippingAddress.city}, {order.shippingAddress.state}
                <br />
                {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>
        </div>

        <ul className="mt-7 divide-y divide-line border-t border-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-3.5">
              <Link
                href={`/product/${item.slug}`}
                className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted"
              >
                {item.image && <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-ink">{item.name}</p>
                <p className="text-[11.5px] text-ink-muted">Qty {item.quantity}</p>
              </div>
              <p className="shrink-0 text-[13px] tabular-nums text-ink">{money(item.total)}</p>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
