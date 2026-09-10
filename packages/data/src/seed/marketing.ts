import {
  major,
  type AutomationRule,
  type Campaign,
  type Coupon,
  type GiftCard,
  type Promotion,
} from "@obsidian/commerce";
import { EDITORIAL, img } from "../images";
import { Rng } from "../rng";

interface CouponBlueprint {
  code: string;
  title: string;
  description: string;
  type: Coupon["type"];
  value: number;
  minimumSpend?: number;
  maximumDiscount?: number;
  eligibility?: Coupon["customerEligibility"];
  stackable?: boolean;
}

const COUPON_BLUEPRINTS: CouponBlueprint[] = [
  { code: "FIRST500", title: "₹500 off your first order", description: "New customers only, on orders above ₹1,999.", type: "fixed", value: major(500), minimumSpend: major(1999), eligibility: "new" },
  { code: "WELCOME10", title: "10% off your first order", description: "Applies to everything except gift cards.", type: "percentage", value: 10, maximumDiscount: major(1500), eligibility: "new" },
  { code: "OBSIDIAN20", title: "20% off sitewide", description: "Our anniversary offer, capped at ₹3,000.", type: "percentage", value: 20, minimumSpend: major(2500), maximumDiscount: major(3000) },
  { code: "FESTIVE30", title: "Flat 30% festive discount", description: "On the festive edit, above ₹4,999.", type: "percentage", value: 30, minimumSpend: major(4999), maximumDiscount: major(6000) },
  { code: "FREESHIP", title: "Free shipping, any order", description: "No minimum spend, standard delivery.", type: "free_shipping", value: 0, stackable: true },
  { code: "BAG1000", title: "₹1,000 off bags", description: "On bags and backpacks above ₹4,999.", type: "fixed", value: major(1000), minimumSpend: major(4999) },
  { code: "TECH15", title: "15% off electronics", description: "Phones, laptops, audio and wearables.", type: "percentage", value: 15, maximumDiscount: major(5000) },
  { code: "BUY2GET1", title: "Buy 2, get 1 free", description: "Cheapest item free on qualifying products.", type: "buy_x_get_y", value: 0, buyQuantity: 2 } as CouponBlueprint,
  { code: "VIP25", title: "VIP members save 25%", description: "Gold and Black tier members only.", type: "percentage", value: 25, maximumDiscount: major(8000), eligibility: "vip" },
  { code: "WEEKEND12", title: "12% weekend saver", description: "Live Friday to Sunday every week.", type: "percentage", value: 12, maximumDiscount: major(2000) },
  { code: "BEAUTY300", title: "₹300 off beauty", description: "On skincare, fragrance and makeup above ₹1,499.", type: "fixed", value: major(300), minimumSpend: major(1499) },
  { code: "HOME2500", title: "₹2,500 off furniture", description: "On furniture orders above ₹19,999.", type: "fixed", value: major(2500), minimumSpend: major(19999) },
  { code: "PANTRY99", title: "₹99 off groceries", description: "Weekly pantry restock, above ₹799.", type: "fixed", value: major(99), minimumSpend: major(799) },
  { code: "APPONLY18", title: "18% app-exclusive", description: "Only redeemable in the mobile app.", type: "percentage", value: 18, maximumDiscount: major(2500) },
  { code: "SPORT40", title: "Up to 40% off training", description: "Tiered: bigger baskets save more.", type: "tiered", value: 25, minimumSpend: major(2999), maximumDiscount: major(7000) },
  { code: "RETURN10", title: "10% welcome-back offer", description: "For customers who have not ordered in 90 days.", type: "percentage", value: 10, maximumDiscount: major(1200) },
  { code: "BULK5000", title: "₹5,000 off bulk orders", description: "Corporate and bulk purchases above ₹49,999.", type: "fixed", value: major(5000), minimumSpend: major(49999) },
  { code: "STUDENT12", title: "12% student discount", description: "Verified students, all year.", type: "percentage", value: 12, maximumDiscount: major(1500) },
  { code: "CLEAR50", title: "Extra 50% off clearance", description: "Final markdowns, no returns.", type: "percentage", value: 50, maximumDiscount: major(4000) },
  { code: "GIFT750", title: "₹750 off gifting", description: "On the gifting edit above ₹3,499.", type: "fixed", value: major(750), minimumSpend: major(3499) },
  { code: "SUMMER22", title: "22% summer sale", description: "Seasonal sitewide promotion.", type: "percentage", value: 22, maximumDiscount: major(4000) },
  { code: "LOYAL15", title: "15% loyalty thank-you", description: "For customers with five or more orders.", type: "percentage", value: 15, maximumDiscount: major(2500), eligibility: "vip" },
  { code: "FLASH60", title: "60% flash sale", description: "Two hours only, limited stock.", type: "percentage", value: 60, maximumDiscount: major(5000) },
  { code: "PET200", title: "₹200 off pet supplies", description: "Food, gear and treats above ₹999.", type: "fixed", value: major(200), minimumSpend: major(999) },
  { code: "BOOK99", title: "₹99 off books", description: "Any two books or more.", type: "fixed", value: major(99), minimumSpend: major(699) },
  { code: "JEWEL8", title: "8% off fine jewellery", description: "Hallmarked pieces, excludes bullion.", type: "percentage", value: 8, maximumDiscount: major(12000) },
  { code: "REFER400", title: "₹400 referral credit", description: "Applied automatically for referred customers.", type: "fixed", value: major(400), minimumSpend: major(1499) },
  { code: "BDAY20", title: "20% birthday treat", description: "Valid for seven days around your birthday.", type: "percentage", value: 20, maximumDiscount: major(3000) },
  { code: "TRYUS5", title: "5% trial discount", description: "Small nudge for first-time browsers.", type: "percentage", value: 5, maximumDiscount: major(500) },
  { code: "MEGA35", title: "35% mega sale", description: "Our biggest sitewide event of the year.", type: "percentage", value: 35, minimumSpend: major(3999), maximumDiscount: major(9000) },
];

export function buildCoupons(storeId: string, referenceDate: Date): Coupon[] {
  const rng = new Rng(`${storeId}:coupons`);
  return COUPON_BLUEPRINTS.map((bp, index) => {
    const state = rng.weighted<"active" | "scheduled" | "expired" | "disabled">([
      ["active", 62],
      ["scheduled", 14],
      ["expired", 18],
      ["disabled", 6],
    ]);
    const startsAt =
      state === "scheduled"
        ? rng.futureDate(referenceDate, 3, 40)
        : rng.pastDate(referenceDate, state === "expired" ? 120 : 10, state === "expired" ? 300 : 90);
    const endsAt =
      state === "expired"
        ? rng.pastDate(referenceDate, 1, 60)
        : new Date(startsAt.getTime() + 86400000 * rng.int(20, 180));

    const usageLimit = rng.bool(0.6) ? rng.int(200, 8000) : undefined;
    return {
      id: `cpn_${storeId}_${bp.code.toLowerCase()}`,
      storeId,
      code: bp.code,
      title: bp.title,
      description: bp.description,
      type: bp.type,
      value: bp.value,
      minimumSpend: bp.minimumSpend,
      maximumDiscount: bp.maximumDiscount,
      buyQuantity: bp.type === "buy_x_get_y" ? 2 : undefined,
      getQuantity: bp.type === "buy_x_get_y" ? 1 : undefined,
      appliesTo: "all",
      appliesToIds: [],
      customerEligibility: bp.eligibility ?? "all",
      usageLimit,
      usagePerCustomer: rng.bool(0.7) ? 1 : undefined,
      usedCount: usageLimit ? rng.int(0, Math.round(usageLimit * 0.7)) : rng.int(12, 2400),
      stackable: bp.stackable ?? false,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status: state,
      createdAt: rng.pastDate(referenceDate, 30, 400).toISOString(),
    } satisfies Coupon & { id: string };
  }).map((c, i) => ({ ...c, id: `cpn_${storeId}_${String(i).padStart(2, "0")}_${c.code.toLowerCase()}` }));
}

/* ---------------------------- Promotions ---------------------------- */

export function buildPromotions(storeId: string, referenceDate: Date): Promotion[] {
  const rng = new Rng(`${storeId}:promotions`);
  const blueprints: { name: string; kind: Promotion["kind"]; description: string; image: string }[] = [
    { name: "Limited Time Deals", kind: "flash_sale", description: "Rotating 24-hour deals across every category.", image: EDITORIAL.heroStore },
    { name: "Festive Season Sale", kind: "seasonal", description: "Our biggest merchandising moment of the year.", image: EDITORIAL.heroShopping },
    { name: "Weekend Flash", kind: "flash_sale", description: "Friday 6 PM to Sunday midnight.", image: EDITORIAL.heroStreet },
    { name: "Buy 2 Get 1 — Basics", kind: "bogo", description: "On tees, socks and everyday basics.", image: EDITORIAL.heroFashion },
    { name: "Spend ₹5,000 Save ₹750", kind: "spend_save", description: "Automatic at checkout, no code needed.", image: EDITORIAL.heroCouple },
    { name: "Home Refresh Bundle", kind: "bundle", description: "Lighting, textiles and decor as a set.", image: EDITORIAL.interiorRoom },
    { name: "End of Season Clearance", kind: "clearance", description: "Final markdowns while stock lasts.", image: EDITORIAL.heroMan },
    { name: "Tech Upgrade Days", kind: "seasonal", description: "Bank offers stacked on top of platform discounts.", image: EDITORIAL.deskTech },
  ];

  return blueprints.map((bp, index) => {
    const status = rng.weighted<Promotion["status"]>([["active", 50], ["scheduled", 25], ["ended", 25]]);
    const startsAt = status === "scheduled" ? rng.futureDate(referenceDate, 2, 30) : rng.pastDate(referenceDate, 2, 90);
    const endsAt = status === "ended" ? rng.pastDate(referenceDate, 1, 30) : new Date(startsAt.getTime() + 86400000 * rng.int(3, 45));
    return {
      id: `promo_${storeId}_${index}`,
      storeId,
      name: bp.name,
      kind: bp.kind,
      description: bp.description,
      banner: img(bp.image, 1600, 700),
      discountPercent: bp.kind === "spend_save" ? undefined : rng.int(10, 60),
      spendThreshold: bp.kind === "spend_save" ? major(5000) : undefined,
      saveAmount: bp.kind === "spend_save" ? major(750) : undefined,
      productIds: [],
      categoryIds: [],
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      status,
      revenue: major(rng.int(45000, 2400000)),
      ordersInfluenced: rng.int(60, 4200),
    };
  });
}

/* ----------------------------- Campaigns ---------------------------- */

export function buildCampaigns(storeId: string, referenceDate: Date): Campaign[] {
  const rng = new Rng(`${storeId}:campaigns`);
  const blueprints: { name: string; subject: string; preview: string; channel: Campaign["channel"]; segment: string }[] = [
    { name: "Autumn Edit launch", subject: "The Autumn Edit is live", preview: "Layers that carry the season — now in stock.", channel: "email", segment: "all" },
    { name: "Abandoned cart — 1 hour", subject: "You left something behind", preview: "Your bag is saved for the next 48 hours.", channel: "email", segment: "at_risk" },
    { name: "VIP early access", subject: "Two days early, just for you", preview: "Gold and Black members shop the sale first.", channel: "email", segment: "vip" },
    { name: "Weekend flash — push", subject: "Flash sale ends at midnight", preview: "Up to 60% off, two hours left.", channel: "push", segment: "all" },
    { name: "Price drop alert", subject: "An item on your wishlist is cheaper", preview: "The price just dropped by 22%.", channel: "push", segment: "repeat" },
    { name: "Back in stock", subject: "It is back", preview: "The piece you wanted has been restocked.", channel: "email", segment: "all" },
    { name: "Win-back 90 days", subject: "It has been a while", preview: "Here is 10% to come back with.", channel: "email", segment: "inactive" },
    { name: "Festive teaser — WhatsApp", subject: "Something big lands Friday", preview: "Set a reminder for the festive drop.", channel: "whatsapp", segment: "all" },
    { name: "New arrivals digest", subject: "Twelve new pieces this week", preview: "Fresh finds across every aisle.", channel: "email", segment: "repeat" },
    { name: "Review request", subject: "How was your order?", preview: "Leave a review, earn 50 points.", channel: "email", segment: "all" },
    { name: "Birthday voucher", subject: "Happy birthday — 20% inside", preview: "Valid for the next seven days.", channel: "email", segment: "all" },
    { name: "Restock reminder — pantry", subject: "Time to restock?", preview: "Reorder your usual in two taps.", channel: "sms", segment: "repeat" },
    { name: "Referral push", subject: "Give ₹400, get ₹400", preview: "Share your code with a friend.", channel: "push", segment: "vip" },
    { name: "Low stock urgency", subject: "Almost gone", preview: "Fewer than ten left in your size.", channel: "email", segment: "at_risk" },
    { name: "Loyalty tier upgrade", subject: "You are now Gold", preview: "Free express shipping unlocked.", channel: "in_app", segment: "vip" },
    { name: "Clearance final call", subject: "Last chance on clearance", preview: "Ends tonight, no extensions.", channel: "email", segment: "coupon_led" },
    { name: "App install nudge", subject: "Shop faster in the app", preview: "18% off your first app order.", channel: "sms", segment: "all" },
    { name: "Post-purchase care guide", subject: "Getting the most from your order", preview: "Care, warranty and setup in one place.", channel: "email", segment: "all" },
    { name: "Gifting guide", subject: "Gifts, sorted by budget", preview: "Under ₹1,000, ₹2,500 and ₹5,000.", channel: "email", segment: "all" },
    { name: "Survey — NPS", subject: "One question, 30 seconds", preview: "How likely are you to recommend us?", channel: "email", segment: "repeat" },
  ];

  return blueprints.map((bp, index) => {
    const status = rng.weighted<Campaign["status"]>([
      ["sent", 55],
      ["scheduled", 18],
      ["draft", 15],
      ["sending", 6],
      ["paused", 6],
    ]);
    const recipients = rng.int(800, 48000);
    const delivered = status === "sent" ? Math.round(recipients * rng.float(0.94, 0.995)) : status === "sending" ? Math.round(recipients * 0.4) : 0;
    const opened = Math.round(delivered * rng.float(0.22, 0.58));
    const clicked = Math.round(opened * rng.float(0.08, 0.34));
    const converted = Math.round(clicked * rng.float(0.04, 0.22));
    return {
      id: `cmp_${storeId}_${index}`,
      storeId,
      name: bp.name,
      channel: bp.channel,
      subject: bp.subject,
      preview: bp.preview,
      segmentKey: bp.segment,
      status,
      scheduledAt: status === "scheduled" ? rng.futureDate(referenceDate, 1, 21).toISOString() : undefined,
      sentAt: status === "sent" ? rng.pastDate(referenceDate, 1, 120).toISOString() : undefined,
      recipients,
      delivered,
      opened,
      clicked,
      converted,
      revenue: major(converted * rng.int(900, 5200)),
      createdAt: rng.pastDate(referenceDate, 5, 180).toISOString(),
    };
  });
}

/* ---------------------------- Automations --------------------------- */

export function buildAutomations(storeId: string): AutomationRule[] {
  const rng = new Rng(`${storeId}:automations`);
  const blueprints: { name: string; trigger: AutomationRule["trigger"]; delay: number; actions: AutomationRule["actions"] }[] = [
    { name: "Abandoned cart — 1 hour reminder", trigger: "cart_abandoned", delay: 60, actions: [{ type: "email", template: "cart-reminder" }] },
    { name: "Abandoned cart — 24 hour discount", trigger: "cart_abandoned", delay: 1440, actions: [{ type: "email", template: "cart-discount" }, { type: "discount", template: "TRYUS5" }] },
    { name: "Abandoned cart — 48 hour final", trigger: "cart_abandoned", delay: 2880, actions: [{ type: "push", template: "cart-final" }] },
    { name: "Welcome series", trigger: "customer_created", delay: 15, actions: [{ type: "email", template: "welcome-1" }] },
    { name: "Order confirmation + tracking", trigger: "order_placed", delay: 2, actions: [{ type: "email", template: "order-confirmed" }, { type: "whatsapp", template: "order-tracking" }] },
    { name: "Review request after delivery", trigger: "order_delivered", delay: 4320, actions: [{ type: "email", template: "review-request" }] },
    { name: "Low stock alert to merchant", trigger: "low_stock", delay: 0, actions: [{ type: "email", template: "merchant-low-stock" }] },
    { name: "Birthday reward", trigger: "birthday", delay: 0, actions: [{ type: "email", template: "birthday-voucher" }, { type: "discount", template: "BDAY20" }] },
    { name: "Browse abandonment", trigger: "browse_abandoned", delay: 360, actions: [{ type: "push", template: "browse-nudge" }] },
    { name: "Replenishment reminder", trigger: "order_delivered", delay: 43200, actions: [{ type: "sms", template: "restock" }] },
  ];

  return blueprints.map((bp, index) => ({
    id: `auto_${storeId}_${index}`,
    storeId,
    name: bp.name,
    trigger: bp.trigger,
    delayMinutes: bp.delay,
    actions: bp.actions,
    status: rng.bool(0.8) ? "active" : "paused",
    runs30d: rng.int(40, 5200),
    revenue30d: major(rng.int(4000, 480000)),
    conversionRate: rng.float(1.8, 24.5, 1),
  }));
}

/* ----------------------------- Gift cards --------------------------- */

export function buildGiftCards(storeId: string, referenceDate: Date, count = 12): GiftCard[] {
  const rng = new Rng(`${storeId}:giftcards`);
  const denominations = [500, 1000, 2500, 5000, 10000];
  return Array.from({ length: count }, (_, i) => {
    const initial = major(rng.pick(denominations));
    const spent = rng.bool(0.5) ? major(rng.int(0, initial / 100)) : 0;
    const balance = Math.max(0, initial - spent);
    return {
      id: `gc_${storeId}_${i}`,
      storeId,
      code: `OBS-${rng.int(1000, 9999)}-${rng.int(1000, 9999)}-${rng.int(1000, 9999)}`,
      initialValue: initial,
      balance,
      issuedTo: rng.bool(0.7) ? "gift@example.com" : undefined,
      status: balance === 0 ? "redeemed" : "active",
      expiresAt: rng.futureDate(referenceDate, 90, 720).toISOString(),
      createdAt: rng.pastDate(referenceDate, 5, 300).toISOString(),
    };
  });
}
