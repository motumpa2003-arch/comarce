"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Repeat, ShoppingBag } from "lucide-react";
import { Badge, Button, Card, useToast } from "@obsidian/ui";
import { useCart } from "@/store/cart";
import { formatDate, money, relativeTime } from "@/lib/format";

export interface BuyAgainItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  brandName?: string;
  variantTitle: string;
  image: string;
  quantity: number;
  times: number;
  lastOrderedAt: string;
  lastOrderNumber: string;
  currentPrice: number;
  unitPrice: number;
  inStock: boolean;
  stillListed: boolean;
}

/**
 * Reorder rows. The price shown is today's, and any difference from what was
 * paid last time is called out rather than quietly applied at checkout.
 */
export function BuyAgainList({ items }: { items: BuyAgainItem[] }) {
  const add = useCart((s) => s.add);
  const { toast } = useToast();
  const [added, setAdded] = React.useState<Record<string, boolean>>({});

  const reorder = (item: BuyAgainItem) => {
    add({
      productId: item.productId,
      variantId: item.variantId,
      slug: item.slug,
      name: item.name,
      brandName: item.brandName,
      variantTitle: item.variantTitle,
      options: {},
      image: item.image,
      unitPrice: item.currentPrice,
      maxQuantity: 10,
      quantity: item.quantity,
    });
    setAdded((a) => ({ ...a, [item.variantId]: true }));
    toast({
      title: "Added to bag",
      description: `${item.name} × ${item.quantity}`,
      tone: "success",
      action: { label: "View bag", href: "/cart" },
    });
  };

  return (
    <Card padded={false}>
      <ul className="divide-y divide-line">
        {items.map((item) => {
          const delta = item.currentPrice - item.unitPrice;
          const isAdded = added[item.variantId];
          return (
            <li key={item.variantId} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-[72px] w-[58px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted"
              >
                {item.image && (
                  <Image src={item.image} alt="" fill sizes="58px" className="object-cover" />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                {item.brandName && (
                  <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-ink-muted">
                    {item.brandName}
                  </p>
                )}
                <Link
                  href={`/product/${item.slug}`}
                  className="mt-0.5 block truncate text-[13.5px] text-ink hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                  {item.variantTitle} · qty {item.quantity}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-muted">
                  <span title={formatDate(item.lastOrderedAt)}>
                    Last bought {relativeTime(item.lastOrderedAt)}
                  </span>
                  {item.times > 1 && (
                    <Badge tone="info" size="xs">
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        {item.times}×
                      </span>
                    </Badge>
                  )}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[14px] font-semibold tabular-nums text-ink">{money(item.currentPrice)}</p>
                {delta !== 0 && (
                  <p
                    className={
                      delta < 0
                        ? "mt-0.5 text-[11px] text-success"
                        : "mt-0.5 text-[11px] text-ink-muted"
                    }
                  >
                    {delta < 0 ? "↓ " : "↑ "}
                    {money(Math.abs(delta))} vs last time
                  </p>
                )}
              </div>

              <div className="shrink-0">
                {!item.stillListed ? (
                  <Badge tone="neutral" size="xs">
                    No longer sold
                  </Badge>
                ) : !item.inStock ? (
                  <Badge tone="warning" size="xs">
                    Out of stock
                  </Badge>
                ) : (
                  <Button size="sm" variant={isAdded ? "outline" : "primary"} onClick={() => reorder(item)}>
                    {isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Buy again
                      </>
                    )}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
