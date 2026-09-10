import { NextResponse } from "next/server";
import { adjustInventory } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    variantId?: string;
    warehouseId?: string;
    delta?: number;
    note?: string;
  } | null;

  if (!body?.variantId || !body.warehouseId || !body.delta) {
    return NextResponse.json(
      { error: "variantId, warehouseId and a non-zero delta are required." },
      { status: 400 },
    );
  }

  const result = adjustInventory(
    await currentStoreId(),
    body.variantId,
    body.warehouseId,
    body.delta,
    body.note ?? "Manual adjustment",
  );

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ onHand: result.onHand });
}
