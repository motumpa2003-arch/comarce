import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { ORDER_STATUS_META, type Order } from "@obsidian/commerce";
import { Badge, Card, Progress } from "@obsidian/ui";
import { formatDate, money } from "@/lib/format";

export function OrderCard({ order }: { order: Order }) {
  const meta = ORDER_STATUS_META[order.status];
  const happyPath = meta.step >= 0;
  const progress = happyPath ? (meta.step / 6) * 100 : 100;

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-muted px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Order</p>
            <p className="text-[13px] font-medium text-ink">#{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Placed</p>
            <p className="text-[13px] text-ink">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted">Total</p>
            <p className="text-[13px] font-medium tabular-nums text-ink">{money(order.total)}</p>
          </div>
        </div>
        <Badge tone={meta.tone} dot>
          {meta.label}
        </Badge>
      </div>

      <div className="p-5">
        {happyPath && order.status !== "delivered" && (
          <div className="mb-5">
            <Progress value={progress} tone="primary" height={4} />
            <p className="mt-2 text-[11.5px] text-ink-muted">
              {meta.description} · estimated delivery {formatDate(order.estimatedDeliveryAt)}
            </p>
          </div>
        )}

        <ul className="space-y-3.5">
          {order.items.slice(0, 3).map((item) => (
            <li key={item.id} className="flex items-center gap-3.5">
              <Link
                href={`/product/${item.slug}`}
                className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted"
              >
                {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/product/${item.slug}`} className="line-clamp-2x text-[13px] text-ink hover:text-primary">
                  {item.name}
                </Link>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {item.variantTitle !== "Default" ? `${item.variantTitle} · ` : ""}Qty {item.quantity}
                </p>
              </div>
              <p className="shrink-0 text-[13px] tabular-nums text-ink">{money(item.total)}</p>
            </li>
          ))}
        </ul>

        {order.items.length > 3 && (
          <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
            <Package className="h-3.5 w-3.5" />+{order.items.length - 3} more item
            {order.items.length - 3 === 1 ? "" : "s"} in this order
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-[11.5px] text-ink-muted">
            {order.shippingMethod} to {order.shippingAddress.city}, {order.shippingAddress.postalCode}
          </p>
          <Link
            href={`/account/orders/${order.id}`}
            className="group inline-flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
