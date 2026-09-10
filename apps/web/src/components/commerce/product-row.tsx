"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Badge, Button, Rating, cn, useToast } from "@obsidian/ui";
import type { ProductCardData } from "@/lib/product-view";
import { money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useHydrated, useWishlist } from "@/store/shopper";
import { useUi } from "@/store/ui";

export function ProductRow({ product }: { product: ProductCardData }) {
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const wishlisted = useWishlist((s) => s.items.some((i) => i.id === product.id));
  const hydrated = useHydrated();
  const { toast } = useToast();

  return (
    <article className="group flex gap-5 border-b border-line py-5 first:border-t">
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-[3/4] w-[128px] shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-muted sm:w-[160px]"
      >
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {product.discount > 0 && (
          <Badge tone="sale" size="xs" className="absolute left-2 top-2">
            {product.discount}%
          </Badge>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {product.brandName && (
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                {product.brandName}
              </p>
            )}
            <Link href={`/product/${product.slug}`}>
              <h3 className="mt-1 text-[15px] leading-snug text-ink transition-colors group-hover:text-primary">
                {product.name}
              </h3>
            </Link>
            {product.categoryName && (
              <p className="mt-0.5 text-[11.5px] text-ink-muted">{product.categoryName}</p>
            )}
            <div className="mt-2">
              <Rating value={product.rating} count={product.ratingCount} size={12} />
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              toggleWishlist({
                id: product.id,
                slug: product.slug,
                name: product.name,
                brandName: product.brandName,
                image: product.image,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                rating: product.rating,
                ratingCount: product.ratingCount,
                inStock: product.inStock,
              })
            }
            aria-label="Save to wishlist"
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors",
              hydrated && wishlisted ? "border-ink bg-ink text-inverse" : "border-line text-ink hover:border-ink/40",
            )}
          >
            <Heart className={cn("h-4 w-4", hydrated && wishlisted && "fill-current")} />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[19px] font-semibold tabular-nums text-ink">{money(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-[13px] tabular-nums text-ink-muted line-through">
                    {money(product.compareAtPrice)}
                  </span>
                  <span className="text-[12.5px] font-medium text-sale">{product.discount}% off</span>
                </>
              )}
            </div>
            {product.stockLabel && (
              <p className={cn("mt-1 text-[11.5px]", product.inStock ? "text-warning" : "text-danger")}>
                {product.stockLabel}
              </p>
            )}
          </div>

          <Button
            size="sm"
            variant={product.inStock ? "primary" : "subtle"}
            disabled={!product.inStock}
            onClick={() => {
              add({
                productId: product.id,
                variantId: product.defaultVariantId,
                slug: product.slug,
                name: product.name,
                brandName: product.brandName,
                variantTitle: product.defaultVariantTitle,
                options: product.defaultVariantOptions,
                image: product.image,
                unitPrice: product.price,
                compareAtPrice: product.compareAtPrice,
                maxQuantity: product.maxQuantity,
              });
              openCart();
              toast({ title: "Added to your bag", description: product.name, image: product.image, tone: "success" });
            }}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {product.inStock ? "Add to bag" : "Sold out"}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductList({ products }: { products: ProductCardData[] }) {
  return (
    <div>
      {products.map((product) => (
        <ProductRow key={product.id} product={product} />
      ))}
    </div>
  );
}
