import type {
  CartLine,
  CartTotals,
  Coupon,
  ShippingMethodOption,
  TaxClass,
} from "../types/commerce";
import type { CustomerSegmentKey } from "../types/customer";
import type { CurrencyCode, Money } from "../types/primitives";
import { percentOf, sumMoney } from "./money";

export const GIFT_WRAP_FEE: Money = 4900;
export const DEFAULT_FREE_SHIPPING_THRESHOLD: Money = 99900;
export const LOYALTY_POINT_VALUE: Money = 100; // 1 point = ₹1

export const TAX_CLASSES: TaxClass[] = [
  { id: "gst-0", name: "GST 0% — Exempt", rate: 0, description: "Unbranded staples, books", hsnPrefix: "49" },
  { id: "gst-5", name: "GST 5% — Essentials", rate: 5, description: "Packaged food, apparel under ₹1,000", hsnPrefix: "21" },
  { id: "gst-12", name: "GST 12% — Standard low", rate: 12, description: "Apparel over ₹1,000, furniture", hsnPrefix: "62" },
  { id: "gst-18", name: "GST 18% — Standard", rate: 18, description: "Electronics, beauty, most goods", hsnPrefix: "85" },
  { id: "gst-28", name: "GST 28% — Luxury", rate: 28, description: "Premium watches, automotive", hsnPrefix: "91" },
];

export function getTaxClass(id: string | undefined): TaxClass {
  return TAX_CLASSES.find((t) => t.id === id) ?? TAX_CLASSES[3]!;
}

/* ------------------------- Coupon validation ------------------------ */

export interface CouponContext {
  subtotal: Money;
  lines: CartLine[];
  customerSegments?: CustomerSegmentKey[];
  customerId?: string;
  now?: Date;
}

export type CouponValidation =
  | { valid: true; coupon: Coupon; discount: Money; freeShipping: boolean; message: string }
  | { valid: false; reason: string };

export function validateCoupon(coupon: Coupon | null | undefined, ctx: CouponContext): CouponValidation {
  if (!coupon) return { valid: false, reason: "Enter a coupon code to continue." };

  const now = ctx.now ?? new Date();
  const startsAt = new Date(coupon.startsAt);
  const endsAt = new Date(coupon.endsAt);

  if (coupon.status === "disabled") return { valid: false, reason: "This coupon is no longer active." };
  if (now < startsAt) return { valid: false, reason: "This coupon is not active yet." };
  if (now > endsAt) return { valid: false, reason: "This coupon has expired." };
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, reason: "This coupon has reached its usage limit." };
  }
  if (coupon.minimumSpend && ctx.subtotal < coupon.minimumSpend) {
    return {
      valid: false,
      reason: `Add ${formatShortfall(coupon.minimumSpend - ctx.subtotal)} more to use this coupon.`,
    };
  }
  if (coupon.customerEligibility === "vip" && !ctx.customerSegments?.includes("vip")) {
    return { valid: false, reason: "This coupon is reserved for VIP members." };
  }
  if (coupon.customerEligibility === "new" && ctx.customerSegments?.includes("repeat")) {
    return { valid: false, reason: "This coupon is for first orders only." };
  }
  if (
    coupon.customerEligibility === "specific" &&
    ctx.customerId &&
    !coupon.eligibleCustomerIds?.includes(ctx.customerId)
  ) {
    return { valid: false, reason: "This coupon is not available on your account." };
  }

  const eligible = eligibleLines(coupon, ctx.lines);
  if (eligible.length === 0 && coupon.appliesTo !== "all") {
    return { valid: false, reason: "No items in your bag qualify for this coupon." };
  }

  const eligibleSubtotal = sumMoney(eligible.map((l) => l.unitPrice * l.quantity));
  let discount: Money = 0;
  let freeShipping = false;

  switch (coupon.type) {
    case "percentage":
      discount = percentOf(eligibleSubtotal, coupon.value);
      break;
    case "fixed":
      discount = Math.min(coupon.value, eligibleSubtotal);
      break;
    case "free_shipping":
      freeShipping = true;
      break;
    case "buy_x_get_y": {
      const buy = coupon.buyQuantity ?? 2;
      const free = coupon.getQuantity ?? 1;
      const units = eligible
        .flatMap((line) => Array.from({ length: line.quantity }, () => line.unitPrice))
        .sort((a, b) => a - b);
      const sets = Math.floor(units.length / (buy + free));
      discount = sumMoney(units.slice(0, sets * free));
      break;
    }
    case "tiered": {
      const tierPercent = ctx.subtotal >= (coupon.minimumSpend ?? 0) * 2 ? coupon.value + 5 : coupon.value;
      discount = percentOf(eligibleSubtotal, tierPercent);
      break;
    }
  }

  if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
  discount = Math.max(0, Math.min(discount, ctx.subtotal));

  return {
    valid: true,
    coupon,
    discount,
    freeShipping,
    message: coupon.title,
  };
}

function eligibleLines(coupon: Coupon, lines: CartLine[]): CartLine[] {
  if (coupon.appliesTo === "all") return lines;
  // Line-level metadata is intentionally thin; the cart carries product ids and
  // the catalogue resolves category/brand membership before calling in.
  return lines.filter((line) => coupon.appliesToIds.includes(line.productId));
}

function formatShortfall(amount: Money): string {
  return `₹${Math.ceil(amount / 100).toLocaleString("en-IN")}`;
}

/* --------------------------- Cart totals ---------------------------- */

export interface PriceCartInput {
  lines: CartLine[];
  coupon?: Coupon | null;
  shippingMethod?: ShippingMethodOption | null;
  taxRate?: number;
  taxInclusive?: boolean;
  intraState?: boolean;
  currency?: CurrencyCode;
  freeShippingThreshold?: Money;
  loyaltyPointsRedeemed?: number;
  storeCredit?: Money;
  customerSegments?: CustomerSegmentKey[];
  customerId?: string;
}

export function priceCart(input: PriceCartInput): CartTotals {
  const {
    lines,
    coupon,
    shippingMethod,
    taxRate = 18,
    taxInclusive = true,
    intraState = true,
    currency = "INR",
    freeShippingThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD,
    loyaltyPointsRedeemed = 0,
    storeCredit = 0,
    customerSegments,
    customerId,
  } = input;

  const itemCount = lines.reduce((n, line) => n + line.quantity, 0);
  const subtotal = sumMoney(lines.map((line) => line.unitPrice * line.quantity));
  const listTotal = sumMoney(
    lines.map((line) => (line.compareAtPrice ?? line.unitPrice) * line.quantity),
  );
  const savings = Math.max(0, listTotal - subtotal);
  const giftWrapFee = lines.filter((line) => line.giftWrap).length * GIFT_WRAP_FEE;

  const validation = validateCoupon(coupon, { subtotal, lines, customerSegments, customerId });
  const discount = validation.valid ? validation.discount : 0;
  const couponFreeShipping = validation.valid && validation.freeShipping;

  const afterDiscount = Math.max(0, subtotal - discount);

  const baseShipping = shippingMethod?.price ?? 0;
  const qualifiesFree = afterDiscount >= freeShippingThreshold || couponFreeShipping;
  const shipping = qualifiesFree && (shippingMethod?.id ?? "standard") === "standard" ? 0 : baseShipping;

  const loyaltyDiscount = Math.min(
    loyaltyPointsRedeemed * LOYALTY_POINT_VALUE,
    Math.max(0, afterDiscount),
  );
  const payableBeforeCredit = Math.max(0, afterDiscount - loyaltyDiscount + shipping + giftWrapFee);
  const storeCreditApplied = Math.min(storeCredit, payableBeforeCredit);

  const total = Math.max(0, payableBeforeCredit - storeCreditApplied);

  // GST on Indian storefronts is quoted inclusive of the displayed price; the
  // invoice extracts the component rather than adding on top.
  const taxableAmount = taxInclusive ? total : afterDiscount;
  const tax = taxInclusive
    ? Math.round(taxableAmount - taxableAmount / (1 + taxRate / 100))
    : percentOf(taxableAmount, taxRate);

  const taxBreakdown = intraState
    ? [
        { label: `CGST ${taxRate / 2}%`, rate: taxRate / 2, amount: Math.round(tax / 2) },
        { label: `SGST ${taxRate / 2}%`, rate: taxRate / 2, amount: tax - Math.round(tax / 2) },
      ]
    : [{ label: `IGST ${taxRate}%`, rate: taxRate, amount: tax }];

  return {
    subtotal,
    savings,
    discount,
    loyaltyDiscount,
    storeCreditApplied,
    shipping,
    giftWrapFee,
    taxableAmount,
    tax,
    taxBreakdown,
    total: taxInclusive ? total : total + tax,
    itemCount,
    freeShippingThreshold,
    freeShippingRemaining: Math.max(0, freeShippingThreshold - afterDiscount),
    currency,
  };
}

export function emptyTotals(currency: CurrencyCode = "INR"): CartTotals {
  return {
    subtotal: 0,
    savings: 0,
    discount: 0,
    loyaltyDiscount: 0,
    storeCreditApplied: 0,
    shipping: 0,
    giftWrapFee: 0,
    taxableAmount: 0,
    tax: 0,
    taxBreakdown: [],
    total: 0,
    itemCount: 0,
    freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining: DEFAULT_FREE_SHIPPING_THRESHOLD,
    currency,
  };
}

/* -------------------------- Shipping rates -------------------------- */

export const SHIPPING_METHODS: ShippingMethodOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Free on orders above ₹999",
    price: 9900,
    minDays: 4,
    maxDays: 6,
    icon: "truck",
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Priority handling and dispatch",
    price: 19900,
    minDays: 2,
    maxDays: 3,
    icon: "zap",
  },
  {
    id: "same_day",
    name: "Same Day",
    description: "Order before 12 PM in metro pincodes",
    price: 34900,
    minDays: 0,
    maxDays: 1,
    icon: "clock",
  },
  {
    id: "pickup",
    name: "Store Pickup",
    description: "Collect from a nearby Obsidian point",
    price: 0,
    minDays: 1,
    maxDays: 2,
    icon: "store",
  },
];

export function estimateDelivery(method: ShippingMethodOption, from = new Date()): { min: Date; max: Date } {
  const min = new Date(from);
  min.setDate(min.getDate() + method.minDays);
  const max = new Date(from);
  max.setDate(max.getDate() + method.maxDays);
  return { min, max };
}
