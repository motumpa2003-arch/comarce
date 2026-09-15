import {
  recommend,
  searchCatalog,
  suggest,
  summariseStock,
  type CatalogQuery,
  type CatalogResult,
  type Category,
  type Customer,
  type Order,
  type Product,
  type RecommendationStrategy,
  type Review,
} from "@obsidian/commerce";
import { getDatabase, type StoreDatabase } from "./database";

/* ---------------------------- Store context -------------------------- */

export function listStoreDatabases(): StoreDatabase[] {
  return getDatabase().stores;
}

export function getStoreDb(storeIdOrSlug?: string): StoreDatabase {
  const db = getDatabase();
  if (!storeIdOrSlug) return db.flagship;
  return (
    db.storesById.get(storeIdOrSlug) ??
    db.stores.find((s) => s.store.slug === storeIdOrSlug) ??
    db.flagship
  );
}

export function listAllStores() {
  return getDatabase().allStores;
}

export function getPlans() {
  return getDatabase().plans;
}

export function getSubscriptions() {
  return getDatabase().subscriptions;
}

export function getPlatformUsers() {
  return getDatabase().users;
}

export function getPlatformAuditLog() {
  return getDatabase().auditLog;
}

/* ------------------------------ Catalogue ---------------------------- */

/** Descendant map so a parent-category filter includes every child. */
function categoryDescendants(categories: Category[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const category of categories) {
    if (!category.parentId) continue;
    const set = map.get(category.parentId) ?? new Set<string>();
    set.add(category.id);
    map.set(category.parentId, set);
  }
  return map;
}

export function queryCatalog(storeIdOrSlug: string | undefined, query: CatalogQuery): CatalogResult {
  const db = getStoreDb(storeIdOrSlug);
  return searchCatalog({
    products: db.products,
    query,
    attributes: db.attributes,
    brands: db.brands,
    categories: db.categories,
    categoryDescendants: categoryDescendants(db.categories),
  });
}

export function suggestCatalog(storeIdOrSlug: string | undefined, term: string, limit = 8) {
  const db = getStoreDb(storeIdOrSlug);
  return suggest(term, { products: db.products, brands: db.brands, categories: db.categories }, limit);
}

export function getProductBySlug(storeIdOrSlug: string | undefined, slug: string): Product | undefined {
  return getStoreDb(storeIdOrSlug).products.find((p) => p.slug === slug);
}

export function getProductById(storeIdOrSlug: string | undefined, id: string): Product | undefined {
  return getStoreDb(storeIdOrSlug).products.find((p) => p.id === id);
}

export function getProductsByIds(storeIdOrSlug: string | undefined, ids: string[]): Product[] {
  const db = getStoreDb(storeIdOrSlug);
  const set = new Set(ids);
  const found = db.products.filter((p) => set.has(p.id));
  // Preserve the requested order — recently-viewed rails depend on it.
  return ids.map((id) => found.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
}

export function getCategoryBySlug(storeIdOrSlug: string | undefined, slug: string): Category | undefined {
  return getStoreDb(storeIdOrSlug).categories.find((c) => c.slug === slug);
}

export function getCategoryTree(storeIdOrSlug?: string) {
  const db = getStoreDb(storeIdOrSlug);
  return db.categories
    .filter((c) => c.level === 0)
    .map((parent) => ({
      ...parent,
      children: db.categories.filter((c) => c.parentId === parent.id),
    }));
}

export function getBrandBySlug(storeIdOrSlug: string | undefined, slug: string) {
  return getStoreDb(storeIdOrSlug).brands.find((b) => b.slug === slug);
}

export function getCollectionBySlug(storeIdOrSlug: string | undefined, slug: string) {
  return getStoreDb(storeIdOrSlug).collections.find((c) => c.slug === slug);
}

export function getAttributeDefinition(storeIdOrSlug: string | undefined, key: string) {
  return getStoreDb(storeIdOrSlug).attributes.find((a) => a.key === key);
}

/* --------------------------- Merchandising --------------------------- */

export function getRecommendations(
  storeIdOrSlug: string | undefined,
  strategy: RecommendationStrategy,
  options: { seedProductId?: string; recentlyViewedIds?: string[]; purchasedIds?: string[]; limit?: number } = {},
): Product[] {
  const db = getStoreDb(storeIdOrSlug);
  return recommend({
    strategy,
    products: db.products,
    seed: options.seedProductId ? db.products.find((p) => p.id === options.seedProductId) : undefined,
    orders: db.orders,
    recentlyViewedIds: options.recentlyViewedIds,
    purchasedIds: options.purchasedIds,
    limit: options.limit ?? 8,
  });
}

export function getFeaturedProducts(storeIdOrSlug: string | undefined, limit = 12): Product[] {
  const db = getStoreDb(storeIdOrSlug);
  return db.products
    .filter((p) => p.status === "active" && p.flags.featured)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, limit);
}

export function getProductsByFlag(
  storeIdOrSlug: string | undefined,
  flag: "featured" | "isNew" | "bestseller" | "onSale" | "exclusive" | "limited",
  limit = 12,
): Product[] {
  const db = getStoreDb(storeIdOrSlug);
  return db.products
    .filter((p) => p.status === "active" && p.flags[flag])
    .sort((a, b) => (flag === "isNew" ? Date.parse(b.publishedAt) - Date.parse(a.publishedAt) : b.unitsSold - a.unitsSold))
    .slice(0, limit);
}

export function getCollectionProducts(storeIdOrSlug: string | undefined, collectionId: string, limit = 12): Product[] {
  const db = getStoreDb(storeIdOrSlug);
  return db.products
    .filter((p) => p.status === "active" && p.collectionIds.includes(collectionId))
    .slice(0, limit);
}

export function getDealProducts(storeIdOrSlug: string | undefined, limit = 24): Product[] {
  const db = getStoreDb(storeIdOrSlug);
  return db.products
    .filter((p) => p.status === "active" && p.compareAtPrice && p.compareAtPrice > p.price)
    .sort((a, b) => {
      const da = (a.compareAtPrice! - a.price) / a.compareAtPrice!;
      const dbb = (b.compareAtPrice! - b.price) / b.compareAtPrice!;
      return dbb - da;
    })
    .slice(0, limit);
}

/* ------------------------------ Reviews ------------------------------ */

export function getProductReviews(storeIdOrSlug: string | undefined, productId: string, limit = 20): Review[] {
  return getStoreDb(storeIdOrSlug)
    .reviews.filter((r) => r.productId === productId && r.status === "approved")
    .slice(0, limit);
}

export function getProductQuestions(storeIdOrSlug: string | undefined, productId: string) {
  return getStoreDb(storeIdOrSlug).questions.filter((q) => q.productId === productId);
}

export function getTopReviews(storeIdOrSlug: string | undefined, limit = 9): Review[] {
  return getStoreDb(storeIdOrSlug)
    .reviews.filter((r) => r.status === "approved" && r.rating >= 4 && r.body.length > 120)
    .sort((a, b) => b.helpfulCount - a.helpfulCount)
    .slice(0, limit);
}


/** Per-product performance, derived from the seeded signals. */
export function getProductAnalyticsFor(storeIdOrSlug: string | undefined, productId: string) {
  const db = getStoreDb(storeIdOrSlug);
  const product = db.products.find((p) => p.id === productId);
  if (!product) {
    return { views: 0, uniqueVisitors: 0, addToCart: 0, purchases: 0, conversionRate: 0, revenue: 0, returns: 0, wishlistAdds: 0 };
  }

  const orderedItems = db.orders.flatMap((o) => o.items).filter((i) => i.productId === productId);
  const purchases = orderedItems.reduce((n, i) => n + i.quantity, 0);
  const revenue = orderedItems.reduce((n, i) => n + i.total, 0);
  const uniqueVisitors = Math.round(product.views * 0.68);
  const addToCart = Math.round(uniqueVisitors * 0.14);
  const returned = db.returns
    .flatMap((r) => r.items)
    .filter((i) => i.productId === productId)
    .reduce((n, i) => n + i.quantity, 0);

  return {
    views: product.views,
    uniqueVisitors,
    addToCart,
    purchases: Math.max(purchases, 0),
    conversionRate: uniqueVisitors ? Number(((purchases / uniqueVisitors) * 100).toFixed(2)) : 0,
    revenue,
    returns: returned,
    wishlistAdds: product.wishlistCount,
  };
}

/* ------------------------------ Inventory ---------------------------- */

export function getVariantStock(storeIdOrSlug: string | undefined, variantId: string) {
  const db = getStoreDb(storeIdOrSlug);
  const records = db.inventory.filter((r) => r.variantId === variantId);
  return summariseStock(records);
}

export function getProductInventory(storeIdOrSlug: string | undefined, productId: string) {
  return getStoreDb(storeIdOrSlug).inventory.filter((r) => r.productId === productId);
}

/**
 * Variants at or below their reorder point, aggregated across locations —
 * a SKU that is low in three warehouses is one problem, not three rows.
 */
export function getLowStockRecords(storeIdOrSlug?: string) {
  const db = getStoreDb(storeIdOrSlug);
  const byVariant = new Map<string, (typeof db.inventory)[number]>();

  for (const record of db.inventory) {
    const existing = byVariant.get(record.variantId);
    if (!existing) {
      byVariant.set(record.variantId, { ...record });
      continue;
    }
    existing.onHand += record.onHand;
    existing.reserved += record.reserved;
    existing.incoming += record.incoming;
    existing.reorderPoint = Math.max(existing.reorderPoint, record.reorderPoint);
  }

  return [...byVariant.values()]
    .filter((r) => r.onHand - r.reserved <= r.reorderPoint)
    .sort((a, b) => a.onHand - a.reserved - (b.onHand - b.reserved));
}

/* ------------------------------- Orders ------------------------------ */

export function getOrderById(storeIdOrSlug: string | undefined, id: string): Order | undefined {
  return getStoreDb(storeIdOrSlug).orders.find((o) => o.id === id);
}

export function getOrderByNumber(storeIdOrSlug: string | undefined, orderNumber: string): Order | undefined {
  const target = orderNumber.trim().toUpperCase();
  return getStoreDb(storeIdOrSlug).orders.find((o) => o.orderNumber.toUpperCase() === target);
}

export function getCustomerOrders(storeIdOrSlug: string | undefined, customerId: string): Order[] {
  return getStoreDb(storeIdOrSlug).orders.filter((o) => o.customerId === customerId);
}

export function getReturnForOrder(storeIdOrSlug: string | undefined, orderId: string) {
  return getStoreDb(storeIdOrSlug).returns.find((r) => r.orderId === orderId);
}

export function getShipmentForOrder(storeIdOrSlug: string | undefined, orderId: string) {
  return getStoreDb(storeIdOrSlug).shipments.find((s) => s.orderId === orderId);
}

/* ------------------------------ Customers ---------------------------- */

export function getCustomerById(storeIdOrSlug: string | undefined, id: string): Customer | undefined {
  return getStoreDb(storeIdOrSlug).customers.find((c) => c.id === id);
}

/**
 * The signed-in shopper for the storefront demo: a repeat customer with a
 * varied order history so account, tracking and returns all have content.
 */
/**
 * The account the storefront demo signs you in as.
 *
 * Chosen to exercise as much of the account area as possible: several orders in
 * different states, at least one return, a review and a support ticket. A demo
 * customer with no tickets leaves the ticket detail page unreachable, which
 * reads as a dead end rather than as an empty state.
 */
export function getDemoCustomer(storeIdOrSlug?: string): Customer {
  const db = getStoreDb(storeIdOrSlug);
  const ranked = [...db.customers]
    .map((customer) => ({
      customer,
      orders: db.orders.filter((o) => o.customerId === customer.id),
      tickets: db.tickets.filter((t) => t.customerId === customer.id).length,
      returns: db.returns.filter((r) => r.customerId === customer.id).length,
      reviews: db.reviews.filter((r) => r.customerId === customer.id).length,
    }))
    .filter((entry) => entry.orders.length >= 3)
    .sort((a, b) => {
      // Coverage first — how many distinct surfaces this account can demonstrate.
      const coverageA = Number(a.tickets > 0) + Number(a.returns > 0) + Number(a.reviews > 0);
      const coverageB = Number(b.tickets > 0) + Number(b.returns > 0) + Number(b.reviews > 0);
      if (coverageB !== coverageA) return coverageB - coverageA;

      const varietyA = new Set(a.orders.map((o) => o.status)).size;
      const varietyB = new Set(b.orders.map((o) => o.status)).size;
      return varietyB - varietyA || b.orders.length - a.orders.length;
    });
  return ranked[0]?.customer ?? db.customers[0]!;
}

export function getDemoStaffMember(storeIdOrSlug?: string) {
  return getStoreDb(storeIdOrSlug).staff[0]!;
}

/* ------------------------------ Content ------------------------------ */

export function getMenu(storeIdOrSlug: string | undefined, handle: string) {
  return getStoreDb(storeIdOrSlug).menus.find((m) => m.handle === handle);
}

export function getPageBySlug(storeIdOrSlug: string | undefined, slug: string) {
  return getStoreDb(storeIdOrSlug).pages.find((p) => p.slug === slug);
}

export function getBlogPostBySlug(storeIdOrSlug: string | undefined, slug: string) {
  return getStoreDb(storeIdOrSlug).blogPosts.find((p) => p.slug === slug);
}

/* ------------------------------ Coupons ------------------------------ */

export function getCouponByCode(storeIdOrSlug: string | undefined, code: string) {
  const target = code.trim().toUpperCase();
  return getStoreDb(storeIdOrSlug).coupons.find((c) => c.code.toUpperCase() === target);
}

export function getActiveCoupons(storeIdOrSlug?: string) {
  return getStoreDb(storeIdOrSlug).coupons.filter((c) => c.status === "active");
}
