import {
  ROLE_PRESETS,
  major,
  type ApiKey,
  type AuditLogEntry,
  type Industry,
  type Plan,
  type PlatformUser,
  type StaffRole,
  type Store,
  type StoreMember,
  type Subscription,
  type Webhook,
  type WebhookTopic,
} from "@obsidian/commerce";
import { PORTRAITS, avatarImg } from "../images";
import { Rng } from "../rng";
import { FIRST_NAMES, LAST_NAMES } from "./people";

export const PLANS: Plan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    slug: "starter",
    tagline: "Get your first hundred orders out the door.",
    monthlyPrice: major(1499),
    annualPrice: major(14990),
    currency: "INR",
    transactionFeeBps: 200,
    popular: false,
    limits: {
      products: 500,
      staff: 2,
      monthlyOrders: 500,
      storageGb: 10,
      warehouses: 1,
      customDomain: false,
      apiAccess: false,
      advancedAnalytics: false,
      abandonedCart: false,
      marketplace: false,
    },
    features: [
      "Premium storefront themes",
      "Unlimited categories and collections",
      "Coupons and basic promotions",
      "Standard analytics",
      "Email support",
    ],
  },
  {
    id: "plan_growth",
    name: "Growth",
    slug: "growth",
    tagline: "For brands finding their rhythm.",
    monthlyPrice: major(4999),
    annualPrice: major(49990),
    currency: "INR",
    transactionFeeBps: 150,
    popular: true,
    limits: {
      products: 5000,
      staff: 8,
      monthlyOrders: 5000,
      storageGb: 100,
      warehouses: 3,
      customDomain: true,
      apiAccess: true,
      advancedAnalytics: true,
      abandonedCart: true,
      marketplace: false,
    },
    features: [
      "Everything in Starter",
      "Custom domain and SSL",
      "Abandoned cart automation",
      "Advanced analytics and cohorts",
      "Storefront and Admin API",
      "Three warehouse locations",
    ],
  },
  {
    id: "plan_professional",
    name: "Professional",
    slug: "professional",
    tagline: "Multi-location operations with real depth.",
    monthlyPrice: major(19999),
    annualPrice: major(199990),
    currency: "INR",
    transactionFeeBps: 90,
    popular: false,
    limits: {
      products: 50000,
      staff: 25,
      monthlyOrders: 50000,
      storageGb: 500,
      warehouses: 10,
      customDomain: true,
      apiAccess: true,
      advancedAnalytics: true,
      abandonedCart: true,
      marketplace: true,
    },
    features: [
      "Everything in Growth",
      "Multi-warehouse routing",
      "Purchase orders and suppliers",
      "Loyalty programme and store credit",
      "Marketplace / multi-vendor mode",
      "Priority support with a named contact",
    ],
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    slug: "enterprise",
    tagline: "Custom infrastructure, custom terms.",
    monthlyPrice: major(89999),
    annualPrice: major(899990),
    currency: "INR",
    transactionFeeBps: 40,
    popular: false,
    limits: {
      products: 1000000,
      staff: 250,
      monthlyOrders: 1000000,
      storageGb: 5000,
      warehouses: 100,
      customDomain: true,
      apiAccess: true,
      advancedAnalytics: true,
      abandonedCart: true,
      marketplace: true,
    },
    features: [
      "Everything in Professional",
      "Dedicated infrastructure and SLAs",
      "SSO, audit exports and custom roles",
      "Bespoke integrations",
      "Quarterly business reviews",
      "24/7 phone support",
    ],
  },
];

export interface StoreBlueprint {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  industry: Industry;
  industries: Industry[] | "all";
  themePreset: string;
  logoText: string;
  logoMark: string;
  planId: string;
  status: Store["status"];
  domain: string;
  productsPerCategory: number;
  customerCount: number;
  orderCount: number;
  reviewCount: number;
  flagship?: boolean;
}

export const STORE_BLUEPRINTS: StoreBlueprint[] = [
  {
    id: "obsidian",
    name: "Obsidian Commerce",
    slug: "obsidian",
    tagline: "Commerce for a brighter tomorrow.",
    description:
      "The flagship universal storefront — fashion, electronics, home, beauty, sports, grocery and everything between, running on one commerce engine.",
    industry: "general",
    industries: "all",
    themePreset: "obsidian",
    logoText: "OBSIDIAN",
    logoMark: "OB",
    planId: "plan_enterprise",
    status: "active",
    domain: "obsidian.commerce.dev",
    productsPerCategory: 14,
    customerCount: 260,
    orderCount: 750,
    reviewCount: 650,
    flagship: true,
  },
  {
    id: "voltwire",
    name: "Volt & Wire",
    slug: "voltwire",
    tagline: "Technology, honestly specified.",
    description: "An electronics specialist built around clear specifications, real battery figures and repairable devices.",
    industry: "electronics",
    industries: ["electronics"],
    themePreset: "halo",
    logoText: "VOLT & WIRE",
    logoMark: "VW",
    planId: "plan_professional",
    status: "active",
    domain: "voltwire.commerce.dev",
    productsPerCategory: 10,
    customerCount: 90,
    orderCount: 180,
    reviewCount: 150,
  },
  {
    id: "lumen",
    name: "Lumen Beauty Co.",
    slug: "lumen",
    tagline: "Short ingredient lists. Long-term skin.",
    description: "Dermatologist-tested skincare, fragrance and colour with full INCI disclosure on every carton.",
    industry: "beauty",
    industries: ["beauty"],
    themePreset: "petal",
    logoText: "LUMEN",
    logoMark: "LU",
    planId: "plan_growth",
    status: "active",
    domain: "lumen.commerce.dev",
    productsPerCategory: 12,
    customerCount: 75,
    orderCount: 150,
    reviewCount: 120,
  },
  {
    id: "formline",
    name: "Formline Studio",
    slug: "formline",
    tagline: "Furniture made to be repaired.",
    description: "Solid timber and steel furniture with published joinery, replaceable covers and a ten-year frame warranty.",
    industry: "furniture",
    industries: ["furniture", "home"],
    themePreset: "atelier",
    logoText: "FORMLINE",
    logoMark: "FL",
    planId: "plan_professional",
    status: "active",
    domain: "formline.commerce.dev",
    productsPerCategory: 10,
    customerCount: 65,
    orderCount: 120,
    reviewCount: 95,
  },
  {
    id: "verdant",
    name: "Verdant Market",
    slug: "verdant",
    tagline: "Pantry staples with a paper trail.",
    description: "Single-estate coffee, cold-pressed oils and fresh produce with farm-gate pricing printed on the pack.",
    industry: "grocery",
    industries: ["grocery", "pets"],
    themePreset: "harvest",
    logoText: "VERDANT",
    logoMark: "VD",
    planId: "plan_growth",
    status: "active",
    domain: "verdant.commerce.dev",
    productsPerCategory: 12,
    customerCount: 80,
    orderCount: 160,
    reviewCount: 110,
  },
  {
    id: "trailhead",
    name: "Trailhead Supply",
    slug: "trailhead",
    tagline: "Kit that survives the season.",
    description: "Running, training and outdoor equipment tested by the people who sell it.",
    industry: "sports",
    industries: ["sports"],
    themePreset: "velocity",
    logoText: "TRAILHEAD",
    logoMark: "TH",
    planId: "plan_growth",
    status: "trial",
    domain: "trailhead.commerce.dev",
    productsPerCategory: 10,
    customerCount: 60,
    orderCount: 100,
    reviewCount: 80,
  },
  {
    id: "aurum",
    name: "Aurum Atelier",
    slug: "aurum",
    tagline: "Hallmarked, traceable, hand-finished.",
    description: "Fine jewellery and mechanical watches with certification in the box and lifetime servicing.",
    industry: "jewelry",
    industries: ["jewelry"],
    themePreset: "obsidian",
    logoText: "AURUM",
    logoMark: "AU",
    planId: "plan_starter",
    status: "active",
    domain: "aurum.commerce.dev",
    productsPerCategory: 12,
    customerCount: 50,
    orderCount: 80,
    reviewCount: 65,
  },
];

/** Extra tenants that exist only as SaaS rows, for a realistic platform console. */
export const GHOST_STORE_BLUEPRINTS: {
  name: string;
  industry: Industry;
  planId: string;
  status: Store["status"];
}[] = [
  { name: "Paperfold Studio", industry: "books", planId: "plan_starter", status: "active" },
  { name: "Cinder & Sage", industry: "home", planId: "plan_growth", status: "active" },
  { name: "Northpeak Outfitters", industry: "sports", planId: "plan_growth", status: "active" },
  { name: "Bloom Grocer", industry: "grocery", planId: "plan_starter", status: "trial" },
  { name: "Pixelworks", industry: "electronics", planId: "plan_professional", status: "active" },
  { name: "Thread Theory", industry: "fashion", planId: "plan_growth", status: "paused" },
  { name: "Wag & Whiskers", industry: "pets", planId: "plan_starter", status: "active" },
  { name: "Marble & Oak", industry: "furniture", planId: "plan_professional", status: "active" },
  { name: "Glow Lab", industry: "beauty", planId: "plan_growth", status: "trial" },
  { name: "Verse Books", industry: "books", planId: "plan_starter", status: "suspended" },
  { name: "Circuit Nine", industry: "electronics", planId: "plan_growth", status: "active" },
  { name: "Harvest Table", industry: "grocery", planId: "plan_growth", status: "active" },
  { name: "Lumen Optics", industry: "fashion", planId: "plan_starter", status: "active" },
  { name: "Base Camp Gear", industry: "sports", planId: "plan_professional", status: "active" },
  { name: "Silk Route Jewels", industry: "jewelry", planId: "plan_growth", status: "active" },
  { name: "Terra Home", industry: "home", planId: "plan_starter", status: "closed" },
  { name: "Cadence Audio", industry: "electronics", planId: "plan_professional", status: "active" },
  { name: "Fern & Fig", industry: "beauty", planId: "plan_starter", status: "trial" },
];

const STAFF_BLUEPRINTS: { name: string; role: StaffRole }[] = [
  { name: "Rahul Mehta", role: "owner" },
  { name: "Priya Nair", role: "admin" },
  { name: "Ananya Iyer", role: "manager" },
  { name: "Kabir Shah", role: "product_manager" },
  { name: "Vikram Rao", role: "warehouse_manager" },
  { name: "Divya Reddy", role: "support" },
  { name: "Arjun Kapoor", role: "marketing" },
  { name: "Meera Joshi", role: "accountant" },
];

export function buildStaff(storeId: string, referenceDate: Date, count = 8): StoreMember[] {
  const rng = new Rng(`${storeId}:staff`);
  // Roles are fixed — every store needs an owner before it needs a marketer —
  // but the people filling them differ per tenant. Reusing eight names across
  // every store is immediately obvious in the platform-wide user list.
  const names = rng.sample(
    FIRST_NAMES.flatMap((first) => LAST_NAMES.slice(0, 6).map((last) => `${first} ${last}`)),
    count,
  );
  return STAFF_BLUEPRINTS.slice(0, count).map((bp, index) => ({
    id: `mem_${storeId}_${index}`,
    storeId,
    userId: `usr_${storeId}_${index}`,
    name: names[index] ?? bp.name,
    email: `${(names[index] ?? bp.name).toLowerCase().replace(/\s+/g, ".")}@${storeId}.example`,
    avatar: avatarImg(PORTRAITS[index % PORTRAITS.length]!, 96),
    role: bp.role,
    permissions: ROLE_PRESETS[bp.role].permissions,
    status: index === 0 ? "active" : rng.weighted([["active", 84], ["invited", 10], ["disabled", 6]]),
    lastActiveAt: rng.pastDate(referenceDate, 0, 14).toISOString(),
    createdAt: rng.pastDate(referenceDate, 60, 700).toISOString(),
  }));
}

export function buildSubscription(store: Store, referenceDate: Date): Subscription {
  const rng = new Rng(`${store.id}:subscription`);
  const plan = PLANS.find((p) => p.id === store.planId) ?? PLANS[0]!;
  const interval = rng.weighted<"monthly" | "annual">([["monthly", 68], ["annual", 32]]);
  const startedAt = rng.pastDate(referenceDate, 30, 800);
  const currentPeriodEnd = rng.futureDate(referenceDate, 2, interval === "annual" ? 330 : 28);
  const status: Subscription["status"] =
    store.status === "trial" ? "trialing"
    : store.status === "suspended" ? "past_due"
    : store.status === "paused" ? "paused"
    : store.status === "closed" ? "cancelled"
    : "active";

  return {
    id: `sub_${store.id}`,
    storeId: store.id,
    planId: plan.id,
    status,
    interval,
    amount: interval === "annual" ? plan.annualPrice : plan.monthlyPrice,
    currency: "INR",
    startedAt: startedAt.toISOString(),
    currentPeriodEnd: currentPeriodEnd.toISOString(),
    trialEndsAt: status === "trialing" ? rng.futureDate(referenceDate, 1, 14).toISOString() : undefined,
    cancelledAt: status === "cancelled" ? rng.pastDate(referenceDate, 5, 90).toISOString() : undefined,
    seats: rng.int(1, Math.min(12, plan.limits.staff)),
  };
}

const AUDIT_ACTIONS: { action: string; resource: string; severity: AuditLogEntry["severity"] }[] = [
  { action: "product.updated", resource: "Product", severity: "info" },
  { action: "product.created", resource: "Product", severity: "info" },
  { action: "product.deleted", resource: "Product", severity: "warning" },
  { action: "order.refunded", resource: "Order", severity: "warning" },
  { action: "order.cancelled", resource: "Order", severity: "warning" },
  { action: "inventory.adjusted", resource: "Inventory", severity: "info" },
  { action: "staff.invited", resource: "StoreMember", severity: "info" },
  { action: "staff.permissions_changed", resource: "StoreMember", severity: "warning" },
  { action: "settings.payment_gateway_updated", resource: "StoreSetting", severity: "critical" },
  { action: "apikey.created", resource: "ApiKey", severity: "critical" },
  { action: "apikey.revoked", resource: "ApiKey", severity: "warning" },
  { action: "theme.published", resource: "Theme", severity: "info" },
  { action: "coupon.created", resource: "Coupon", severity: "info" },
  { action: "login.success", resource: "Session", severity: "info" },
  { action: "login.failed", resource: "Session", severity: "warning" },
  { action: "subscription.plan_changed", resource: "Subscription", severity: "critical" },
  { action: "store.suspended", resource: "Store", severity: "critical" },
  { action: "webhook.delivery_failed", resource: "Webhook", severity: "warning" },
];

export function buildAuditLog({
  storeId,
  actors,
  referenceDate,
  count,
}: {
  storeId: string | null;
  actors: { id: string; name: string; type: AuditLogEntry["actorType"] }[];
  referenceDate: Date;
  count: number;
}): AuditLogEntry[] {
  const rng = new Rng(`${storeId ?? "platform"}:audit`);
  return Array.from({ length: count }, (_, i) => {
    const entry = rng.pick(AUDIT_ACTIONS);
    const actor = rng.pick(actors);
    return {
      id: `aud_${storeId ?? "platform"}_${i}`,
      storeId,
      actorId: actor.id,
      actorName: actor.name,
      actorType: actor.type,
      action: entry.action,
      resource: entry.resource,
      resourceId: `${entry.resource.toLowerCase()}_${rng.int(1000, 9999)}`,
      ip: `${rng.int(49, 203)}.${rng.int(0, 255)}.${rng.int(0, 255)}.${rng.int(1, 254)}`,
      userAgent: rng.pick([
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) Chrome/126.0",
        "Mozilla/5.0 (Windows NT 11.0; Win64; x64) Chrome/126.0",
        "Obsidian-Admin-iOS/2.4.1",
        "Obsidian-API-Client/1.0",
      ]),
      severity: entry.severity,
      createdAt: rng.pastDate(referenceDate, 0, 60).toISOString(),
    };
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function buildApiKeys(storeId: string, referenceDate: Date): ApiKey[] {
  const rng = new Rng(`${storeId}:apikeys`);
  const names = ["Production storefront", "Mobile app", "ERP sync", "Analytics pipeline", "Legacy integration"];
  return names.slice(0, rng.int(2, 5)).map((name, index) => ({
    id: `key_${storeId}_${index}`,
    storeId,
    name,
    prefix: `obs_${rng.bool(0.5) ? "live" : "test"}_${rng.int(100000, 999999)}`,
    scopes: index === 0 ? ["products.read", "orders.read"] : ["products.read", "orders.read", "orders.write", "customers.read"],
    lastUsedAt: rng.bool(0.8) ? rng.pastDate(referenceDate, 0, 20).toISOString() : undefined,
    createdAt: rng.pastDate(referenceDate, 20, 500).toISOString(),
    revokedAt: index === names.length - 1 && rng.bool(0.4) ? rng.pastDate(referenceDate, 1, 60).toISOString() : undefined,
  }));
}

export function buildWebhooks(storeId: string, referenceDate: Date): Webhook[] {
  const rng = new Rng(`${storeId}:webhooks`);
  const endpoints = [
    { url: "https://erp.internal.example/hooks/orders", topics: ["order.created", "order.updated", "order.fulfilled"] },
    { url: "https://warehouse.partner.example/obsidian", topics: ["order.created", "inventory.updated"] },
    { url: "https://crm.example/webhooks/customers", topics: ["customer.created", "review.created"] },
    { url: "https://accounting.example/hooks/payments", topics: ["payment.succeeded", "refund.created"] },
  ];
  return endpoints.slice(0, rng.int(2, 4)).map((endpoint, index) => {
    const failures = rng.bool(0.25) ? rng.int(1, 40) : 0;
    return {
      id: `whk_${storeId}_${index}`,
      storeId,
      url: endpoint.url,
      topics: endpoint.topics as WebhookTopic[],
      status: failures > 20 ? "failing" : rng.bool(0.9) ? "active" : "paused",
      secretPrefix: `whsec_${rng.int(100000, 999999)}`,
      deliveries24h: rng.int(20, 2400),
      failures24h: failures,
      createdAt: rng.pastDate(referenceDate, 30, 600).toISOString(),
    };
  });
}

export function buildPlatformUsers(stores: Store[], referenceDate: Date): PlatformUser[] {
  const rng = new Rng("platform:users");
  const users: PlatformUser[] = [
    {
      id: "usr_platform_root",
      name: "Subarna Mondal",
      email: "operator@obsidian.dev",
      avatar: avatarImg(PORTRAITS[6]!, 96),
      phone: "+91 98765 43210",
      type: "platform",
      storeIds: stores.map((s) => s.id),
      mfaEnabled: true,
      createdAt: rng.pastDate(referenceDate, 700, 900).toISOString(),
      lastLoginAt: rng.pastDate(referenceDate, 0, 2).toISOString(),
    },
  ];

  stores.forEach((store, index) => {
    users.push({
      id: store.ownerId,
      name: STAFF_BLUEPRINTS[index % STAFF_BLUEPRINTS.length]!.name,
      email: `owner@${store.slug}.example`,
      avatar: avatarImg(PORTRAITS[index % PORTRAITS.length]!, 96),
      phone: `+91 ${rng.int(70000, 99999)} ${rng.int(10000, 99999)}`,
      type: "merchant",
      storeIds: [store.id],
      mfaEnabled: rng.bool(0.5),
      createdAt: store.createdAt,
      lastLoginAt: rng.pastDate(referenceDate, 0, 10).toISOString(),
    });
  });

  return users;
}
