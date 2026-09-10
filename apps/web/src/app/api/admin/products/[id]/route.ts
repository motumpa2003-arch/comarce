import { NextResponse } from "next/server";
import { updateProduct } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";

/** Merchant-side product save. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "A patch body is required." }, { status: 400 });

  const patch: Parameters<typeof updateProduct>[2] = {};
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.shortDescription === "string") patch.shortDescription = body.shortDescription;
  if (typeof body.description === "string") patch.description = body.description;
  if (typeof body.price === "number") patch.price = body.price;
  if (typeof body.compareAtPrice === "number") patch.compareAtPrice = body.compareAtPrice;
  if (body.status === "active" || body.status === "draft" || body.status === "archived") {
    patch.status = body.status;
  }

  const result = updateProduct(await currentStoreId(), id, patch);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 404 });

  return NextResponse.json({ id: result.product.id, updatedAt: result.product.updatedAt });
}
