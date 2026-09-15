"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { Badge, cn } from "@obsidian/ui";
import type { NavigationItem } from "@obsidian/commerce";

export function MainNav({ items, tagline }: { items: NavigationItem[]; tagline: string }) {
  const [openId, setOpenId] = React.useState<string | null>(null);
  const closeTimer = React.useRef<number | undefined>(undefined);
  const pathname = usePathname();

  React.useEffect(() => {
    setOpenId(null);
  }, [pathname]);

  const open = (id: string) => {
    window.clearTimeout(closeTimer.current);
    setOpenId(id);
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenId(null), 140);
  };

  const [shopItem, ...rest] = items;
  const active = items.find((i) => i.id === openId);

  return (
    <div
      className="relative hidden border-t border-white/[0.08] bg-obsidian lg:block"
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-[46px] max-w-[var(--container-width)] items-center gap-1 px-4 sm:px-6 lg:px-10">
        {shopItem && (
          <button
            type="button"
            onMouseEnter={() => open(shopItem.id)}
            onClick={() => setOpenId((id) => (id === shopItem.id ? null : shopItem.id))}
            aria-expanded={openId === shopItem.id}
            className={cn(
              "-ml-1 mr-3 flex h-[34px] items-center gap-2 rounded-[var(--radius-button)] bg-primary px-3.5 text-[11.5px] font-medium uppercase tracking-[0.1em] text-inverse transition-colors hover:bg-primary-hover",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            All categories
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", openId === shopItem.id && "rotate-180")}
            />
          </button>
        )}

        <nav className="flex items-center gap-0.5">
          {rest.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <div key={item.id} onMouseEnter={() => (hasChildren ? open(item.id) : setOpenId(null))}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex h-[46px] items-center gap-1.5 px-3 text-[12px] font-medium tracking-[0.02em] transition-colors",
                    isActive || openId === item.id ? "text-accent" : "text-inverse/75 hover:text-accent",
                  )}
                >
                  {item.label}
                  {item.badge && (
                    <Badge tone="sale" size="xs" className="ml-0.5">
                      {item.badge}
                    </Badge>
                  )}
                  {hasChildren && <ChevronDown className="h-3 w-3 opacity-60" />}
                  {(isActive || openId === item.id) && (
                    <motion.span
                      layoutId="nav-active-underline"
                      className="absolute inset-x-3 bottom-0 h-[2px] bg-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <p className="ml-auto hidden font-display text-[13px] italic tracking-wide text-accent xl:block">
          {tagline}
        </p>
      </div>

      {/* --------------------------- Mega menu --------------------------- */}
      {active?.children?.length ? (
        <div
          onMouseEnter={() => open(active.id)}
          className="absolute inset-x-0 top-full z-40 animate-fade-in border-y border-line bg-surface shadow-xl"
        >
          <div className="mx-auto max-w-[var(--container-width)] px-4 py-8 sm:px-6 lg:px-10">
            {active.id === "nav_shop" ? (
              <CategoryMegaMenu items={active.children} />
            ) : (
              <CollectionMegaMenu items={active.children} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CategoryMegaMenu({ items }: { items: NavigationItem[] }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = items[activeIndex];

  return (
    <div className="grid grid-cols-[240px_1fr_320px] gap-8">
      <ul className="border-r border-line pr-4">
        {items.map((item, index) => (
          <li key={item.id}>
            <Link
              href={item.href}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                "flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-[9px] text-[12.5px] transition-colors",
                index === activeIndex ? "bg-muted font-medium text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {item.label}
              <ArrowRight
                className={cn(
                  "h-3.5 w-3.5 transition-all",
                  index === activeIndex ? "translate-x-0 opacity-70" : "-translate-x-1 opacity-0",
                )}
              />
            </Link>
          </li>
        ))}
      </ul>

      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-display display-case text-[19px] text-ink">{active?.label}</h3>
          <Link
            href={active?.href ?? "/shop"}
            className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            Shop all
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
          {active?.children?.map((child) => (
            <li key={child.id}>
              <Link
                href={child.href}
                className="block py-[7px] text-[12.5px] text-ink-muted transition-colors hover:text-primary"
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
        {active?.description && (
          <p className="mt-5 max-w-md text-[12px] leading-relaxed text-ink-muted">{active.description}</p>
        )}
      </div>

      {active?.image && (
        <Link href={active.href} className="group relative overflow-hidden rounded-[var(--radius-card)]">
          <div className="relative aspect-[4/5]">
            <Image
              src={active.image}
              alt={active.label}
              fill
              sizes="320px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[9.5px] font-medium uppercase tracking-[0.2em] text-accent">Explore</p>
            <p className="mt-1 font-display display-case text-[20px] leading-tight text-inverse">
              {active.label}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-inverse">
              Shop now <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}

function CollectionMegaMenu({ items }: { items: NavigationItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-5">
      {items.slice(0, 8).map((item) => (
        <Link key={item.id} href={item.href} className="group">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] bg-muted">
            {item.image && (
              <Image
                src={item.image}
                alt={item.label}
                fill
                sizes="260px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
          </div>
          <p className="mt-2.5 text-[13px] font-medium text-ink transition-colors group-hover:text-primary">
            {item.label}
          </p>
          {item.description && (
            <p className="mt-0.5 line-clamp-2x text-[11.5px] leading-snug text-ink-muted">
              {item.description}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
