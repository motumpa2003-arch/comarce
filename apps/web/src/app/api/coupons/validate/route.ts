import { NextResponse } from "next/server";
import { validateCoupon, type CartLine } from "@obsidian/commerce";
import { getCouponByCode } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";

export async function POST(request: Request) {
  const storeId = await currentStoreId();
  const body = (await request.json().catch(() => null)) as
    | { code?: string; lines?: Partial<CartLine>[] }
    | null;

  const code = body?.code?.trim();
  if (!code) {
    return NextResponse.json({ valid: false, reason: "Enter a coupon code." }, { status: 400 });
  }

  const coupon = getCouponByCode(storeId, code);
  if (!coupon) {
    return NextResponse.json({ valid: false, reason: `“${code.toUpperCase()}” is not a valid code.` });
  }

  const lines = (body?.lines ?? []).map((line, index) => ({
    id: line.id ?? String(index),
    productId: line.productId ?? "",
    variantId: line.variantId ?? "",
    slug: line.slug ?? "",
    name: line.name ?? "",
    variantTitle: line.variantTitle ?? "",
    options: line.options ?? {},
    image: line.image ?? "",
    unitPrice: line.unitPrice ?? 0,
    compareAtPrice: line.compareAtPrice,
    quantity: line.quantity ?? 1,
    maxQuantity: line.maxQuantity ?? 10,
    addedAt: line.addedAt ?? new Date(0).toISOString(),
  })) satisfies CartLine[];

  const subtotal = lines.reduce((n, line) => n + line.unitPrice * line.quantity, 0);
  const result = validateCoupon(coupon, { subtotal, lines });

  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    title: coupon.title,
    description: coupon.description,
    discount: result.discount,
    freeShipping: result.freeShipping,
  });
}
