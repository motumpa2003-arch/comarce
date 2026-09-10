"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  LayoutDashboard,
  Megaphone,
  Package,
  Palette,
  Settings,
  ShoppingBag,
  Users,
  Wallet,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@obsidian/ui";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { useUi } from "@/store/ui";

const ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  package: Package,
  "shopping-bag": ShoppingBag,
  warehouse: Warehouse,
  users: Users,
  megaphone: Megaphone,
  palette: Palette,
  wallet: Wallet,
  settings: Settings,
};

export interface AdminBadges {
  orders: number;
  returns: number;
  lowStock: number;
  reviews: number;
  tickets: number;
}

export function AdminSidebar({
  storeName,
  storeMark,
  storeDomain,
  badges,
}: {
  storeName: string;
  storeMark: string;
  storeDomain: string;
  badges: AdminBadges;
}) {
  const pathname = usePathname();
  const open = useUi((s) => s.adminSidebarOpen);
  const toggle = useUi((s) => s.toggleAdminSidebar);

  React.useEffect(() => {
    toggle(false);
  }, [pathname, toggle]);

  const activeGroup = ADMIN_NAV.find((group) =>
    group.links.some((link) => (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href))),
  );

  const [expanded, setExpanded] = React.useState<string[]>(() =>
    activeGroup ? [activeGroup.label] : ["Overview"],
  );

  React.useEffect(() => {
    if (activeGroup && !expanded.includes(activeGroup.label)) {
      setExpanded((current) => [...current, activeGroup.label]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup?.label]);

  return (
    <>
      {open && (
        <div
          aria-hidden
          onClick={() => toggle(false)}
          className="fixed inset-0 z-40 bg-obsidian/50 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-white/[0.07] bg-obsidian text-inverse transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] px-4">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-accent/40 bg-accent/10 text-[11px] font-semibold text-accent">
              {storeMark}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-medium text-inverse">{storeName}</span>
              <span className="block truncate text-[10px] text-inverse/40">{storeDomain}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => toggle(false)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-inverse/60 hover:bg-white/[0.06] lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
          {ADMIN_NAV.map((group) => {
            const Icon = ICONS[group.icon] ?? LayoutDashboard;
            const isExpanded = expanded.includes(group.label);
            const hasActive = group.links.some((link) =>
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href),
            );

            return (
              <div key={group.label} className="mb-0.5">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((current) =>
                      current.includes(group.label)
                        ? current.filter((g) => g !== group.label)
                        : [...current, group.label],
                    )
                  }
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left transition-colors",
                    hasActive ? "text-inverse" : "text-inverse/60 hover:text-inverse",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-[12px] font-medium tracking-[0.02em]">{group.label}</span>
                  <ChevronDown
                    className={cn("h-3 w-3 shrink-0 transition-transform", isExpanded && "rotate-180")}
                  />
                </button>

                {isExpanded && (
                  <ul className="ml-[26px] space-y-0.5 border-l border-white/[0.08] pl-2.5">
                    {group.links.map((link) => {
                      const active =
                        link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
                      const badge = link.badgeKey ? badges[link.badgeKey] : 0;
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={cn(
                              "flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-[7px] text-[12px] transition-colors",
                              active
                                ? "bg-white/[0.09] font-medium text-accent"
                                : "text-inverse/55 hover:bg-white/[0.05] hover:text-inverse",
                            )}
                          >
                            <span className="flex-1 truncate">{link.label}</span>
                            {badge > 0 && (
                              <span className="grid h-[17px] min-w-[17px] shrink-0 place-items-center rounded-full bg-accent px-1 text-[9.5px] font-bold tabular-nums text-obsidian">
                                {badge > 99 ? "99+" : badge}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.07] p-2.5">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-[12px] text-inverse/55 transition-colors hover:bg-white/[0.05] hover:text-inverse"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View storefront
          </Link>
          <Link
            href="/platform"
            className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-[12px] text-inverse/55 transition-colors hover:bg-white/[0.05] hover:text-inverse"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Platform console
          </Link>
        </div>
      </aside>
    </>
  );
}
