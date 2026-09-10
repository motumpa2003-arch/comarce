import { SEED_NOW } from "@obsidian/data";
import { formatMoney, shortNumber, type CurrencyCode, type Money } from "@obsidian/commerce";

/** The demo clock. All relative time in the UI is measured against this. */
export const NOW = SEED_NOW;

export const money = (amount: Money, currency: CurrencyCode = "INR") =>
  formatMoney(amount, { currency });

export const moneyShort = (amount: Money, currency: CurrencyCode = "INR") =>
  formatMoney(amount, { currency, notation: "short" });

export const compact = (value: number) => shortNumber(value, "INR");

export const number = (value: number) => new Intl.NumberFormat("en-IN").format(value);

export function percent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function signedPercent(value: number, digits = 1): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

/* -------------------------------- Dates ----------------------------- */

const DATE_FMT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const DATE_SHORT_FMT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const TIME_FMT = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
const WEEKDAY_FMT = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

export const formatDate = (value: string | Date) => DATE_FMT.format(new Date(value));
export const formatDateShort = (value: string | Date) => DATE_SHORT_FMT.format(new Date(value));
export const formatTime = (value: string | Date) => TIME_FMT.format(new Date(value));
export const formatWeekday = (value: string | Date) => WEEKDAY_FMT.format(new Date(value));
export const formatDateTime = (value: string | Date) =>
  `${DATE_FMT.format(new Date(value))}, ${TIME_FMT.format(new Date(value))}`;

/** "2 hours ago" / "in 3 days", measured against the demo clock. */
export function relativeTime(value: string | Date, reference: Date = NOW): string {
  const target = new Date(value).getTime();
  const diffMs = target - reference.getTime();
  const abs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 3_600_000;
  const day = 86_400_000;

  if (abs < minute) return "just now";
  if (abs < hour) return phrase(Math.round(abs / minute), "minute", diffMs);
  if (abs < day) return phrase(Math.round(abs / hour), "hour", diffMs);
  if (abs < day * 30) return phrase(Math.round(abs / day), "day", diffMs);
  if (abs < day * 365) return phrase(Math.round(abs / (day * 30)), "month", diffMs);
  return phrase(Math.round(abs / (day * 365)), "year", diffMs);
}

function phrase(value: number, unit: string, diffMs: number): string {
  const plural = `${value} ${unit}${value === 1 ? "" : "s"}`;
  return diffMs < 0 ? `${plural} ago` : `in ${plural}`;
}

/** Inclusive delivery window, e.g. "Tue, 9 Sep – Thu, 11 Sep". */
export function deliveryWindow(minDays: number, maxDays: number, from: Date = NOW): string {
  const min = new Date(from);
  min.setDate(min.getDate() + minDays);
  const max = new Date(from);
  max.setDate(max.getDate() + maxDays);
  if (minDays === maxDays) return WEEKDAY_FMT.format(min);
  return `${WEEKDAY_FMT.format(min)} – ${WEEKDAY_FMT.format(max)}`;
}

export function daysBetween(a: string | Date, b: string | Date = NOW): number {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 86_400_000);
}

/* ------------------------------- Strings ---------------------------- */

export function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function truncate(value: string, length: number): string {
  return value.length <= length ? value : `${value.slice(0, length - 1).trimEnd()}…`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${number(count)} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/** Masks a phone number for display: +91 98765 43210 -> +91 ***** 43210 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\+\d{2}\s?)(\d{5})/, (_, prefix) => `${prefix}*****`);
}
