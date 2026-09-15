import type { Metadata } from "next";
import { Globe2, MapPin, Plus, Truck } from "lucide-react";
import { SHIPPING_METHODS } from "@obsidian/commerce";
import { Badge, Card, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { money, number, percent } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Shipping zones" };

/**
 * Zones are matched top to bottom and the first hit wins, so order is the
 * whole configuration. A zone that would never be reached is called out rather
 * than silently doing nothing.
 */
const ZONES = [
  {
    id: "z_metro",
    name: "Metro cities",
    match: "6 pincode ranges",
    regions: ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune"],
    methods: ["standard", "express", "same_day", "pickup"],
    pincodes: 1_840,
    ordersShare: 46.2,
    freeOver: 99_900,
    status: "active" as const,
  },
  {
    id: "z_tier2",
    name: "Tier 2 cities",
    match: "State list",
    regions: ["Karnataka", "Maharashtra", "Tamil Nadu", "Telangana", "Gujarat", "West Bengal"],
    methods: ["standard", "express"],
    pincodes: 7_420,
    ordersShare: 34.8,
    freeOver: 149_900,
    status: "active" as const,
  },
  {
    id: "z_rest",
    name: "Rest of India",
    match: "Country fallback",
    regions: ["All remaining states and union territories"],
    methods: ["standard"],
    pincodes: 9_950,
    ordersShare: 17.4,
    freeOver: 199_900,
    status: "active" as const,
  },
  {
    id: "z_ne",
    name: "North East & islands",
    match: "8 states + 2 UTs",
    regions: ["Assam", "Meghalaya", "Manipur", "Mizoram", "Nagaland", "Tripura", "Sikkim", "Arunachal Pradesh"],
    methods: ["standard"],
    pincodes: 1_260,
    ordersShare: 1.6,
    freeOver: 249_900,
    status: "active" as const,
  },
  {
    id: "z_intl",
    name: "International",
    match: "14 countries",
    regions: ["United Arab Emirates", "Singapore", "United Kingdom", "United States", "Australia"],
    methods: ["express"],
    pincodes: 0,
    ordersShare: 0,
    freeOver: 0,
    status: "draft" as const,
  },
];

export default async function ShippingZonesPage() {
  const db = await currentStore();
  const methodName = new Map(SHIPPING_METHODS.map((m) => [m.id, m.name]));
  const active = ZONES.filter((z) => z.status === "active");
  const covered = active.reduce((n, z) => n + z.pincodes, 0);

  return (
    <>
      <AdminPageHeader
        title="Shipping zones"
        description="Zones are evaluated top to bottom and the first match wins, so the order of this list is the configuration. A delivery address that matches nothing cannot check out."
        breadcrumbs={[{ label: "Shipping" }, { label: "Zones" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New zone
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active zones" value={number(active.length)} hint={`${ZONES.length - active.length} draft`} />
        <Stat label="Pincodes covered" value={number(covered)} hint="Of ~19,300 serviceable" />
        <Stat label="Warehouses" value={number(db.warehouses.length)} hint="Routing origins" />
        <Stat label="Methods offered" value={number(SHIPPING_METHODS.length)} />
      </div>

      <div className="mt-5 space-y-3">
        {ZONES.map((zone, index) => (
          <Card key={zone.id} padded={false}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="flex min-w-0 items-start gap-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-[12px] font-semibold tabular-nums text-ink-muted">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h2 className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-ink">
                    {zone.name}
                    <Badge tone={zone.status === "active" ? "success" : "neutral"} size="xs">
                      {zone.status}
                    </Badge>
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                    <MapPin className="h-3 w-3" />
                    {zone.match}
                    {zone.pincodes > 0 && ` · ${number(zone.pincodes)} pincodes`}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" className={buttonClasses("outline", "xs")}>
                  Edit
                </button>
                <button type="button" className={buttonClasses("ghost", "xs")}>
                  Duplicate
                </button>
              </div>
            </div>

            <div className="grid gap-x-8 gap-y-5 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Regions</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {zone.regions.map((region) => (
                    <span
                      key={region}
                      className="rounded-full border border-line px-2.5 py-1 text-[11.5px] text-ink-muted"
                    >
                      {region}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  Methods available here
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {zone.methods.map((method) => (
                    <span
                      key={method}
                      className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11.5px] text-ink"
                    >
                      <Truck className="h-3 w-3 text-ink-muted" />
                      {methodName.get(method) ?? method}
                    </span>
                  ))}
                </div>
              </div>

              <dl className="space-y-2.5 text-[12.5px] lg:border-l lg:border-line lg:pl-8">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-muted">Share of orders</dt>
                  <dd className="tabular-nums text-ink">{percent(zone.ordersShare)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-muted">Free shipping over</dt>
                  <dd className="tabular-nums text-ink">{zone.freeOver ? money(zone.freeOver) : "—"}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-muted">Rates configured</dt>
                  <dd className="tabular-nums text-ink">{zone.methods.length}</dd>
                </div>
              </dl>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-5" padded={false}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
          <Globe2 className="h-3.5 w-3.5 text-ink-muted" />
          <h2 className="text-[12.5px] font-semibold text-ink">Fulfilment origins</h2>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Warehouse</TH>
              <TH>City</TH>
              <TH>Type</TH>
              <TH align="center">Ships online</TH>
              <TH align="center">Pickup</TH>
              <TH align="right">Free capacity</TH>
            </TR>
          </THead>
          <TBody>
            {[...db.warehouses]
              .sort(
                (a, b) =>
                  Number(b.isDefault) - Number(a.isDefault) ||
                  b.capacityUnits - b.usedUnits - (a.capacityUnits - a.usedUnits),
              )
              .map((warehouse) => (
                <TR key={warehouse.id}>
                  <TD className="font-medium text-ink">{warehouse.name}</TD>
                  <TD className="text-ink-muted">
                    {warehouse.address.city}, {warehouse.address.state}
                  </TD>
                  <TD className="capitalize text-ink-muted">{warehouse.type.replace("_", " ")}</TD>
                  <TD align="center">
                    <Badge tone={warehouse.fulfilsOnline ? "success" : "neutral"} size="xs">
                      {warehouse.fulfilsOnline ? "Yes" : "No"}
                    </Badge>
                  </TD>
                  <TD align="center">
                    <Badge tone={warehouse.supportsPickup ? "info" : "neutral"} size="xs">
                      {warehouse.supportsPickup ? "Yes" : "No"}
                    </Badge>
                  </TD>
                  <TD align="right" className="tabular-nums text-ink-muted">
                    {percent(((warehouse.capacityUnits - warehouse.usedUnits) / Math.max(1, warehouse.capacityUnits)) * 100)}
                  </TD>
                </TR>
              ))}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
