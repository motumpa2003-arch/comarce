import {
  discountPercent,
  type Brand,
  type Category,
  type Product,
  type ProductVariant,
} from "@obsidian/commerce";
import type { BadgeTone } from "@obsidian/ui";
import type { StoreDatabase } from "@obsidian/data";

export interface ProductCardSwatch {
  value: string;
  label: string;
  swatch?: string;
  image?: string;
}

/**
 * The minimal, serialisable shape a product card needs.
 *
 * Product records carry descriptions, full variant matrices and SEO records —
 * none of which a grid tile uses. Projecting first keeps the client payload
 * small on pages that render fifty tiles.
 */
export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  brandName?: string;
  categoryName?: string;
  image: string;
  hoverImage?: string;
  price: number;
  compareAtPrice?: number;
  discount: number;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  stockLabel?: string;
  badges: { label: string; tone: BadgeTone }[];
  swatches: ProductCardSwatch[];
  defaultVariantId: string;
  defaultVariantTitle: string;
  defaultVariantOptions: Record<string, string>;
  maxQuantity: number;
  hasOptions: boolean;
  unitsSold: number;
}

export function toCardData(
  product: Product,
  lookup?: { brands?: Brand[]; categories?: Category[] },
): ProductCardData {
  const brand = lookup?.brands?.find((b) => b.id === product.brandId);
  const category = lookup?.categories?.find((c) => c.id === product.categoryId);
  const variant = pickDefaultVariant(product);

  const badges: { label: string; tone: BadgeTone }[] = [];
  if (product.flags.isNew) badges.push({ label: "New", tone: "obsidian" });
  else if (product.flags.bestseller) badges.push({ label: "Bestseller", tone: "accent" });
  else if (product.flags.limited) badges.push({ label: "Limited", tone: "outline" });
  if (product.flags.exclusive) badges.push({ label: "Exclusive", tone: "outline" });

  const swatchKey = product.variantAttributeKeys.find((k) => k === "color" || k === "finish" || k === "shade");
  const swatches: ProductCardSwatch[] = swatchKey
    ? dedupeBy(
        product.variants
          .filter((v) => v.options[swatchKey])
          .map((v) => ({
            value: v.options[swatchKey]!,
            label: v.title.split(" / ")[0] ?? v.options[swatchKey]!,
            swatch: swatchHex(v.options[swatchKey]!),
            image: v.image,
          })),
        (s) => s.value,
      ).slice(0, 5)
    : [];

  const available = product.totalStock;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brandName: brand?.name,
    categoryName: category?.name,
    image: product.media[0]?.url ?? "",
    hoverImage: product.media[1]?.url,
    price: variant?.price ?? product.price,
    compareAtPrice: variant?.compareAtPrice ?? product.compareAtPrice,
    discount: discountPercent(variant?.price ?? product.price, variant?.compareAtPrice ?? product.compareAtPrice),
    rating: product.rating.average,
    ratingCount: product.rating.count,
    inStock: available > 0 || product.allowBackorder,
    stockLabel:
      available === 0
        ? product.allowBackorder
          ? "Backorder"
          : "Out of stock"
        : available <= 12
          ? `Only ${available} left`
          : undefined,
    badges,
    swatches,
    defaultVariantId: variant?.id ?? `${product.id}_default`,
    defaultVariantTitle: variant?.title ?? "Default",
    defaultVariantOptions: variant?.options ?? {},
    maxQuantity: Math.max(1, Math.min(10, variant?.stock ?? 10)),
    hasOptions: product.variantAttributeKeys.length > 0 && product.variants.length > 1,
    unitsSold: product.unitsSold,
  };
}

export function toCardList(products: Product[], db: StoreDatabase): ProductCardData[] {
  return products.map((p) => toCardData(p, { brands: db.brands, categories: db.categories }));
}

/**
 * The variant a shopper lands on. Prefers one that is genuinely available
 * (on hand minus reserved), so the buy box is not disabled on arrival.
 */
export function pickDefaultVariant(product: Product): ProductVariant | undefined {
  const available = product.variants.filter(
    (v) => v.status === "active" && v.stock - v.reservedStock > 0,
  );
  if (available.length) {
    return available.reduce((best, v) =>
      v.stock - v.reservedStock > best.stock - best.reservedStock ? v : best,
    );
  }
  return (
    product.variants.find((v) => v.status === "active" && v.stock > 0) ??
    [...product.variants].sort((a, b) => a.price - b.price)[0]
  );
}

const SWATCH_HEX: Record<string, string> = {
  black: "#111111",
  obsidian: "#080908",
  white: "#FFFFFF",
  ivory: "#F4F0E7",
  emerald: "#063F32",
  olive: "#5A6141",
  sand: "#C9B294",
  tan: "#A97F52",
  grey: "#8A8D88",
  charcoal: "#3A3D3B",
  navy: "#1E2A44",
  burgundy: "#5E1F2A",
  gold: "#C9A227",
  silver: "#C4C7C9",
  rose: "#C98A8A",
  blue: "#2F6FB0",
  walnut: "#5C4033",
  oak: "#C3A17A",
  teak: "#9C6B3F",
  "matte-black": "#1A1A1A",
  natural: "#D9C7A7",
  porcelain: "#F5E6DA",
  beige: "#E3C9A8",
  honey: "#D2A45C",
  caramel: "#A9703F",
  espresso: "#4A2E1E",
};

export function swatchHex(value: string): string | undefined {
  return SWATCH_HEX[value.toLowerCase()];
}

function dedupeBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}
