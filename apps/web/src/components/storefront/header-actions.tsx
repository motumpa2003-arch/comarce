"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@obsidian/ui";
import { selectItemCount, useCart } from "@/store/cart";
import { useHydrated, useWishlist } from "@/store/shopper";
import { useUi } from "@/store/ui";

function CountBubble({ count }: { count: number }) {
  const previous = React.useRef(count);
  const grew = count > previous.current;
  React.useEffect(() => {
    previous.current = count;
  }, [count]);

  if (count <= 0) return null;
  return (
    <motion.span
      key={grew ? `pulse-${count}` : "bubble"}
      initial={grew ? { scale: 1 } : false}
      animate={grew ? { scale: [1, 1.35, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-accent px-1 text-[9.5px] font-bold tabular-nums text-obsidian",
        grew && "animate-pulse-ring",
      )}
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
}

export function SearchTrigger({ className }: { className?: string }) {
  const openSearch = useUi((s) => s.openSearch);
  return (
    <button
      type="button"
      onClick={openSearch}
      className={cn(
        "group flex h-11 w-full items-center gap-3 rounded-[var(--radius-button)] border border-white/15 bg-white/[0.08] px-4 text-left transition-colors hover:border-white/30 hover:bg-white/[0.12]",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-inverse/55" />
      <span className="truncate text-[13px] text-inverse/55">Search for products, brands, categories…</span>
      <kbd className="ml-auto hidden shrink-0 rounded-[3px] border border-white/15 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-inverse/60 lg:block">
        /
      </kbd>
    </button>
  );
}

export function HeaderActions() {
  const itemCount = useCart(selectItemCount);
  const wishlistCount = useWishlist((s) => s.items.length);
  const hydrated = useHydrated();
  const { openCart, openSearch, toggleMobileNav, setCartIconRect } = useUi();

  const registerCartIcon = React.useCallback(
    (node: HTMLButtonElement | null) => {
      if (!node) return;
      const report = () => setCartIconRect(node.getBoundingClientRect());
      report();
      window.addEventListener("resize", report);
      return () => window.removeEventListener("resize", report);
    },
    [setCartIconRect],
  );

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search"
        className="grid h-11 w-11 place-items-center rounded-full text-inverse transition-colors hover:bg-white/10 lg:hidden"
      >
        <Search className="h-[19px] w-[19px]" />
      </button>

      <Link
        href="/account"
        className="hidden h-11 items-center gap-2 rounded-full px-3 text-inverse transition-colors hover:bg-white/10 sm:flex"
      >
        <User className="h-[18px] w-[18px]" />
        <span className="hidden text-[12px] font-medium xl:inline">Account</span>
      </Link>

      <Link
        href="/wishlist"
        aria-label="Wishlist"
        className="relative hidden h-11 items-center gap-2 rounded-full px-3 text-inverse transition-colors hover:bg-white/10 sm:flex"
      >
        <span className="relative">
          <Heart className="h-[18px] w-[18px]" />
          {hydrated && <CountBubble count={wishlistCount} />}
        </span>
        <span className="hidden text-[12px] font-medium xl:inline">Wishlist</span>
      </Link>

      <button
        ref={registerCartIcon}
        type="button"
        onClick={openCart}
        aria-label={`Bag, ${hydrated ? itemCount : 0} items`}
        className="relative flex h-11 items-center gap-2 rounded-full px-3 text-inverse transition-colors hover:bg-white/10"
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
        className="grid h-11 w-11 place-items-center rounded-full text-inverse transition-colors hover:bg-white/10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}
