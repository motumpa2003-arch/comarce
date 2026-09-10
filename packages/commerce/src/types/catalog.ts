import type {
  Dimensions,
  ID,
  ISODate,
  MediaAsset,
  Money,
  SEORecord,
  Weight,
} from "./primitives";
import type { Industry } from "./tenancy";

/* ------------------------------------------------------------------ *
 * Dynamic attribute system
 *
 * The commerce engine never hard-codes "size" or "colour". A merchant
 * defines AttributeDefinitions; products carry values against them and
 * variants are generated from the subset flagged `variantDefining`.
 * ------------------------------------------------------------------ */

export type AttributeInputType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "boolean"
  | "color"
  | "dimension"
  | "date"
  | "richtext";

export interface AttributeOption {
  value: string;
  label: string;
  /** Hex swatch for colour-style attributes. */
  swatch?: string;
  image?: string;
}

export interface AttributeDefinition {
  id: ID;
  storeId: ID;
  key: string;
  label: string;
  inputType: AttributeInputType;
  unit?: string;
  options?: AttributeOption[];
  /** Attribute participates in variant generation (size, colour, storage…). */
  variantDefining: boolean;
  /** Attribute is exposed as a PLP facet. */
  filterable: boolean;
  /** Attribute is shown in the PDP specification table. */
  displayInSpecs: boolean;
  searchable: boolean;
  required: boolean;
  /** Restricts the attribute to certain category subtrees. */
  categoryIds: ID[];
  industry: Industry | "all";
  position: number;
}

export type AttributeValue = string | number | boolean | string[];

/* ------------------------------------------------------------------ *
 * Taxonomy
 * ------------------------------------------------------------------ */

export interface Category {
  id: ID;
  storeId: ID;
  name: string;
  slug: string;
  description: string;
  parentId: ID | null;
  path: string[];
  level: number;
  image: string;
  icon?: string;
  industry: Industry;
  productCount: number;
  featured: boolean;
  position: number;
  seo: SEORecord;
}

export interface Brand {
  id: ID;
  storeId: ID;
  name: string;
  slug: string;
  logo: string;
  cover?: string;
  description: string;
  origin: string;
  /** Which industries this brand actually sells into. */
  industries: Industry[];
  productCount: number;
  featured: boolean;
  rating: number;
}

export type CollectionRuleField =
  | "category"
  | "brand"
  | "tag"
  | "price"
  | "rating"
  | "flag";

export interface CollectionRule {
  field: CollectionRuleField;
  operator: "eq" | "neq" | "lt" | "gt" | "in" | "contains";
  value: string | number | string[];
}

export interface Collection {
  id: ID;
  storeId: ID;
  name: string;
  slug: string;
  headline: string;
  description: string;
  image: string;
  /** Manual pick list, or rule-driven "smart" collection. */
  type: "manual" | "smart";
  rules: CollectionRule[];
  productIds: ID[];
  featured: boolean;
  startsAt?: ISODate;
  endsAt?: ISODate;
  seo: SEORecord;
}

/* ------------------------------------------------------------------ *
 * Products & variants
 * ------------------------------------------------------------------ */

export type ProductType =
  | "physical"
  | "digital"
  | "service"
  | "subscription"
  | "bundle";

export type ProductStatus = "draft" | "active" | "archived";

export interface ProductVariant {
  id: ID;
  productId: ID;
  storeId: ID;
  sku: string;
  barcode?: string;
  title: string;
  /** Values keyed by AttributeDefinition.key, e.g. { color: "black", size: "M" } */
  options: Record<string, string>;
  price: Money;
  compareAtPrice?: Money;
  costPrice?: Money;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  weight?: Weight;
  image?: string;
  position: number;
  status: "active" | "inactive";
}

export interface ProductFlags {
  featured: boolean;
  isNew: boolean;
  bestseller: boolean;
  onSale: boolean;
  exclusive: boolean;
  limited: boolean;
}

export interface ProductRatingSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface Product {
  id: ID;
  storeId: ID;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  highlights: string[];

  productType: ProductType;
  status: ProductStatus;

  categoryId: ID;
  categoryPath: string[];
  brandId?: ID;
  collectionIds: ID[];
  tags: string[];
  industry: Industry;

  media: MediaAsset[];
  /** Attribute values keyed by AttributeDefinition.key. */
  attributes: Record<string, AttributeValue>;
  /** Keys of attributes that define this product's variant matrix. */
  variantAttributeKeys: string[];
  variants: ProductVariant[];

  price: Money;
  compareAtPrice?: Money;
  costPrice?: Money;
  taxClassId: string;

  sku: string;
  barcode?: string;

  trackInventory: boolean;
  allowBackorder: boolean;
  totalStock: number;

  shippingRequired: boolean;
  weight?: Weight;
  dimensions?: Dimensions;

  /** Digital / subscription extras. */
  digitalFileUrl?: string;
  subscriptionIntervalDays?: number;
  bundleProductIds?: ID[];

  rating: ProductRatingSummary;
  flags: ProductFlags;

  /** Merchandising signals used by search ranking and analytics. */
  views: number;
  unitsSold: number;
  wishlistCount: number;

  seo: SEORecord;
  publishedAt: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/** Product joined with its resolved relations, for rendering. */
export interface ProductView extends Product {
  brand?: Brand;
  category?: Category;
}
