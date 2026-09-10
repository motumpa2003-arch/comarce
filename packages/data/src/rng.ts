/**
 * Deterministic pseudo-randomness.
 *
 * Every seeded record is generated from a fixed seed so the server and the
 * client always produce byte-identical data. Never introduce Date.now() or
 * Math.random() into the seed pipeline — hydration will break.
 */
export class Rng {
  private state: number;

  constructor(seed: number | string) {
    this.state = typeof seed === "string" ? hashString(seed) : seed >>> 0;
    if (this.state === 0) this.state = 0x9e3779b9;
  }

  /** mulberry32 */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  float(min: number, max: number, decimals = 2): number {
    const value = this.next() * (max - min) + min;
    return Number(value.toFixed(decimals));
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)]!;
  }

  /** Pick with relative weights: [["a", 3], ["b", 1]] picks "a" 75% of the time. */
  weighted<T>(entries: readonly (readonly [T, number])[]): T {
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = this.next() * total;
    for (const [value, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return value;
    }
    return entries[entries.length - 1]![0];
  }

  sample<T>(items: readonly T[], count: number): T[] {
    return this.shuffle(items).slice(0, Math.min(count, items.length));
  }

  shuffle<T>(items: readonly T[]): T[] {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  }

  /** Date offset backwards from a reference point. */
  pastDate(reference: Date, minDaysAgo: number, maxDaysAgo: number): Date {
    const days = this.int(minDaysAgo, maxDaysAgo);
    const minutes = this.int(0, 1439);
    const d = new Date(reference);
    d.setDate(d.getDate() - days);
    d.setHours(0, minutes, this.int(0, 59), 0);
    return d;
  }

  futureDate(reference: Date, minDays: number, maxDays: number): Date {
    const d = new Date(reference);
    d.setDate(d.getDate() + this.int(minDays, maxDays));
    d.setHours(this.int(9, 20), this.int(0, 59), 0, 0);
    return d;
  }
}

export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** Stable index into a list, derived from any string key. */
export function pickStable<T>(items: readonly T[], key: string, offset = 0): T {
  return items[(hashString(key) + offset) % items.length]!;
}
