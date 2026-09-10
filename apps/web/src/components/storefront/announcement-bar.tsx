"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck, ChevronDown, RotateCcw, Truck } from "lucide-react";
import { Popover, MenuItem, cn } from "@obsidian/ui";
import { useRouter } from "next/navigation";
import { STORE_COOKIE } from "@/lib/tenant-shared";

const MESSAGES = [
  { icon: Truck, text: "Free shipping on orders above ₹999" },
  { icon: RotateCcw, text: "Easy 30 day returns" },
  { icon: BadgeCheck, text: "100% authentic products" },
];

export interface StoreOption {
  id: string;
  name: string;
  industry: string;
  logoMark: string;
  themePreset: string;
  products: number;
}

export function AnnouncementBar({
  storeId,
  stores,
}: {
  storeId: string;
  stores: StoreOption[];
}) {
  const [index, setIndex] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4200);
    return () => window.clearInterval(id);
  }, []);

  const switchStore = (id: string) => {
    document.cookie = `${STORE_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
    // A tenant change swaps the whole catalogue, so land on the home page.
    router.push("/");
  };

  const active = stores.find((s) => s.id === storeId);

  return (
    <div className="border-b border-white/[0.08] bg-obsidian text-inverse">
      <div className="mx-auto flex h-9 max-w-[var(--container-width)] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Rotating trust messages — all three on desktop, one at a time on mobile */}
        <div className="hidden items-center gap-7 md:flex">
          {MESSAGES.map((message) => (
            <span key={message.text} className="flex items-center gap-1.5 text-[11px] text-inverse/70">
              <message.icon className="h-3.5 w-3.5 text-accent" />
              {message.text}
            </span>
          ))}
        </div>
        <div className="relative h-4 flex-1 overflow-hidden md:hidden">
          {MESSAGES.map((message, i) => (
            <span
              key={message.text}
              className={cn(
                "absolute inset-0 flex items-center gap-1.5 text-[11px] text-inverse/75 transition-all duration-500",
                i === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              <message.icon className="h-3.5 w-3.5 text-accent" />
              {message.text}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-5 text-[11px] text-inverse/70">
          <Link href="/track" className="hidden transition-colors hover:text-inverse sm:inline">
            Track order
          </Link>
          <Link href="/platform" className="hidden transition-colors hover:text-inverse sm:inline">
            Sell on Obsidian
          </Link>
          <Link href="/pages/help" className="hidden transition-colors hover:text-inverse lg:inline">
            Help &amp; support
          </Link>

          <Popover
            align="end"
            panelClassName="w-[280px] border-white/10 bg-obsidian text-inverse"
            trigger={({ toggle, open }) => (
              <button
                type="button"
                onClick={toggle}
                className="flex items-center gap-1.5 transition-colors hover:text-inverse"
                aria-expanded={open}
              >
                <span className="grid h-4 w-4 place-items-center rounded-[2px] bg-accent text-[8px] font-bold text-obsidian">
                  {active?.logoMark ?? "OB"}
                </span>
                <span className="hidden sm:inline">{active?.name ?? "Obsidian"}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            )}
          >
            {({ close }) => (
              <div>
                <p className="px-3.5 pb-2 pt-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-inverse/45">
                  Demo tenants · switch storefront
                </p>
                {stores.map((store) => (
                  <MenuItem
                    key={store.id}
                    className={cn(
                      "text-inverse/85 hover:bg-white/[0.07]",
                      store.id === storeId && "bg-white/[0.06] text-inverse",
                    )}
                    onClick={() => {
                      close();
                      if (store.id !== storeId) switchStore(store.id);
                    }}
                    icon={
                      <span className="grid h-6 w-6 place-items-center rounded-[3px] bg-white/10 text-[9px] font-bold text-accent">
                        {store.logoMark}
                      </span>
                    }
                  >
                    <span className="flex flex-col">
                      <span className="truncate">{store.name}</span>
                      <span className="text-[10.5px] capitalize text-inverse/45">
                        {store.industry} · {store.themePreset} theme · {store.products} products
                      </span>
                    </span>
                  </MenuItem>
                ))}
              </div>
            )}
          </Popover>
        </div>
      </div>
    </div>
  );
}
