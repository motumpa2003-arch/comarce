"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { cn } from "@obsidian/ui";
import { selectItemCount, useCart } from "@/store/cart";
import { useHydrated, useWishlist } from "@/store/shopper";
import { useUi } from "@/store/ui";

function CountBubble({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-accent px-1 text-[9.5px] font-bold tabular-nums text-obsidian">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SearchTrigger({ className }: { className?: string }) {
  const openSearch = useUi((s) => s.openSearch);
  return (
    <button
      type="button"
      onClick={openSearch}
      className={cn(
        "group flex h-11 w-full items-center gap-3 rounded-[var(--radius-button)] border border-line bg-muted px-4 text-left transition-colors hover:border-ink/30",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-ink-muted" />
      <span className="truncate text-[13px] text-ink-muted">Search for products, brands, categories…</span>
      <kbd className="ml-auto hidden shrink-0 rounded-[3px] border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink-muted lg:block">
        /
      </kbd>
    </button>
  );
}

export function HeaderActions() {
  const itemCount = useCart(selectItemCount);
  const wishlistCount = useWishlist((s) => s.items.length);
  const hydrated = useHydrated();
  const { openCart, openSearch, toggleMobileNav } = useUi();

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search"
        className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/[0.05] lg:hidden"
      >
        <Search className="h-[19px] w-[19px]" />
      </button>

      <Link
        href="/account"
        className="hidden h-11 items-center gap-2 rounded-full px-3 text-ink transition-colors hover:bg-ink/[0.05] sm:flex"
      >
        <User className="h-[18px] w-[18px]" />
        <span className="hidden text-[12px] font-medium xl:inline">Account</span>
      </Link>

      <Link
        href="/wishlist"
        aria-label="Wishlist"
        className="relative hidden h-11 items-center gap-2 rounded-full px-3 text-ink transition-colors hover:bg-ink/[0.05] sm:flex"
      >
        <span className="relative">
          <Heart className="h-[18px] w-[18px]" />
          {hydrated && <CountBubble count={wishlistCount} />}
        </span>
        <span className="hidden text-[12px] font-medium xl:inline">Wishlist</span>
      </Link>

      <button
        type="button"
        onClick={openCart}
        aria-label={`Bag, ${hydrated ? itemCount : 0} items`}
        className="relative flex h-11 items-center gap-2 rounded-full px-3 text-ink transition-colors hover:bg-ink/[0.05]"
      >
        <span className="relative">
          <ShoppingBag className="h-[18px] w-[18px]" />
          {hydrated && <CountBubble count={itemCount} />}
        </span>
        <span className="hidden text-[12px] font-medium xl:inline">Bag</span>
      </button>

      <button
        type="button"
        onClick={() => toggleMobileNav(true)}
        aria-label="Open menu"
        className="grid h-11 w-11 place-items-center rounded-full text-ink transition-colors hover:bg-ink/[0.05] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}
