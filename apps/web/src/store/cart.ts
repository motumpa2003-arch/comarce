"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine } from "@obsidian/commerce";

export interface AddToCartInput {
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  brandName?: string;
  variantTitle: string;
  options: Record<string, string>;
  image: string;
  unitPrice: number;
  compareAtPrice?: number;
  maxQuantity: number;
  quantity?: number;
  giftWrap?: boolean;
  personalization?: string;
}

interface CartState {
  storeId: string;
  lines: CartLine[];
  couponCode: string | null;
  shippingMethodId: string;
  loyaltyPointsRedeemed: number;
  useStoreCredit: boolean;
  giftMessage: string;
  /** Set once an order is placed so the confirmation page can render it. */
  lastOrderId: string | null;

  setStore: (storeId: string) => void;
  add: (input: AddToCartInput) => void;
  remove: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  toggleGiftWrap: (lineId: string) => void;
  setCoupon: (code: string | null) => void;
  setShippingMethod: (id: string) => void;
  setLoyaltyPoints: (points: number) => void;
  setUseStoreCredit: (value: boolean) => void;
  setGiftMessage: (value: string) => void;
  clear: () => void;
  setLastOrderId: (id: string | null) => void;
}

const lineKey = (productId: string, variantId: string) => `${productId}::${variantId}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      storeId: "obsidian",
      lines: [],
      couponCode: null,
      shippingMethodId: "standard",
      loyaltyPointsRedeemed: 0,
      useStoreCredit: false,
      giftMessage: "",
      lastOrderId: null,

      setStore: (storeId) => {
        // Switching tenant must not leak another store's bag.
        if (get().storeId !== storeId) set({ storeId, lines: [], couponCode: null });
      },

      add: (input) =>
        set((state) => {
          const id = lineKey(input.productId, input.variantId);
          const quantity = input.quantity ?? 1;
          const existing = state.lines.find((line) => line.id === id);

          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.id === id
                  ? { ...line, quantity: Math.min(line.maxQuantity, line.quantity + quantity) }
                  : line,
              ),
            };
          }

          const line: CartLine = {
            id,
            productId: input.productId,
            variantId: input.variantId,
            slug: input.slug,
            name: input.name,
            brandName: input.brandName,
            variantTitle: input.variantTitle,
            options: input.options,
            image: input.image,
            unitPrice: input.unitPrice,
            compareAtPrice: input.compareAtPrice,
            quantity: Math.min(input.maxQuantity || 10, quantity),
            maxQuantity: input.maxQuantity || 10,
            giftWrap: input.giftWrap,
            personalization: input.personalization,
            addedAt: new Date().toISOString(),
          };
          return { lines: [line, ...state.lines] };
        }),

      remove: (lineId) => set((state) => ({ lines: state.lines.filter((line) => line.id !== lineId) })),

      setQuantity: (lineId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.id !== lineId)
              : state.lines.map((line) =>
                  line.id === lineId
                    ? { ...line, quantity: Math.min(line.maxQuantity, Math.max(1, quantity)) }
                    : line,
                ),
        })),

      toggleGiftWrap: (lineId) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === lineId ? { ...line, giftWrap: !line.giftWrap } : line,
          ),
        })),

      setCoupon: (code) => set({ couponCode: code }),
      setShippingMethod: (id) => set({ shippingMethodId: id }),
      setLoyaltyPoints: (points) => set({ loyaltyPointsRedeemed: Math.max(0, points) }),
      setUseStoreCredit: (value) => set({ useStoreCredit: value }),
      setGiftMessage: (value) => set({ giftMessage: value }),
      clear: () =>
        set({ lines: [], couponCode: null, loyaltyPointsRedeemed: 0, useStoreCredit: false, giftMessage: "" }),
      setLastOrderId: (id) => set({ lastOrderId: id }),
    }),
    {
      name: "obsidian.cart.v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export const selectItemCount = (state: CartState) =>
  state.lines.reduce((n, line) => n + line.quantity, 0);

export const selectSubtotal = (state: CartState) =>
  state.lines.reduce((n, line) => n + line.unitPrice * line.quantity, 0);
