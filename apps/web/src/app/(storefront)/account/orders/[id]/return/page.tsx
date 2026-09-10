import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isReturnable } from "@obsidian/commerce";
import { getOrderById, getReturnForOrder } from "@obsidian/data";
import { Breadcrumb, Card } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { ReturnWizard } from "@/components/account/return-wizard";
import { formatDate } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Return or exchange" };

export default async function ReturnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await currentStore();
  const order = getOrderById(db.store.id, id);
  if (!order) notFound();

  const existing = getReturnForOrder(db.store.id, order.id);

  if (existing) {
    return (
      <div>
        <Breadcrumb
          className="mb-5"
          items={[
            { label: "Account", href: "/account" },
            { label: "Orders", href: "/account/orders" },
            { label: `#${order.orderNumber}`, href: `/account/orders/${order.id}` },
            { label: "Return" },
          ]}
        />
        <Card>
          <h1 className="font-display display-case text-[22px] text-ink">A return is already in progress</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            You raised a return for this order on {formatDate(existing.createdAt)}. Its current status is{" "}
            {existing.status.replace(/_/g, " ")}.
          </p>
          <ButtonLink href={`/account/orders/${order.id}`} className="mt-5">
            View order
          </ButtonLink>
        </Card>
      </div>
    );
  }

  if (!isReturnable(order)) {
    return (
      <div>
        <Card>
          <h1 className="font-display display-case text-[22px] text-ink">This order cannot be returned</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            Returns are available for thirty days after delivery. This order is{" "}
            {order.status === "delivered" ? "outside that window" : `currently ${order.status.replace(/_/g, " ")}`}.
          </p>
          <ButtonLink href="/account/support" className="mt-5" variant="outline">
            Contact support
          </ButtonLink>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb
        className="mb-5"
        items={[
          { label: "Account", href: "/account" },
          { label: "Orders", href: "/account/orders" },
          { label: `#${order.orderNumber}`, href: `/account/orders/${order.id}` },
          { label: "Return" },
        ]}
      />
      <h1 className="font-display display-case text-[26px] leading-none text-ink">Return or exchange</h1>
      <p className="mt-2 text-[13px] text-ink-muted">
        Order #{order.orderNumber} · delivered {order.deliveredAt ? formatDate(order.deliveredAt) : "recently"}
      </p>

      <ReturnWizard
        orderId={order.id}
        orderNumber={order.orderNumber}
        items={order.items.map((item) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          total: item.total,
        }))}
      />
    </div>
  );
}
