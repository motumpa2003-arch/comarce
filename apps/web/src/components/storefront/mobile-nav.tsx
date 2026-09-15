"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { motion } from "framer-motion";
import type { NavigationItem } from "@obsidian/commerce";
import { Drawer, cn } from "@obsidian/ui";
import { selectItemCount, useCart } from "@/store/cart";
import { useHydrated, useWishlist } from "@/store/shopper";
import { useUi } from "@/store/ui";

export function MobileNav({ items, storeName }: { items: NavigationItem[]; storeName: string }) {
  const open = useUi((s) => s.mobileNavOpen);
  const toggle = useUi((s) => s.toggleMobileNav);
  const [stack, setStack] = React.useState<NavigationItem[]>([]);
  const pathname = usePathname();

  React.useEffect(() => {
    toggle(false);
    setStack([]);
  }, [pathname, toggle]);

  const current = stack[stack.length - 1];
  const list = current?.children ?? items;

  return (
    <Drawer
      open={open}
      onClose={() => toggle(false)}
      side="left"
      width="min(360px,88vw)"
      title={current ? current.label : storeName}
      description={current ? undefined : "Browse the full catalogue"}
    >
      <div className="flex flex-col">
        {current && (
          <button
            type="button"
            onClick={() => setStack((s) => s.slice(0, -1))}
            className="flex items-center gap-2 border-b border-line px-5 py-3 text-[12px] font-medium uppercase tracking-[0.1em] text-ink-muted"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>
        )}

        {current && (
          <Link
            href={current.href}
            className="flex items-center justify-between border-b border-line bg-muted px-5 py-3.5 text-[13px] font-medium text-ink"
          >
            Shop all {current.label}
            <ChevronRight className="h-3.5 w-3.5 text-ink-muted" />
          </Link>
        )}

        <ul className="divide-y divide-line">
          {list.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            return (
              <li key={item.id}>
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => setStack((s) => [...s, item])}
                    className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-muted"
                  >
                    {item.image && (
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                        <Image src={item.image} alt="" fill sizes="44px" className="object-cover" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1 text-[13.5px] text-ink">{item.label}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
                  </button>
                ) : (
                  <Link href={item.href} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted">
                    <span className="min-w-0 flex-1 text-[13.5px] text-ink">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-sale px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {!current && (
          <div className="mt-2 border-t border-line px-5 py-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Your account</p>
            <ul className="space-y-1">
              {[
                { label: "My account", href: "/account" },
                { label: "Orders & tracking", href: "/account/orders" },
                { label: "Wishlist", href: "/wishlist" },
                { label: "Rewards", href: "/account/rewards" },
                { label: "Help & support", href: "/pages/help" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block py-2 text-[13px] text-ink-muted hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* --------------------------- Bottom tab bar -------------------------- */

const TABS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore", href: "/categories", icon: LayoutGrid },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Bag", href: "/cart", icon: ShoppingBag },
  { label: "Account", href: "/account", icon: User },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const itemCount = useCart(selectItemCount);
  const wishlistCount = useWishlist((s) => s.items.length);
  const hydrated = useHydrated();

  // Checkout is a focused flow; the tab bar would only invite drop-off.
  if (pathname.startsWith("/checkout")) return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const count = tab.label === "Bag" ? itemCount : tab.label === "Wishlist" ? wishlistCount : 0;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-ink-muted",
                )}
              >
                <span className="relative">
                  <tab.icon className={cn("h-[19px] w-[19px]", active && "stroke-[2.2]")} />
                  {hydrated && count > 0 && (
                    <span className="absolute -right-2 -top-1.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-accent px-1 text-[9px] font-bold tabular-nums text-obsidian">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                {tab.label}
                {active && (
                  <motion.span
                    layoutId="mobile-tab-active"
                    className="absolute inset-x-6 top-0 h-[2px] rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
