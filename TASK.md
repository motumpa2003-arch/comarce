# Build ledger

Tracks `universal_ecommerce_saas_master_blueprint.md` against what is actually in the
repo. Updated as work lands.

## How the blueprint's "696 screens" maps to routes

The blueprint counts **screens**, not routes, and the two are not the same thing.

- Many rows are *states of one route*. "Search Results", "Search Suggestions",
  "Search No Results", "Filtered Results" and "Pagination State" are five rows and
  one page — `/search` — with five states. The state matrix in §3 of the blueprint
  is the real requirement there, and it applies to every list we ship.
- Many rows are *modals and sheets*, not pages: Quick View, Filter Drawer, Sort
  Sheet, Cart Drawer, Address Form. They live inside a route.
- The admin, platform and mobile sections are **generically numbered**
  ("Catalog & Merchandising Screen 001–052"). Those rows carry no individual
  requirement — the section header above them (purpose, UI sections, actions,
  modals, filters, data) is the actual spec. We build to the header.

So this ledger tracks **deliverables**, not the headline number. Shipping 696
near-duplicate files would hit the count and fail the spec's own definition of
done, which is that a tester can complete every flow without a dead end.

---

## Status

| Surface | Routes live | State |
| --- | ---: | --- |
| Customer web | 56 | discovery, catalogue, PDP, cart, checkout, auth, full account, content — done. |
| Merchant admin | 47 | catalogue, orders, inventory, customers, marketing, content, finance, shipping, integrations, settings — done. Reports and roles editor outstanding. |
| Platform console | 18 | tenants, plans, billing, revenue, commerce, risk, support desk, flags, incidents, audit, settings — done. |
| Customer mobile | 0 | not started |
| Merchant mobile | 0 | not started |

Verification that currently passes:

- `npm run build` — clean, 121 pages generated
- `npx tsc --noEmit` — clean across the workspace
- `scripts/seed-check.mts` — 842 products / 1,540 orders, `Deterministic: YES`
- `scripts/flow-check.mts` — order placed → invoice → account → admin → walked to `delivered`
- `scripts/date-check.mts` — zero records dated after the demo clock
- `scripts/prisma-lint.mjs` — every relation has a matching back-reference

---

## Customer web

### Done
Home (21 sections) · shop · category · subcategory · search · brand · brands ·
collection · collections · product detail · quick view · cart · checkout (contact →
address → delivery → payment → review) · order confirmation · account overview ·
orders · order detail · return request · addresses · rewards · reviews · support ·
settings · wishlist · track · deals · flash sale · new arrivals · bestsellers ·
trending · gift guide · recommended · recently viewed · compare · store locator ·
membership · announcements · size guide · journal · article · faq · contact ·
gift cards · static pages (our story, shipping, returns, privacy, terms, help) ·
404

### Outstanding

- [x] **Auth** — `/login`, `/signup`, `/forgot-password`. Live per-field validation,
      password-strength meter, focus moves to the first error. (165–166)
- [x] **Account — security** — password, MFA matrix, signed-in devices, activity. (135)
- [x] **Account — payment methods** — cards, UPI, store credit, PCI note. (137)
- [x] **Account — notifications** — read/unread, category badges. (154)
- [x] **Account — preferences** — channel matrix with locked transactional rows. (155)
- [x] **Account — referrals** — code, share sheet with clipboard fallback. (153)
- [x] **Account — buy again** — per-variant repeat rows, live price delta. (149)
- [x] **Account — privacy** — consent, export, delete with typed confirmation. (162–164)
- [x] **Saved searches** — from the persisted search history. (37)
- [ ] **Account — ticket detail** `/account/support/[id]`. (160)
- [ ] **Account — shipment detail** `/account/orders/[id]/shipment`. (143)
- [ ] **Brand pages** `/pages/about`, `/pages/sustainability`. (167, 169)
- [ ] **Lookbook** `/lookbook`. (174)

---

## Merchant admin

### Done
Dashboard · analytics · products · product editor (7 tabs) · new product ·
categories · collections · brands · attributes · orders · order detail (state
machine) · returns · shipments · inventory (working adjust) · warehouses ·
transfers · purchase orders · suppliers · customers · customer detail · segments ·
reviews · support · campaigns · coupons · promotions · loyalty · automations ·
theme editor (live preview) · home builder (drag reorder) · navigation · pages ·
blog · payments · payouts · taxes · settings · staff · api · audit · notifications ·
shipping settings

### Outstanding

- [x] **Shipping zones** — ordered match list, methods per zone, fulfilment origins. (431–448)
- [x] **Shipping rates** — weight bands plus a working rate calculator.
- [x] **Carriers** — connection state, on-time, damage rate, routing rule.
- [x] **App catalog** — connected and available apps with scopes. (475–492)
- [x] **Webhooks** — endpoints, topics, delivery health, topic reference.
- [x] **Integration logs** — filterable call log, 4xx/5xx split by fault.
- [x] **Invoices & credit notes** — GST split derived from place of supply. (411–430)
- [x] **Media library** — every referenced asset, usage-counted before delete.
- [ ] **Reconciliation** `/admin/finance/reconciliation` — settlement vs orders.
- [ ] **Import / export** `/admin/products/import` — mapping and dry-run preview.
- [ ] **Roles & permissions** `/admin/settings/roles` — matrix editor. (449–474)
- [ ] **Reports** `/admin/analytics/[report]` — sales, products, customers, funnel.

---

## Platform console

### Done
Overview · stores · store detail (usage, flags, impersonate) · plans · subscriptions ·
revenue · users · audit log · settings (with working demo-data reset)

### Outstanding

- [x] **Platform orders** — cross-tenant order book with per-plan fee. (547–562)
- [x] **Payouts** — settlement run, float, hold rules.
- [x] **Disputes** — chargebacks, evidence deadlines, rate per tenant.
- [x] **Risk** — rules with their own false-positive cost, signals on real orders.
- [x] **Support desk** — queue plus ticket detail with conversation. (563–576)
- [x] **Feature flags** — rollout targeting, stale-flag warning.
- [x] **Incidents** — service health and update timeline.

---

## Mobile applications

Blueprint §2 lists these as separate React Native apps. This build serves them as
**dedicated mobile-shell routes** inside the same Next app — a phone-framed layout
with bottom navigation, sheets instead of modals, and a sticky action bar — because
that keeps one commerce engine, one seed and one design system. The alternative is a
second toolchain for screens nobody can run without a simulator.

- [ ] `/m` — customer app shell: home feed, categories, search, PDP, cart, account
- [ ] `/m/merchant` — merchant app shell: dashboard, orders queue, scan, stock, alerts

---

## Cross-cutting (§3 Global UI State Requirements)

- [x] Skeletons on every network-bound list and rail
- [x] Empty states with a route out (not a dead end)
- [x] Destructive actions confirm with impact text
- [x] Focus trap, ESC, scroll lock on every modal and drawer
- [x] Server-side validation on order placement (422 on a malformed payload)
- [x] Server-enforced order state machine; illegal transitions rejected
- [ ] Error boundary per route segment with a retry path
- [ ] Authorization-error state distinct from not-found
- [ ] Column visibility on the dense admin tables

---

## Known issues

- **The production build occasionally aborts with code 134.** A Next build worker
  ran out of memory once during static generation of 114 pages, then succeeded on
  retry with no code change. Worth a `--max-old-space-size` bump in CI before this
  grows further.

- **Stock photos carry third-party branding.** Some Unsplash images in the pools
  show real products (a Gucci-logo bag under our fictional "Velmont", a Canon body
  under "Atlas Optics"). This works against the originality requirement in §0 and
  needs a pass over all 102 pool images.
- **`prisma/schema.prisma` is unvalidated.** Prisma is not a project dependency, so
  the schema has been checked structurally (`scripts/prisma-lint.mjs`) but never run
  through `prisma validate`.
