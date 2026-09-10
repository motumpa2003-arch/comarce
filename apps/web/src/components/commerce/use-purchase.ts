"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@obsidian/ui";
import type { ProductDetail } from "@/lib/product-detail";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

export interface PurchaseState {
  options: Record<string, string>;
  setOption: (key: string, value: string) => void;
  variant: ProductDetail["variants"][number] | undefined;
  price: number;
  compareAtPrice?: number;
  discount: number;
  quantity: number;
  setQuantity: (value: number) => void;
  maxQuantity: number;
  inStock: boolean;
  stockLabel: string;
  activeImage: string | undefined;
  addToBag: (opts?: { silent?: boolean }) => void;
  buyNow: () => void;
  /** True when the product has variant axes the shopper has not chosen yet. */
  incomplete: boolean;
}

export function usePurchase(detail: ProductDetail): PurchaseState {
  const initial = React.useMemo(() => {
    const preferred = detail.variants.find((v) => v.id === detail.defaultVariantId) ?? detail.variants[0];
    return preferred?.options ?? {};
  }, [detail]);

  const [options, setOptions] = React.useState<Record<string, string>>(initial);
  const [quantity, setQuantity] = React.useState(1);

  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const setQuickView = useUi((s) => s.setQuickView);
  const { toast } = useToast();
  const router = useRouter();

  const setOption = React.useCallback(
    (key: string, value: string) => setOptions((current) => ({ ...current, [key]: value })),
    [],
  );

  const variant = React.useMemo(
    () =>
      detail.variants.find((candidate) =>
        Object.entries(options).every(([key, value]) => candidate.options[key] === value),
      ) ?? detail.variants.find((v) => v.id === detail.defaultVariantId),
    [detail, options],
  );

  const incomplete = detail.variantAttributes.some((attribute) => !options[attribute.key]);

  const price = variant?.price ?? detail.price;
  const compareAtPrice = variant?.compareAtPrice ?? detail.compareAtPrice;
  const discount =
    compareAtPrice && compareAtPrice > price ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  const available = variant?.available ?? detail.totalStock;
  const inStock = available > 0 || detail.allowBackorder;
  const maxQuantity = Math.max(1, Math.min(10, available || (detail.allowBackorder ? 5 : 1)));

  React.useEffect(() => {
    setQuantity((q) => Math.min(q, maxQuantity));
  }, [maxQuantity]);

  const stockLabel =
    available <= 0
      ? detail.allowBackorder
        ? "Available on backorder — ships in 7–10 days"
        : "Out of stock"
      : available <= 5
        ? `Hurry — only ${available} left`
        : available <= 20
          ? `Low stock — ${available} remaining`
          : "In stock, ready to ship";

  const activeImage = variant?.image ?? detail.media[0]?.url;

  const addToBag = React.useCallback(
    (opts?: { silent?: boolean }) => {
      if (!variant) return;
      add({
        productId: detail.id,
        variantId: variant.id,
        slug: detail.slug,
        name: detail.name,
        brandName: detail.brand?.name,
        variantTitle: variant.title,
        options: variant.options,
        image: variant.image ?? detail.media[0]?.url ?? "",
        unitPrice: variant.price,
        compareAtPrice: variant.compareAtPrice,
        maxQuantity,
        quantity,
      });
      setQuickView(null);
      if (opts?.silent) return;
      toast({
        title: "Added to your bag",
        description: `${detail.name}${variant.title !== "Default" ? ` · ${variant.title}` : ""}`,
        image: variant.image ?? detail.media[0]?.url,
        tone: "success",
        action: { label: "View bag", href: "/cart" },
      });
      openCart();
    },
    [add, detail, variant, quantity, maxQuantity, openCart, setQuickView, toast],
  );

  const buyNow = React.useCallback(() => {
    addToBag({ silent: true });
    router.push("/checkout");
  }, [addToBag, router]);

  return {
    options,
    setOption,
    variant,
    price,
    compareAtPrice,
    discount,
    quantity,
    setQuantity,
    maxQuantity,
    inStock,
    stockLabel,
    activeImage,
    addToBag,
    buyNow,
    incomplete,
  };
}
