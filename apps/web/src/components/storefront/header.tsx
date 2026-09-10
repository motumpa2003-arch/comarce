import Link from "next/link";
import { getMenu } from "@obsidian/data";
import type { StoreDatabase } from "@obsidian/data";
import { AnnouncementBar, type StoreOption } from "./announcement-bar";
import { HeaderActions, SearchTrigger } from "./header-actions";
import { MainNav } from "./main-nav";
import { StickyHeader } from "./sticky-header";

export function Wordmark({ store, inverse }: { store: StoreDatabase["store"]; inverse?: boolean }) {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={`${store.name} home`}>
      <span
        className={`grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border text-[13px] font-semibold tracking-tight transition-colors ${
          inverse
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-accent/50 bg-accent/10 text-accent group-hover:bg-accent group-hover:text-obsidian"
        }`}
      >
        {store.logoMark}
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display display-case text-[17px] leading-none ${inverse ? "text-inverse" : "text-ink"}`}
        >
          {store.logoText}
        </span>
        <span className="mt-[3px] text-[8.5px] font-medium uppercase tracking-[0.32em] text-ink-muted">
          Commerce
        </span>
      </span>
    </Link>
  );
}

export function StorefrontHeader({ db, stores }: { db: StoreDatabase; stores: StoreOption[] }) {
  const menu = getMenu(db.store.id, "main");

  return (
    <header className="relative z-50">
      <AnnouncementBar storeId={db.store.id} stores={stores} />

      <StickyHeader>
        <div className="border-b border-line bg-surface">
          <div className="mx-auto flex h-[72px] max-w-[var(--container-width)] items-center gap-4 px-4 sm:px-6 lg:gap-10 lg:px-10">
            <Wordmark store={db.store} />
            <div className="hidden max-w-[620px] flex-1 lg:block">
              <SearchTrigger />
            </div>
            <div className="ml-auto">
              <HeaderActions />
            </div>
          </div>
        </div>

        <MainNav items={menu?.items ?? []} tagline={db.store.tagline} />
      </StickyHeader>
    </header>
  );
}
