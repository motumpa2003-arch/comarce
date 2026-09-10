import { NextResponse } from "next/server";
import { getProductBySlug, getStoreDb } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";
import { toProductDetail } from "@/lib/product-detail";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const storeId = await currentStoreId();
  const product = getProductBySlug(storeId, slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ detail: toProductDetail(product, getStoreDb(storeId)) });
}
