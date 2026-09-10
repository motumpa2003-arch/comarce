"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, Plus, Search, Store } from "lucide-react";
import { Avatar, Badge, MenuItem, Popover, cn } from "@obsidian/ui";
import { relativeTime } from "@/lib/format";
import { STORE_COOKIE } from "@/lib/tenant-shared";
import { useUi } from "@/store/ui";

export interface TopbarNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  category: string;
}

export interface TopbarStore {
  id: string;
  name: string;
  logoMark: string;
  industry: string;
}

export function AdminTopbar({
  storeId,
  stores,
  staff,
  notifications,
}: {
  storeId: string;
  stores: TopbarStore[];
  staff: { name: string; email: string; avatar: string; role: string };
  notifications: TopbarNotification[];
}) {
  const toggleSidebar = useUi((s) => s.toggleAdminSidebar);
  const router = useRouter();
  const unread = notifications.filter((n) => !n.read).length;
  const active = stores.find((s) => s.id === storeId);

  const switchStore = (id: string) => {
    document.cookie = `${STORE_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
    router.push("/admin");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:px-6">
      <button
        type="button"
        onClick={() => toggleSidebar(true)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] text-ink hover:bg-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      {/* Store switcher */}
      <Popover
        align="start"
        panelClassName="w-[260px]"
        trigger={({ toggle, open }) => (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className="flex h-9 items-center gap-2 rounded-[var(--radius-sm)] border border-line px-2.5 text-[12px] text-ink transition-colors hover:border-ink/30"
          >
            <Store className="h-3.5 w-3.5 text-ink-muted" />
            <span className="max-w-[140px] truncate font-medium">{active?.name ?? "Store"}</span>
            <ChevronDown className="h-3 w-3 text-ink-muted" />
          </button>
        )}
      >
        {({ close }) => (
          <div>
            <p className="px-3.5 pb-2 pt-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Switch store
            </p>
            {stores.map((store) => (
              <MenuItem
                key={store.id}
                className={cn(store.id === storeId && "bg-muted font-medium")}
                onClick={() => {
                  close();
                  if (store.id !== storeId) switchStore(store.id);
                }}
                icon={
                  <span className="grid h-6 w-6 place-items-center rounded-[3px] bg-obsidian text-[9px] font-bold text-accent">
                    {store.logoMark}
                  </span>
                }
              >
                <span className="flex flex-col">
                  <span className="truncate">{store.name}</span>
                  <span className="text-[10.5px] capitalize text-ink-muted">{store.industry}</span>
                </span>
              </MenuItem>
            ))}
          </div>
        )}
      </Popover>

      {/* Search */}
      <div className="hidden min-w-0 flex-1 md:block">
        <label className="relative block max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            placeholder="Search orders, products, customers…"
            className="h-9 w-full rounded-[var(--radius-sm)] border border-line bg-muted pl-9 pr-3 text-[12.5px] text-ink outline-none placeholder:text-ink-muted/70 focus:border-primary focus:bg-surface"
          />
        </label>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Link
          href="/admin/products/new"
          className="hidden h-9 items-center gap-1.5 rounded-[var(--radius-sm)] bg-primary px-3 text-[11.5px] font-medium uppercase tracking-[0.08em] text-inverse transition-colors hover:bg-primary-hover sm:flex"
        >
          <Plus className="h-3.5 w-3.5" />
          New product
        </Link>

        {/* Notifications */}
        <Popover
          align="end"
          panelClassName="w-[340px] py-0"
          trigger={({ toggle, open }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-label={`Notifications, ${unread} unread`}
              className="relative grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] text-ink transition-colors hover:bg-muted"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          )}
        >
          <div>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Notifications</p>
              <Badge tone="neutral" size="xs">
                {unread} new
              </Badge>
            </div>
            <ul className="max-h-[340px] divide-y divide-line overflow-y-auto">
              {notifications.slice(0, 8).map((notification) => (
                <li key={notification.id}>
                  <Link
                    href={notification.actionUrl ?? "#"}
                    className={cn(
                      "block px-4 py-3 transition-colors hover:bg-muted",
                      !notification.read && "bg-primary/[0.03]",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!notification.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium text-ink">{notification.title}</p>
                        <p className="mt-0.5 line-clamp-2x text-[11.5px] leading-snug text-ink-muted">
                          {notification.body}
                        </p>
                        <p className="mt-1 text-[10.5px] text-ink-muted">{relativeTime(notification.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Popover>

        {/* Account */}
        <Popover
          align="end"
          panelClassName="w-[220px]"
          trigger={({ toggle, open }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="flex h-9 items-center gap-2 rounded-[var(--radius-sm)] pl-1 pr-2 transition-colors hover:bg-muted"
            >
              <Avatar src={staff.avatar} name={staff.name} size={28} />
              <ChevronDown className="h-3 w-3 text-ink-muted" />
            </button>
          )}
        >
          <div>
            <div className="border-b border-line px-3.5 py-3">
              <p className="text-[12.5px] font-medium text-ink">{staff.name}</p>
              <p className="truncate text-[11px] text-ink-muted">{staff.email}</p>
              <Badge tone="info" size="xs" className="mt-2 capitalize">
                {staff.role.replace(/_/g, " ")}
              </Badge>
            </div>
            <MenuItem onClick={() => router.push("/admin/settings")}>Store settings</MenuItem>
            <MenuItem onClick={() => router.push("/admin/settings/staff")}>Staff &amp; roles</MenuItem>
            <MenuItem onClick={() => router.push("/platform")}>Platform console</MenuItem>
            <MenuItem onClick={() => router.push("/")}>View storefront</MenuItem>
            <MenuItem danger onClick={() => router.push("/")}>
              Sign out
            </MenuItem>
          </div>
        </Popover>
      </div>
    </header>
  );
}
