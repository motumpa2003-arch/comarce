import type { Metadata } from "next";
import { Activity, AlertOctagon, CheckCircle2, Plus } from "lucide-react";
import { Badge, Card, Progress, Stat, buttonClasses, cn } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { NOW, formatDateTime, number, percent, relativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Incidents" };

const at = (hoursAgo: number) => new Date(NOW.getTime() - hoursAgo * 3_600_000).toISOString();

const SERVICES = [
  { name: "Storefront", uptime: 99.98, latencyMs: 184, status: "operational" as const },
  { name: "Checkout & payments", uptime: 99.94, latencyMs: 312, status: "operational" as const },
  { name: "Merchant admin", uptime: 99.99, latencyMs: 210, status: "operational" as const },
  { name: "Search", uptime: 99.82, latencyMs: 96, status: "degraded" as const },
  { name: "Media CDN", uptime: 100, latencyMs: 41, status: "operational" as const },
  { name: "Webhooks", uptime: 99.71, latencyMs: 640, status: "operational" as const },
  { name: "Reporting", uptime: 99.96, latencyMs: 890, status: "operational" as const },
];

interface Incident {
  id: string;
  title: string;
  severity: "minor" | "major" | "critical";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  startedHoursAgo: number;
  resolvedHoursAgo: number | null;
  affected: string[];
  tenantsAffected: number;
  updates: { hoursAgo: number; body: string }[];
}

const INCIDENTS: Incident[] = [
  {
    id: "inc_042",
    title: "Search results degraded for beauty and grocery catalogues",
    severity: "minor",
    status: "monitoring",
    startedHoursAgo: 3.5,
    resolvedHoursAgo: null,
    affected: ["Search"],
    tenantsAffected: 9,
    updates: [
      { hoursAgo: 0.4, body: "Index rebuild is 80% complete. Results are correct but ranking is still settling." },
      { hoursAgo: 1.8, body: "Root cause identified: an attribute migration invalidated two shards. Rebuilding." },
      { hoursAgo: 3.5, body: "Investigating reports of missing results on facet-heavy queries." },
    ],
  },
  {
    id: "inc_041",
    title: "Webhook deliveries delayed up to 12 minutes",
    severity: "minor",
    status: "resolved",
    startedHoursAgo: 52,
    resolvedHoursAgo: 49,
    affected: ["Webhooks"],
    tenantsAffected: 25,
    updates: [
      { hoursAgo: 49, body: "Queue drained. All delayed events delivered — none were dropped." },
      { hoursAgo: 51, body: "A slow consumer was holding connections. Backpressure applied." },
      { hoursAgo: 52, body: "Delivery lag alarm fired on the webhook queue." },
    ],
  },
  {
    id: "inc_040",
    title: "Card payments failing for one acquirer",
    severity: "major",
    status: "resolved",
    startedHoursAgo: 190,
    resolvedHoursAgo: 188.5,
    affected: ["Checkout & payments"],
    tenantsAffected: 25,
    updates: [
      { hoursAgo: 188.5, body: "Acquirer restored service. Failed authorisations were not charged." },
      { hoursAgo: 189.4, body: "Failing over to the secondary acquirer for card traffic." },
      { hoursAgo: 190, body: "Elevated decline rate on card payments. UPI unaffected." },
    ],
  },
];

export default function IncidentsPage() {
  const open = INCIDENTS.filter((i) => i.status !== "resolved");
  const degraded = SERVICES.filter((s) => s.status !== "operational");
  const uptime = SERVICES.reduce((n, s) => n + s.uptime, 0) / SERVICES.length;

  return (
    <>
      <AdminPageHeader
        title="Incidents"
        description="What is broken, who it affects and what we have said about it. This page backs the public status page — an incident that is not here was never communicated."
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            Declare incident
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open incidents" value={number(open.length)} />
        <Stat label="Services degraded" value={number(degraded.length)} hint={`${SERVICES.length} monitored`} />
        <Stat label="30-day uptime" value={percent(uptime, 2)} />
        <Stat
          label="Tenants affected"
          value={number(open.reduce((n, i) => n + i.tenantsAffected, 0))}
          hint="Right now"
        />
      </div>

      <Card className="mt-5" padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">Service health</h2>
          </div>
          <span
            className={cn(
              "flex items-center gap-1.5 text-[12px] font-medium",
              degraded.length ? "text-warning" : "text-success",
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                degraded.length ? "bg-warning" : "bg-success",
              )}
            />
            {degraded.length ? "Partially degraded" : "All systems operational"}
          </span>
        </div>
        <ul className="divide-y divide-line">
          {SERVICES.map((service) => (
            <li key={service.name} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-ink">{service.name}</span>
                <span className="mt-0.5 block text-[11px] text-ink-muted">
                  p50 {number(service.latencyMs)} ms
                </span>
              </span>
              <span className="w-[140px] shrink-0">
                <Progress
                  value={service.uptime}
                  tone={service.uptime >= 99.9 ? "success" : service.uptime >= 99.5 ? "warning" : "danger"}
                  height={4}
                />
                <span className="mt-1 block text-[11px] tabular-nums text-ink-muted">
                  {percent(service.uptime, 2)} uptime
                </span>
              </span>
              <Badge tone={service.status === "operational" ? "success" : "warning"} size="xs">
                {service.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-5 space-y-3">
        {INCIDENTS.map((incident) => (
          <Card key={incident.id} padded={false}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div className="flex min-w-0 items-start gap-3.5">
                <span
                  className={cn(
                    "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                    incident.status === "resolved"
                      ? "bg-success/12 text-success"
                      : incident.severity === "major"
                        ? "bg-danger/12 text-danger"
                        : "bg-warning/15 text-warning",
                  )}
                >
                  {incident.status === "resolved" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertOctagon className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0">
                  <h2 className="text-[13.5px] font-semibold text-ink">{incident.title}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-ink-muted">
                    <Badge
                      tone={
                        incident.status === "resolved"
                          ? "success"
                          : incident.status === "monitoring"
                            ? "info"
                            : "warning"
                      }
                      size="xs"
                    >
                      {incident.status}
                    </Badge>
                    <Badge tone={incident.severity === "major" ? "danger" : "neutral"} size="xs">
                      {incident.severity}
                    </Badge>
                    <span>{incident.affected.join(", ")}</span>
                    <span>·</span>
                    <span>{number(incident.tenantsAffected)} tenants</span>
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-right text-[11.5px] text-ink-muted">
                Started {relativeTime(at(incident.startedHoursAgo))}
                {incident.resolvedHoursAgo != null && (
                  <span className="mt-0.5 block">
                    Resolved in {Math.round(incident.startedHoursAgo - incident.resolvedHoursAgo)} h
                  </span>
                )}
              </p>
            </div>

            <ol className="divide-y divide-line">
              {incident.updates.map((update, index) => (
                <li key={index} className="flex gap-4 px-5 py-3">
                  <time
                    dateTime={at(update.hoursAgo)}
                    title={formatDateTime(at(update.hoursAgo))}
                    className="w-[110px] shrink-0 text-[11.5px] text-ink-muted"
                  >
                    {relativeTime(at(update.hoursAgo))}
                  </time>
                  <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-ink-muted">{update.body}</p>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>

      <Card className="mt-5" tone="muted">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Communication rule</h2>
        <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
          An incident is declared within five minutes of confirming customer impact, not once the cause is known.
          The first update says what is broken and who it affects; the cause comes later. Merchants forgive an
          outage far more readily than they forgive silence.
        </p>
      </Card>
    </>
  );
}
