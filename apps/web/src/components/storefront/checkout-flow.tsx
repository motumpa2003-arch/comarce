"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Building2,
  Check,
  ChevronLeft,
  CreditCard,
  Gift,
  Lock,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { SHIPPING_METHODS, priceCart, type Address, type PaymentMethodKind } from "@obsidian/commerce";
import { Badge, Button, Card, Field, Input, Radio, Select, Separator, Textarea, cn, useToast } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { deliveryWindow, money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useHydrated } from "@/store/shopper";
import { useCouponValidation } from "./use-coupon";
import { CouponField } from "./cart-drawer";

const STEPS = ["Address", "Delivery", "Payment", "Review"] as const;
type Step = (typeof STEPS)[number];

export interface CheckoutCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  storeCredit: number;
  loyaltyPoints: number;
  addresses: Address[];
}

const PAYMENT_METHODS: {
  id: PaymentMethodKind;
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { id: "upi", label: "UPI", hint: "Pay by any UPI app — instant confirmation", icon: Smartphone },
  { id: "card", label: "Credit / debit card", hint: "Visa, Mastercard, RuPay and Amex", icon: CreditCard },
  { id: "netbanking", label: "Net banking", hint: "All major Indian banks", icon: Building2 },
  { id: "wallet", label: "Wallets", hint: "Paytm, PhonePe, Amazon Pay", icon: Wallet },
  { id: "bnpl", label: "Pay later", hint: "Split into 3 interest-free instalments", icon: Banknote },
  { id: "cod", label: "Cash on delivery", hint: "Pay the courier when it arrives", icon: Banknote },
];

export function CheckoutFlow({ customer }: { customer: CheckoutCustomer }) {
  const router = useRouter();
  const { toast } = useToast();
  const hydrated = useHydrated();
  const cart = useCart();
  const coupon = useCouponValidation(cart.lines, cart.couponCode);

  const [step, setStep] = React.useState<Step>("Address");
  const [addressId, setAddressId] = React.useState(customer.addresses[0]?.id ?? "new");
  const [contact, setContact] = React.useState({
    name: `${customer.firstName} ${customer.lastName}`,
    email: customer.email,
    phone: customer.phone,
  });
  const [draft, setDraft] = React.useState<Address>(() => emptyAddress(customer));
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodKind>("upi");
  const [placing, setPlacing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [giftMessage, setGiftMessage] = React.useState("");
  const [wantsGift, setWantsGift] = React.useState(false);

  const shippingMethod =
    SHIPPING_METHODS.find((m) => m.id === cart.shippingMethodId) ?? SHIPPING_METHODS[0]!;

  const totals = priceCart({
    lines: cart.lines,
    shippingMethod,
    loyaltyPointsRedeemed: cart.loyaltyPointsRedeemed,
    storeCredit: cart.useStoreCredit ? customer.storeCredit : 0,
  });
  const discount = coupon.status === "valid" ? coupon.discount : 0;
  const afterDiscount = Math.max(0, totals.subtotal - discount);
  const shipping =
    (coupon.status === "valid" && coupon.freeShipping) || afterDiscount >= totals.freeShippingThreshold
      ? shippingMethod.id === "standard"
        ? 0
        : shippingMethod.price
      : shippingMethod.price;
  const loyaltyValue = Math.min(cart.loyaltyPointsRedeemed * 100, afterDiscount);
  const creditValue = cart.useStoreCredit
    ? Math.min(customer.storeCredit, Math.max(0, afterDiscount - loyaltyValue + shipping))
    : 0;
  const payable = Math.max(0, afterDiscount - loyaltyValue + shipping + totals.giftWrapFee - creditValue);

  const selectedAddress =
    addressId === "new" ? draft : (customer.addresses.find((a) => a.id === addressId) ?? draft);

  React.useEffect(() => {
    if (hydrated && cart.lines.length === 0 && !placing) {
      router.replace("/cart");
    }
  }, [hydrated, cart.lines.length, placing, router]);

  const addressValid =
    contact.name.trim().length > 2 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email) &&
    contact.phone.replace(/\D/g, "").length >= 10 &&
    selectedAddress.line1.trim().length > 3 &&
    selectedAddress.city.trim().length > 1 &&
    /^\d{6}$/.test(selectedAddress.postalCode);

  const placeOrder = async () => {
    setPlacing(true);
    setError(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lines: cart.lines,
          contact,
          shippingAddress: { ...selectedAddress, firstName: contact.name.split(" ")[0], lastName: contact.name.split(" ").slice(1).join(" ") || "—" },
          shippingMethodId: cart.shippingMethodId,
          paymentMethod,
          couponCode: cart.couponCode,
          loyaltyPointsRedeemed: cart.loyaltyPointsRedeemed,
          useStoreCredit: cart.useStoreCredit,
          giftMessage: wantsGift ? giftMessage : undefined,
          customerId: customer.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "We could not place the order.");

      cart.setLastOrderId(data.orderId);
      cart.clear();
      toast({ title: "Order placed", description: `#${data.orderNumber}`, tone: "success" });
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Something went wrong.";
      setError(message);
      toast({ title: "Payment could not be completed", description: message, tone: "danger" });
      setPlacing(false);
    }
  };

  if (!hydrated) {
    return <div className="h-[520px] animate-pulse rounded-[var(--radius-card)] bg-muted" />;
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
      <div className="min-w-0">
        <Stepper current={stepIndex} onSelect={(i) => i < stepIndex && setStep(STEPS[i]!)} />

        {error && (
          <div className="mt-6 rounded-[var(--radius-card)] border border-danger/40 bg-danger/[0.06] p-4 text-[13px] text-danger">
            {error}
          </div>
        )}

        {/* ------------------------------ Address ---------------------------- */}
        {step === "Address" && (
          <section className="mt-8">
            <h2 className="font-display display-case text-[22px] text-ink">Contact &amp; delivery address</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required htmlFor="co-name">
                <Input
                  id="co-name"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  autoComplete="name"
                />
              </Field>
              <Field label="Phone" required htmlFor="co-phone" hint="We only use this for delivery updates.">
                <Input
                  id="co-phone"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  autoComplete="tel"
                />
              </Field>
              <Field label="Email" required htmlFor="co-email" className="sm:col-span-2">
                <Input
                  id="co-email"
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  autoComplete="email"
                />
              </Field>
            </div>

            {customer.addresses.length > 0 && (
              <div className="mt-7">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Saved addresses</h3>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {customer.addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setAddressId(address.id)}
                      className={cn(
                        "rounded-[var(--radius-card)] border p-4 text-left transition-colors",
                        addressId === address.id ? "border-ink bg-muted" : "border-line hover:border-ink/35",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Badge tone={address.label === "home" ? "info" : "neutral"} size="xs">
                          {address.label}
                        </Badge>
                        {address.isDefaultShipping && (
                          <span className="text-[10.5px] text-ink-muted">Default</span>
                        )}
                      </span>
                      <p className="mt-2 text-[13px] font-medium text-ink">
                        {address.firstName} {address.lastName}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}
                        <br />
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="mt-1.5 text-[12px] text-ink-muted">{address.phone}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddressId("new")}
                    className={cn(
                      "rounded-[var(--radius-card)] border border-dashed p-4 text-left text-[13px] transition-colors",
                      addressId === "new" ? "border-ink bg-muted text-ink" : "border-line text-ink-muted hover:border-ink/35",
                    )}
                  >
                    + Deliver to a new address
                  </button>
                </div>
              </div>
            )}

            {addressId === "new" && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Flat, house no., building" required className="sm:col-span-2">
                  <Input value={draft.line1} onChange={(e) => setDraft({ ...draft, line1: e.target.value })} />
                </Field>
                <Field label="Area, street, sector" className="sm:col-span-2">
                  <Input value={draft.line2 ?? ""} onChange={(e) => setDraft({ ...draft, line2: e.target.value })} />
                </Field>
                <Field label="Landmark">
                  <Input value={draft.landmark ?? ""} onChange={(e) => setDraft({ ...draft, landmark: e.target.value })} />
                </Field>
                <Field label="Pincode" required>
                  <Input
                    value={draft.postalCode}
                    inputMode="numeric"
                    onChange={(e) =>
                      setDraft({ ...draft, postalCode: e.target.value.replace(/\D/g, "").slice(0, 6) })
                    }
                  />
                </Field>
                <Field label="City" required>
                  <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
                </Field>
                <Field label="State" required>
                  <Input value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })} />
                </Field>
                <Field label="Address type" className="sm:col-span-2">
                  <Select
                    value={draft.label}
                    onChange={(e) => setDraft({ ...draft, label: e.target.value as Address["label"] })}
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <ButtonLink href="/cart" variant="ghost">
                <ChevronLeft className="h-4 w-4" />
                Back to bag
              </ButtonLink>
              <Button size="lg" disabled={!addressValid} onClick={() => setStep("Delivery")}>
                Continue to delivery
              </Button>
            </div>
          </section>
        )}

        {/* ----------------------------- Delivery ---------------------------- */}
        {step === "Delivery" && (
          <section className="mt-8">
            <h2 className="font-display display-case text-[22px] text-ink">Delivery speed</h2>
            <p className="mt-1.5 text-[13px] text-ink-muted">
              Shipping to {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
            </p>

            <div className="mt-5 space-y-2.5">
              {SHIPPING_METHODS.map((method) => {
                const free = method.id === "standard" && afterDiscount >= totals.freeShippingThreshold;
                return (
                  <label
                    key={method.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-card)] border p-4 transition-colors",
                      cart.shippingMethodId === method.id ? "border-ink bg-muted" : "border-line hover:border-ink/35",
                    )}
                  >
                    <Radio
                      name="shipping"
                      checked={cart.shippingMethodId === method.id}
                      onChange={() => cart.setShippingMethod(method.id)}
                      label={<span className="text-[13.5px] font-medium">{method.name}</span>}
                      description={
                        <>
                          {method.description} · arrives {deliveryWindow(method.minDays, method.maxDays)}
                        </>
                      }
                    />
                    <span className="shrink-0 text-[13.5px] font-medium tabular-nums text-ink">
                      {free || method.price === 0 ? "Free" : money(method.price)}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 rounded-[var(--radius-card)] border border-line p-4">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={wantsGift}
                  onChange={(e) => setWantsGift(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--c-primary)]"
                />
                <span>
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                    <Gift className="h-3.5 w-3.5" />
                    This is a gift
                  </span>
                  <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                    We will hide prices on the invoice and include a handwritten note.
                  </span>
                </span>
              </label>
              {wantsGift && (
                <Textarea
                  className="mt-3"
                  rows={3}
                  maxLength={200}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="Write your message (200 characters max)"
                />
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep("Address")}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button size="lg" onClick={() => setStep("Payment")}>
                Continue to payment
              </Button>
            </div>
          </section>
        )}

        {/* ------------------------------ Payment ---------------------------- */}
        {step === "Payment" && (
          <section className="mt-8">
            <h2 className="font-display display-case text-[22px] text-ink">Payment method</h2>

            <div className="mt-5 space-y-2.5">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-[var(--radius-card)] border p-4 transition-colors",
                    paymentMethod === method.id ? "border-ink bg-muted" : "border-line hover:border-ink/35",
                  )}
                >
                  <Radio
                    name="payment"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    label={
                      <span className="flex items-center gap-2 text-[13.5px] font-medium">
                        <method.icon className="h-4 w-4 text-primary" />
                        {method.label}
                      </span>
                    }
                    description={method.hint}
                  />
                </label>
              ))}
            </div>

            {paymentMethod === "card" && (
              <Card className="mt-5" tone="muted">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Demo mode — no real card is charged
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
                  Card details are never collected in this demo. Use an email starting with{" "}
                  <code className="rounded bg-surface px-1.5 py-0.5 text-[11.5px]">decline@</code> to see the failed
                  payment path.
                </p>
              </Card>
            )}

            {(customer.storeCredit > 0 || customer.loyaltyPoints > 0) && (
              <div className="mt-6 space-y-3 rounded-[var(--radius-card)] border border-line p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Apply your balance</p>
                {customer.storeCredit > 0 && (
                  <label className="flex cursor-pointer items-center justify-between gap-3">
                    <span className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={cart.useStoreCredit}
                        onChange={(e) => cart.setUseStoreCredit(e.target.checked)}
                        className="h-4 w-4 accent-[var(--c-primary)]"
                      />
                      <span className="text-[13px] text-ink">Use store credit</span>
                    </span>
                    <span className="text-[13px] tabular-nums text-ink">{money(customer.storeCredit)} available</span>
                  </label>
                )}
                {customer.loyaltyPoints > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-ink">
                      Redeem loyalty points
                      <span className="ml-2 text-[11.5px] text-ink-muted">
                        {customer.loyaltyPoints} available · 1 point = ₹1
                      </span>
                    </span>
                    <Input
                      sizeVariant="sm"
                      type="number"
                      min={0}
                      max={customer.loyaltyPoints}
                      value={cart.loyaltyPointsRedeemed}
                      onChange={(e) =>
                        cart.setLoyaltyPoints(Math.min(customer.loyaltyPoints, Number(e.target.value) || 0))
                      }
                      className="w-28"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep("Delivery")}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button size="lg" onClick={() => setStep("Review")}>
                Review order
              </Button>
            </div>
          </section>
        )}

        {/* ------------------------------- Review ---------------------------- */}
        {step === "Review" && (
          <section className="mt-8">
            <h2 className="font-display display-case text-[22px] text-ink">Review and place your order</h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ReviewBlock title="Delivering to" onEdit={() => setStep("Address")}>
                <p className="text-[13px] font-medium text-ink">{contact.name}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                  {selectedAddress.line1}
                  {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}
                  <br />
                  {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                </p>
                <p className="mt-1.5 text-[12.5px] text-ink-muted">
                  {contact.phone} · {contact.email}
                </p>
              </ReviewBlock>

              <ReviewBlock title="Delivery" onEdit={() => setStep("Delivery")}>
                <p className="text-[13px] font-medium text-ink">{shippingMethod.name}</p>
                <p className="mt-1 text-[12.5px] text-ink-muted">
                  Arrives {deliveryWindow(shippingMethod.minDays, shippingMethod.maxDays)}
                </p>
                {wantsGift && <p className="mt-1.5 text-[12.5px] text-ink-muted">Gift wrapped with a note</p>}
              </ReviewBlock>

              <ReviewBlock title="Payment" onEdit={() => setStep("Payment")} className="sm:col-span-2">
                <p className="text-[13px] font-medium text-ink">
                  {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
                </p>
                {creditValue > 0 && (
                  <p className="mt-1 text-[12.5px] text-success">Store credit applied: {money(creditValue)}</p>
                )}
                {loyaltyValue > 0 && (
                  <p className="mt-1 text-[12.5px] text-success">
                    {cart.loyaltyPointsRedeemed} loyalty points applied: {money(loyaltyValue)}
                  </p>
                )}
              </ReviewBlock>
            </div>

            <ul className="mt-6 divide-y divide-line border-y border-line">
              {cart.lines.map((line) => (
                <li key={line.id} className="flex items-center gap-4 py-4">
                  <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                    {line.image && <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">{line.name}</p>
                    <p className="text-[11.5px] text-ink-muted">
                      {line.variantTitle !== "Default" ? `${line.variantTitle} · ` : ""}Qty {line.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] tabular-nums text-ink">
                    {money(line.unitPrice * line.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep("Payment")}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button size="lg" variant="accent" loading={placing} onClick={placeOrder}>
                <Lock className="h-4 w-4" />
                Place order · {money(payable)}
              </Button>
            </div>

            <p className="mt-4 text-[11.5px] leading-relaxed text-ink-muted">
              By placing this order you agree to our{" "}
              <Link href="/pages/terms" className="underline underline-offset-4">
                terms of service
              </Link>{" "}
              and{" "}
              <Link href="/pages/returns" className="underline underline-offset-4">
                returns policy
              </Link>
              .
            </p>
          </section>
        )}
      </div>

      {/* ------------------------------ Summary ----------------------------- */}
      <aside className="lg:sticky lg:top-[120px] lg:self-start">
        <Card padded={false}>
          <div className="border-b border-line p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
              Order summary · {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"}
            </h2>
          </div>

          <ul className="max-h-[240px] divide-y divide-line overflow-y-auto">
            {cart.lines.map((line) => (
              <li key={line.id} className="flex items-center gap-3 px-5 py-3">
                <div className="relative aspect-[3/4] w-11 shrink-0 overflow-hidden rounded-[2px] bg-muted">
                  {line.image && <Image src={line.image} alt="" fill sizes="44px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] text-ink">{line.name}</p>
                  <p className="text-[11px] text-ink-muted">Qty {line.quantity}</p>
                </div>
                <p className="shrink-0 text-[12.5px] tabular-nums text-ink">
                  {money(line.unitPrice * line.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="space-y-2.5 border-t border-line p-5 text-[13px]">
            <SummaryRow label="Subtotal" value={money(totals.subtotal)} />
            {discount > 0 && <SummaryRow label={`Coupon ${cart.couponCode}`} value={`− ${money(discount)}`} tone="success" />}
            {loyaltyValue > 0 && <SummaryRow label="Loyalty points" value={`− ${money(loyaltyValue)}`} tone="success" />}
            {creditValue > 0 && <SummaryRow label="Store credit" value={`− ${money(creditValue)}`} tone="success" />}
            {totals.giftWrapFee > 0 && <SummaryRow label="Gift wrapping" value={money(totals.giftWrapFee)} />}
            <SummaryRow
              label="Delivery"
              value={shipping === 0 ? "Free" : money(shipping)}
              tone={shipping === 0 ? "success" : undefined}
            />
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="font-medium text-ink">Total payable</span>
              <span className="font-display text-[24px] tabular-nums text-ink">{money(payable)}</span>
            </div>
            <p className="text-[11px] text-ink-muted">Inclusive of all taxes</p>
          </div>

          <div className="border-t border-line p-5">
            <CouponField />
          </div>

          <div className="border-t border-line bg-muted p-4 text-[11px] text-ink-muted">
            <p className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-primary" /> 256-bit encrypted. We never store card details.
            </p>
          </div>
        </Card>
      </aside>
    </div>
  );
}

/* ------------------------------- Pieces ----------------------------- */

function Stepper({ current, onSelect }: { current: number; onSelect: (index: number) => void }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onSelect(index)}
              disabled={index >= current}
              className="flex min-w-0 items-center gap-2"
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11.5px] font-medium transition-colors",
                  done
                    ? "border-primary bg-primary text-inverse"
                    : active
                      ? "border-ink bg-ink text-inverse"
                      : "border-line text-ink-muted",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[11.5px] font-medium uppercase tracking-[0.1em] sm:inline",
                  active ? "text-ink" : "text-ink-muted",
                )}
              >
                {label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <span className={cn("h-px flex-1", done ? "bg-primary" : "bg-line")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
  className,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-line p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink underline underline-offset-4"
        >
          Edit
        </button>
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-ink-muted">{label}</span>
      <span className={cn("tabular-nums", tone === "success" ? "text-success" : "text-ink")}>{value}</span>
    </div>
  );
}

function emptyAddress(customer: CheckoutCustomer): Address {
  return {
    id: "new",
    label: "home",
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefaultShipping: false,
    isDefaultBilling: false,
  };
}
