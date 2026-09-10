import type { Metadata } from "next";
import { Download, ShieldAlert } from "lucide-react";
import { Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AuditTable } from "@/components/admin/audit-table";
import { number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Audit log" };

export default async function AdminAuditPage() {
  const db = await currentStore();

  const rows = db.auditLog.map((entry) => ({
    id: entry.id,
    actorName: entry.actorName,
    actorType: entry.actorType,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    ip: entry.ip,
    userAgent: entry.userAgent,
    severity: entry.severity,
    createdAt: entry.createdAt,
  }));

  const critical = rows.filter((r) => r.severity === "critical");
  const warnings = rows.filter((r) => r.severity === "warning");

  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="Every privileged action, with the actor, IP and user agent. Entries are append-only — nothing here can be edited or removed from the admin."
        breadcrumbs={[{ label: "Settings" }, { label: "Audit log" }]}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Export log
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Entries" value={number(rows.length)} hint="Last 60 days" />
        <Stat label="Critical" value={number(critical.length)} hint="Gateway, keys, plan changes" />
        <Stat label="Warnings" value={number(warnings.length)} hint="Deletes, refunds, permission edits" />
        <Stat label="Distinct actors" value={number(new Set(rows.map((r) => r.actorName)).size)} />
      </div>

      {critical.length > 0 && (
        <div className="mb-5 flex items-start gap-2.5 rounded-[var(--radius-card)] border border-warning/40 bg-warning/[0.06] p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-[12.5px] leading-relaxed text-ink">
            {critical.length} critical action{critical.length === 1 ? "" : "s"} recorded. Critical entries cover
            payment gateway changes, API key issuance, plan changes and store suspension — review them if anything
            looks unfamiliar.
          </p>
        </div>
      )}

      <AuditTable rows={rows} />
    </>
  );
}
