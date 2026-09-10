import { NextResponse } from "next/server";
import type { ReturnReason } from "@obsidian/commerce";
import { createReturn } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    itemIds?: string[];
    reason?: ReturnReason;
    comment?: string;
    resolution?: "refund" | "exchange" | "store_credit";
  } | null;

  if (!body?.itemIds?.length) {
    return NextResponse.json({ error: "Select at least one item to return." }, { status: 400 });
  }

  const result = createReturn({
    storeId: await currentStoreId(),
    orderId: id,
    itemIds: body.itemIds,
    reason: body.reason ?? "changed_mind",
    comment: body.comment ?? "",
    resolution: body.resolution ?? "refund",
  });

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ returnId: result.request.id, status: result.request.status });
}
