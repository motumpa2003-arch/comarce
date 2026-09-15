# Obsidian Commerce

A multi-tenant ecommerce SaaS platform: a customer storefront, a merchant admin, and a
platform operator console, all driven by one category-agnostic commerce engine.

The same code runs a fashion label, an electronics retailer, a grocer and a jewellery
house. Nothing in the engine knows what a "size" is.

```bash
npm install
npm run dev          # http://localhost:3100
```

Three surfaces, all live against the same data:

| Surface | Path | What it is |
| --- | --- | --- |
| Storefront | `/` | What a shopper sees. Browse, search, filter, buy, track, return. |
| Merchant admin | `/admin` | What a store owner sees. Catalogue, orders, inventory, content, analytics. |
| Platform console | `/platform` | What the SaaS operator sees. Tenants, plans, revenue, audit. |

Switch tenants from the store picker in the storefront header, or from **Open merchant
admin** on any seeded tenant in the platform console. The seven seeded tenants each have
a full catalogue; the other eighteen exist as SaaS records only, which is what a real
platform's tenant list looks like.

---

## What actually works

This is a working application, not a set of screens. A reviewer can complete the whole
loop without hitting a dead end:

1. Land on the storefront, search "linen shirt", filter by a facet that only exists
   because the catalogue has that attribute.
2. Open a product, switch variants — price, stock and imagery follow the selection.
3. Add to bag, apply coupon `WELCOME10`, watch the GST split recalculate.
4. Check out. The order is created server-side with a real number and a real total.
5. Open the invoice, the tracking page, and the order in your account.
6. Go to `/admin/orders`, find the same order, and advance it through the state machine.
   Illegal transitions are rejected by the server, not hidden in the UI.
7. Request a return from the account area; see it land in `/admin/returns`.
8. Adjust stock in `/admin/inventory`; the movement is written with a running balance.
9. Edit the theme in `/admin/content/theme`; the storefront restyles without a deploy.
10. Reorder homepage sections in `/admin/content/home`; the storefront reflects the order.

Writes persist for the life of the server process. `/platform/settings` → **Reset demo
data** rebuilds the seed and returns every number to its documented baseline.

---

## Architecture

```
apps/
  web/                 Next.js App Router — all three surfaces
packages/
  commerce/            Types and the commerce engine. No React, no data.
  data/                Deterministic seed, repositories, mutation layer.
  ui/                  Design system primitives.
prisma/
  schema.prisma        Persistence schema for the Postgres deployment.
```

`commerce` holds the rules — pricing, tax, coupons, the order state machine, search and
faceting, theme tokens, attribute definitions. It has no dependency on React or on any
storage layer, so the same functions run on the server, in a test, or in a script.

`data` owns the demo dataset and the query surface. Every repository function takes a
store id; there is no way to read another tenant's rows by forgetting a filter.

### The tenancy boundary

A tenant resolves from the request — host header in production, a signed cookie in this
build — into a `storeId` that is threaded through every read and write:

```ts
export function queryCatalog(storeIdOrSlug: string | undefined, query: CatalogQuery) {
  const db = getStoreDb(storeIdOrSlug);
  return searchCatalog({ products: db.products, /* … */ });
}
```

In the Postgres deployment the same boundary is enforced twice: once in the repository
layer, and again by row-level security keyed on a `current_setting('app.store_id')`
session variable, so a bug in application code cannot leak across tenants.

### Category independence

This is the constraint the whole schema is shaped around. There is no `size` column, no
`colour` column, no `ram` column — anywhere.

An `AttributeDefinition` row describes one characteristic:

```ts
{ key: "carat", label: "Carat", inputType: "number", unit: "ct",
  variantDefining: true, filterable: true, displayInSpecs: true, industry: "jewelry" }
```

Three flags drive three different parts of the app, with no per-industry code:

- `variantDefining` → the attribute joins the variant matrix, so a ring gets
  carat × metal variants exactly the way a t-shirt gets size × colour.
- `filterable` → the attribute becomes a facet on the listing page, ranked by how much
  of the result set it actually covers so eight useful facets show instead of forty.
- `displayInSpecs` → the attribute appears in the product's spec table.

Adding a vertical means adding attribute rows. It never means touching the cart, the
order state machine, or the storefront.

### Money

Every amount is an integer in the currency's minor unit — paise for INR. There is no
`Decimal` and no `Float` in any monetary field, in the types or in the Prisma schema.
Formatting happens once, at the edge:

```ts
formatMoney(2499900)   // "₹24,999"
shortNumber(19_11_92_809_00, "INR")  // "₹19.1Cr"
```

Indian grouping and lakh/crore abbreviation are built in, because "₹191,192,809" is not
how this number is read where it is used.

### Orders are a state machine

Legal transitions are declared once and enforced server-side:

```ts
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "delivered"],
  // …
};
```

The admin only offers what `nextStatuses(order)` returns, and `POST /api/orders/:id/status`
rejects anything else with a 400 — the UI is a convenience, not the enforcement.

### Theming

A theme is data. Publishing one writes a set of CSS custom properties onto the storefront
wrapper:

```ts
themeToCssVars(theme)  // { "--c-bg": "#F4F0E7", "--c-accent": "#C9A227", … }
```

Every component reads those variables, so six presets restyle the entire storefront with
no component changes and no rebuild.

---

## The demo dataset

Generated in about half a second from a seeded PRNG, identical on every run and on both
server and client — which is what makes hydration stable and screenshots reproducible.

| | |
| --- | --- |
| Tenants | 25 (7 with full catalogues) |
| Products | 842 across 4,317 variants |
| Categories / brands / collections | 85 / 52 / 105 |
| Customers | 680 |
| Orders | 1,540 across 3,052 line items |
| Reviews | 1,270 |
| Inventory records / movements | 8,461 / 12,543 |
| Warehouses | 26 |

All names, emails, phones and addresses are synthetic. No real customer data appears
anywhere in the seed.

The demo clock is fixed at `SEED_NOW` so "2 days ago" means the same thing on every run.
Relative time in the UI is formatted against that same instant.

Numbers are modelled rather than sprinkled. Ghost tenants draw a monthly GMV from the
plan they pay for and derive their order count from their vertical's basket size, so a
grocer reaches the same revenue as a jewellery house on far more orders — and no tenant
exceeds the order limit its own plan sells it.

---

## Scripts

```bash
npm run dev          # dev server on :3100
npm run build        # production build
npm run typecheck    # tsc --noEmit across the workspace
npm run db:generate  # prisma generate   (needs `npm i -D prisma @prisma/client` first)
npm run db:push      # prisma db push    (needs a DATABASE_URL)
```

The running app uses the in-memory seed, so Prisma is not installed as a dependency and
`prisma/schema.prisma` has not been through `prisma validate`. Its relation graph is
checked structurally instead — install the CLI before pointing this at a real database.

Verification harnesses under `scripts/`:

```bash
npx tsx scripts/seed-check.mts   # dataset totals, sample product, determinism check
npx tsx scripts/rev-check.mts    # per-tenant economics: plan, GMV, take rate, MRR
npx tsx scripts/date-check.mts   # asserts no seeded record is dated after SEED_NOW
npx tsx scripts/flow-check.mts   # places an order and walks it to delivered
node  scripts/prisma-lint.mjs    # every Prisma relation has a matching back-reference
node  scripts/check-images.mjs   # confirms every image id resolves
```

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Recharts ·
Prisma / PostgreSQL · npm workspaces.

Chart colours are validated for colour-vision deficiency: every adjacent pair clears
ΔE 8 under deuteranopia, protanopia and tritanopia simulation, and every series clears
3:1 contrast against the surface it sits on.
