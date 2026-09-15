import {
  major,
  type AppNotification,
  type ApiKey,
  type AttributeDefinition,
  type AuditLogEntry,
  type AutomationRule,
  type BlogPost,
  type Brand,
  type Campaign,
  type Category,
  type Collection,
  type Coupon,
  type Customer,
  type FAQItem,
  type GiftCard,
  type Industry,
  type InventoryMovement,
  type InventoryRecord,
  type MetricPoint,
  type NavigationMenu,
  type Order,
  type Payment,
  type Plan,
  type PlatformUser,
  type Product,
  type ProductQuestion,
  type Promotion,
  type PurchaseOrder,
  type Refund,
  type ReturnRequest,
  type Review,
  type Shipment,
  type StockTransfer,
  type Store,
  type StoreMember,
  type StorePage,
  type Subscription,
  type Supplier,
  type SupportTicket,
  type Theme,
  type Warehouse,
} from "@obsidian/commerce";
import { Rng, slugify } from "./rng";
import { buildDailyMetrics } from "./seed/analytics";
import { buildCustomers } from "./seed/customers";
import {
  buildBlogPosts,
  buildFaqs,
  buildHomePage,
  buildNavigation,
  buildStaticPages,
  buildTheme,
} from "./seed/content";
import {
  buildNotifications,
  buildQuestions,
  buildReviews,
  buildSupportTickets,
} from "./seed/engagement";
import {
  buildAutomations,
  buildCampaigns,
  buildCoupons,
  buildGiftCards,
  buildPromotions,
} from "./seed/marketing";
import {
  buildInventory,
  buildPurchaseOrders,
  buildStockTransfers,
  buildSuppliers,
  buildWarehouses,
} from "./seed/operations";
import { buildOrders } from "./seed/orders";
import {
  GHOST_STORE_BLUEPRINTS,
  PLANS,
  STORE_BLUEPRINTS,
  buildApiKeys,
  buildAuditLog,
  buildPlatformUsers,
  buildStaff,
  buildSubscription,
  buildWebhooks,
  type StoreBlueprint,
} from "./seed/platform";
import { buildAttributesForStore, buildProducts } from "./seed/products";
import { buildBrands, buildCategories, buildCollections } from "./seed/taxonomy";
import type { Webhook } from "@obsidian/commerce";

/**
 * The demo clock.
 *
 * All seeded timestamps are relative to this fixed instant so the dataset is
 * stable across server restarts and identical on server and client. Relative
 * time in the UI is formatted against this same reference.
 */
export const SEED_NOW = new Date("2026-09-05T09:30:00.000Z");

export interface StoreDatabase {
  store: Store;
  theme: Theme;
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  attributes: AttributeDefinition[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  payments: Payment[];
  shipments: Shipment[];
  returns: ReturnRequest[];
  refunds: Refund[];
  coupons: Coupon[];
  promotions: Promotion[];
  campaigns: Campaign[];
  automations: AutomationRule[];
  giftCards: GiftCard[];
  warehouses: Warehouse[];
  inventory: InventoryRecord[];
  movements: InventoryMovement[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  transfers: StockTransfer[];
  reviews: Review[];
  questions: ProductQuestion[];
  customerNotifications: AppNotification[];
  merchantNotifications: AppNotification[];
  tickets: SupportTicket[];
  homePage: StorePage;
  pages: StorePage[];
  menus: NavigationMenu[];
  blogPosts: BlogPost[];
  faqs: FAQItem[];
  staff: StoreMember[];
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  auditLog: AuditLogEntry[];
  subscription: Subscription;
  metrics: MetricPoint[];
}

export interface PlatformDatabase {
  stores: StoreDatabase[];
  storesById: Map<string, StoreDatabase>;
  allStores: Store[];
  plans: Plan[];
  users: PlatformUser[];
  subscriptions: Subscription[];
  auditLog: AuditLogEntry[];
  flagship: StoreDatabase;
  generatedAt: string;
}

function buildStoreDatabase(blueprint: StoreBlueprint): StoreDatabase {
  const storeId = blueprint.id;
  const rng = new Rng(`${storeId}:store`);
  const createdAt = rng.pastDate(SEED_NOW, 200, 1000);

  const categories = buildCategories(storeId, blueprint.industries);
  const brands = buildBrands(storeId, blueprint.industries);
  const collections = buildCollections(storeId, SEED_NOW);
  const attributes = buildAttributesForStore(storeId, blueprint.industries);

  const products = buildProducts({
    storeId,
    categories,
    brands,
    collections,
    attributeDefinitions: attributes,
    industries: blueprint.industries,
    referenceDate: SEED_NOW,
    perCategory: blueprint.productsPerCategory,
  });

  // Denormalise counts the UI leans on constantly.
  for (const category of categories) {
    category.productCount = products.filter(
      (p) => p.categoryId === category.id || p.categoryPath.includes(category.id),
    ).length;
  }
  for (const brand of brands) {
    brand.productCount = products.filter((p) => p.brandId === brand.id).length;
  }
  for (const collection of collections) {
    collection.productIds = products.filter((p) => p.collectionIds.includes(collection.id)).map((p) => p.id);
  }

  const warehouses = buildWarehouses(storeId, blueprint.flagship ? 8 : 3);
  const customers = buildCustomers({ storeId, count: blueprint.customerCount, referenceDate: SEED_NOW });
  const coupons = buildCoupons(storeId, SEED_NOW);

  const { orders, payments, shipments, returns, refunds } = buildOrders({
    storeId,
    products,
    customers,
    coupons,
    warehouseIds: warehouses.map((w) => w.id),
    count: blueprint.orderCount,
    referenceDate: SEED_NOW,
  });

  const { records: inventory, movements } = buildInventory({
    storeId,
    products,
    warehouses,
    referenceDate: SEED_NOW,
    movementsPerRecord: blueprint.flagship ? 2 : 1,
  });

  const suppliers = buildSuppliers(storeId);
  const purchaseOrders = buildPurchaseOrders({
    storeId,
    products,
    suppliers,
    warehouses,
    referenceDate: SEED_NOW,
    count: blueprint.flagship ? 18 : 8,
  });
  const transfers = buildStockTransfers({
    storeId,
    products,
    warehouses,
    referenceDate: SEED_NOW,
    count: blueprint.flagship ? 10 : 4,
  });

  const reviews = buildReviews({
    storeId,
    products,
    customers,
    referenceDate: SEED_NOW,
    count: blueprint.reviewCount,
  });
  const questions = buildQuestions({
    storeId,
    products,
    customers,
    referenceDate: SEED_NOW,
    count: blueprint.flagship ? 60 : 18,
  });

  const customerNotifications = buildNotifications({
    storeId,
    orders,
    products,
    referenceDate: SEED_NOW,
    audience: "customer",
    count: 14,
  });
  const merchantNotifications = buildNotifications({
    storeId,
    orders,
    products,
    referenceDate: SEED_NOW,
    audience: "merchant",
    count: 18,
  });

  const tickets = buildSupportTickets({
    storeId,
    customers,
    orders,
    referenceDate: SEED_NOW,
    count: blueprint.flagship ? 60 : 18,
  });

  const staff = buildStaff(storeId, SEED_NOW, blueprint.flagship ? 8 : 4);
  const metrics = buildDailyMetrics({ storeId, orders, referenceDate: SEED_NOW });

  const last30 = metrics.slice(-30);
  const gmv = last30.reduce((n, m) => n + m.revenue, 0);
  const orderCount = last30.reduce((n, m) => n + m.orders, 0);
  const visitors = last30.reduce((n, m) => n + m.visitors, 0);

  const store: Store = {
    id: storeId,
    name: blueprint.name,
    slug: blueprint.slug,
    tagline: blueprint.tagline,
    description: blueprint.description,
    industry: blueprint.industry,
    status: blueprint.status,
    logoText: blueprint.logoText,
    logoMark: blueprint.logoMark,
    ownerId: `usr_owner_${storeId}`,
    planId: blueprint.planId,
    currency: "INR",
    country: "India",
    locale: "en-IN",
    timezone: "Asia/Kolkata",
    domain: blueprint.domain,
    customDomain: blueprint.flagship ? "shop.obsidian.dev" : undefined,
    themeId: `theme_${storeId}`,
    supportEmail: `support@${blueprint.slug}.example`,
    supportPhone: "+91 80 4718 2200",
    createdAt: createdAt.toISOString(),
    metrics: {
      gmv,
      orders: orderCount,
      customers: customers.length,
      products: products.length,
      conversionRate: visitors ? Number(((orderCount / visitors) * 100).toFixed(2)) : 0,
      averageOrderValue: orderCount ? Math.round(gmv / orderCount) : 0,
    },
    features: {
      marketplace: blueprint.planId === "plan_enterprise" || blueprint.planId === "plan_professional",
      loyalty: blueprint.planId !== "plan_starter",
      subscriptions: blueprint.planId === "plan_enterprise",
      aiAssistant: blueprint.planId !== "plan_starter",
      multiWarehouse: warehouses.length > 1,
      b2b: blueprint.planId === "plan_enterprise",
    },
  };

  const subscription = buildSubscription(store, SEED_NOW);
  const homePage = buildHomePage(storeId, store.name, collections, SEED_NOW);
  const pages = buildStaticPages(storeId, store.name, SEED_NOW);
  const menus = buildNavigation(storeId, categories, collections);

  const auditLog = buildAuditLog({
    storeId,
    actors: staff.map((s) => ({ id: s.userId, name: s.name, type: "merchant" as const })),
    referenceDate: SEED_NOW,
    count: blueprint.flagship ? 80 : 24,
  });

  return {
    store,
    theme: buildTheme(storeId, blueprint.themePreset, SEED_NOW),
    categories,
    brands,
    collections,
    attributes,
    products,
    customers,
    orders,
    payments,
    shipments,
    returns,
    refunds,
    coupons,
    promotions: buildPromotions(storeId, SEED_NOW),
    campaigns: buildCampaigns(storeId, SEED_NOW),
    automations: buildAutomations(storeId),
    giftCards: buildGiftCards(storeId, SEED_NOW, blueprint.flagship ? 14 : 6),
    warehouses,
    inventory,
    movements,
    suppliers,
    purchaseOrders,
    transfers,
    reviews,
    questions,
    customerNotifications,
    merchantNotifications,
    tickets,
    homePage,
    pages,
    menus,
    blogPosts: buildBlogPosts(storeId, SEED_NOW),
    faqs: buildFaqs(storeId),
    staff,
    apiKeys: buildApiKeys(storeId, SEED_NOW),
    webhooks: buildWebhooks(storeId, SEED_NOW),
    auditLog,
    subscription,
    metrics,
  };
}

/**
 * Ghost tenants have no catalogue, so their counters are synthetic.
 *
 * Draw monthly *GMV* from the plan they pay for and derive the order count from
 * their basket size, rather than drawing orders and basket independently — that
 * is what produced a jewellery boutique doing 11,000 orders a month at ₹32,000
 * each. A merchant buys the tier its revenue justifies, and high-basket
 * verticals reach the same revenue on far fewer orders.
 */
const GHOST_GMV_BAND: Record<string, [number, number]> = {
  plan_starter: [150_000, 1_800_000],
  plan_growth: [1_500_000, 9_000_000],
  plan_professional: [8_000_000, 34_000_000],
  plan_enterprise: [40_000_000, 160_000_000],
};

/** Basket sizes differ by an order of magnitude between verticals. */
const GHOST_AOV_BAND: Record<Industry, [number, number]> = {
  grocery: [650, 2600],
  books: [450, 2200],
  beauty: [900, 4200],
  pets: [700, 3200],
  fashion: [1400, 6500],
  sports: [1800, 9500],
  home: [1900, 11000],
  electronics: [4500, 38000],
  furniture: [7500, 62000],
  jewelry: [9000, 85000],
  general: [1200, 7500],
};

function buildGhostStores(): { stores: Store[]; subscriptions: Subscription[] } {
  const rng = new Rng("platform:ghosts");
  const stores: Store[] = [];
  const subscriptions: Subscription[] = [];

  GHOST_STORE_BLUEPRINTS.forEach((bp, index) => {
    const id = `ghost_${slugify(bp.name)}`;
    const plan = PLANS.find((p) => p.id === bp.planId);
    const [minGmv, maxGmv] = GHOST_GMV_BAND[bp.planId] ?? GHOST_GMV_BAND.plan_starter!;
    const [minAov, maxAov] = GHOST_AOV_BAND[bp.industry];
    // A closed or suspended tenant stopped trading; show the tail, not a peak.
    const activityScale =
      bp.status === "closed" ? 0.08 : bp.status === "suspended" ? 0.18 : bp.status === "paused" ? 0.35 : 1;
    const aov = major(rng.int(minAov, maxAov));
    const gmv = major(Math.round(rng.int(minGmv, maxGmv) * activityScale));
    // Never let the derived volume exceed what the plan entitles them to — and
    // stop just short of the cap, since the platform would have blocked the
    // order that crossed it rather than recording a suspiciously round total.
    const orderCeiling = Math.round((plan?.limits.monthlyOrders ?? 500) * 0.94);
    const orders = Math.min(orderCeiling, Math.max(4, Math.round(gmv / aov)));
    const store: Store = {
      id,
      name: bp.name,
      slug: slugify(bp.name),
      tagline: "Independent brand on Obsidian Commerce.",
      description: `${bp.name} runs its storefront, catalogue and fulfilment on the Obsidian platform.`,
      industry: bp.industry,
      status: bp.status,
      logoText: bp.name.toUpperCase(),
      logoMark: bp.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2),
      ownerId: `usr_owner_${id}`,
      planId: bp.planId,
      currency: "INR",
      country: "India",
      locale: "en-IN",
      timezone: "Asia/Kolkata",
      domain: `${slugify(bp.name)}.commerce.dev`,
      themeId: `theme_${id}`,
      supportEmail: `support@${slugify(bp.name)}.example`,
      supportPhone: "+91 80 4718 2200",
      createdAt: rng.pastDate(SEED_NOW, 20, 900).toISOString(),
      metrics: {
        gmv: orders * aov,
        orders,
        customers: rng.int(20, 4200),
        products: rng.int(18, 2400),
        conversionRate: rng.float(0.8, 4.6, 2),
        averageOrderValue: aov,
      },
      features: {
        marketplace: false,
        loyalty: bp.planId !== "plan_starter",
        subscriptions: false,
        aiAssistant: bp.planId !== "plan_starter",
        multiWarehouse: bp.planId === "plan_professional",
        b2b: false,
      },
    };
    stores.push(store);
    subscriptions.push(buildSubscription(store, SEED_NOW));
    void index;
  });

  return { stores, subscriptions };
}

export function buildPlatformDatabase(): PlatformDatabase {
  const stores = STORE_BLUEPRINTS.map(buildStoreDatabase);
  const ghosts = buildGhostStores();

  const allStores = [...stores.map((s) => s.store), ...ghosts.stores];
  const subscriptions = [...stores.map((s) => s.subscription), ...ghosts.subscriptions];
  const users = buildPlatformUsers(allStores, SEED_NOW);

  const platformAudit = buildAuditLog({
    storeId: null,
    actors: [
      { id: "usr_platform_root", name: "Subarna Mondal", type: "platform" },
      { id: "usr_platform_bot", name: "Billing Worker", type: "system" },
      { id: "usr_platform_ops", name: "Platform Ops", type: "platform" },
    ],
    referenceDate: SEED_NOW,
    count: 120,
  });

  const storesById = new Map(stores.map((s) => [s.store.id, s]));

  return {
    stores,
    storesById,
    allStores,
    plans: PLANS,
    users,
    subscriptions,
    auditLog: platformAudit,
    flagship: stores[0]!,
    generatedAt: SEED_NOW.toISOString(),
  };
}

/* ------------------------- Singleton accessor ------------------------ */

declare global {
  // eslint-disable-next-line no-var
  var __obsidianDb: { token: object; value: PlatformDatabase } | undefined;
}

/**
 * Identity of this module evaluation. It changes whenever the seed code (or
 * anything it imports) is recompiled, which is precisely when the cached
 * database is stale.
 */
const MODULE_TOKEN = {};

/**
 * Cached so the seed is generated exactly once per process — and, in dev,
 * once per recompile of the seed itself, so edits take effect without a
 * server restart while ordinary page edits keep the same data.
 */
export function getDatabase(): PlatformDatabase {
  if (!globalThis.__obsidianDb || globalThis.__obsidianDb.token !== MODULE_TOKEN) {
    globalThis.__obsidianDb = { token: MODULE_TOKEN, value: buildPlatformDatabase() };
  }
  return globalThis.__obsidianDb.value;
}
