/**
 * Shared scalar/value types used across every domain module.
 *
 * Money is always stored as an integer in the currency's minor unit
 * (paise for INR, cents for USD). Never use floats for money.
 */

export type ID = string;
export type ISODate = string;

/** Integer amount in the minor currency unit. 249900 === ₹2,499.00 */
export type Money = number;

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "SGD";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  minorUnits: number;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  INR: { code: "INR", symbol: "₹", minorUnits: 2, locale: "en-IN" },
  USD: { code: "USD", symbol: "$", minorUnits: 2, locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", minorUnits: 2, locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", minorUnits: 2, locale: "en-GB" },
  AED: { code: "AED", symbol: "د.إ", minorUnits: 2, locale: "ar-AE" },
  SGD: { code: "SGD", symbol: "S$", minorUnits: 2, locale: "en-SG" },
};

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: "cm" | "in";
}

export interface Weight {
  value: number;
  unit: "g" | "kg" | "lb" | "oz";
}

export interface MediaAsset {
  id: ID;
  url: string;
  alt: string;
  type: "image" | "video" | "model3d" | "document";
  width?: number;
  height?: number;
  position: number;
  /** Optional variant binding, so galleries can swap with colour selection. */
  variantIds?: ID[];
}

export interface SEORecord {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };
