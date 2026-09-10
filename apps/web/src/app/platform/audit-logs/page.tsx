import type { Metadata } from "next";
import { Download, Lock } from "lucide-react";
import { getPlatformAuditLog, listAllStores, listStoreDatabases } from "@obsidian/data";
import { Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { AuditLogTable, type AuditRow } from "@/components/platform/audit-log-table";
import { NOW, number, relativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Audit log" };

export default function PlatformAuditLogPage() {
  const stores = listAllStores();
  const storeNames = new Map(stores.map((s) => [s.id, s.name]));

  // Platform-scoped events plus every tenant's own trail, merged into one timeline.
  const entries = [
    ...getPlatformAuditLog(),
    ...listStoreDatabases().flatMap((db) => db.auditLog),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const rows: AuditRow[] = entries.map((entry) => ({
    id: entry.id,
    createdAt: entry.createdAt,
    actorName: entry.actorName,
    actorType: entry.actorType,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    storeId: entry.storeId,
    storeName: entry.storeId ? (storeNames.get(entry.storeId) ?? entry.storeId) : "Platform",
    ip: entry.ip,
    userAgent: entry.userAgent,
    severity: entry.severity,
  }));

  const critical = rows.filter((r) => r.severity === "critical");
  const warnings = rows.filter((r) => r.severity === "warning");

  const dayMs = 86_400_000;
  const last24h = rows.filter((r) => NOW.getTime() - Date.parse(r.createdAt) <= dayMs);

  const topActions = Object.entries(
    rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.action] = (acc[row.action] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="An append-only record of every privileged action across the platform. Entries cannot be edited or deleted from the console — only exported."
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Events" value={number(rows.length)} hint="Last 60 days" />
        <Stat label="Last 24 hours" value={number(last24h.length)} />
        <Stat label="Critical" value={number(critical.length)} hint="Plan, suspension and refund changes" />
        <Stat label="Warnings" value={number(warnings.length)} hint="Failed logins and webhook failures" />
      </div>

      {critical.length > 0 && (
        <Card className="mt-5 border-danger/35 bg-danger/[0.04]" padded={false}>
          <div className="flex items-center gap-2 border-b border-danger/20 px-5 py-3">
            <Lock className="h-4 w-4 text-danger" />
            <h2 className="text-[12.5px] font-semibold text-danger">Most recent critical events</h2>
          </div>
          <ul className="divide-y divide-danger/15">
            {critical.slice(0, 5).map((row) => (
              <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 text-[12.5px]">
                <code className="shrink-0 text-[11.5px] font-medium text-ink">{row.action}</code>
                <span className="min-w-0 flex-1 truncate text-ink-muted">
                  {row.actorName} · {row.storeName}
                </span>
                <span className="shrink-0 tabular-nums text-ink-muted">{row.ip}</span>
                <span className="shrink-0 text-ink-muted">{relativeTime(row.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <AuditLogTable rows={rows} />

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Most frequent events</h2>
            <RankedBars rows={topActions} format="number" color={SERIES[2]} />
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">What gets recorded</h2>
            <ul className="mt-3 space-y-1.5 text-[12px] text-ink-muted">
              <li>Sign-ins, including failures</li>
              <li>Any write to products, orders or inventory</li>
              <li>Refunds and payout changes</li>
              <li>Plan, seat and entitlement changes</li>
              <li>Operator impersonation of a tenant</li>
              <li>API key creation and revocation</li>
              <li>Theme and storefront publishes</li>
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-muted">
              Reads are not logged individually — only privileged reads such as customer data exports.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
