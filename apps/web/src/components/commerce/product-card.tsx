"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { Badge, Rating, cn, useToast } from "@obsidian/ui";
import { useFlyToCart } from "@/components/storefront/fly-to-cart";
import type { ProductCardData } from "@/lib/product-view";
import { money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useHydrated, useWishlist } from "@/store/shopper";
import { useUi } from "@/store/ui";

/**
 * Small tilt + magnetic-pull effect for a card's media block, driven by
 * pointer position. Disabled under reduced-motion and on coarse (touch)
 * pointers, where there's no hover to react to anyway.
 */
function useCardTilt() {
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 300, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 22 });
  const x = useSpring(0, { stiffness: 300, damping: 22 });
  const y = useSpring(0, { stiffness: 300, damping: 22 });

  const enabled = () => !reduceMotion && typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 9);
    rotateX.set(py * -9);
    x.set(px * 6);
    y.set(py * 6);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    x.set(0);
    y.set(0);
  };

  return {
    onPointerMove,
    onPointerLeave,
    style: { rotateX, rotateY, x, y, transformPerspective: 800 },
  };
}

export type ProductCardStyle = "editorial" | "classic" | "compact" | "overlay";

export interface ProductCardProps {
  product: ProductCardData;
  variant?: ProductCardStyle;
  priority?: boolean;
  className?: string;
  sizes?: string;
  showQuickAdd?: boolean;
}

export function ProductCard({
  product,
  variant = "editorial",
  priority,
  className,
  sizes = "(min-width:1280px) 20vw, (min-width:768px) 30vw, 45vw",
  showQuickAdd = true,
}: ProductCardProps) {
  const [activeSwatch, setActiveSwatch] = React.useState(0);
  const tilt = useCardTilt();
  const mediaRef = React.useRef<HTMLDivElement>(null);
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const setQuickView = useUi((s) => s.setQuickView);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const wishlisted = useWishlist((s) => s.items.some((i) => i.id === product.id));
  const hydrated = useHydrated();
  const { toast } = useToast();
  const { fly } = useFlyToCart();

  const swatch = product.swatches[activeSwatch];
  const primaryImage = swatch?.image ?? product.image;

  const onAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (mediaRef.current && primaryImage) {
      fly(mediaRef.current.getBoundingClientRect(), primaryImage);
    }
    add({
      productId: product.id,
      variantId: product.defaultVariantId,
      slug: product.slug,
      name: product.name,
      brandName: product.brandName,
      variantTitle: product.defaultVariantTitle,
      options: product.defaultVariantOptions,
      image: primaryImage,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      maxQuantity: product.maxQuantity,
    });
    openCart();
  };

  const onWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const added = toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brandName: product.brandName,
      image: primaryImage,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      rating: product.rating,
      ratingCount: product.ratingCount,
      inStock: product.inStock,
    });
    toast({
      title: added ? "Saved to wishlist" : "Removed from wishlist",
      description: product.name,
      image: primaryImage,
      tone: added ? "accent" : "default",
      action: added ? { label: "View wishlist", href: "/wishlist" } : undefined,
    });
  };

  const onQuickView = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setQuickView(product.slug);
  };

  const aspect = variant === "compact" ? "aspect-square" : variant === "classic" ? "aspect-[4/5]" : "aspect-[3/4]";

  return (
    <article className={cn("group relative flex h-full flex-col", className)}>
      <div className="flex h-full flex-col">
        {/* ------------------------------ Media ----------------------------- */}
        <motion.div
          ref={mediaRef}
          onPointerMove={tilt.onPointerMove}
          onPointerLeave={tilt.onPointerLeave}
          style={tilt.style}
          className={cn(
            "relative overflow-hidden bg-muted",
            aspect,
            variant === "overlay" ? "rounded-[var(--radius-card)]" : "rounded-[var(--radius-card)]",
          )}
        >
          {primaryImage && (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes={sizes}
              priority={priority}
              className={cn(
                "object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                "group-hover:scale-[1.045]",
                product.hoverImage && "group-hover:opacity-0",
              )}
            />
          )}
          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt=""
              fill
              sizes={sizes}
              className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              aria-hidden
            />
          )}

          {/* Badges */}
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone} size="xs">
                {badge.label}
              </Badge>
            ))}
            {product.discount > 0 && (
              <Badge tone="sale" size="xs">
                {product.discount}% off
              </Badge>
            )}
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={onWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={hydrated ? wishlisted : undefined}
            className={cn(
              "absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-all duration-200",
              hydrated && wishlisted
                ? "border-transparent bg-obsidian text-inverse"
                : "border-white/50 bg-white/85 text-ink hover:bg-white",
            )}
          >
            <Heart className={cn("h-[15px] w-[15px]", hydrated && wishlisted && "fill-current")} />
          </button>

          {/* Hover actions */}
          {showQuickAdd && (
            <div
              className={cn(
                "absolute inset-x-2.5 bottom-2.5 z-10 flex gap-2 opacity-0 transition-all duration-300",
                "translate-y-2 group-hover:translate-y-0 group-hover:opacity-100",
                "max-md:hidden",
              )}
            >
              <button
                type="button"
                onClick={onAdd}
                disabled={!product.inStock}
                className={cn(
                  "flex h-10 flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] text-[11px] font-medium uppercase tracking-[0.1em] transition-colors",
                  product.inStock
                    ? "bg-obsidian text-inverse hover:bg-primary"
                    : "cursor-not-allowed bg-white/85 text-ink-muted",
                )}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                {product.inStock ? (product.hasOptions ? "Quick add" : "Add to bag") : "Sold out"}
              </button>
              <button
                type="button"
                onClick={onQuickView}
                aria-label="Quick view"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-button)] bg-white/90 text-ink transition-colors hover:bg-white"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          )}

          {!product.inStock && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-surface/55">
              <span className="rounded-full bg-obsidian px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-inverse">
                Sold out
              </span>
            </div>
          )}

          {variant === "overlay" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/85 via-obsidian/25 to-transparent p-4 pt-14">
              <p className="font-display text-[17px] leading-tight text-inverse">
                <Link
                  href={`/product/${product.slug}`}
                  className="pointer-events-auto after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:underline"
                >
                  {product.name}
                </Link>
              </p>
              <p className="mt-1 text-[13px] font-medium text-inverse/90">{money(product.price)}</p>
            </div>
          )}
        </motion.div>

        {/* ------------------------------ Details --------------------------- */}
        {variant !== "overlay" && (
          <div className={cn("flex flex-1 flex-col", variant === "compact" ? "pt-2.5" : "pt-3.5")}>
            {product.brandName && variant !== "compact" && (
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                {product.brandName}
              </p>
            )}
            <h3
              className={cn(
                "mt-1 line-clamp-2x text-ink transition-colors group-hover:text-primary",
                variant === "editorial" ? "text-[13.5px] leading-snug" : "text-[13px] leading-snug",
              )}
            >
              <Link
                href={`/product/${product.slug}`}
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:underline"
              >
                {product.name}
              </Link>
            </h3>

            {variant !== "compact" && (
              <div className="mt-1.5">
                <Rating value={product.rating} count={product.ratingCount} size={11} showValue={false} />
              </div>
            )}

            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-[14px] font-semibold tabular-nums text-ink">{money(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-[12px] tabular-nums text-ink-muted line-through">
                    {money(product.compareAtPrice)}
                  </span>
                  <span className="text-[11.5px] font-medium text-sale">{product.discount}% off</span>
                </>
              )}
            </div>

            {product.swatches.length > 1 && (
              <div className="relative z-10 mt-2.5 flex w-fit items-center gap-1.5">
                {product.swatches.map((s, index) => (
                  <button
                    key={s.value}
                    type="button"
                    aria-label={s.label}
                    title={s.label}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActiveSwatch(index);
                    }}
                    className={cn(
                      "h-4 w-4 rounded-full border transition-all",
                      index === activeSwatch
                        ? "border-ink ring-1 ring-ink ring-offset-1 ring-offset-surface"
                        : "border-line hover:border-ink/40",
                    )}
                    style={{ backgroundColor: s.swatch ?? "var(--c-surface-muted)" }}
                  />
                ))}
                {product.swatches.length >= 5 && (
                  <span className="text-[10.5px] text-ink-muted">+more</span>
                )}
              </div>
            )}

            {product.stockLabel && (
              <p
                className={cn(
                  "mt-2 text-[11px] font-medium",
                  product.inStock ? "text-warning" : "text-danger",
                )}
              >
                {product.stockLabel}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mobile add-to-bag: hover affordances do not exist on touch. */}
      {showQuickAdd && variant !== "overlay" && (
        <button
          type="button"
          onClick={onAdd}
          disabled={!product.inStock}
          className={cn(
            "relative z-10 mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-line text-[11px] font-medium uppercase tracking-[0.1em] transition-colors md:hidden",
            product.inStock ? "text-ink active:bg-ink active:text-inverse" : "text-ink-muted",
          )}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {product.inStock ? "Add to bag" : "Sold out"}
        </button>
      )}
    </article>
  );
}

/* ------------------------------- Grid ------------------------------- */

export function ProductGrid({
  products,
  columns = 4,
  variant = "editorial",
  className,
  priorityCount = 0,
}: {
  products: ProductCardData[];
  columns?: 2 | 3 | 4 | 5 | 6;
  variant?: ProductCardStyle;
  className?: string;
  priorityCount?: number;
}) {
  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  }[columns];

  return (
    <div className={cn("grid gap-x-4 gap-y-9 sm:gap-x-5 sm:gap-y-11", colClass, className)}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
