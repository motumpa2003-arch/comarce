"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Gift, Minus, Plus, ShoppingBag, Tag, Trash2, Truck, X } from "lucide-react";
import { SHIPPING_METHODS, priceCart } from "@obsidian/commerce";
import { Badge, Button, Drawer, EmptyState, Input, Progress, cn, useToast } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";
import { useCouponValidation } from "./use-coupon";

export function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  const closeCart = useUi((s) => s.closeCart);
  const { lines, setQuantity, remove, toggleGiftWrap, couponCode } = useCart();
  const coupon = useCouponValidation(lines, couponCode);

  const totals = priceCart({
    lines,
    shippingMethod: SHIPPING_METHODS[0],
  });
  const discount = coupon.status === "valid" ? coupon.discount : 0;
  const payable = Math.max(0, totals.subtotal - discount);

  return (
    <Drawer
      open={open}
      onClose={closeCart}
      title={`Your bag${lines.length ? ` (${totals.itemCount})` : ""}`}
      description={lines.length ? "Items are reserved for 30 minutes." : undefined}
      width="min(460px,100vw)"
      footer={
        lines.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] uppercase tracking-[0.1em] text-ink-muted">Subtotal</span>
              <span className="font-display text-[22px] tabular-nums text-ink">{money(payable)}</span>
            </div>
            {discount > 0 && (
              <p className="text-[11.5px] text-success">
                Coupon {couponCode} applied — you save {money(discount)}
              </p>
            )}
            <p className="text-[11px] text-ink-muted">
              Shipping and taxes calculated at checkout. Inclusive of all taxes.
            </p>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <ButtonLink href="/checkout" onClick={closeCart} size="lg" fullWidth>
                Checkout
              </ButtonLink>
              <ButtonLink href="/cart" onClick={closeCart} variant="outline" size="lg">
                View bag
              </ButtonLink>
            </div>
          </div>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your bag is empty"
          description="Once you add something, it will show up here. Saved items stay in your wishlist."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <ButtonLink href="/shop" onClick={closeCart}>
                Start shopping
              </ButtonLink>
              <ButtonLink href="/wishlist" onClick={closeCart} variant="outline">
                View wishlist
              </ButtonLink>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col">
          <FreeShippingMeter totals={totals} payable={payable} />

          <ul className="divide-y divide-line">
            {lines.map((line) => (
              <li key={line.id} className="flex gap-3.5 px-5 py-4">
                <Link
                  href={`/product/${line.slug}`}
                  onClick={closeCart}
                  className="relative aspect-[3/4] w-[76px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted"
                >
                  {line.image && (
                    <Image src={line.image} alt={line.name} fill sizes="76px" className="object-cover" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {line.brandName && (
                        <p className="text-[9.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                          {line.brandName}
                        </p>
                      )}
                      <Link
                        href={`/product/${line.slug}`}
                        onClick={closeCart}
                        className="line-clamp-2x text-[13px] leading-snug text-ink hover:text-primary"
                      >
                        {line.name}
                      </Link>
                      {line.variantTitle !== "Default" && (
                        <p className="mt-0.5 text-[11.5px] text-ink-muted">{line.variantTitle}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      aria-label={`Remove ${line.name}`}
                      className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-danger"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-3">
                    <QuantityStepper
                      value={line.quantity}
                      max={line.maxQuantity}
                      onChange={(q) => setQuantity(line.id, q)}
                    />
                    <div className="text-right">
                      <p className="text-[13.5px] font-semibold tabular-nums text-ink">
                        {money(line.unitPrice * line.quantity)}
                      </p>
                      {line.compareAtPrice && line.compareAtPrice > line.unitPrice && (
                        <p className="text-[11px] tabular-nums text-ink-muted line-through">
                          {money(line.compareAtPrice * line.quantity)}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleGiftWrap(line.id)}
                    className={cn(
                      "mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] transition-colors",
                      line.giftWrap
                        ? "border-accent bg-accent/10 text-ink"
                        : "border-line text-ink-muted hover:border-ink/30",
                    )}
                  >
                    <Gift className="h-3 w-3" />
                    {line.giftWrap ? "Gift wrapped · ₹49" : "Add gift wrap"}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-line px-5 py-4">
            <CouponField />
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ------------------------- Free shipping meter ---------------------- */

function FreeShippingMeter({
  totals,
  payable,
}: {
  totals: ReturnType<typeof priceCart>;
  payable: number;
}) {
  const remaining = Math.max(0, totals.freeShippingThreshold - payable);
  const progress = Math.min(100, (payable / totals.freeShippingThreshold) * 100);

  return (
    <div className="border-b border-line bg-muted px-5 py-3.5">
      <div className="flex items-center gap-2 text-[12px]">
        <Truck className="h-3.5 w-3.5 shrink-0 text-primary" />
        {remaining > 0 ? (
          <p className="text-ink">
            Add <span className="font-semibold">{money(remaining)}</span> more for free shipping
          </p>
        ) : (
          <p className="font-medium text-success">You have unlocked free shipping</p>
        )}
      </div>
      <Progress value={progress} tone={remaining > 0 ? "primary" : "success"} className="mt-2.5" height={4} />
    </div>
  );
}

/* ----------------------------- Quantity ----------------------------- */

export function QuantityStepper({
  value,
  max,
  min = 1,
  onChange,
  size = "sm",
}: {
  value: number;
  max: number;
  min?: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[var(--radius-button)] border border-line",
        size === "sm" ? "h-8" : "h-11",
      )}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          "grid place-items-center text-ink transition-colors hover:bg-ink/[0.05] disabled:opacity-30",
          size === "sm" ? "h-8 w-8" : "h-11 w-11",
        )}
      >
        <Minus className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
      <span
        className={cn(
          "min-w-8 text-center tabular-nums text-ink",
          size === "sm" ? "text-[12.5px]" : "text-[14px] min-w-10",
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          "grid place-items-center text-ink transition-colors hover:bg-ink/[0.05] disabled:opacity-30",
          size === "sm" ? "h-8 w-8" : "h-11 w-11",
        )}
      >
        <Plus className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </button>
    </div>
  );
}

/* ------------------------------ Coupon ------------------------------ */

export function CouponField({ className }: { className?: string }) {
  const { lines, couponCode, setCoupon } = useCart();
  const coupon = useCouponValidation(lines, couponCode);
  const [draft, setDraft] = React.useState("");
  const { toast } = useToast();

  const apply = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = draft.trim().toUpperCase();
    if (!code) return;
    setCoupon(code);
    setDraft("");
  };

  React.useEffect(() => {
    if (coupon.status === "invalid" && couponCode) {
      toast({ title: "Coupon not applied", description: coupon.reason, tone: "danger" });
    }
    // Only announce a rejection once per code.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon.status, couponCode]);

  if (coupon.status === "valid") {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-dashed border-success/45 bg-success/[0.06] px-3.5 py-3",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Tag className="h-4 w-4 shrink-0 text-success" />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium text-ink">
              {couponCode} · saving {money(coupon.discount)}
            </p>
            <p className="truncate text-[11px] text-ink-muted">{coupon.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCoupon(null)}
          className="shrink-0 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted underline underline-offset-4 hover:text-ink"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={apply} className={cn("flex gap-2", className)}>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value.toUpperCase())}
        placeholder="Coupon code"
        aria-label="Coupon code"
        leading={<Tag className="h-3.5 w-3.5" />}
        invalid={coupon.status === "invalid"}
        sizeVariant="sm"
        className="uppercase tracking-wider"
      />
      <Button type="submit" variant="outline" size="sm" className="shrink-0" loading={coupon.status === "checking"}>
        Apply
      </Button>
    </form>
  );
}

/* ------------------------- Available offers ------------------------- */

export function OfferChips({ codes, className }: { codes: { code: string; title: string }[]; className?: string }) {
  const setCoupon = useCart((s) => s.setCoupon);
  const { toast } = useToast();

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {codes.map((offer) => (
        <button
          key={offer.code}
          type="button"
          onClick={() => {
            setCoupon(offer.code);
            toast({ title: `Applied ${offer.code}`, description: offer.title, tone: "success" });
          }}
          className="group flex items-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line px-3 py-2 text-left transition-colors hover:border-accent"
        >
          <Badge tone="accent" size="xs">
            {offer.code}
          </Badge>
          <span className="text-[11.5px] text-ink-muted group-hover:text-ink">{offer.title}</span>
        </button>
      ))}
    </div>
  );
}
