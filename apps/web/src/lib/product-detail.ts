import { discountPercent, getTaxClass, type Product } from "@obsidian/commerce";
import type { StoreDatabase } from "@obsidian/data";
import { pickDefaultVariant, swatchHex } from "./product-view";
import { titleCase } from "./format";

export interface DetailVariantOption {
  value: string;
  label: string;
  swatch?: string;
  image?: string;
  available: boolean;
}

export interface DetailVariantAttribute {
  key: string;
  label: string;
  inputType: string;
  options: DetailVariantOption[];
}

export interface DetailVariant {
  id: string;
  sku: string;
  title: string;
  options: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  available: number;
  image?: string;
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  brand?: { id: string; name: string; slug: string; description: string; origin: string };
  category?: { id: string; name: string; slug: string };
  parentCategory?: { id: string; name: string; slug: string };
  media: { url: string; alt: string; type: string }[];
  price: number;
  compareAtPrice?: number;
  discount: number;
  rating: { average: number; count: number; distribution: Record<string, number> };
  variantAttributes: DetailVariantAttribute[];
  variants: DetailVariant[];
  defaultVariantId: string;
  specs: { label: string; value: string }[];
  sku: string;
  taxLabel: string;
  totalStock: number;
  allowBackorder: boolean;
  shippingRequired: boolean;
  productType: string;
  flags: Product["flags"];
  tags: string[];
  unitsSold: number;
  wishlistCount: number;
  views: number;
  collectionNames: { name: string; slug: string }[];
  weightLabel?: string;
  dimensionsLabel?: string;
}

export function toProductDetail(product: Product, db: StoreDatabase): ProductDetail {
  const brand = db.brands.find((b) => b.id === product.brandId);
  const category = db.categories.find((c) => c.id === product.categoryId);
  const parent = category?.parentId ? db.categories.find((c) => c.id === category.parentId) : undefined;
  const defaultVariant = pickDefaultVariant(product);

  const variants: DetailVariant[] = product.variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    title: variant.title,
    options: variant.options,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    stock: variant.stock,
    available: Math.max(0, variant.stock - variant.reservedStock),
    image: variant.image,
  }));

  const variantAttributes: DetailVariantAttribute[] = product.variantAttributeKeys.map((key) => {
    const definition = db.attributes.find((a) => a.key === key);
    const seen = new Map<string, DetailVariantOption>();
    for (const variant of product.variants) {
      const value = variant.options[key];
      if (!value) continue;
      const existing = seen.get(value);
      const available = variant.stock > 0;
      if (existing) {
        existing.available = existing.available || available;
        continue;
      }
      const option = definition?.options?.find((o) => o.value === value);
      seen.set(value, {
        value,
        label: option?.label ?? titleCase(value),
        swatch: option?.swatch ?? swatchHex(value),
        image: variant.image,
        available,
      });
    }
    return {
      key,
      label: definition?.label ?? titleCase(key),
      inputType: definition?.inputType ?? "select",
      options: [...seen.values()],
    };
  });

  const specs: { label: string; value: string }[] = [];
  for (const [key, raw] of Object.entries(product.attributes)) {
    const definition = db.attributes.find((a) => a.key === key);
    if (definition && !definition.displayInSpecs) continue;
    const label = definition?.label ?? titleCase(key);
    let value: string;
    if (typeof raw === "boolean") value = raw ? "Yes" : "No";
    else if (Array.isArray(raw)) value = raw.map((v) => titleCase(String(v))).join(", ");
    else if (typeof raw === "number") value = `${raw}${definition?.unit ? ` ${definition.unit}` : ""}`;
    else {
      const option = definition?.options?.find((o) => o.value === raw);
      value = option?.label ?? titleCase(String(raw));
    }
    specs.push({ label, value });
  }
  if (product.weight) specs.push({ label: "Weight", value: `${product.weight.value} ${product.weight.unit}` });
  if (product.dimensions) {
    const d = product.dimensions;
    specs.push({ label: "Dimensions", value: `${d.length} × ${d.width} × ${d.height} ${d.unit}` });
  }
  specs.push({ label: "SKU", value: product.sku });
  if (brand) specs.push({ label: "Brand", value: brand.name });
  if (product.barcode) specs.push({ label: "Barcode (EAN)", value: product.barcode });

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    highlights: product.highlights,
    brand: brand
      ? { id: brand.id, name: brand.name, slug: brand.slug, description: brand.description, origin: brand.origin }
      : undefined,
    category: category ? { id: category.id, name: category.name, slug: category.slug } : undefined,
    parentCategory: parent ? { id: parent.id, name: parent.name, slug: parent.slug } : undefined,
    media: product.media.map((m) => ({ url: m.url, alt: m.alt, type: m.type })),
    price: defaultVariant?.price ?? product.price,
    compareAtPrice: defaultVariant?.compareAtPrice ?? product.compareAtPrice,
    discount: discountPercent(
      defaultVariant?.price ?? product.price,
      defaultVariant?.compareAtPrice ?? product.compareAtPrice,
    ),
    rating: {
      average: product.rating.average,
      count: product.rating.count,
      distribution: Object.fromEntries(
        Object.entries(product.rating.distribution).map(([k, v]) => [k, v]),
      ),
    },
    variantAttributes,
    variants,
    defaultVariantId: defaultVariant?.id ?? variants[0]?.id ?? "",
    specs,
    sku: product.sku,
    taxLabel: getTaxClass(product.taxClassId).name,
    totalStock: product.totalStock,
    allowBackorder: product.allowBackorder,
    shippingRequired: product.shippingRequired,
    productType: product.productType,
    flags: product.flags,
    tags: product.tags,
    unitsSold: product.unitsSold,
    wishlistCount: product.wishlistCount,
    views: product.views,
    collectionNames: product.collectionIds
      .map((id) => db.collections.find((c) => c.id === id))
      .filter(Boolean)
      .slice(0, 4)
      .map((c) => ({ name: c!.name, slug: c!.slug })),
    weightLabel: product.weight ? `${product.weight.value} ${product.weight.unit}` : undefined,
    dimensionsLabel: product.dimensions
      ? `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height} ${product.dimensions.unit}`
      : undefined,
  };
}
