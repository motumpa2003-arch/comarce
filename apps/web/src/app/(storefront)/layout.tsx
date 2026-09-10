import type { Metadata } from "next";
import { getMenu } from "@obsidian/data";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontHeader } from "@/components/storefront/header";
import { MobileNav, MobileTabBar } from "@/components/storefront/mobile-nav";
import { QuickView } from "@/components/storefront/quick-view";
import { SearchOverlay } from "@/components/storefront/search-overlay";
import { currentStore, storeOptions, themeStyle } from "@/lib/tenant";

export async function generateMetadata(): Promise<Metadata> {
  const db = await currentStore();
  return {
    title: { default: `${db.store.name} — ${db.store.tagline}`, template: `%s · ${db.store.name}` },
    description: db.store.description,
  };
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const db = await currentStore();
  const menu = getMenu(db.store.id, "main");

  return (
    <div style={themeStyle(db)} className="flex min-h-screen flex-col bg-surface">
      <StorefrontHeader db={db} stores={storeOptions()} />

      <main className="flex-1 pb-16 lg:pb-0">{children}</main>

      <StorefrontFooter db={db} />

      {/* Global overlays */}
      <CartDrawer />
      <SearchOverlay />
      <MobileNav items={menu?.items ?? []} storeName={db.store.name} />
      <MobileTabBar />
      <QuickView />
    </div>
  );
}
