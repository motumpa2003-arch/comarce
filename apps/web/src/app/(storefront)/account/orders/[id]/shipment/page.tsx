import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Package, Truck, Weight } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Badge, Card, Rule } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDate, formatDateTime, number, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const db = await currentStore();
  const order = db.orders.find((o) => o.id === id);
  return { title: order ? `Shipment · ${order.orderNumber}` : "Shipment" };
}

const STATUS_STEPS = ["label_created", "picked_up", "in_transit", "out_for_delivery", "delivered"] as const;

const STATUS_LABEL: Record<string, string> = {
  label_created: "Label created",
  picked_up: "Picked up",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  exception: "Exception",
};

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);

  const order = db.orders.find((o) => o.id === id);
  if (!order || order.customerId !== customer.id) notFound();

  const shipment = db.shipments.find((s) => s.orderId === order.id);

  if (!shipment) {
    return (
      <div className="space-y-6">
        <ButtonLink href={`/account/orders/${order.id}`} variant="ghost" size="xs" className="-ml-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to order
        </ButtonLink>
        <Card className="py-10 text-center">
          <Package className="mx-auto h-6 w-6 text-ink-muted" />
          <h1 className="mt-4 font-display display-case text-[22px] leading-tight text-ink">
            Not dispatched yet
          </h1>
          <p className="mx-auto mt-2.5 max-w-sm text-[13px] leading-relaxed text-ink-muted">
            Order {order.orderNumber} is {order.status.replace(/_/g, " ")}. Tracking appears here the moment the
            parcel leaves our warehouse, and we will email and text you at the same time.
          </p>
          <ButtonLink href={`/account/orders/${order.id}`} className="mt-6">
            View order
          </ButtonLink>
        </Card>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(shipment.status as (typeof STATUS_STEPS)[number]);
  const isException = shipment.status === "exception";
  const events = [...shipment.events].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <ButtonLink href={`/account/orders/${order.id}`} variant="ghost" size="xs" className="-ml-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to order {order.orderNumber}
        </ButtonLink>

        <h1 className="mt-3 font-display display-case text-[24px] leading-tight text-ink">Shipment tracking</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-muted">
          <span className="font-medium text-ink">{shipment.trackingNumber}</span>
          <Badge tone={isException ? "danger" : shipment.status === "delivered" ? "success" : "info"} size="xs">
            {STATUS_LABEL[shipment.status] ?? shipment.status}
          </Badge>
          <span>{shipment.carrier}</span>
          <span>{shipment.service}</span>
        </div>
      </div>

      <Card>
        {isException ? (
          <div className="rounded-[var(--radius-md)] border border-danger/35 bg-danger/[0.04] p-4">
            <p className="text-[13px] font-medium text-ink">Delivery needs attention</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              The carrier could not complete delivery. The most recent update below explains why — if it needs
              something from you, replying to the delivery SMS is the fastest route.
            </p>
          </div>
        ) : (
          <ol className="flex flex-wrap gap-y-4">
            {STATUS_STEPS.map((step, index) => {
              const done = index <= currentStep;
              const active = index === currentStep;
              return (
                <li key={step} className="flex min-w-[112px] flex-1 flex-col items-center text-center">
                  <div className="flex w-full items-center">
                    <span
                      className={
                        index === 0
                          ? "h-[2px] flex-1 bg-transparent"
                          : done
                            ? "h-[2px] flex-1 bg-primary"
                            : "h-[2px] flex-1 bg-line"
                      }
                    />
                    <span
                      className={
                        active
                          ? "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-inverse ring-4 ring-primary/15"
                          : done
                            ? "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-inverse"
                            : "grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-surface text-[11px] text-ink-muted"
                      }
                    >
                      {index + 1}
                    </span>
                    <span
                      className={
                        index === STATUS_STEPS.length - 1
                          ? "h-[2px] flex-1 bg-transparent"
                          : index < currentStep
                            ? "h-[2px] flex-1 bg-primary"
                            : "h-[2px] flex-1 bg-line"
                      }
                    />
                  </div>
                  <span
                    className={
                      done ? "mt-2.5 text-[11.5px] font-medium text-ink" : "mt-2.5 text-[11.5px] text-ink-muted"
                    }
                  >
                    {STATUS_LABEL[step]}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <Rule className="my-6" />

        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">
              <Truck className="h-3 w-3" />
              Carrier
            </dt>
            <dd className="mt-1.5 text-[13px] text-ink">{shipment.carrier}</dd>
            <dd className="text-[11.5px] text-ink-muted">{shipment.service}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">
              <Package className="h-3 w-3" />
              {shipment.deliveredAt ? "Delivered" : "Expected"}
            </dt>
            <dd className="mt-1.5 text-[13px] text-ink">
              {formatDate(shipment.deliveredAt ?? shipment.estimatedDeliveryAt)}
            </dd>
            <dd className="text-[11.5px] text-ink-muted">
              {relativeTime(shipment.deliveredAt ?? shipment.estimatedDeliveryAt)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">
              <Weight className="h-3 w-3" />
              Weight
            </dt>
            <dd className="mt-1.5 text-[13px] tabular-nums text-ink">
              {number(shipment.weightGrams)} g
            </dd>
            <dd className="text-[11.5px] text-ink-muted">Dispatched {formatDate(shipment.shippedAt)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">
              <MapPin className="h-3 w-3" />
              Delivering to
            </dt>
            <dd className="mt-1.5 text-[13px] leading-snug text-ink">
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </dd>
            <dd className="text-[11.5px] tabular-nums text-ink-muted">{order.shippingAddress.postalCode}</dd>
          </div>
        </dl>

        {shipment.trackingUrl && (
          <Link
            href={shipment.trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-primary underline-offset-2 hover:underline"
          >
            Track on {shipment.carrier}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </Card>

      <Card padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Journey</h2>
        </div>
        <ol className="px-5 py-2">
          {events.map((event, index) => (
            <li key={`${event.createdAt}-${index}`} className="flex gap-4 py-3">
              <div className="flex flex-col items-center">
                <span
                  className={
                    index === 0 ? "mt-1 h-2 w-2 rounded-full bg-primary" : "mt-1 h-2 w-2 rounded-full bg-line"
                  }
                />
                {index < events.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <p className={index === 0 ? "text-[13px] font-medium text-ink" : "text-[13px] text-ink"}>
                  {event.label}
                </p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {event.location} · {formatDateTime(event.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            In this parcel · {number(order.items.length)} item{order.items.length === 1 ? "" : "s"}
          </h2>
        </div>
        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-3.5">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-[60px] w-[48px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted"
              >
                {item.image && <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="block truncate text-[13px] text-ink hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                  {item.variantTitle} · qty {item.quantity}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-[11.5px] leading-relaxed text-ink-muted">
        Tracking updates come from {shipment.carrier} and can lag the parcel by a few hours, particularly overnight.
        If nothing has moved for two working days,{" "}
        <Link href="/account/support" className="text-primary underline-offset-2 hover:underline">
          open a ticket
        </Link>{" "}
        and we will chase them.
      </p>
    </div>
  );
}
