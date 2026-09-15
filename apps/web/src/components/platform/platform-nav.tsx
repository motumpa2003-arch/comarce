"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@obsidian/ui";

const LINKS = [
  { href: "/platform", label: "Overview", exact: true },
  { href: "/platform/stores", label: "Stores" },
  { href: "/platform/subscriptions", label: "Subscriptions" },
  { href: "/platform/plans", label: "Plans" },
  { href: "/platform/revenue", label: "Revenue" },
  { href: "/platform/orders", label: "Orders" },
  { href: "/platform/payouts", label: "Payouts" },
  { href: "/platform/disputes", label: "Disputes" },
  { href: "/platform/risk", label: "Risk" },
  { href: "/platform/support", label: "Support" },
  { href: "/platform/users", label: "Users" },
  { href: "/platform/flags", label: "Flags" },
  { href: "/platform/incidents", label: "Incidents" },
  { href: "/platform/audit-logs", label: "Audit" },
  { href: "/platform/settings", label: "Settings" },
];

export function PlatformNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Platform" className="no-scrollbar -mx-1 min-w-0 flex-1 overflow-x-auto">
      <ul className="flex items-center gap-0.5">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "block whitespace-nowrap rounded-[var(--radius-sm)] px-3 py-1.5 text-[12px] transition-colors",
                  active
                    ? "bg-white/[0.1] font-medium text-accent"
                    : "text-inverse/60 hover:bg-white/[0.06] hover:text-inverse",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
