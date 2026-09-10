import { NextResponse } from "next/server";
import type { OrderStatus } from "@obsidian/commerce";
import { advanceOrderStatus } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";

/** Merchant-side status advance, used by the admin order console. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { next?: OrderStatus; actor?: string } | null;
  if (!body?.next) return NextResponse.json({ error: "A target status is required." }, { status: 400 });

  const result = advanceOrderStatus(await currentStoreId(), id, body.next, body.actor ?? "Merchant");
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({
    status: result.order.status,
    paymentStatus: result.order.paymentStatus,
    fulfilmentStatus: result.order.fulfilmentStatus,
  });
}
