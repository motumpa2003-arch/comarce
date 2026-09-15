"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Gift, Lock, ShieldCheck, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import { SHIPPING_METHODS, priceCart } from "@obsidian/commerce";
import { Badge, Button, Card, EmptyState, Progress, Separator, cn } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/store/shopper";
import { CouponField, OfferChips, QuantityStepper } from "./cart-drawer";
import { useCouponValidation } from "./use-coupon";

export function CartPageView({
  offers,
}: {
  offers: { code: string; title: string }[];
}) {
  const { lines, setQuantity, remove, toggleGiftWrap, couponCode, shippingMethodId, setShippingMethod } = useCart();
  const coupon = useCouponValidation(lines, couponCode);
  const hydrated = useHydrated();

  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === shippingMethodId) ?? SHIPPING_METHODS[0]!;
  const totals = priceCart({ lines, shippingMethod });
  const discount = coupon.status === "valid" ? coupon.discount : 0;
  const freeShippingFromCoupon = coupon.status === "valid" && coupon.freeShipping;
  const afterDiscount = Math.max(0, totals.subtotal - discount);
  const shipping =
    freeShippingFromCoupon || afterDiscount >= totals.freeShippingThreshold
      ? shippingMethod.id === "standard"
        ? 0
        : shippingMethod.price
      : shippingMethod.price;
  const payable = afterDiscount + shipping + totals.giftWrapFee;

  if (!hydrated) {
    return <div className="h-[420px] animate-pulse rounded-[var(--radius-card)] bg-muted" />;
  }

  if (lines.length === 0) {
    return (
      <Card padded={false} className="overflow-hidden">
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          eyebrow="Your bag is waiting"
          title="Nothing here yet"
          description="Browse the catalogue and add something you will actually use. Items you save stay in your wishlist."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <ButtonLink href="/shop">Start shopping</ButtonLink>
              <ButtonLink href="/deals" variant="outline">
                See today&rsquo;s deals
              </ButtonLink>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
      <div>
        {/* Free shipping progress */}
        <div className="mb-6 rounded-[var(--radius-card)] border border-line bg-muted px-5 py-4">
          <div className="flex items-center gap-2.5 text-[13px]">
            <Truck className="h-4 w-4 shrink-0 text-primary" />
            {totals.freeShippingThreshold - afterDiscount > 0 ? (
              <p className="text-ink">
                You are <span className="font-semibold">{money(totals.freeShippingThreshold - afterDiscount)}</span>{" "}
                away from free standard shipping
              </p>
            ) : (
              <p className="font-medium text-success">Free standard shipping unlocked</p>
            )}
          </div>
          <Progress
            className="mt-3"
            height={5}
            value={Math.min(100, (afterDiscount / totals.freeShippingThreshold) * 100)}
            tone={afterDiscount >= totals.freeShippingThreshold ? "success" : "primary"}
          />
        </div>

        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            Bag · {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"}
          </h2>
          <button
            type="button"
            onClick={() => lines.forEach((line) => remove(line.id))}
            className="text-[11.5px] text-ink-muted underline underline-offset-4 hover:text-danger"
          >
            Clear bag
          </button>
        </div>

        <ul className="divide-y divide-line">
          {lines.map((line) => (
            <li key={line.id} className="flex gap-4 py-5 sm:gap-5">
              <Link
                href={`/product/${line.slug}`}
                className="relative aspect-[3/4] w-[92px] shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-muted sm:w-[112px]"
              >
                {line.image && <Image src={line.image} alt={line.name} fill sizes="112px" className="object-cover" />}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {line.brandName && (
                      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                        {line.brandName}
                      </p>
                    )}
                    <Link
                      href={`/product/${line.slug}`}
                      className="mt-0.5 block text-[14px] leading-snug text-ink hover:text-primary"
                    >
                      {line.name}
                    </Link>
                    {line.variantTitle !== "Default" && (
                      <p className="mt-1 text-[12px] text-ink-muted">{line.variantTitle}</p>
                    )}
                    {line.compareAtPrice && line.compareAtPrice > line.unitPrice && (
                      <Badge tone="success" size="xs" className="mt-2">
                        Saving {money((line.compareAtPrice - line.unitPrice) * line.quantity)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-semibold tabular-nums text-ink">
                      {money(line.unitPrice * line.quantity)}
                    </p>
                    {line.compareAtPrice && line.compareAtPrice > line.unitPrice && (
                      <p className="text-[12px] tabular-nums text-ink-muted line-through">
                        {money(line.compareAtPrice * line.quantity)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                  <QuantityStepper
                    value={line.quantity}
                    max={line.maxQuantity}
                    onChange={(q) => setQuantity(line.id, q)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleGiftWrap(line.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11.5px] transition-colors",
                      line.giftWrap ? "text-ink" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    <Gift className="h-3.5 w-3.5" />
                    {line.giftWrap ? "Gift wrapped (₹49)" : "Add gift wrap"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(line.id)}
                    className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted transition-colors hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Shipping method */}
        <div className="mt-8">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Delivery speed</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SHIPPING_METHODS.map((method) => {
              const active = method.id === shippingMethodId;
              const free = method.id === "standard" && afterDiscount >= totals.freeShippingThreshold;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setShippingMethod(method.id)}
                  className={cn(
                    "flex items-start justify-between gap-3 rounded-[var(--radius-card)] border p-4 text-left transition-colors",
                    active ? "border-ink bg-muted" : "border-line hover:border-ink/35",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-ink">{method.name}</span>
                    <span className="mt-0.5 block text-[11.5px] text-ink-muted">{method.description}</span>
                    <span className="mt-1 block text-[11.5px] text-ink-muted">
                      {method.minDays === 0 ? "Today" : `${method.minDays}–${method.maxDays} days`}
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] font-medium tabular-nums text-ink">
                    {free || method.price === 0 ? "Free" : money(method.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ------------------------------ Summary ----------------------------- */}
      <aside className="lg:sticky lg:top-[180px] lg:self-start">
        <Card className="p-0" padded={false}>
          <div className="border-b border-line p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Order summary</h2>
          </div>

          <div className="space-y-3 p-5 text-[13px]">
            <Row label={`Subtotal (${totals.itemCount} items)`} value={money(totals.subtotal)} />
            {totals.savings > 0 && (
              <Row label="Product savings" value={`− ${money(totals.savings)}`} tone="success" />
            )}
            {discount > 0 && (
              <Row label={`Coupon ${couponCode}`} value={`− ${money(discount)}`} tone="success" />
            )}
            {totals.giftWrapFee > 0 && <Row label="Gift wrapping" value={money(totals.giftWrapFee)} />}
            <Row label="Delivery" value={shipping === 0 ? "Free" : money(shipping)} tone={shipping === 0 ? "success" : undefined} />
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-medium text-ink">Total</span>
              <span className="font-display text-[26px] tabular-nums text-ink">{money(payable)}</span>
            </div>
            <p className="text-[11px] text-ink-muted">
              Inclusive of all taxes. GST of {money(Math.round(payable - payable / 1.18))} included.
            </p>
          </div>

          <div className="border-t border-line p-5">
            <CouponField />
            {offers.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  <Tag className="h-3 w-3" />
                  Available offers
                </p>
                <OfferChips codes={offers.slice(0, 3)} />
              </div>
            )}
          </div>

          <div className="border-t border-line p-5">
            <ButtonLink href="/checkout" size="lg" fullWidth variant="accent">
              <Lock className="h-4 w-4" />
              Proceed to checkout
            </ButtonLink>
            <ButtonLink href="/shop" variant="ghost" fullWidth className="mt-2">
              Continue shopping
            </ButtonLink>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Secure, encrypted checkout
            </p>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-ink-muted">{label}</span>
      <span
        className={cn(
          "tabular-nums",
          tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-ink",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export { Button };
