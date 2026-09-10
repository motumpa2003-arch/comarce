import {
  buildAttributeDefinitions,
  generateVariantMatrix,
  major,
  type AttributeDefinition,
  type Brand,
  type Category,
  type Collection,
  type Industry,
  type MediaAsset,
  type Product,
  type ProductVariant,
} from "@obsidian/commerce";
import { IMAGE_POOLS, img } from "../images";
import { Rng, slugify } from "../rng";
import { DESCRIPTION_OPENERS, PRODUCT_BLUEPRINTS, type ProductBlueprint } from "./catalog-blueprints";

const SKU_PREFIX: Record<Industry, string> = {
  fashion: "FSH",
  electronics: "ELE",
  beauty: "BEA",
  home: "HOM",
  furniture: "FRN",
  sports: "SPT",
  grocery: "GRC",
  jewelry: "JWL",
  books: "BOK",
  pets: "PET",
  general: "GEN",
};

export interface BuildProductsInput {
  storeId: string;
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  attributeDefinitions: AttributeDefinition[];
  industries: Industry[] | "all";
  referenceDate: Date;
  /** How many products per leaf category. */
  perCategory: number;
}

export function buildProducts({
  storeId,
  categories,
  brands,
  collections,
  attributeDefinitions,
  industries,
  referenceDate,
  perCategory,
}: BuildProductsInput): Product[] {
  const rng = new Rng(`${storeId}:products`);
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const products: Product[] = [];
  let sequence = 1;

  const blueprints = PRODUCT_BLUEPRINTS.filter((bp) => bySlug.has(bp.categorySlug));

  for (const blueprint of blueprints) {
    const category = bySlug.get(blueprint.categorySlug)!;
    if (industries !== "all" && !industries.includes(category.industry)) continue;

    const count = Math.min(perCategory, blueprint.names.length);
    const names = rng.sample(blueprint.names, count);

    for (const name of names) {
      products.push(
        buildProduct({
          storeId,
          rng,
          sequence: sequence++,
          name,
          blueprint,
          category,
          parentCategory: categories.find((c) => c.id === category.parentId),
          brands,
          collections,
          attributeDefinitions,
          referenceDate,
        }),
      );
    }
  }

  return products;
}

interface BuildProductInput {
  storeId: string;
  rng: Rng;
  sequence: number;
  name: string;
  blueprint: ProductBlueprint;
  category: Category;
  parentCategory?: Category;
  brands: Brand[];
  collections: Collection[];
  attributeDefinitions: AttributeDefinition[];
  referenceDate: Date;
}

function buildProduct({
  storeId,
  rng,
  sequence,
  name,
  blueprint,
  category,
  parentCategory,
  brands,
  collections,
  attributeDefinitions,
  referenceDate,
}: BuildProductInput): Product {
  const industry = category.industry;
  // A jewellery house should never end up branding a running shoe.
  const industryBrands = brands.filter((b) => b.industries.includes(industry));
  const eligibleBrands = industryBrands.length ? industryBrands : brands;
  const brand = eligibleBrands.length ? rng.pick(eligibleBrands) : undefined;

  const id = `prod_${storeId}_${slugify(name)}_${sequence}`;
  const slug = slugify(`${name}-${sequence}`);

  /* ---------------------------- Pricing ---------------------------- */
  const [minPrice, maxPrice] = blueprint.price;
  const basePrice = major(roundPrice(priceInBand(rng, minPrice, maxPrice)));
  const onSale = rng.bool(0.55);
  const discountPct = onSale ? rng.weighted([[5, 2], [10, 5], [15, 5], [20, 5], [25, 3], [30, 3], [35, 2], [40, 1]]) : 0;
  const compareAtPrice = onSale ? major(roundPrice(Math.round((basePrice / 100) / (1 - discountPct / 100)))) : undefined;
  const costPrice = Math.round(basePrice * rng.float(0.42, 0.68));

  /* --------------------------- Attributes -------------------------- */
  const industryDefs = attributeDefinitions.filter((d) => d.industry === industry || d.industry === "all");
  const attributes: Record<string, string | number | boolean | string[]> = {};

  for (const def of industryDefs) {
    if (def.inputType === "boolean") {
      attributes[def.key] = rng.bool(0.4);
      continue;
    }
    if (def.inputType === "number") {
      attributes[def.key] = numberForKey(def.key, rng);
      continue;
    }
    if (def.inputType === "text") {
      attributes[def.key] = textForKey(def.key, rng);
      continue;
    }
    if (!def.options?.length) continue;
    if (def.inputType === "multiselect") {
      attributes[def.key] = rng.sample(def.options, rng.int(1, 3)).map((o) => o.value);
      continue;
    }
    if (!def.variantDefining) {
      attributes[def.key] = rng.pick(def.options).value;
    }
  }

  /* ---------------------------- Variants --------------------------- */
  const variantDefs = industryDefs.filter((d) => d.variantDefining && d.options?.length).slice(0, 2);
  const optionSets = variantDefs.map((def) => ({
    key: def.key,
    values: rng.sample(def.options!, rng.int(2, def.key === "color" ? 4 : 4)).map((o) => o.value),
  }));

  const combos = optionSets.length ? generateVariantMatrix(optionSets).slice(0, 12) : [{}];
  const sku = `${SKU_PREFIX[industry]}-${category.slug.replace(/[^a-z]/g, "").slice(0, 3).toUpperCase()}-${String(sequence).padStart(3, "0")}`;

  const pool = IMAGE_POOLS[blueprint.pool];
  const galleryIds = rng.sample(pool, Math.min(pool.length, rng.int(3, 5)));
  const media: MediaAsset[] = galleryIds.map((imageId, index) => ({
    id: `media_${id}_${index}`,
    url: img(imageId, 1200, 1500),
    alt: `${name}${brand ? ` by ${brand.name}` : ""} — view ${index + 1}`,
    type: "image" as const,
    width: 1200,
    height: 1500,
    position: index,
  }));

  const variants: ProductVariant[] = combos.map((options, index) => {
    // Larger sizes / bigger storage cost more — a small, believable premium.
    const premium = variantPremium(options, optionSets);
    // Keep variant prices on whole rupees — no shopper sees ₹24,638.88.
    const price = roundToUnit(basePrice * premium);
    const stock = rng.weighted([
      [0, 1],
      [rng.int(1, 8), 2],
      [rng.int(9, 60), 6],
      [rng.int(61, 240), 3],
    ]);
    return {
      id: `var_${id}_${index}`,
      productId: id,
      storeId,
      sku: `${sku}-${index + 1}`,
      barcode: `89${String(700000000 + sequence * 37 + index).slice(0, 11)}`,
      title: variantTitle(options, industryDefs),
      options,
      price,
      compareAtPrice: compareAtPrice ? roundToUnit(compareAtPrice * premium) : undefined,
      costPrice: roundToUnit(costPrice * premium),
      stock,
      reservedStock: stock > 0 ? rng.int(0, Math.min(4, stock)) : 0,
      lowStockThreshold: 10,
      weight: blueprint.weightG
        ? { value: rng.int(blueprint.weightG[0], blueprint.weightG[1]), unit: "g" as const }
        : undefined,
      image: media[Math.min(index, media.length - 1)]?.url,
      position: index,
      status: "active" as const,
    };
  });

  const totalStock = variants.reduce((n, v) => n + v.stock, 0);

  /* ------------------------ Ratings & signals ---------------------- */
  const ratingAverage = rng.float(3.6, 4.9, 1);
  const ratingCount = rng.int(24, 4200);
  const distribution = ratingDistribution(ratingAverage, ratingCount);

  const unitsSold = rng.int(12, 3800);
  const views = unitsSold * rng.int(18, 90);

  const publishedAt = rng.pastDate(referenceDate, 3, 420);
  const isNew = (referenceDate.getTime() - publishedAt.getTime()) / 86400000 <= 30;

  /* --------------------------- Collections ------------------------- */
  const collectionIds: string[] = [];
  const pick = (slug: string) => collections.find((c) => c.slug === slug)?.id;
  if (isNew) pushIf(collectionIds, pick("new-arrivals"));
  if (unitsSold > 2600) pushIf(collectionIds, pick("bestsellers"));
  if (basePrice < major(2000)) pushIf(collectionIds, pick("under-2000"));
  if (basePrice > major(20000)) pushIf(collectionIds, pick("premium-picks"));
  if (discountPct >= 35) pushIf(collectionIds, pick("clearance"));
  if (["electronics"].includes(industry)) pushIf(collectionIds, pick("tech-lifestyle"));
  if (["furniture", "home"].includes(industry)) pushIf(collectionIds, pick("home-upgrade"));
  if (["beauty"].includes(industry)) pushIf(collectionIds, pick("wellness-beauty"));
  if (["sports"].includes(industry)) pushIf(collectionIds, pick("weekend-adventure"));
  if (["fashion"].includes(industry) && rng.bool(0.5)) pushIf(collectionIds, pick("the-autumn-edit"));
  if (["grocery", "pets"].includes(industry)) pushIf(collectionIds, pick("everyday-essentials"));
  if (rng.bool(0.2)) pushIf(collectionIds, pick("gifting-edit"));
  if (rng.bool(0.15)) pushIf(collectionIds, pick("sustainable-choices"));
  if (rng.bool(0.12)) pushIf(collectionIds, pick("limited-drops"));
  if (rng.bool(0.18)) pushIf(collectionIds, pick("work-productivity"));

  /* ---------------------------- Copy ------------------------------- */
  const highlights = rng.sample(blueprint.benefits, Math.min(4, blueprint.benefits.length));
  const opener = rng.pick(DESCRIPTION_OPENERS);
  const shortDescription = `${category.name.replace(/s$/, "")} · ${highlights[0]}`;
  const description = [
    opener,
    `The ${name.toLowerCase()} sits in our ${category.name.toLowerCase()} range${brand ? `, made with ${brand.name}` : ""}. ${brand?.description ?? ""}`,
    `${highlights.map((h) => `• ${h}`).join("\n")}`,
    `Every order ships from the warehouse closest to you, arrives with a printed invoice, and is covered by a thirty-day return window.`,
  ].join("\n\n");

  const tags = buildTags(name, category, brand?.name, industry, attributes);

  return {
    id,
    storeId,
    name,
    slug,
    description,
    shortDescription,
    highlights,
    productType: blueprint.digital ? "digital" : "physical",
    status: rng.bool(0.97) ? "active" : "draft",
    categoryId: category.id,
    categoryPath: parentCategory ? [parentCategory.id, category.id] : [category.id],
    brandId: brand?.id,
    collectionIds,
    tags,
    industry,
    media,
    attributes,
    variantAttributeKeys: optionSets.map((s) => s.key),
    variants,
    price: basePrice,
    compareAtPrice,
    costPrice,
    taxClassId: blueprint.taxClassId,
    sku,
    barcode: `890${String(1000000 + sequence * 7).slice(0, 10)}`,
    trackInventory: true,
    allowBackorder: rng.bool(0.12),
    totalStock,
    shippingRequired: !blueprint.digital,
    weight: blueprint.weightG
      ? { value: rng.int(blueprint.weightG[0], blueprint.weightG[1]), unit: "g" }
      : undefined,
    dimensions: blueprint.weightG
      ? {
          length: rng.int(10, 90),
          width: rng.int(8, 70),
          height: rng.int(3, 60),
          unit: "cm",
        }
      : undefined,
    rating: { average: ratingAverage, count: ratingCount, distribution },
    flags: {
      featured: rng.bool(0.18),
      isNew,
      bestseller: unitsSold > 3150,
      onSale,
      exclusive: rng.bool(0.08),
      limited: rng.bool(0.1),
    },
    views,
    unitsSold,
    wishlistCount: Math.round(unitsSold * rng.float(0.1, 0.5)),
    seo: {
      title: `${name}${brand ? ` — ${brand.name}` : ""} | Buy online`,
      description: shortDescription,
      keywords: tags,
    },
    publishedAt: publishedAt.toISOString(),
    createdAt: publishedAt.toISOString(),
    updatedAt: rng.pastDate(referenceDate, 0, 30).toISOString(),
  };
}

/* ------------------------------ Helpers ----------------------------- */

function pushIf(list: string[], value?: string) {
  if (value && !list.includes(value)) list.push(value);
}

/** Snap a minor-unit amount to a whole major unit (paise -> rupees). */
function roundToUnit(amount: number): number {
  return Math.round(amount / 100) * 100;
}

/**
 * Real catalogues are bottom-heavy: many accessible pieces and a handful of
 * hero items. A uniform draw across the band produces the opposite shape — it
 * is how a jewellery store ends up reporting a ₹4.9 lakh average basket. Draw
 * on a log scale, biased low, so the median lands near the accessible end
 * while the top of the band stays reachable.
 */
function priceInBand(rng: Rng, min: number, max: number): number {
  if (max <= min) return min;
  const t = Math.pow(rng.float(0, 1, 4), 1.6);
  return Math.round(min * Math.pow(max / min, t));
}

/** Nudge prices to psychologically familiar endings (₹2,499 / ₹1,299). */
function roundPrice(value: number): number {
  if (value < 500) return Math.max(49, Math.round(value / 10) * 10 - 1);
  if (value < 5000) return Math.round(value / 100) * 100 - 1;
  if (value < 50000) return Math.round(value / 500) * 500 - 1;
  return Math.round(value / 1000) * 1000 - 1;
}

function variantPremium(options: Record<string, string>, sets: { key: string; values: string[] }[]): number {
  let premium = 1;
  for (const set of sets) {
    const value = options[set.key];
    if (!value) continue;
    const index = set.values.indexOf(value);
    if (index <= 0) continue;
    // Storage and pack sizes scale meaningfully; colour never does.
    const scale = ["storage", "ram", "volume", "weight", "size", "metal", "format"].includes(set.key) ? 0.12 : 0;
    premium += index * scale;
  }
  return Number(premium.toFixed(3));
}

function variantTitle(options: Record<string, string>, defs: AttributeDefinition[]): string {
  const parts = Object.entries(options).map(([key, value]) => {
    const def = defs.find((d) => d.key === key);
    return def?.options?.find((o) => o.value === value)?.label ?? value;
  });
  return parts.length ? parts.join(" / ") : "Default";
}

function ratingDistribution(average: number, count: number): Record<1 | 2 | 3 | 4 | 5, number> {
  // Skew the histogram toward the average without letting any bucket vanish.
  const weights: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const star of [1, 2, 3, 4, 5] as const) {
    weights[star] = Math.exp(-Math.abs(star - average) * 1.6) + 0.02;
  }
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let remaining = count;
  const out: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const star of [1, 2, 3, 4] as const) {
    out[star] = Math.round((weights[star] / total) * count);
    remaining -= out[star];
  }
  out[5] = Math.max(0, remaining);
  return out;
}

function numberForKey(key: string, rng: Rng): number {
  switch (key) {
    case "screen_size":
      return rng.pick([6.1, 6.7, 13.3, 14, 15.6, 16, 27, 32]);
    case "warranty_months":
      return rng.pick([12, 18, 24, 36]);
    case "width_cm":
      return rng.int(40, 220);
    case "height_cm":
      return rng.int(35, 210);
    case "depth_cm":
      return rng.int(30, 95);
    case "weight_g":
      return rng.int(3, 60);
    case "shelf_life_days":
      return rng.pick([30, 90, 180, 365]);
    case "pages":
      return rng.int(160, 520);
    default:
      return rng.int(1, 100);
  }
}

function textForKey(key: string, rng: Rng): string {
  switch (key) {
    case "processor":
      return rng.pick([
        "Octa-core 4 nm",
        "8-core CPU / 10-core GPU",
        "Hexa-core 6 nm",
        "12-core desktop class",
      ]);
    case "battery":
      return rng.pick(["4,500 mAh", "5,000 mAh", "58 Wh", "72 Wh", "30 h playback"]);
    case "care":
      return rng.pick([
        "Machine wash cold, line dry",
        "Dry clean only",
        "Wipe with a damp cloth",
        "Hand wash, do not bleach",
      ]);
    case "publisher":
      return rng.pick(["Papermill Press", "Saga Editions", "Northlight Books"]);
    default:
      return rng.pick(["Standard", "Premium", "Signature"]);
  }
}

function buildTags(
  name: string,
  category: Category,
  brandName: string | undefined,
  industry: Industry,
  attributes: Record<string, string | number | boolean | string[]>,
): string[] {
  const tags = new Set<string>([industry, category.slug]);
  for (const word of name.toLowerCase().split(/[\s—-]+/)) {
    if (word.length > 3) tags.add(word.replace(/[^a-z0-9]/g, ""));
  }
  if (brandName) tags.add(slugify(brandName));
  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value === "string" && value.length < 20 && ["color", "gender", "sport", "room", "diet", "genre", "pet"].includes(key)) {
      tags.add(value);
    }
  }
  return [...tags].filter(Boolean).slice(0, 12);
}

export function buildAttributesForStore(storeId: string, industries: Industry[] | "all"): AttributeDefinition[] {
  const list: Industry[] =
    industries === "all"
      ? ["fashion", "electronics", "beauty", "home", "furniture", "sports", "grocery", "jewelry", "books", "pets"]
      : industries;
  return buildAttributeDefinitions(storeId, list);
}
