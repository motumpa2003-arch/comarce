"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ShieldCheck, Truck } from "lucide-react";
import { Badge, Button, Modal, Rating, Skeleton, cn } from "@obsidian/ui";
import type { ProductDetail } from "@/lib/product-detail";
import { money } from "@/lib/format";
import { useUi } from "@/store/ui";
import { useWishlist } from "@/store/shopper";
import { usePurchase } from "@/components/commerce/use-purchase";
import { VariantPicker } from "@/components/commerce/variant-picker";
import { QuantityStepper } from "./cart-drawer";

export function QuickView() {
  const slug = useUi((s) => s.quickViewSlug);
  const setQuickView = useUi((s) => s.setQuickView);
  const [detail, setDetail] = React.useState<ProductDetail | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setDetail(null);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => !cancelled && setDetail(data.detail ?? null))
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <Modal open={Boolean(slug)} onClose={() => setQuickView(null)} size="lg" title={detail?.name ?? "Quick view"}>
      {loading || !detail ? <QuickViewSkeleton /> : <QuickViewBody detail={detail} />}
    </Modal>
  );
}

function QuickViewBody({ detail }: { detail: ProductDetail }) {
  const purchase = usePurchase(detail);
  const setQuickView = useUi((s) => s.setQuickView);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const wishlisted = useWishlist((s) => s.items.some((i) => i.id === detail.id));
  const [activeImage, setActiveImage] = React.useState(0);

  const image = purchase.variant?.image ?? detail.media[activeImage]?.url ?? detail.media[0]?.url;

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,300px)_1fr]">
      <div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-muted">
          {image && <Image src={image} alt={detail.name} fill sizes="300px" className="object-cover" />}
          {detail.discount > 0 && (
            <Badge tone="sale" size="xs" className="absolute left-3 top-3">
              {detail.discount}% off
            </Badge>
          )}
        </div>
        {detail.media.length > 1 && (
          <div className="mt-2.5 flex gap-2">
            {detail.media.slice(0, 4).map((media, index) => (
              <button
                key={media.url}
                type="button"
                onClick={() => setActiveImage(index)}
                className={cn(
                  "relative aspect-square w-14 overflow-hidden rounded-[var(--radius-sm)] border transition-colors",
                  index === activeImage ? "border-ink" : "border-line hover:border-ink/40",
                )}
              >
                <Image src={media.url} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0">
        {detail.brand && (
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">{detail.brand.name}</p>
        )}
        <h3 className="mt-1 font-display text-[24px] leading-tight text-ink">{detail.name}</h3>
        <div className="mt-2">
          <Rating value={detail.rating.average} count={detail.rating.count} />
        </div>

        <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
          <span className="font-display text-[28px] tabular-nums text-ink">{money(purchase.price)}</span>
          {purchase.compareAtPrice && purchase.compareAtPrice > purchase.price && (
            <>
              <span className="text-[14px] tabular-nums text-ink-muted line-through">
                {money(purchase.compareAtPrice)}
              </span>
              <span className="text-[13px] font-medium text-sale">{purchase.discount}% off</span>
            </>
          )}
        </div>
        <p className="mt-1 text-[11.5px] text-ink-muted">Inclusive of all taxes</p>

        <p className="mt-4 line-clamp-2x text-[13px] leading-relaxed text-ink-muted">{detail.shortDescription}</p>

        <VariantPicker
          className="mt-5"
          compact
          attributes={detail.variantAttributes}
          options={purchase.options}
          onChange={purchase.setOption}
        />

        <p
          className={cn(
            "mt-4 text-[12px] font-medium",
            purchase.inStock ? (purchase.stockLabel.startsWith("Hurry") ? "text-warning" : "text-success") : "text-danger",
          )}
        >
          {purchase.stockLabel}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <QuantityStepper
            value={purchase.quantity}
            max={purchase.maxQuantity}
            onChange={purchase.setQuantity}
            size="md"
          />
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!purchase.inStock}
            onClick={() => purchase.addToBag()}
          >
            Add to bag
          </Button>
          <button
            type="button"
            onClick={() =>
              toggleWishlist({
                id: detail.id,
                slug: detail.slug,
                name: detail.name,
                brandName: detail.brand?.name,
                image: image ?? "",
                price: purchase.price,
                compareAtPrice: purchase.compareAtPrice,
                rating: detail.rating.average,
                ratingCount: detail.rating.count,
                inStock: purchase.inStock,
              })
            }
            aria-label="Save to wishlist"
            className={cn(
              "grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[var(--radius-button)] border transition-colors",
              wishlisted ? "border-ink bg-ink text-inverse" : "border-line text-ink hover:border-ink/40",
            )}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[11.5px] text-ink-muted">
          <span className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 text-primary" /> Free delivery above ₹999
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 30-day returns
          </span>
        </div>

        <Link
          href={`/product/${detail.slug}`}
          onClick={() => setQuickView(null)}
          className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink underline underline-offset-4"
        >
          View full details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function QuickViewSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,300px)_1fr]">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
