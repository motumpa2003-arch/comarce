const { getDatabase } = await import("../packages/data/src/database.ts");

const t0 = performance.now();
const db = getDatabase();
const t1 = performance.now();

const sum = (fn: (s: any) => number) => db.stores.reduce((n: number, s: any) => n + fn(s), 0);
console.log(JSON.stringify({
  generationMs: Math.round(t1 - t0),
  tenants: db.allStores.length,
  seededStores: db.stores.length,
  products: sum((s) => s.products.length),
  variants: sum((s) => s.products.reduce((m: number, p: any) => m + p.variants.length, 0)),
  categories: sum((s) => s.categories.length),
  brands: sum((s) => s.brands.length),
  collections: sum((s) => s.collections.length),
  customers: sum((s) => s.customers.length),
  orders: sum((s) => s.orders.length),
  orderItems: sum((s) => s.orders.reduce((m: number, o: any) => m + o.items.length, 0)),
  reviews: sum((s) => s.reviews.length),
  coupons: sum((s) => s.coupons.length),
  warehouses: sum((s) => s.warehouses.length),
  inventoryRecords: sum((s) => s.inventory.length),
  movements: sum((s) => s.movements.length),
  tickets: sum((s) => s.tickets.length),
  returns: sum((s) => s.returns.length),
}, null, 2));

const f = db.flagship;
console.log("\nFlagship:", f.store.name, "| products", f.products.length, "| orders", f.orders.length);
const p = f.products.find((x: any) => x.variants.length > 3) ?? f.products[0];
console.log("Sample:", p.name, "|", p.sku, "| Rs", p.price / 100, "| variants", p.variants.length);
console.log("  attrs:", JSON.stringify(p.attributes).slice(0, 200));
console.log("  variant:", JSON.stringify(p.variants[0].options), "->", p.variants[0].title);
console.log("  media:", p.media.length, p.media[0].url.slice(0, 70));

const statuses = new Map<string, number>();
for (const o of f.orders) statuses.set(o.status, (statuses.get(o.status) ?? 0) + 1);
console.log("\nOrder status mix:", [...statuses.entries()].sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join(" "));

const a = JSON.stringify(db.flagship.products.map((x: any) => [x.id, x.price, x.totalStock]));
delete (globalThis as any).__obsidianDb;
const db2 = getDatabase();
const b = JSON.stringify(db2.flagship.products.map((x: any) => [x.id, x.price, x.totalStock]));
console.log("\nDeterministic:", a === b ? "YES" : "NO");
