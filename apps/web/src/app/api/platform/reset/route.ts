import { NextResponse } from "next/server";
import { resetDatabase } from "@obsidian/data";

/**
 * Rebuilds the deterministic seed, discarding every write made during this
 * server process. Operator-only in a real deployment.
 */
export async function POST() {
  const db = resetDatabase();
  return NextResponse.json({
    ok: true,
    stores: db.allStores.length,
    seededStores: db.stores.length,
    products: db.stores.reduce((n, store) => n + store.products.length, 0),
    orders: db.stores.reduce((n, store) => n + store.orders.length, 0),
  });
}
