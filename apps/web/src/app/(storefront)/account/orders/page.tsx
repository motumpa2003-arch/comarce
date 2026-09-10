import type { Metadata } from "next";
import { Package } from "lucide-react";
import { getCustomerOrders, getDemoCustomer } from "@obsidian/data";
import { ORDER_STATUS_META, type OrderStatus } from "@obsidian/commerce";
import { EmptyState } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { OrderCard } from "@/components/account/order-card";
import { OrderFilterTabs } from "@/components/account/order-filter-tabs";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Orders & tracking" };

const GROUPS: Record<string, OrderStatus[]> = {
  all: [],
  active: ["pending", "payment_pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery"],
  delivered: ["delivered"],
  returns: ["return_requested", "return_approved", "returned", "refund_pending", "refunded"],
  cancelled: ["cancelled"],
};

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "all", q } = await searchParams;
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);
  const all = getCustomerOrders(db.store.id, customer.id);

  const group = GROUPS[status] ?? [];
  let orders = group.length ? all.filter((o) => group.includes(o.status)) : all;
  if (q) {
    const term = q.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(term) ||
        o.items.some((item) => item.name.toLowerCase().includes(term)),
    );
  }

  const counts = Object.fromEntries(
    Object.entries(GROUPS).map(([key, statuses]) => [
      key,
      statuses.length ? all.filter((o) => statuses.includes(o.status)).length : all.length,
    ]),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display display-case text-[26px] leading-none text-ink">Orders &amp; tracking</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          {all.length} order{all.length === 1 ? "" : "s"} placed with {db.store.name}.
        </p>
      </div>

      <OrderFilterTabs active={status} counts={counts} initialQuery={q ?? ""} />

      <div className="mt-6 space-y-4">
        {orders.length ? (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title={q ? `No orders match “${q}”` : "Nothing here yet"}
            description={
              status === "all"
                ? "Once you place an order it will appear here with live tracking."
                : `You have no ${status} orders right now.`
            }
            action={<ButtonLink href="/shop">Browse the catalogue</ButtonLink>}
            className="rounded-[var(--radius-card)] border border-dashed border-line"
          />
        )}
      </div>

      {orders.length > 0 && (
        <p className="mt-8 text-[11.5px] text-ink-muted">
          Showing {orders.length} of {all.length} orders. Statuses update automatically —{" "}
          {ORDER_STATUS_META.shipped.description.toLowerCase()}
        </p>
      )}
    </div>
  );
}
