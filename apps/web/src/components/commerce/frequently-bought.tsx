"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { Button, Checkbox, SectionHeading, cn, useToast } from "@obsidian/ui";
import type { ProductCardData } from "@/lib/product-view";
import { money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

export interface BundleAnchor {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  variantId: string;
  variantTitle: string;
  options: Record<string, string>;
}

/**
 * Bundle add-on strip. The anchor product is always included; the shopper
 * ticks the extras and adds everything in one action.
 */
export function FrequentlyBoughtTogether({
  anchor,
  suggestions,
}: {
  anchor: BundleAnchor;
  suggestions: ProductCardData[];
}) {
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(suggestions.map((s) => s.id)),
  );
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const { toast } = useToast();

  const chosen = suggestions.filter((s) => selected.has(s.id));
  const total = anchor.price + chosen.reduce((n, s) => n + s.price, 0);
  const listTotal =
    anchor.price + chosen.reduce((n, s) => n + (s.compareAtPrice ?? s.price), 0);
  const savings = Math.max(0, listTotal - total);

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addAll = () => {
    add({
      productId: anchor.id,
      variantId: anchor.variantId,
      slug: anchor.slug,
      name: anchor.name,
      variantTitle: anchor.variantTitle,
      options: anchor.options,
      image: anchor.image,
      unitPrice: anchor.price,
      maxQuantity: 10,
    });
    for (const item of chosen) {
      add({
        productId: item.id,
        variantId: item.defaultVariantId,
        slug: item.slug,
        name: item.name,
        brandName: item.brandName,
        variantTitle: item.defaultVariantTitle,
        options: item.defaultVariantOptions,
        image: item.image,
        unitPrice: item.price,
        compareAtPrice: item.compareAtPrice,
        maxQuantity: item.maxQuantity,
      });
    }
    toast({
      title: `${chosen.length + 1} items added`,
      description: `Bundle total ${money(total)}`,
      tone: "success",
      action: { label: "Checkout", href: "/checkout" },
    });
    openCart();
  };

  const tiles = [
    { id: anchor.id, name: anchor.name, image: anchor.image, price: anchor.price, slug: anchor.slug, anchor: true },
    ...suggestions.map((s) => ({
      id: s.id,
      name: s.name,
      image: s.image,
      price: s.price,
      slug: s.slug,
      anchor: false,
    })),
  ];

  return (
    <div>
      <SectionHeading
        eyebrow="Bought together"
        title="Frequently bought together"
        description="Based on what other customers added in the same order."
        size="sm"
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <div className="flex flex-wrap items-center gap-3">
          {tiles.map((tile, index) => (
            <React.Fragment key={tile.id}>
              {index > 0 && (
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ink-muted">
                  <Plus className="h-3.5 w-3.5" />
                </span>
              )}
              <Link
                href={`/product/${tile.slug}`}
                className={cn(
                  "group relative aspect-[3/4] w-[124px] shrink-0 overflow-hidden rounded-[var(--radius-card)] border bg-muted transition-colors sm:w-[150px]",
                  tile.anchor || selected.has(tile.id) ? "border-ink" : "border-line opacity-55",
                )}
              >
                {tile.image && (
                  <Image src={tile.image} alt={tile.name} fill sizes="150px" className="object-cover" />
                )}
              </Link>
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
          <ul className="space-y-3">
            <li className="flex items-start justify-between gap-3">
              <span className="flex items-start gap-2.5">
                <span className="mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-[3px] bg-ink text-[9px] text-inverse">
                  ✓
                </span>
                <span className="text-[12.5px] leading-snug text-ink">
                  <span className="font-medium">This item:</span> {anchor.name}
                </span>
              </span>
              <span className="shrink-0 text-[12.5px] tabular-nums text-ink">{money(anchor.price)}</span>
            </li>
            {suggestions.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3">
                <Checkbox
                  checked={selected.has(item.id)}
                  onChange={() => toggle(item.id)}
                  label={<span className="text-[12.5px] leading-snug">{item.name}</span>}
                />
                <span className="shrink-0 text-[12.5px] tabular-nums text-ink">{money(item.price)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-line pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] uppercase tracking-[0.1em] text-ink-muted">Bundle total</span>
              <span className="font-display text-[24px] tabular-nums text-ink">{money(total)}</span>
            </div>
            {savings > 0 && (
              <p className="mt-1 text-right text-[11.5px] text-success">You save {money(savings)}</p>
            )}
            <Button fullWidth className="mt-4" onClick={addAll}>
              <ShoppingBag className="h-4 w-4" />
              Add {chosen.length + 1} to bag
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
