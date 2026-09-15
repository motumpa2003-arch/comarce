"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  Bookmark,
  CreditCard,
  FileLock,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPin,
  Package,
  Repeat,
  Settings,
  Shield,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react";
import { cn } from "@obsidian/ui";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders & tracking", icon: Package, countKey: "orders" as const },
  { href: "/account/buy-again", label: "Buy again", icon: Repeat },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/saved-searches", label: "Saved searches", icon: Bookmark },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, countKey: "addresses" as const },
  { href: "/account/payment-methods", label: "Payment methods", icon: CreditCard },
  { href: "/account/rewards", label: "Rewards", icon: Award, countKey: "points" as const },
  { href: "/account/referrals", label: "Referrals", icon: Users },
  { href: "/account/reviews", label: "My reviews", icon: Star },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/support", label: "Help & support", icon: LifeBuoy },
  { href: "/account/preferences", label: "Preferences", icon: SlidersHorizontal },
  { href: "/account/security", label: "Security", icon: Shield },
  { href: "/account/privacy", label: "Privacy & data", icon: FileLock },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountNav({
  counts,
}: {
  counts: { orders: number; returns: number; addresses: number; points: number };
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="lg:sticky lg:top-[180px] lg:self-start">
      <ul className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          const count = link.countKey ? counts[link.countKey] : undefined;
          return (
            <li key={link.href} className="shrink-0 lg:shrink">
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[13px] transition-colors lg:whitespace-normal",
                  active ? "bg-muted font-medium text-ink" : "text-ink-muted hover:bg-muted/60 hover:text-ink",
                )}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{link.label}</span>
                {count != null && count > 0 && (
                  <span className="hidden shrink-0 text-[11px] tabular-nums text-ink-muted lg:inline">{count}</span>
                )}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 lg:mt-4 lg:border-t lg:border-line lg:pt-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 whitespace-nowrap rounded-[var(--radius-sm)] px-3.5 py-2.5 text-[13px] text-ink-muted transition-colors hover:text-danger"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </Link>
        </li>
      </ul>
    </nav>
  );
}
