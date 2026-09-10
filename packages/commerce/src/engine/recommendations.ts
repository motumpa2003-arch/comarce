import type { Product } from "../types/catalog";
import type { Order } from "../types/commerce";

export type RecommendationStrategy =
  | "similar"
  | "complete_the_look"
  | "frequently_bought_together"
  | "also_bought"
  | "trending"
  | "popular"
  | "recently_viewed"
  | "for_you";

export interface RecommendationRequest {
  strategy: RecommendationStrategy;
  products: Product[];
  seed?: Product;
  orders?: Order[];
  recentlyViewedIds?: string[];
  purchasedIds?: string[];
  limit?: number;
}

/**
 * Rule-based recommendation layer. Deliberately deterministic so the same
 * page renders identically on the server and the client; the interface is
 * shaped so an ML-backed ranker can replace the body later.
 */
export function recommend({
  strategy,
  products,
  seed,
  orders = [],
  recentlyViewedIds = [],
  purchasedIds = [],
  limit = 8,
}: RecommendationRequest): Product[] {
  const pool = products.filter((p) => p.status === "active" && p.id !== seed?.id);

  switch (strategy) {
    case "similar": {
      if (!seed) return topBy(pool, (p) => p.unitsSold, limit);
      return topBy(pool, (p) => similarityScore(seed, p), limit);
    }

    case "complete_the_look": {
      if (!seed) return topBy(pool, (p) => p.unitsSold, limit);
      // Same industry, different category — accessories to the hero item.
      return topBy(
        pool.filter((p) => p.industry === seed.industry && p.categoryId !== seed.categoryId),
        (p) => p.rating.average * 2 + Math.log10(p.unitsSold + 1) - priceDistance(seed, p),
        limit,
      );
    }

    case "frequently_bought_together": {
      if (!seed) return topBy(pool, (p) => p.unitsSold, limit);
      const co = coOccurrence(orders, seed.id);
      const scored = pool.map((p) => ({
        p,
        score: (co.get(p.id) ?? 0) * 10 + (p.industry === seed.industry ? 2 : 0) - priceDistance(seed, p) * 0.5,
      }));
      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((s) => s.p);
    }

    case "also_bought": {
      const co = new Map<string, number>();
      for (const order of orders) {
        for (const item of order.items) {
          co.set(item.productId, (co.get(item.productId) ?? 0) + item.quantity);
        }
      }
      return topBy(pool, (p) => co.get(p.id) ?? 0, limit);
    }

    case "trending":
      return topBy(
        pool,
        (p) => p.views * 0.4 + p.unitsSold * 3 + p.wishlistCount * 1.5 + (p.flags.isNew ? 40 : 0),
        limit,
      );

    case "popular":
      return topBy(pool, (p) => p.unitsSold * 2 + p.rating.count, limit);

    case "recently_viewed": {
      const order = new Map(recentlyViewedIds.map((id, i) => [id, recentlyViewedIds.length - i]));
      return pool
        .filter((p) => order.has(p.id))
        .sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0))
        .slice(0, limit);
    }

    case "for_you": {
      const affinity = new Map<string, number>();
      for (const id of [...recentlyViewedIds, ...purchasedIds]) {
        const source = products.find((p) => p.id === id);
        if (!source) continue;
        affinity.set(source.categoryId, (affinity.get(source.categoryId) ?? 0) + 1);
        if (source.brandId) affinity.set(source.brandId, (affinity.get(source.brandId) ?? 0) + 0.6);
      }
      if (affinity.size === 0) return topBy(pool, (p) => p.unitsSold, limit);
      return topBy(
        pool.filter((p) => !purchasedIds.includes(p.id)),
        (p) =>
          (affinity.get(p.categoryId) ?? 0) * 4 +
          (p.brandId ? (affinity.get(p.brandId) ?? 0) * 3 : 0) +
          p.rating.average,
        limit,
      );
    }

    default:
      return pool.slice(0, limit);
  }
}

function topBy(items: Product[], score: (p: Product) => number, limit: number): Product[] {
  return items
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || a.p.id.localeCompare(b.p.id))
    .slice(0, limit)
    .map((x) => x.p);
}

function similarityScore(a: Product, b: Product): number {
  let score = 0;
  if (a.categoryId === b.categoryId) score += 10;
  else if (a.categoryPath.some((c) => b.categoryPath.includes(c))) score += 5;
  if (a.brandId && a.brandId === b.brandId) score += 4;
  if (a.industry === b.industry) score += 3;
  const sharedTags = a.tags.filter((t) => b.tags.includes(t)).length;
  score += sharedTags * 1.5;
  const sharedCollections = a.collectionIds.filter((c) => b.collectionIds.includes(c)).length;
  score += sharedCollections * 2;
  score -= priceDistance(a, b) * 3;
  score += b.rating.average * 0.5;
  return score;
}

/** 0 when identically priced, approaching 1 as prices diverge. */
function priceDistance(a: Product, b: Product): number {
  const max = Math.max(a.price, b.price, 1);
  return Math.min(1, Math.abs(a.price - b.price) / max);
}

function coOccurrence(orders: Order[], productId: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const order of orders) {
    if (!order.items.some((i) => i.productId === productId)) continue;
    for (const item of order.items) {
      if (item.productId === productId) continue;
      counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
    }
  }
  return counts;
}
