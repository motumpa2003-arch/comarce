import type { Metadata } from "next";
import { Repeat } from "lucide-react";
import { getCustomerOrders, getDemoCustomer, getProductsByIds } from "@obsidian/data";
import { Card, EmptyState } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductGrid } from "@/components/commerce/product-card";
import { BuyAgainList } from "@/components/account/buy-again-list";
import { toCardList } from "@/lib/product-view";
import { number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Buy again" };

export default async function BuyAgainPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);
  const orders = getCustomerOrders(db.store.id, customer.id);

  // One row per variant across every delivered order, most recent first, with
  // how many times it has been bought — the signal that makes this page useful
  // rather than just a second order history.
  const seen = new Map<
    string,
    {
      productId: string;
      variantId: string;
      name: string;
      slug: string;
      brandName?: string;
      variantTitle: string;
      image: string;
      unitPrice: number;
      quantity: number;
      times: number;
      lastOrderedAt: string;
      lastOrderNumber: string;
    }
  >();

  for (const order of orders) {
    if (order.status !== "delivered") continue;
    for (const item of order.items) {
      const existing = seen.get(item.variantId);
      if (existing) {
        existing.times += 1;
        if (Date.parse(order.createdAt) > Date.parse(existing.lastOrderedAt)) {
          existing.lastOrderedAt = order.createdAt;
          existing.lastOrderNumber = order.orderNumber;
        }
        continue;
      }
      seen.set(item.variantId, {
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        slug: item.slug,
        brandName: item.brandName,
        variantTitle: item.variantTitle,
        image: item.image,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        times: 1,
        lastOrderedAt: order.createdAt,
        lastOrderNumber: order.orderNumber,
      });
    }
  }

  const rows = [...seen.values()].sort(
    (a, b) => b.times - a.times || Date.parse(b.lastOrderedAt) - Date.parse(a.lastOrderedAt),
  );

  // Availability now, not at the time of the original order.
  const products = getProductsByIds(
    db.store.id,
    rows.map((r) => r.productId),
  );
  const byId = new Map(products.map((p) => [p.id, p]));

  const items = rows.map((row) => {
    const product = byId.get(row.productId);
    const variant = product?.variants.find((v) => v.id === row.variantId);
    const available = variant ? variant.stock - variant.reservedStock : 0;
    return {
      ...row,
      currentPrice: variant?.price ?? row.unitPrice,
      inStock: available > 0,
      stillListed: Boolean(product && product.status === "active"),
    };
  });

  const repeats = items.filter((i) => i.times > 1).length;
  const suggestions = toCardList(products.filter((p) => p.status === "active").slice(0, 8), db);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display display-case text-[26px] leading-none text-ink">Buy again</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          {items.length === 0
            ? "Delivered items will appear here so you can reorder them in a tap."
            : `${number(items.length)} item${items.length === 1 ? "" : "s"} you have had delivered${
                repeats > 0 ? `, ${number(repeats)} of them more than once` : ""
              }. Prices and stock are live, not what you paid last time.`}
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="py-4">
          <EmptyState
            icon={<Repeat className="h-6 w-6" />}
            title="Nothing delivered yet"
            description="Once an order reaches you, everything in it shows up here with its current price and stock."
            action={<ButtonLink href="/shop">Start shopping</ButtonLink>}
          />
        </Card>
      ) : (
        <BuyAgainList items={items} />
      )}

      {suggestions.length > 0 && (
        <div className="pt-4">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            Others you might restock
          </h2>
          <ProductGrid products={suggestions} columns={4} />
        </div>
      )}
    </div>
  );
}
