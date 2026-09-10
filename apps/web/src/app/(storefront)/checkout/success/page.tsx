import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Download, MapPin, Package, Truck } from "lucide-react";
import { getOrderById, getRecommendations } from "@obsidian/data";
import { Badge, Card, Container, Section, Separator } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductRail } from "@/components/commerce/product-rail";
import { toCardList } from "@/lib/product-view";
import { deliveryWindow, formatDate, money } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const db = await currentStore();
  const order = orderId ? getOrderById(db.store.id, orderId) : undefined;
  if (!order) notFound();

  const recommended = getRecommendations(db.store.id, "also_bought", { limit: 10 });

  return (
    <>
      <Section tone="surface" spacing="none" className="py-10 sm:py-14">
        <Container size="narrow">
          <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/10 text-success">
              <Check className="h-8 w-8" strokeWidth={2.4} />
            </span>
            <h1 className="mt-6 font-display display-case text-[32px] leading-tight text-ink sm:text-[42px]">
              Order placed
            </h1>
            <p className="mt-3 text-[14px] text-ink-muted">
              Thank you, {order.customerName.split(" ")[0]}. We have emailed a confirmation to{" "}
              <span className="text-ink">{order.customerEmail}</span>.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-muted px-4 py-2 text-[13px]">
              Order <span className="font-semibold text-ink">#{order.orderNumber}</span>
              <Badge tone="info" size="xs">
                {order.status.replace(/_/g, " ")}
              </Badge>
            </p>
          </div>

          <Card className="mt-9" padded={false}>
            <div className="grid gap-px bg-line sm:grid-cols-3">
              <InfoTile
                icon={<Truck className="h-4 w-4" />}
                label="Estimated delivery"
                value={deliveryWindow(3, 6, new Date(order.createdAt))}
                hint={order.shippingMethod}
              />
              <InfoTile
                icon={<MapPin className="h-4 w-4" />}
                label="Delivering to"
                value={`${order.shippingAddress.city}, ${order.shippingAddress.state}`}
                hint={order.shippingAddress.postalCode}
              />
              <InfoTile
                icon={<Package className="h-4 w-4" />}
                label="Payment"
                value={order.paymentMethod.toUpperCase()}
                hint={`Ref ${order.paymentReference}`}
              />
            </div>

            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-5">
                  <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                    {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] text-ink">{item.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      {item.variantTitle !== "Default" ? `${item.variantTitle} · ` : ""}Qty {item.quantity} · SKU{" "}
                      {item.sku}
                    </p>
                  </div>
                  <p className="shrink-0 text-[13.5px] tabular-nums text-ink">{money(item.total)}</p>
                </li>
              ))}
            </ul>

            <div className="space-y-2.5 border-t border-line p-5 text-[13px]">
              <Row label="Subtotal" value={money(order.subtotal)} />
              {order.discount > 0 && (
                <Row label={order.couponCode ? `Discount (${order.couponCode})` : "Discount"} value={`− ${money(order.discount)}`} success />
              )}
              <Row label="Delivery" value={order.shipping === 0 ? "Free" : money(order.shipping)} />
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-ink">Total paid</span>
                <span className="font-display text-[24px] tabular-nums text-ink">{money(order.total)}</span>
              </div>
              <p className="text-[11px] text-ink-muted">
                Includes {money(order.tax)} GST · Placed {formatDate(order.createdAt)}
              </p>
            </div>
          </Card>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <ButtonLink href={`/account/orders/${order.id}`} size="lg" fullWidth>
              Track your order
            </ButtonLink>
            <ButtonLink href={`/api/orders/${order.id}/invoice`} variant="outline" size="lg" fullWidth>
              <Download className="h-4 w-4" />
              Download invoice
            </ButtonLink>
            <ButtonLink href="/shop" variant="ghost" size="lg" fullWidth>
              Continue shopping
            </ButtonLink>
          </div>

          <Card tone="muted" className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">What happens next</p>
            <ol className="mt-3 space-y-2.5 text-[13px] leading-relaxed text-ink-muted">
              <li>1. We confirm the order and pick it at the fulfilment centre closest to you.</li>
              <li>2. You get a tracking link by email and SMS the moment it ships.</li>
              <li>3. Pay nothing further — {order.paymentMethod === "cod" ? "settle with the courier on delivery" : "your payment is already captured"}.</li>
              <li>4. Thirty days to return anything that is not right.</li>
            </ol>
          </Card>
        </Container>
      </Section>

      <Section tone="muted" spacing="default">
        <Container>
          <ProductRail
            eyebrow="Customers also bought"
            title="Complete your order"
            products={toCardList(recommended, db)}
            ctaHref="/shop"
          />
        </Container>
      </Section>
    </>
  );
}

function InfoTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-surface p-5">
      <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="mt-2 text-[13.5px] font-medium text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-[11.5px] text-ink-muted">{hint}</p>}
    </div>
  );
}

function Row({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-ink-muted">{label}</span>
      <span className={success ? "tabular-nums text-success" : "tabular-nums text-ink"}>{value}</span>
    </div>
  );
}
