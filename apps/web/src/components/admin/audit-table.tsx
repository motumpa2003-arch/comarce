"use client";

import { Badge } from "@obsidian/ui";
import { DataTable, type Column } from "./data-table";
import { formatDateTime, relativeTime, titleCase } from "@/lib/format";

export interface AuditRow {
  id: string;
  actorName: string;
  actorType: string;
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  userAgent: string;
  severity: string;
  createdAt: string;
}

export function AuditTable({ rows }: { rows: AuditRow[] }) {
  const columns: Column<AuditRow>[] = [
    {
      key: "when",
      header: "When",
      sortable: true,
      value: (row) => Date.parse(row.createdAt),
      render: (row) => (
        <div className="min-w-[130px]">
          <p className="text-ink">{relativeTime(row.createdAt)}</p>
          <p className="text-[10.5px] text-ink-muted">{formatDateTime(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      sortable: true,
      value: (row) => row.actorName,
      render: (row) => (
        <div>
          <p className="text-ink">{row.actorName}</p>
          <Badge tone={row.actorType === "system" ? "neutral" : "outline"} size="xs" className="mt-0.5">
            {row.actorType}
          </Badge>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      sortable: true,
      value: (row) => row.action,
      render: (row) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-ink">{row.action}</code>
      ),
    },
    {
      key: "resource",
      header: "Resource",
      sortable: true,
      value: (row) => row.resource,
      render: (row) => (
        <div>
          <p className="text-ink">{titleCase(row.resource)}</p>
          <p className="font-mono text-[10.5px] text-ink-muted">{row.resourceId}</p>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      value: (row) => row.severity,
      render: (row) => (
        <Badge
          tone={row.severity === "critical" ? "danger" : row.severity === "warning" ? "warning" : "neutral"}
          size="xs"
        >
          {row.severity}
        </Badge>
      ),
    },
    {
      key: "origin",
      header: "Origin",
      sortable: true,
      value: (row) => row.ip,
      render: (row) => (
        <div className="min-w-[180px]">
          <p className="font-mono text-[11px] text-ink">{row.ip}</p>
          <p className="truncate text-[10.5px] text-ink-muted">{row.userAgent}</p>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      searchPlaceholder="Search by actor, action or resource id…"
      pageSize={20}
      dense
      filters={[
        {
          key: "severity",
          label: "Severity",
          options: [
            { value: "critical", label: "Critical" },
            { value: "warning", label: "Warning" },
            { value: "info", label: "Info" },
          ],
          match: (row, value) => row.severity === value,
        },
        {
          key: "actorType",
          label: "Actor",
          options: [
            { value: "merchant", label: "Merchant" },
            { value: "platform", label: "Platform" },
            { value: "system", label: "System" },
            { value: "customer", label: "Customer" },
          ],
          match: (row, value) => row.actorType === value,
        },
      ]}
      emptyMessage="No audit entries match those filters."
    />
  );
}
