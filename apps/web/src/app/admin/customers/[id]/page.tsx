import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone, Star, Ticket, Wallet } from "lucide-react";
import { ORDER_STATUS_META } from "@obsidian/commerce";
import { getCustomerById, getCustomerOrders, LOYALTY_TIERS } from "@obsidian/data";
import { Avatar, Badge, Card, Progress, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { formatDate, money, number, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const db = await currentStore();
  const customer = getCustomerById(db.store.id, id);
  return { title: customer ? `${customer.firstName} ${customer.lastName}` : "Customer" };
}

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await currentStore();
  const customer = getCustomerById(db.store.id, id);
  if (!customer) notFound();

  const orders = getCustomerOrders(db.store.id, customer.id);
  const reviews = db.reviews.filter((r) => r.customerId === customer.id);
  const tickets = db.tickets.filter((t) => t.customerId === customer.id);
  const returns = db.returns.filter((r) => r.customerId === customer.id);

  const tier = LOYALTY_TIERS.find((t) => t.key === customer.loyaltyTier)!;
  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(tier) + 1];

  // What this customer actually buys, by top-level category.
  const categorySpend = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.productId);
      const parentId = product?.categoryPath[0];
      const parent = db.categories.find((c) => c.id === parentId);
      if (!parent) continue;
      categorySpend.set(parent.name, (categorySpend.get(parent.name) ?? 0) + item.total);
    }
  }
  const affinity = [...categorySpend.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <>
      <AdminPageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              {customer.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" />
              {customer.phone}
            </span>
            <span>Customer since {formatDate(customer.createdAt)}</span>
          </span>
        }
        breadcrumbs={[
          { label: "Customers", href: "/admin/customers" },
          { label: `${customer.firstName} ${customer.lastName}` },
        ]}
        actions={
          <>
            <button type="button" className={buttonClasses("outline", "sm")}>
              Send email
            </button>
            <button type="button" className={buttonClasses("outline", "sm")}>
              Add store credit
            </button>
          </>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lifetime value" value={money(customer.lifetimeValue)} hint={`${number(customer.ordersCount)} orders`} />
        <Stat label="Average order" value={money(customer.averageOrderValue)} />
        <Stat label="Loyalty points" value={number(customer.loyaltyPoints)} hint={`${tier.name} tier`} />
        <Stat label="Store credit" value={money(customer.storeCredit)} hint="Available at checkout" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card padded={false}>
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Order history</h2>
              <span className="text-[11.5px] text-ink-muted">{orders.length} orders</span>
            </div>
            <ul className="divide-y divide-line">
              {orders.map((order) => {
                const meta = ORDER_STATUS_META[order.status];
                return (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/60"
                    >
                      <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-[4px] bg-muted">
                        {order.items[0]?.image && (
                          <Image src={order.items[0].image} alt="" fill sizes="32px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                          #{order.orderNumber}
                          <Badge tone={meta.tone} size="xs">
                            {meta.label}
                          </Badge>
                        </p>
                        <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                          {order.itemCount} item{order.itemCount === 1 ? "" : "s"} · {order.shippingMethod} ·{" "}
                          {relativeTime(order.createdAt)}
                        </p>
                      </div>
                      <p className="shrink-0 text-[13px] font-medium tabular-nums text-ink">{money(order.total)}</p>
                    </Link>
                  </li>
                );
              })}
              {orders.length === 0 && (
                <li className="px-5 py-10 text-center text-[12.5px] text-ink-muted">
                  This customer has not ordered yet.
                </li>
              )}
            </ul>
          </Card>

          {affinity.length > 0 && (
            <Card>
              <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Category affinity</h2>
              <RankedBars rows={affinity} format="money" color={SERIES[0]} />
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Card padded={false}>
              <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
                <Star className="h-3.5 w-3.5 text-ink-muted" />
                <h2 className="text-[12.5px] font-semibold text-ink">Reviews</h2>
                <span className="ml-auto text-[11.5px] text-ink-muted">{reviews.length}</span>
              </div>
              <ul className="divide-y divide-line">
                {reviews.slice(0, 4).map((review) => (
                  <li key={review.id} className="px-5 py-3">
                    <p className="text-[12px] font-medium text-ink">
                      {"★".repeat(review.rating)}
                      <span className="text-line">{"★".repeat(5 - review.rating)}</span>
                      <span className="ml-2 font-normal text-ink-muted">{review.title}</span>
                    </p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">{review.productName}</p>
                  </li>
                ))}
                {reviews.length === 0 && (
                  <li className="px-5 py-8 text-center text-[12px] text-ink-muted">No reviews.</li>
                )}
              </ul>
            </Card>

            <Card padded={false}>
              <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
                <Ticket className="h-3.5 w-3.5 text-ink-muted" />
                <h2 className="text-[12.5px] font-semibold text-ink">Support tickets</h2>
                <span className="ml-auto text-[11.5px] text-ink-muted">{tickets.length}</span>
              </div>
              <ul className="divide-y divide-line">
                {tickets.slice(0, 4).map((ticket) => (
                  <li key={ticket.id} className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-ink-muted">{ticket.reference}</span>
                      <Badge
                        tone={
                          ticket.status === "resolved" || ticket.status === "closed"
                            ? "success"
                            : ticket.status === "open"
                              ? "info"
                              : "warning"
                        }
                        size="xs"
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-[12px] text-ink">{ticket.subject}</p>
                  </li>
                ))}
                {tickets.length === 0 && (
                  <li className="px-5 py-8 text-center text-[12px] text-ink-muted">No tickets.</li>
                )}
              </ul>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card>
            <div className="flex items-center gap-3">
              <Avatar src={customer.avatar} name={`${customer.firstName} ${customer.lastName}`} size={48} />
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-ink">
                  {customer.firstName} {customer.lastName}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {customer.segments.map((segment) => (
                    <Badge key={segment} tone="outline" size="xs">
                      {titleCase(segment)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[12.5px]">
              <Row label="Status" value={titleCase(customer.status)} />
              <Row label="Marketing" value={customer.marketingOptIn ? "Opted in" : "Opted out"} />
              <Row label="First order" value={customer.firstOrderAt ? formatDate(customer.firstOrderAt) : "—"} />
              <Row label="Last order" value={customer.lastOrderAt ? formatDate(customer.lastOrderAt) : "—"} />
              <Row label="Last seen" value={relativeTime(customer.lastSeenAt)} />
              <Row label="Refunded" value={money(customer.refundedAmount)} />
              <Row label="Open returns" value={String(returns.filter((r) => r.status !== "completed").length)} />
            </dl>

            {customer.notes && (
              <p className="mt-4 rounded-[var(--radius-sm)] bg-muted p-3 text-[12px] italic text-ink-muted">
                {customer.notes}
              </p>
            )}
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Wallet className="h-3.5 w-3.5" />
              Loyalty
            </h2>
            <p className="mt-2 text-[12.5px] text-ink-muted">
              {tier.name} tier · earning {tier.pointsMultiplier}× points
            </p>
            {nextTier && (
              <div className="mt-3">
                <div className="flex items-baseline justify-between text-[11.5px] text-ink-muted">
                  <span>{tier.name}</span>
                  <span>{money(Math.max(0, nextTier.minSpend - customer.lifetimeValue))} to {nextTier.name}</span>
                </div>
                <Progress
                  className="mt-1.5"
                  tone="accent"
                  value={Math.min(
                    100,
                    ((customer.lifetimeValue - tier.minSpend) / (nextTier.minSpend - tier.minSpend)) * 100,
                  )}
                />
              </div>
            )}
          </Card>

          <Card padded={false}>
            <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
              <MapPin className="h-3.5 w-3.5 text-ink-muted" />
              <h2 className="text-[12.5px] font-semibold text-ink">Addresses</h2>
            </div>
            <ul className="divide-y divide-line text-[12.5px]">
              {customer.addresses.map((address) => (
                <li key={address.id} className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">{address.label}</span>
                    {address.isDefaultShipping && (
                      <Badge tone="info" size="xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1.5 leading-relaxed text-ink-muted">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate text-right text-ink">{value}</dd>
    </div>
  );
}
