"use client";

import { create } from "zustand";

interface UiState {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileNavOpen: boolean;
  filtersOpen: boolean;
  quickViewSlug: string | null;
  notificationsOpen: boolean;
  adminSidebarOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMobileNav: (value?: boolean) => void;
  toggleFilters: (value?: boolean) => void;
  setQuickView: (slug: string | null) => void;
  toggleNotifications: (value?: boolean) => void;
  toggleAdminSidebar: (value?: boolean) => void;
  closeAll: () => void;
}

export const useUi = create<UiState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileNavOpen: false,
  filtersOpen: false,
  quickViewSlug: null,
  notificationsOpen: false,
  adminSidebarOpen: false,

  openCart: () => set({ cartOpen: true, searchOpen: false, mobileNavOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true, cartOpen: false, mobileNavOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  toggleMobileNav: (value) => set((s) => ({ mobileNavOpen: value ?? !s.mobileNavOpen })),
  toggleFilters: (value) => set((s) => ({ filtersOpen: value ?? !s.filtersOpen })),
  setQuickView: (slug) => set({ quickViewSlug: slug }),
  toggleNotifications: (value) => set((s) => ({ notificationsOpen: value ?? !s.notificationsOpen })),
  toggleAdminSidebar: (value) => set((s) => ({ adminSidebarOpen: value ?? !s.adminSidebarOpen })),
  closeAll: () =>
    set({ cartOpen: false, searchOpen: false, mobileNavOpen: false, filtersOpen: false, quickViewSlug: null }),
}));
