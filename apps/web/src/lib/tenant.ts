import "server-only";
import { cookies } from "next/headers";
import { getStoreDb, listStoreDatabases, type StoreDatabase } from "@obsidian/data";
import { themeToCssVars } from "@obsidian/commerce";
import { DEFAULT_STORE_ID, STORE_COOKIE } from "./tenant-shared";

export { STORE_COOKIE } from "./tenant-shared";

/**
 * Resolves the active tenant.
 *
 * In production this would come from the request host (custom domain or
 * subdomain). For the demo we read a cookie set by the store switcher and
 * fall back to the flagship store.
 */
export async function currentStoreId(): Promise<string> {
  const jar = await cookies();
  return jar.get(STORE_COOKIE)?.value ?? DEFAULT_STORE_ID;
}

export async function currentStore(): Promise<StoreDatabase> {
  return getStoreDb(await currentStoreId());
}

export function storeOptions() {
  return listStoreDatabases().map((db) => ({
    id: db.store.id,
    name: db.store.name,
    industry: db.store.industry,
    logoMark: db.store.logoMark,
    themePreset: db.theme.preset,
    products: db.products.length,
  }));
}

/** Inline style object that projects a tenant theme onto a subtree. */
export function themeStyle(db: StoreDatabase): React.CSSProperties {
  return themeToCssVars(db.theme) as React.CSSProperties;
}
