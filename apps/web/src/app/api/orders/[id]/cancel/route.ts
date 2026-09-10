import { NextResponse } from "next/server";
import { cancelOrder } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = cancelOrder(await currentStoreId(), id, "Customer");
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ status: result.order.status });
}
