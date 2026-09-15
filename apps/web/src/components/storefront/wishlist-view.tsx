"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Share2, ShoppingBag, Trash2 } from "lucide-react";
import { Badge, Button, Card, EmptyState, Rating, Skeleton, useToast } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useHydrated, useWishlist } from "@/store/shopper";
import { useUi } from "@/store/ui";

export function WishlistView() {
  const { items, remove, clear } = useWishlist();
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const hydrated = useHydrated();
  const { toast } = useToast();

  const inStock = items.filter((item) => item.inStock);

  const addAll = () => {
    for (const item of inStock) {
      add({
        productId: item.id,
        variantId: `${item.id}_default`,
        slug: item.slug,
        name: item.name,
        brandName: item.brandName,
        variantTitle: "Default",
        options: {},
        image: item.image,
        unitPrice: item.price,
        compareAtPrice: item.compareAtPrice,
        maxQuantity: 10,
      });
    }
    toast({ title: `${inStock.length} items added to your bag`, tone: "success" });
    openCart();
  };

  if (!hydrated) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[3/4] w-full" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card padded={false}>
        <EmptyState
          icon={<Heart className="h-6 w-6" />}
          eyebrow="Save it for later"
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here. We will tell you when a saved item drops in price."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <ButtonLink href="/shop">Browse products</ButtonLink>
              <ButtonLink href="/deals" variant="outline">
                See deals
              </ButtonLink>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display display-case text-[30px] leading-none text-ink sm:text-[38px]">Wishlist</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            {items.length} saved item{items.length === 1 ? "" : "s"} · {inStock.length} available now
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={addAll} disabled={inStock.length === 0}>
            <ShoppingBag className="h-3.5 w-3.5" />
            Add all in stock
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast({ title: "Wishlist link copied", tone: "success" });
            }}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="text-danger" onClick={clear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const discount =
            item.compareAtPrice && item.compareAtPrice > item.price
              ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
              : 0;
          return (
            <article key={item.id} className="group flex flex-col">
              <Link
                href={`/product/${item.slug}`}
                className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-muted"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width:1024px) 25vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                {discount > 0 && (
                  <Badge tone="sale" size="xs" className="absolute left-3 top-3">
                    {discount}% off
                  </Badge>
                )}
                {!item.inStock && (
                  <span className="absolute inset-0 grid place-items-center bg-surface/60">
                    <span className="rounded-full bg-obsidian px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-inverse">
                      Out of stock
                    </span>
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col pt-3.5">
                {item.brandName && (
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                    {item.brandName}
                  </p>
                )}
                <Link href={`/product/${item.slug}`} className="mt-1 line-clamp-2x text-[13.5px] text-ink hover:text-primary">
                  {item.name}
                </Link>
                <div className="mt-1.5">
                  <Rating value={item.rating} count={item.ratingCount} size={11} showValue={false} />
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-[14px] font-semibold tabular-nums text-ink">{money(item.price)}</span>
                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                    <span className="text-[12px] tabular-nums text-ink-muted line-through">
                      {money(item.compareAtPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex gap-2 pt-4">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={!item.inStock}
                    onClick={() => {
                      add({
                        productId: item.id,
                        variantId: `${item.id}_default`,
                        slug: item.slug,
                        name: item.name,
                        brandName: item.brandName,
                        variantTitle: "Default",
                        options: {},
                        image: item.image,
                        unitPrice: item.price,
                        compareAtPrice: item.compareAtPrice,
                        maxQuantity: 10,
                      });
                      openCart();
                    }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {item.inStock ? "Add to bag" : "Sold out"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Remove"
                    onClick={() => {
                      remove(item.id);
                      toast({ title: "Removed from wishlist", description: item.name });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
