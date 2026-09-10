import { CURRENCIES, type CurrencyCode, type Money } from "../types/primitives";

/** Build a Money value from a major-unit number: rupees(2499) -> 249900 */
export function major(amount: number, currency: CurrencyCode = "INR"): Money {
  return Math.round(amount * 10 ** CURRENCIES[currency].minorUnits);
}

/** Convert minor units back to a major-unit float. */
export function toMajor(amount: Money, currency: CurrencyCode = "INR"): number {
  return amount / 10 ** CURRENCIES[currency].minorUnits;
}

export interface FormatMoneyOptions {
  currency?: CurrencyCode;
  /** Drop the decimal part when the amount is a whole unit. Default true. */
  compactZeroes?: boolean;
  /** Render 1.2L / 45.3K style short forms for dashboards. */
  notation?: "standard" | "short";
  withSymbol?: boolean;
}

export function formatMoney(amount: Money, options: FormatMoneyOptions = {}): string {
  const {
    currency = "INR",
    compactZeroes = true,
    notation = "standard",
    withSymbol = true,
  } = options;

  const meta = CURRENCIES[currency];
  const value = toMajor(amount, currency);
  const symbol = withSymbol ? meta.symbol : "";

  if (notation === "short") {
    return symbol + shortNumber(value, currency);
  }

  const hasFraction = Math.abs(value % 1) > 0.0001;
  const fractionDigits = compactZeroes && !hasFraction ? 0 : meta.minorUnits;

  return (
    symbol +
    new Intl.NumberFormat(meta.locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value)
  );
}

/** Indian numbering (K/L/Cr) for INR, western (K/M/B) otherwise. */
export function shortNumber(value: number, currency: CurrencyCode = "INR"): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const trim = (n: number) => {
    const fixed = n >= 100 ? n.toFixed(0) : n.toFixed(n >= 10 ? 1 : 2);
    return fixed.replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1");
  };

  if (currency === "INR") {
    if (abs >= 1_00_00_000) return `${sign}${trim(abs / 1_00_00_000)}Cr`;
    if (abs >= 1_00_000) return `${sign}${trim(abs / 1_00_000)}L`;
    if (abs >= 1_000) return `${sign}${trim(abs / 1_000)}K`;
  } else {
    if (abs >= 1_000_000_000) return `${sign}${trim(abs / 1_000_000_000)}B`;
    if (abs >= 1_000_000) return `${sign}${trim(abs / 1_000_000)}M`;
    if (abs >= 1_000) return `${sign}${trim(abs / 1_000)}K`;
  }
  return `${sign}${trim(abs)}`;
}

export function formatNumber(value: number, locale = "en-IN"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCompact(value: number, currency: CurrencyCode = "INR"): string {
  return shortNumber(value, currency);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value >= 0 ? "" : "-"}${Math.abs(value).toFixed(digits)}%`;
}

/** Discount percentage of `price` against `compareAt`, floored to an int. */
export function discountPercent(price: Money, compareAt?: Money): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Percentage of an amount, rounded to the nearest minor unit. */
export function percentOf(amount: Money, percent: number): Money {
  return Math.round((amount * percent) / 100);
}

export function clampMoney(amount: Money, min: Money, max: Money): Money {
  return Math.max(min, Math.min(max, amount));
}

export function sumMoney(values: Money[]): Money {
  return values.reduce((total, value) => total + value, 0);
}
