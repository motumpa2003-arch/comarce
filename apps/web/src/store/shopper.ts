"use client";

import * as React from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ProductSnapshot {
  id: string;
  slug: string;
  name: string;
  brandName?: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  ratingCount: number;
  inStock: boolean;
}

/* ------------------------------ Wishlist ---------------------------- */

interface WishlistState {
  items: ProductSnapshot[];
  toggle: (item: ProductSnapshot) => boolean;
  add: (item: ProductSnapshot) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        set((state) => ({
          items: exists ? state.items.filter((i) => i.id !== item.id) : [item, ...state.items],
        }));
        return !exists;
      },
      add: (item) =>
        set((state) =>
          state.items.some((i) => i.id === item.id) ? state : { items: [item, ...state.items] },
        ),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      has: (id) => get().items.some((i) => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: "obsidian.wishlist.v1", storage: createJSONStorage(() => localStorage) },
  ),
);

/* --------------------------- Recently viewed ------------------------ */

interface RecentState {
  ids: string[];
  push: (id: string) => void;
  clear: () => void;
}

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) =>
        set((state) => ({ ids: [id, ...state.ids.filter((x) => x !== id)].slice(0, 20) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "obsidian.recent.v1", storage: createJSONStorage(() => localStorage) },
  ),
);

/* ------------------------------ Compare ----------------------------- */

interface CompareState {
  items: ProductSnapshot[];
  toggle: (item: ProductSnapshot) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set) => ({
      items: [],
      toggle: (item) =>
        set((state) => ({
          items: state.items.some((i) => i.id === item.id)
            ? state.items.filter((i) => i.id !== item.id)
            : [...state.items, item].slice(-4),
        })),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "obsidian.compare.v1", storage: createJSONStorage(() => localStorage) },
  ),
);

/* ---------------------------- Search history ------------------------ */

interface SearchState {
  recent: string[];
  push: (term: string) => void;
  clear: () => void;
}

export const useSearchHistory = create<SearchState>()(
  persist(
    (set) => ({
      recent: [],
      push: (term) =>
        set((state) => {
          const value = term.trim();
          if (!value) return state;
          return { recent: [value, ...state.recent.filter((t) => t !== value)].slice(0, 8) };
        }),
      clear: () => set({ recent: [] }),
    }),
    { name: "obsidian.search.v1", storage: createJSONStorage(() => localStorage) },
  ),
);

/* ------------------------------ Hydration --------------------------- */

/**
 * Persisted stores read localStorage after mount, so anything driven by them
 * must render its server value on the first paint. Gate on this.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
}
