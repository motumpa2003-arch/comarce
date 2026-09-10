import type { CatalogQuery, SortKey } from "@obsidian/commerce";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

const RESERVED = new Set(["q", "sort", "page", "brand", "cat", "col", "min", "max", "rating", "avail", "view"]);

const SORT_KEYS: SortKey[] = [
  "relevance",
  "featured",
  "newest",
  "price_asc",
  "price_desc",
  "rating",
  "popularity",
  "discount",
];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function list(value: string | string[] | undefined): string[] {
  const raw = first(value);
  if (!raw) return [];
  return raw.split(",").map((v) => v.trim()).filter(Boolean);
}

/**
 * The URL is the single source of truth for catalogue state, so filters are
 * shareable, back/forward works, and the server can render the exact result.
 */
export function parseCatalogParams(params: SearchParamsInput): CatalogQuery & { view: "grid" | "list" } {
  const attributes: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!key.startsWith("a_")) continue;
    const values = list(value);
    if (values.length) attributes[key.slice(2)] = values;
  }

  const availability = list(params.avail);
  const sortRaw = first(params.sort) as SortKey | undefined;

  return {
    q: first(params.q)?.trim() || undefined,
    sort: sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : undefined,
    page: Math.max(1, Number(first(params.page) ?? 1) || 1),
    pageSize: 24,
    brandIds: list(params.brand),
    categoryIds: list(params.cat),
    collectionIds: list(params.col),
    minPrice: numberOrUndefined(first(params.min)),
    maxPrice: numberOrUndefined(first(params.max)),
    minRating: numberOrUndefined(first(params.rating)),
    inStock: availability.includes("in_stock") || undefined,
    onSale: availability.includes("on_sale") || undefined,
    flags: [
      ...(availability.includes("new") ? (["isNew"] as const) : []),
      ...(availability.includes("bestseller") ? (["bestseller"] as const) : []),
    ],
    attributes: Object.keys(attributes).length ? attributes : undefined,
    view: first(params.view) === "list" ? "list" : "grid",
  };
}

function numberOrUndefined(value?: string): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Rebuilds a query string from the current params plus a patch. */
export function buildCatalogHref(
  basePath: string,
  current: URLSearchParams,
  patch: Record<string, string | string[] | null>,
): string {
  const next = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(patch)) {
    if (value == null || (Array.isArray(value) && value.length === 0) || value === "") {
      next.delete(key);
    } else {
      next.set(key, Array.isArray(value) ? value.join(",") : value);
    }
  }

  // Any filter change invalidates the current page.
  if (!("page" in patch)) next.delete("page");
  if (next.get("page") === "1") next.delete("page");

  const query = next.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function toggleInParam(current: URLSearchParams, key: string, value: string): string[] {
  const existing = (current.get(key) ?? "").split(",").filter(Boolean);
  return existing.includes(value) ? existing.filter((v) => v !== value) : [...existing, value];
}

/** Human-readable chips for the applied-filters row. */
export interface AppliedFilter {
  key: string;
  value: string;
  label: string;
}

export function appliedFilters(
  params: URLSearchParams,
  lookup: {
    brands: { id: string; name: string }[];
    categories: { id: string; name: string }[];
    facetLabels: Record<string, { label: string; values: Record<string, string> }>;
  },
): AppliedFilter[] {
  const chips: AppliedFilter[] = [];

  for (const id of (params.get("brand") ?? "").split(",").filter(Boolean)) {
    chips.push({ key: "brand", value: id, label: lookup.brands.find((b) => b.id === id)?.name ?? id });
  }
  for (const id of (params.get("cat") ?? "").split(",").filter(Boolean)) {
    chips.push({ key: "cat", value: id, label: lookup.categories.find((c) => c.id === id)?.name ?? id });
  }
  for (const value of (params.get("avail") ?? "").split(",").filter(Boolean)) {
    const labels: Record<string, string> = {
      in_stock: "In stock",
      on_sale: "On sale",
      new: "New arrivals",
      bestseller: "Bestsellers",
    };
    chips.push({ key: "avail", value, label: labels[value] ?? value });
  }
  const rating = params.get("rating");
  if (rating) chips.push({ key: "rating", value: rating, label: `${rating}★ & above` });

  const min = params.get("min");
  const max = params.get("max");
  if (min || max) {
    const fmt = (v: string) => `₹${Math.round(Number(v) / 100).toLocaleString("en-IN")}`;
    chips.push({
      key: "price",
      value: "range",
      label: min && max ? `${fmt(min)} – ${fmt(max)}` : min ? `Above ${fmt(min)}` : `Under ${fmt(max!)}`,
    });
  }

  for (const [key, raw] of params.entries()) {
    if (!key.startsWith("a_")) continue;
    const facetKey = key.slice(2);
    const meta = lookup.facetLabels[facetKey];
    for (const value of raw.split(",").filter(Boolean)) {
      chips.push({ key, value, label: meta?.values[value] ?? value });
    }
  }

  return chips;
}

export { RESERVED as RESERVED_PARAMS };
