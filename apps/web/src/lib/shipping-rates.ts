/**
 * Weight-banded shipping rates per zone. Amounts are minor units, like every
 * other money value in the codebase.
 *
 * Lives outside the page module because an App Router page may only export
 * `default`, `metadata` and a handful of reserved names.
 */
export interface ShippingRateBand {
  zone: string;
  method: string;
  minG: number;
  maxG: number;
  price: number;
  freeOver: number;
  days: string;
}

export const RATE_TABLE: ShippingRateBand[] = [
  { zone: "Metro cities", method: "standard", minG: 0, maxG: 500, price: 4900, freeOver: 99_900, days: "2–3" },
  { zone: "Metro cities", method: "standard", minG: 501, maxG: 2000, price: 7900, freeOver: 99_900, days: "2–3" },
  { zone: "Metro cities", method: "standard", minG: 2001, maxG: 10_000, price: 14_900, freeOver: 149_900, days: "3–4" },
  { zone: "Metro cities", method: "express", minG: 0, maxG: 2000, price: 14_900, freeOver: 249_900, days: "1–2" },
  { zone: "Metro cities", method: "same_day", minG: 0, maxG: 5000, price: 24_900, freeOver: 0, days: "Same day" },
  { zone: "Tier 2 cities", method: "standard", minG: 0, maxG: 500, price: 5900, freeOver: 149_900, days: "3–5" },
  { zone: "Tier 2 cities", method: "standard", minG: 501, maxG: 2000, price: 9900, freeOver: 149_900, days: "3–5" },
  { zone: "Tier 2 cities", method: "express", minG: 0, maxG: 2000, price: 19_900, freeOver: 0, days: "2–3" },
  { zone: "Rest of India", method: "standard", minG: 0, maxG: 500, price: 7900, freeOver: 199_900, days: "4–7" },
  { zone: "Rest of India", method: "standard", minG: 501, maxG: 2000, price: 12_900, freeOver: 199_900, days: "4–7" },
  { zone: "Rest of India", method: "standard", minG: 2001, maxG: 10_000, price: 24_900, freeOver: 0, days: "5–8" },
  { zone: "North East & islands", method: "standard", minG: 0, maxG: 2000, price: 14_900, freeOver: 249_900, days: "6–10" },
];
