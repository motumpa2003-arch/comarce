"use client";

import * as React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  Gift,
  Heart,
  MapPin,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import { Badge, Button, Rating, cn, useToast } from "@obsidian/ui";
import type { ProductDetail } from "@/lib/product-detail";
import { deliveryWindow, money, number } from "@/lib/format";
import { useHydrated, useRecentlyViewed, useWishlist } from "@/store/shopper";
import { QuantityStepper } from "@/components/storefront/cart-drawer";
import { usePurchase } from "./use-purchase";
import { VariantPicker } from "./variant-picker";
import { ProductGallery } from "./product-gallery";

export function ProductPurchase({ detail }: { detail: ProductDetail }) {
  const purchase = usePurchase(detail);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const wishlisted = useWishlist((s) => s.items.some((i) => i.id === detail.id));
  const pushRecent = useRecentlyViewed((s) => s.push);
  const hydrated = useHydrated();
  const { toast } = useToast();

  React.useEffect(() => {
    pushRecent(detail.id);
  }, [detail.id, pushRecent]);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: detail.name, url });
        return;
      } catch {
        /* user dismissed the sheet */
      }
    }
    await navigator.clipboard?.writeText(url);
    toast({ title: "Link copied", description: "Product link is on your clipboard.", tone: "success" });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
      <div className="lg:sticky lg:top-[180px] lg:self-start">
        <ProductGallery
          media={detail.media}
          activeUrl={purchase.variant?.image}
          badge={
            <>
              {detail.flags.isNew && <Badge tone="obsidian">New</Badge>}
              {detail.flags.bestseller && <Badge tone="accent">Bestseller</Badge>}
              {purchase.discount > 0 && <Badge tone="sale">{purchase.discount}% off</Badge>}
            </>
          }
        />
      </div>

      <div className="min-w-0">
        {/* Title block */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {detail.brand && (
              <Link
                href={`/brand/${detail.brand.slug}`}
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-primary"
              >
                {detail.brand.name}
              </Link>
            )}
            <h1 className="mt-2 font-display text-[30px] leading-[1.1] text-ink sm:text-[38px]">{detail.name}</h1>
            <p className="mt-2 text-[13.5px] text-ink-muted">{detail.shortDescription}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={share}
              aria-label="Share"
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition-colors hover:border-ink/40"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <a href="#reviews" className="transition-opacity hover:opacity-80">
            <Rating value={detail.rating.average} count={detail.rating.count} />
          </a>
          <span className="h-3 w-px bg-line" />
          <span className="text-[12px] text-ink-muted">{number(detail.unitsSold)} sold</span>
          {detail.flags.bestseller && <Badge tone="success">Bestseller</Badge>}
        </div>

        {/* Price */}
        <div className="mt-6 border-y border-line py-5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-display text-[38px] leading-none tabular-nums text-ink">
              {money(purchase.price)}
            </span>
            {purchase.compareAtPrice && purchase.compareAtPrice > purchase.price && (
              <>
                <span className="text-[16px] tabular-nums text-ink-muted line-through">
                  {money(purchase.compareAtPrice)}
                </span>
                <span className="text-[15px] font-medium text-sale">{purchase.discount}% off</span>
              </>
            )}
          </div>
          <p className="mt-1.5 text-[11.5px] text-ink-muted">
            Inclusive of all taxes · {detail.taxLabel}
          </p>
          {purchase.compareAtPrice && purchase.compareAtPrice > purchase.price && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-success/[0.08] px-2.5 py-1 text-[12px] font-medium text-success">
              <Check className="h-3.5 w-3.5" />
              You save {money(purchase.compareAtPrice - purchase.price)}
            </p>
          )}
        </div>

        {/* Variants */}
        <VariantPicker
          className="mt-6"
          attributes={detail.variantAttributes}
          options={purchase.options}
          onChange={purchase.setOption}
        />

        {/* Stock */}
        <p
          className={cn(
            "mt-6 flex items-center gap-2 text-[13px] font-medium",
            !purchase.inStock ? "text-danger" : purchase.stockLabel.startsWith("Hurry") ? "text-warning" : "text-success",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              !purchase.inStock ? "bg-danger" : purchase.stockLabel.startsWith("Hurry") ? "bg-warning" : "bg-success",
            )}
          />
          {purchase.stockLabel}
        </p>

        {/* Buy box */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <QuantityStepper
            value={purchase.quantity}
            max={purchase.maxQuantity}
            onChange={purchase.setQuantity}
            size="md"
          />
          <Button
            size="lg"
            variant="accent"
            className="min-w-[180px] flex-1"
            disabled={!purchase.inStock}
            onClick={() => purchase.addToBag()}
          >
            <ShoppingBag className="h-4 w-4" />
            Add to bag
          </Button>
          <Button
            size="lg"
            variant="obsidian"
            className="min-w-[150px] flex-1"
            disabled={!purchase.inStock}
            onClick={purchase.buyNow}
          >
            <Zap className="h-4 w-4" />
            Buy now
          </Button>
          <button
            type="button"
            onClick={() => {
              const added = toggleWishlist({
                id: detail.id,
                slug: detail.slug,
                name: detail.name,
                brandName: detail.brand?.name,
                image: purchase.activeImage ?? "",
                price: purchase.price,
                compareAtPrice: purchase.compareAtPrice,
                rating: detail.rating.average,
                ratingCount: detail.rating.count,
                inStock: purchase.inStock,
              });
              toast({
                title: added ? "Saved to wishlist" : "Removed from wishlist",
                description: detail.name,
                tone: added ? "accent" : "default",
              });
            }}
            aria-label="Save to wishlist"
            className={cn(
              "grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[var(--radius-button)] border transition-colors",
              hydrated && wishlisted ? "border-ink bg-ink text-inverse" : "border-line text-ink hover:border-ink/40",
            )}
          >
            <Heart className={cn("h-[18px] w-[18px]", hydrated && wishlisted && "fill-current")} />
          </button>
        </div>

        <DeliveryChecker />

        {/* Assurances */}
        <ul className="mt-6 grid grid-cols-2 gap-y-3 border-t border-line pt-5 text-[12px] text-ink-muted">
          <li className="flex items-center gap-2">
            <Truck className="h-4 w-4 shrink-0 text-primary" />
            Free delivery above ₹999
          </li>
          <li className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 shrink-0 text-primary" />
            30-day easy returns
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            Secure encrypted payment
          </li>
          <li className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            100% authentic, brand sourced
          </li>
        </ul>

        {/* Highlights */}
        {detail.highlights.length > 0 && (
          <div className="mt-7 rounded-[var(--radius-card)] border border-line bg-muted p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Why this one</p>
            <ul className="mt-3 space-y-2.5">
              {detail.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Meta */}
        <dl className="mt-6 grid grid-cols-2 gap-y-2 text-[12px]">
          <dt className="text-ink-muted">SKU</dt>
          <dd className="text-right font-medium text-ink">{purchase.variant?.sku ?? detail.sku}</dd>
          {detail.category && (
            <>
              <dt className="text-ink-muted">Category</dt>
              <dd className="text-right">
                <Link href={`/category/${detail.category.slug}`} className="font-medium text-ink hover:text-primary">
                  {detail.category.name}
                </Link>
              </dd>
            </>
          )}
          {detail.collectionNames.length > 0 && (
            <>
              <dt className="text-ink-muted">Collections</dt>
              <dd className="text-right">
                {detail.collectionNames.map((c, i) => (
                  <React.Fragment key={c.slug}>
                    {i > 0 && <span className="text-ink-muted">, </span>}
                    <Link href={`/collection/${c.slug}`} className="font-medium text-ink hover:text-primary">
                      {c.name}
                    </Link>
                  </React.Fragment>
                ))}
              </dd>
            </>
          )}
        </dl>

        <button
          type="button"
          onClick={() => toast({ title: "Gift options open at checkout", tone: "default" })}
          className="mt-5 inline-flex items-center gap-2 text-[12px] text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          <Gift className="h-3.5 w-3.5" />
          Add gift wrap and a message at checkout
        </button>
      </div>

      <StickyBuyBar purchase={purchase} detail={detail} />
    </div>
  );
}

/* -------------------------- Delivery checker ------------------------ */

function DeliveryChecker() {
  const [pincode, setPincode] = React.useState("");
  const [result, setResult] = React.useState<{ ok: boolean; message: string; eta?: string } | null>(null);

  const check = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setResult({ ok: false, message: "Enter a valid 6-digit pincode." });
      return;
    }
    // Deterministic from the pincode so the answer is stable on re-check.
    const serviceable = Number(pincode) % 17 !== 0;
    const fast = Number(pincode) % 3 === 0;
    setResult(
      serviceable
        ? {
            ok: true,
            message: fast ? "Express delivery available" : "Standard delivery available",
            eta: fast ? deliveryWindow(1, 2) : deliveryWindow(4, 6),
          }
        : { ok: false, message: "We do not deliver to this pincode yet." },
    );
  };

  return (
    <div className="mt-6 rounded-[var(--radius-card)] border border-line p-4">
      <p className="flex items-center gap-2 text-[12px] font-medium text-ink">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        Check delivery to your area
      </p>
      <form onSubmit={check} className="mt-3 flex gap-2">
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="Enter 6-digit pincode"
          aria-label="Delivery pincode"
          className="h-10 flex-1 rounded-[var(--radius-button)] border border-line bg-surface px-3.5 text-[13px] text-ink outline-none placeholder:text-ink-muted/70 focus:border-primary"
        />
        <Button type="submit" variant="outline" size="sm">
          Check
        </Button>
      </form>
      {result && (
        <div className={cn("mt-3 text-[12.5px]", result.ok ? "text-success" : "text-danger")}>
          <p className="font-medium">{result.message}</p>
          {result.eta && <p className="mt-0.5 text-ink-muted">Arrives {result.eta}</p>}
        </div>
      )}
    </div>
  );
}

/* --------------------------- Sticky buy bar ------------------------- */

function StickyBuyBar({
  purchase,
  detail,
}: {
  purchase: ReturnType<typeof usePurchase>;
  detail: ProductDetail;
}) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 620);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-[57px] z-30 border-t border-line bg-surface/97 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-[130%]",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] text-ink-muted">{detail.name}</p>
          <p className="text-[16px] font-semibold tabular-nums text-ink">{money(purchase.price)}</p>
        </div>
        <Button
          variant="accent"
          className="shrink-0"
          disabled={!purchase.inStock}
          onClick={() => purchase.addToBag()}
        >
          <ShoppingBag className="h-4 w-4" />
          Add to bag
        </Button>
      </div>
    </div>
  );
}
