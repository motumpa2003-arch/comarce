"use client";

import * as React from "react";
import type { CartLine } from "@obsidian/commerce";

export type CouponResult =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; discount: number; freeShipping: boolean; title: string }
  | { status: "invalid"; reason: string };

/**
 * Validates a coupon against the server so discount rules stay authoritative —
 * the client never decides what a code is worth.
 */
export function useCouponValidation(lines: CartLine[], code: string | null): CouponResult {
  const [result, setResult] = React.useState<CouponResult>({ status: "idle" });

  // Only the parts of the bag that affect the discount.
  const signature = React.useMemo(
    () => lines.map((l) => `${l.productId}:${l.unitPrice}:${l.quantity}`).join("|"),
    [lines],
  );

  React.useEffect(() => {
    if (!code) {
      setResult({ status: "idle" });
      return;
    }
    let cancelled = false;
    setResult({ status: "checking" });

    const payload = lines.map((l) => ({
      id: l.id,
      productId: l.productId,
      variantId: l.variantId,
      unitPrice: l.unitPrice,
      quantity: l.quantity,
      maxQuantity: l.maxQuantity,
    }));

    fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, lines: payload }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.valid) {
          setResult({
            status: "valid",
            discount: data.discount ?? 0,
            freeShipping: Boolean(data.freeShipping),
            title: data.title ?? "",
          });
        } else {
          setResult({ status: "invalid", reason: data?.reason ?? "That code could not be applied." });
        }
      })
      .catch(() => {
        if (!cancelled) setResult({ status: "invalid", reason: "Could not reach the server. Try again." });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, signature]);

  return result;
}
