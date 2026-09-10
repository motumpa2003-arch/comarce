import type { AttributeDefinition, Brand, Category, Product } from "../types/catalog";
import type { Money } from "../types/primitives";

/* ------------------------------ Sorting ----------------------------- */

export type SortKey =
  | "relevance"
  | "featured"
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "popularity"
  | "discount";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "newest", label: "New arrivals" },
  { key: "popularity", label: "Best selling" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
  { key: "rating", label: "Customer rating" },
  { key: "discount", label: "Biggest discount" },
];

/* ------------------------------- Query ------------------------------ */

export interface CatalogQuery {
  q?: string;
  categoryIds?: string[];
  /** Include descendants of the given category slugs/ids. */
  categoryPath?: string;
  brandIds?: string[];
  collectionIds?: string[];
  tags?: string[];
  minPrice?: Money;
  maxPrice?: Money;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  flags?: ("featured" | "isNew" | "bestseller" | "onSale" | "exclusive" | "limited")[];
  /** Dynamic attribute facets keyed by AttributeDefinition.key. */
  attributes?: Record<string, string[]>;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface FacetValue {
  value: string;
  label: string;
  count: number;
  swatch?: string;
}

export interface Facet {
  key: string;
  label: string;
  type: "checkbox" | "swatch" | "range" | "rating";
  values: FacetValue[];
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  facets: Facet[];
  priceRange: { min: Money; max: Money };
  appliedCount: number;
}

/* ---------------------------- Text search --------------------------- */

const STOPWORDS = new Set(["the", "a", "an", "for", "and", "with", "of", "in", "to"]);

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9₹.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

/** Bounded Levenshtein — returns `limit + 1` as soon as it exceeds the budget. */
export function editDistance(a: string, b: string, limit = 2): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(curr[j - 1]! + 1, prev[j]! + 1, prev[j - 1]! + cost);
      curr.push(value);
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > limit) return limit + 1;
    prev = curr;
  }
  return prev[b.length]!;
}

function fieldScore(token: string, field: string, weight: number): number {
  if (!field) return 0;
  const haystack = field.toLowerCase();
  if (haystack === token) return weight * 3;
  if (haystack.startsWith(token)) return weight * 2;
  if (haystack.includes(token)) return weight;
  // Typo tolerance only for longer tokens, matched per word.
  if (token.length >= 4) {
    for (const word of haystack.split(/[\s-]+/)) {
      if (word.length >= 4 && editDistance(token, word, 1) <= 1) return weight * 0.6;
    }
  }
  return 0;
}

export function scoreProduct(
  product: Product,
  tokens: string[],
  brandName?: string,
  categoryName?: string,
): number {
  if (tokens.length === 0) return 0;
  let score = 0;
  for (const token of tokens) {
    const tokenScore =
      fieldScore(token, product.name, 6) +
      fieldScore(token, brandName ?? "", 4) +
      fieldScore(token, categoryName ?? "", 3) +
      fieldScore(token, product.tags.join(" "), 2.5) +
      fieldScore(token, product.shortDescription, 1.5) +
      fieldScore(token, product.sku, 3) +
      fieldScore(token, Object.values(product.attributes).join(" "), 1.5);
    if (tokenScore === 0) return 0; // every token must match somewhere
    score += tokenScore;
  }
  // Blend in merchandising signals so equal text matches rank sensibly.
  return score + product.rating.average * 0.8 + Math.log10(product.unitsSold + 1) * 1.2;
}

/* ------------------------------ Filtering --------------------------- */

type Predicate = (p: Product) => boolean;

function buildPredicates(
  query: CatalogQuery,
  categoryDescendants: Map<string, Set<string>>,
): Record<string, Predicate> {
  const preds: Record<string, Predicate> = {};

  if (query.categoryIds?.length) {
    const allowed = new Set<string>();
    for (const id of query.categoryIds) {
      allowed.add(id);
      for (const child of categoryDescendants.get(id) ?? []) allowed.add(child);
    }
    preds.category = (p) => allowed.has(p.categoryId) || p.categoryPath.some((c) => allowed.has(c));
  }
  if (query.brandIds?.length) {
    const set = new Set(query.brandIds);
    preds.brand = (p) => !!p.brandId && set.has(p.brandId);
  }
  if (query.collectionIds?.length) {
    const set = new Set(query.collectionIds);
    preds.collection = (p) => p.collectionIds.some((c) => set.has(c));
  }
  if (query.tags?.length) {
    const set = new Set(query.tags.map((t) => t.toLowerCase()));
    preds.tags = (p) => p.tags.some((t) => set.has(t.toLowerCase()));
  }
  if (query.minPrice != null || query.maxPrice != null) {
    const min = query.minPrice ?? 0;
    const max = query.maxPrice ?? Number.MAX_SAFE_INTEGER;
    preds.price = (p) => p.price >= min && p.price <= max;
  }
  if (query.minRating) {
    preds.rating = (p) => p.rating.average >= query.minRating!;
  }
  if (query.inStock) {
    preds.stock = (p) => p.totalStock > 0;
  }
  if (query.onSale) {
    preds.sale = (p) => p.flags.onSale;
  }
  if (query.flags?.length) {
    preds.flags = (p) => query.flags!.every((f) => p.flags[f]);
  }
  if (query.attributes) {
    for (const [key, values] of Object.entries(query.attributes)) {
      if (!values?.length) continue;
      const set = new Set(values.map((v) => v.toLowerCase()));
      preds[`attr:${key}`] = (p) => {
        const raw = p.attributes[key];
        if (raw == null) {
          // Fall back to variant options so colour/size facets work even when
          // the value only exists at variant level.
          return p.variants.some((v) => set.has(String(v.options[key] ?? "").toLowerCase()));
        }
        if (Array.isArray(raw)) return raw.some((v) => set.has(String(v).toLowerCase()));
        return set.has(String(raw).toLowerCase());
      };
    }
  }
  return preds;
}

function passesAll(product: Product, preds: Record<string, Predicate>, skipKey?: string): boolean {
  for (const [key, pred] of Object.entries(preds)) {
    if (key === skipKey) continue;
    if (!pred(product)) return false;
  }
  return true;
}

/* ------------------------------ Sorting ----------------------------- */

function applySort(items: Product[], sort: SortKey, scores: Map<string, number>): Product[] {
  const sorted = [...items];
  switch (sort) {
    case "relevance":
      sorted.sort((a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0));
      break;
    case "price_asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      sorted.sort((a, b) => b.rating.average - a.rating.average || b.rating.count - a.rating.count);
      break;
    case "newest":
      sorted.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
      break;
    case "popularity":
      sorted.sort((a, b) => b.unitsSold - a.unitsSold);
      break;
    case "discount":
      sorted.sort(
        (a, b) =>
          discountRatio(b) - discountRatio(a) || b.rating.average - a.rating.average,
      );
      break;
    case "featured":
    default:
      sorted.sort(
        (a, b) =>
          Number(b.flags.featured) - Number(a.flags.featured) ||
          b.unitsSold - a.unitsSold ||
          b.rating.average - a.rating.average,
      );
      break;
  }
  return sorted;
}

function discountRatio(p: Product): number {
  if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
  return (p.compareAtPrice - p.price) / p.compareAtPrice;
}

/* ------------------------------- Facets ----------------------------- */

/** Upper bound on dynamic attribute facets rendered in one filter panel. */
const MAX_ATTRIBUTE_FACETS = 8;

export interface FacetContext {
  attributes: AttributeDefinition[];
  brands: Brand[];
  categories: Category[];
}

function buildFacets(
  all: Product[],
  preds: Record<string, Predicate>,
  ctx: FacetContext,
  query: CatalogQuery,
): Facet[] {
  const facets: Facet[] = [];

  // Category facet — counts computed ignoring the category filter itself.
  const catPool = all.filter((p) => passesAll(p, preds, "category"));
  const catCounts = new Map<string, number>();
  for (const p of catPool) catCounts.set(p.categoryId, (catCounts.get(p.categoryId) ?? 0) + 1);
  const catValues = ctx.categories
    .filter((c) => catCounts.has(c.id))
    .map((c) => ({ value: c.id, label: c.name, count: catCounts.get(c.id)! }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 14);
  if (catValues.length > 1) {
    facets.push({ key: "category", label: "Category", type: "checkbox", values: catValues });
  }

  // Brand facet
  const brandPool = all.filter((p) => passesAll(p, preds, "brand"));
  const brandCounts = new Map<string, number>();
  for (const p of brandPool) {
    if (p.brandId) brandCounts.set(p.brandId, (brandCounts.get(p.brandId) ?? 0) + 1);
  }
  const brandValues = ctx.brands
    .filter((b) => brandCounts.has(b.id))
    .map((b) => ({ value: b.id, label: b.name, count: brandCounts.get(b.id)! }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);
  if (brandValues.length > 1) {
    facets.push({ key: "brand", label: "Brand", type: "checkbox", values: brandValues });
  }

  // Dynamic attribute facets — only those relevant to the current result set.
  // A universal catalogue can define fifty attributes across ten industries;
  // only the ones that actually describe most of these results are useful, so
  // rank by coverage and keep the strongest few.
  const attrPoolBase = all.filter((p) => passesAll(p, preds, undefined));
  const attributeFacets: { facet: Facet; coverage: number }[] = [];
  for (const def of ctx.attributes) {
    if (!def.filterable) continue;
    const skipKey = `attr:${def.key}`;
    const pool = skipKey in preds ? all.filter((p) => passesAll(p, preds, skipKey)) : attrPoolBase;
    const counts = new Map<string, number>();
    for (const p of pool) {
      for (const value of extractAttributeValues(p, def.key)) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }
    if (counts.size < 2) continue;
    const values: FacetValue[] = [...counts.entries()]
      .map(([value, count]) => {
        const option = def.options?.find((o) => o.value.toLowerCase() === value.toLowerCase());
        return {
          value,
          label: option?.label ?? titleCase(value),
          count,
          swatch: option?.swatch,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 18);
    const coverage = pool.length ? [...counts.values()].reduce((a, b) => a + b, 0) / pool.length : 0;
    attributeFacets.push({
      coverage,
      facet: {
        key: def.key,
        label: def.label,
        type: def.inputType === "color" ? "swatch" : "checkbox",
        values,
      },
    });
  }

  const applied = new Set(
    Object.keys(query.attributes ?? {}).filter((k) => (query.attributes?.[k]?.length ?? 0) > 0),
  );
  const ranked = attributeFacets
    .sort((a, b) => b.coverage - a.coverage)
    .filter((entry, index) => index < MAX_ATTRIBUTE_FACETS || applied.has(entry.facet.key))
    .filter((entry) => entry.coverage >= 0.06 || applied.has(entry.facet.key));
  facets.push(...ranked.map((entry) => entry.facet));

  // Rating facet
  const ratingPool = all.filter((p) => passesAll(p, preds, "rating"));
  const ratingValues = [4, 3, 2].map((min) => ({
    value: String(min),
    label: `${min} & above`,
    count: ratingPool.filter((p) => p.rating.average >= min).length,
  })).filter((v) => v.count > 0);
  if (ratingValues.length) {
    facets.push({ key: "rating", label: "Customer rating", type: "rating", values: ratingValues });
  }

  // Availability / merchandising flags
  const flagPool = all.filter((p) => passesAll(p, preds, "sale"));
  const flagValues: FacetValue[] = [
    { value: "in_stock", label: "In stock", count: flagPool.filter((p) => p.totalStock > 0).length },
    { value: "on_sale", label: "On sale", count: flagPool.filter((p) => p.flags.onSale).length },
    { value: "new", label: "New arrivals", count: flagPool.filter((p) => p.flags.isNew).length },
    { value: "bestseller", label: "Bestsellers", count: flagPool.filter((p) => p.flags.bestseller).length },
  ].filter((v) => v.count > 0);
  if (flagValues.length) {
    facets.push({ key: "availability", label: "Availability", type: "checkbox", values: flagValues });
  }

  return facets;
}

function extractAttributeValues(product: Product, key: string): string[] {
  const raw = product.attributes[key];
  if (raw != null) {
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === "boolean") return raw ? [key] : [];
    return [String(raw)];
  }
  const fromVariants = new Set<string>();
  for (const variant of product.variants) {
    const value = variant.options[key];
    if (value) fromVariants.add(value);
  }
  return [...fromVariants];
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ------------------------------- Runner ----------------------------- */

export interface SearchCatalogInput extends FacetContext {
  products: Product[];
  query: CatalogQuery;
  categoryDescendants?: Map<string, Set<string>>;
}

export function searchCatalog({
  products,
  query,
  attributes,
  brands,
  categories,
  categoryDescendants = new Map(),
}: SearchCatalogInput): CatalogResult {
  const active = products.filter((p) => p.status === "active");
  const tokens = query.q ? tokenize(query.q) : [];

  const brandName = new Map(brands.map((b) => [b.id, b.name]));
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  const scores = new Map<string, number>();
  let pool = active;
  if (tokens.length) {
    pool = [];
    for (const product of active) {
      const score = scoreProduct(
        product,
        tokens,
        product.brandId ? brandName.get(product.brandId) : undefined,
        categoryName.get(product.categoryId),
      );
      if (score > 0) {
        scores.set(product.id, score);
        pool.push(product);
      }
    }
  }

  const preds = buildPredicates(query, categoryDescendants);
  const filtered = pool.filter((p) => passesAll(p, preds));

  const sort = query.sort ?? (tokens.length ? "relevance" : "featured");
  const sorted = applySort(filtered, sort, scores);

  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 24;
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const items = sorted.slice((page - 1) * pageSize, page * pageSize);

  const prices = pool.map((p) => p.price);
  const priceRange = {
    min: prices.length ? Math.min(...prices) : 0,
    max: prices.length ? Math.max(...prices) : 0,
  };

  const appliedCount =
    (query.brandIds?.length ?? 0) +
    (query.categoryIds?.length ?? 0) +
    (query.collectionIds?.length ?? 0) +
    (query.minRating ? 1 : 0) +
    (query.inStock ? 1 : 0) +
    (query.onSale ? 1 : 0) +
    (query.minPrice != null || query.maxPrice != null ? 1 : 0) +
    Object.values(query.attributes ?? {}).reduce((n, v) => n + (v?.length ?? 0), 0);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount,
    facets: buildFacets(pool, preds, { attributes, brands, categories }, query),
    priceRange,
    appliedCount,
  };
}

/* --------------------------- Autocomplete --------------------------- */

export interface Suggestion {
  type: "product" | "category" | "brand" | "collection" | "query";
  id: string;
  label: string;
  sublabel?: string;
  image?: string;
  href: string;
}

export function suggest(
  term: string,
  { products, brands, categories }: { products: Product[]; brands: Brand[]; categories: Category[] },
  limit = 8,
): Suggestion[] {
  const tokens = tokenize(term);
  if (!tokens.length) return [];
  const out: Suggestion[] = [];

  for (const category of categories) {
    if (out.length >= 3) break;
    if (tokens.every((t) => category.name.toLowerCase().includes(t))) {
      out.push({
        type: "category",
        id: category.id,
        label: category.name,
        sublabel: `${category.productCount} products`,
        href: `/category/${category.slug}`,
      });
    }
  }
  for (const brand of brands) {
    if (out.length >= 5) break;
    if (tokens.every((t) => brand.name.toLowerCase().includes(t))) {
      out.push({
        type: "brand",
        id: brand.id,
        label: brand.name,
        sublabel: "Brand",
        image: brand.logo,
        href: `/brand/${brand.slug}`,
      });
    }
  }

  const scored = products
    .filter((p) => p.status === "active")
    .map((p) => ({ p, score: scoreProduct(p, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit - out.length);

  for (const { p } of scored) {
    out.push({
      type: "product",
      id: p.id,
      label: p.name,
      sublabel: p.shortDescription,
      image: p.media[0]?.url,
      href: `/product/${p.slug}`,
    });
  }
  return out.slice(0, limit);
}
