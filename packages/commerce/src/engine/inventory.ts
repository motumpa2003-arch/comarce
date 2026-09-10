import type { InventoryRecord, Warehouse } from "../types/inventory";
import type { GeoPoint } from "../types/primitives";

export type StockLevel = "in_stock" | "low_stock" | "out_of_stock" | "backorder";

export interface StockSummary {
  onHand: number;
  reserved: number;
  available: number;
  incoming: number;
  level: StockLevel;
  label: string;
}

export function summariseStock(
  records: InventoryRecord[],
  { lowStockThreshold = 10, allowBackorder = false }: { lowStockThreshold?: number; allowBackorder?: boolean } = {},
): StockSummary {
  const onHand = records.reduce((n, r) => n + r.onHand, 0);
  const reserved = records.reduce((n, r) => n + r.reserved, 0);
  const incoming = records.reduce((n, r) => n + r.incoming, 0);
  const available = Math.max(0, onHand - reserved);

  let level: StockLevel = "in_stock";
  if (available <= 0) level = allowBackorder ? "backorder" : "out_of_stock";
  else if (available <= lowStockThreshold) level = "low_stock";

  const label =
    level === "out_of_stock"
      ? "Out of stock"
      : level === "backorder"
        ? "Available on backorder"
        : level === "low_stock"
          ? `Only ${available} left`
          : "In stock";

  return { onHand, reserved, available, incoming, level, label };
}

export function stockLevelTone(level: StockLevel): "success" | "warning" | "danger" | "info" {
  switch (level) {
    case "in_stock":
      return "success";
    case "low_stock":
      return "warning";
    case "backorder":
      return "info";
    default:
      return "danger";
  }
}

/* --------------------------- Order routing -------------------------- */

export interface RoutingCandidate {
  warehouse: Warehouse;
  available: number;
  distanceKm: number;
  score: number;
}

/**
 * Picks the fulfilment location for a line: nearest warehouse that can serve
 * the whole quantity, falling back to the deepest stock position.
 */
export function routeFulfilment(
  warehouses: Warehouse[],
  inventory: InventoryRecord[],
  destination: GeoPoint,
  quantity: number,
): RoutingCandidate | null {
  const candidates: RoutingCandidate[] = warehouses
    .filter((w) => w.status === "active" && w.fulfilsOnline)
    .map((w) => {
      const available = inventory
        .filter((r) => r.warehouseId === w.id)
        .reduce((n, r) => n + Math.max(0, r.onHand - r.reserved), 0);
      const distanceKm = haversineKm(w.geo, destination);
      const canServe = available >= quantity ? 1 : 0;
      return {
        warehouse: w,
        available,
        distanceKm,
        score: canServe * 1000 - distanceKm + Math.min(available, 50),
      };
    })
    .filter((c) => c.available > 0);

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]!;
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/* ------------------------- Replenishment ---------------------------- */

export interface ReorderSuggestion {
  record: InventoryRecord;
  suggestedQuantity: number;
  urgency: "critical" | "high" | "normal";
}

export function reorderSuggestions(records: InventoryRecord[]): ReorderSuggestion[] {
  return records
    .filter((r) => r.onHand - r.reserved <= r.reorderPoint)
    .map((record) => {
      const available = Math.max(0, record.onHand - record.reserved);
      const deficit = Math.max(record.reorderPoint - available, 0);
      return {
        record,
        suggestedQuantity: Math.max(record.reorderQuantity, deficit + record.reorderQuantity),
        urgency: available === 0 ? "critical" : available <= record.reorderPoint / 2 ? "high" : "normal",
      } as ReorderSuggestion;
    })
    .sort((a, b) => {
      const rank = { critical: 0, high: 1, normal: 2 };
      return rank[a.urgency] - rank[b.urgency];
    });
}
