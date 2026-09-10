import { NextResponse } from "next/server";
import type { Address, CartLine, PaymentMethodKind } from "@obsidian/commerce";
import { placeOrder } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";

interface PlaceOrderBody {
  lines?: CartLine[];
  contact?: { name: string; email: string; phone: string };
  shippingAddress?: Address;
  shippingMethodId?: string;
  paymentMethod?: PaymentMethodKind;
  couponCode?: string | null;
  loyaltyPointsRedeemed?: number;
  useStoreCredit?: boolean;
  giftMessage?: string;
  note?: string;
  customerId?: string;
}

export async function POST(request: Request) {
  const storeId = await currentStoreId();
  const body = (await request.json().catch(() => null)) as PlaceOrderBody | null;

  if (!body?.lines?.length) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }
  if (!body.contact?.email || !body.shippingAddress) {
    return NextResponse.json({ error: "Contact and delivery address are required." }, { status: 400 });
  }

  // A card decline path so the failure branch is demonstrable end to end.
  if (body.paymentMethod === "card" && body.contact.email.startsWith("decline@")) {
    return NextResponse.json({ error: "Payment was declined by the issuing bank." }, { status: 402 });
  }

  const { order } = placeOrder({
    storeId,
    lines: body.lines,
    customerId: body.customerId,
    contact: body.contact,
    shippingAddress: body.shippingAddress,
    shippingMethodId: body.shippingMethodId ?? "standard",
    paymentMethod: body.paymentMethod ?? "upi",
    couponCode: body.couponCode ?? null,
    loyaltyPointsRedeemed: body.loyaltyPointsRedeemed,
    useStoreCredit: body.useStoreCredit,
    giftMessage: body.giftMessage,
    note: body.note,
  });

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: order.total,
    status: order.status,
  });
}
