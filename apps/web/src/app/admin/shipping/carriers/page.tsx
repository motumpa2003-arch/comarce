import type { Metadata } from "next";
import { AlertTriangle, Plug, Plus, Truck } from "lucide-react";
import { Badge, Card, Progress, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, RankedBars, SERIES } from "@/components/admin/charts";
import { money, number, percent, relativeTime } from "@/lib/format";
import { NOW } from "@/lib/format";

export const metadata: Metadata = { title: "Carriers" };

const at = (hours: number) => new Date(NOW.getTime() - hours * 3_600_000).toISOString();

const CARRIERS = [
  {
    id: "c_bluedart",
    name: "Skyline Express",
    services: ["Surface", "Air", "Same day"],
    status: "connected" as const,
    shipments30d: 4_182,
    onTime: 94.6,
    damageRate: 0.31,
    avgCost: 8_640,
    lastSyncHours: 0.4,
    zones: ["Metro", "Tier 2", "Rest of India"],
  },
  {
    id: "c_delhivery",
    name: "Meridian Logistics",
    services: ["Surface", "Heavy"],
    status: "connected" as const,
    shipments30d: 2_930,
    onTime: 91.2,
    damageRate: 0.44,
    avgCost: 7_180,
    lastSyncHours: 1.2,
    zones: ["Tier 2", "Rest of India", "North East"],
  },
  {
    id: "c_local",
    name: "Cityhop (own fleet)",
    services: ["Same day", "Pickup"],
    status: "connected" as const,
    shipments30d: 968,
    onTime: 98.1,
    damageRate: 0.08,
    avgCost: 12_400,
    lastSyncHours: 0.1,
    zones: ["Metro"],
  },
  {
    id: "c_intl",
    name: "Transglobal",
    services: ["International air"],
    status: "error" as const,
    shipments30d: 0,
    onTime: 0,
    damageRate: 0,
    avgCost: 0,
    lastSyncHours: 62,
    zones: ["International"],
  },
  {
    id: "c_postal",
    name: "India Post",
    services: ["Registered", "Speed post"],
    status: "available" as const,
    shipments30d: 0,
    onTime: 0,
    damageRate: 0,
    avgCost: 0,
    lastSyncHours: 0,
    zones: [],
  },
];

export default function CarriersPage() {
  const connected = CARRIERS.filter((c) => c.status === "connected");
  const failing = CARRIERS.filter((c) => c.status === "error");
  const total = connected.reduce((n, c) => n + c.shipments30d, 0);
  const weightedOnTime =
    connected.reduce((n, c) => n + c.onTime * c.shipments30d, 0) / Math.max(1, total);

  return (
    <>
      <AdminPageHeader
        title="Carriers"
        description="Connected shipping partners, the services each one offers and how they are actually performing. Routing prefers the cheapest carrier that serves the zone and clears the on-time floor."
        breadcrumbs={[{ label: "Shipping" }, { label: "Carriers" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            Connect carrier
          </button>
        }
      />

      {failing.length > 0 && (
        <Card className="mb-5 border-danger/40 bg-danger/[0.04]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div>
              <h2 className="text-[12.5px] font-semibold text-ink">
                {failing.length} carrier connection{failing.length === 1 ? "" : "s"} failing
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                {failing.map((c) => c.name).join(", ")} last synced{" "}
                {relativeTime(at(failing[0]!.lastSyncHours))}. Orders in the zones they serve cannot be booked until
                the credentials are refreshed.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Connected" value={number(connected.length)} hint={`${CARRIERS.length} available`} />
        <Stat label="Shipments (30d)" value={number(total)} />
        <Stat label="On-time" value={percent(weightedOnTime)} hint="Weighted by volume" />
        <Stat
          label="Average cost"
          value={money(Math.round(connected.reduce((n, c) => n + c.avgCost * c.shipments30d, 0) / Math.max(1, total)))}
          hint="Per shipment"
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {CARRIERS.map((carrier) => (
            <Card key={carrier.id} padded={false}>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
                <div className="flex min-w-0 items-start gap-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-ink-muted">
                    <Truck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-ink">
                      {carrier.name}
                      <Badge
                        tone={
                          carrier.status === "connected"
                            ? "success"
                            : carrier.status === "error"
                              ? "danger"
                              : "neutral"
                        }
                        size="xs"
                      >
                        {carrier.status === "available" ? "Not connected" : carrier.status}
                      </Badge>
                    </h2>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      {carrier.services.join(" · ")}
                      {carrier.zones.length > 0 && ` — serves ${carrier.zones.join(", ")}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {carrier.status === "available" ? (
                    <button type="button" className={buttonClasses("outline", "xs")}>
                      <Plug className="h-3.5 w-3.5" />
                      Connect
                    </button>
                  ) : (
                    <>
                      <button type="button" className={buttonClasses("outline", "xs")}>
                        Settings
                      </button>
                      <button type="button" className={buttonClasses("ghost", "xs")}>
                        Test
                      </button>
                    </>
                  )}
                </div>
              </div>

              {carrier.status === "connected" && (
                <div className="grid gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Shipments (30d)</p>
                    <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                      {number(carrier.shipments30d)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">On-time</p>
                    <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                      {percent(carrier.onTime)}
                    </p>
                    <Progress
                      className="mt-1.5"
                      value={carrier.onTime}
                      tone={carrier.onTime >= 95 ? "success" : carrier.onTime >= 90 ? "warning" : "danger"}
                      height={4}
                    />
                  </div>
                  <div>
                    <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Damage rate</p>
                    <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                      {percent(carrier.damageRate, 2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Average cost</p>
                    <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">{money(carrier.avgCost)}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <aside className="space-y-4">
          <ChartFrame title="Volume by carrier" description="Shipments, last 30 days" height={220}>
            <RankedBars
              rows={connected.map((c) => ({ label: c.name, value: c.shipments30d }))}
              format="number"
              color={SERIES[0]}
            />
          </ChartFrame>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Cost per shipment</h2>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Carrier</TH>
                  <TH align="right">Average</TH>
                </TR>
              </THead>
              <TBody>
                {[...connected]
                  .sort((a, b) => a.avgCost - b.avgCost)
                  .map((carrier) => (
                    <TR key={carrier.id}>
                      <TD className="text-ink">{carrier.name}</TD>
                      <TD align="right" className="tabular-nums text-ink">
                        {money(carrier.avgCost)}
                      </TD>
                    </TR>
                  ))}
              </TBody>
            </Table>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Routing rule</h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              Cheapest carrier that serves the destination zone, offers the chosen service, and has held above 90%
              on-time over the last thirty days. Below that floor a carrier is skipped automatically rather than
              quietly degrading every delivery estimate on the storefront.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
