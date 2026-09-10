"use client";

import Link from "next/link";
import { Badge } from "@obsidian/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDateTime, relativeTime } from "@/lib/format";

export interface AuditRow {
  id: string;
  createdAt: string;
  actorName: string;
  actorType: string;
  action: string;
  resource: string;
  resourceId: string;
  storeId: string | null;
  storeName: string;
  ip: string;
  userAgent: string;
  severity: "info" | "warning" | "critical";
}

const SEVERITY_TONE = { info: "neutral", warning: "warning", critical: "danger" } as const;

export function AuditLogTable({ rows }: { rows: AuditRow[] }) {
  const columns: Column<AuditRow>[] = [
    {
      key: "createdAt",
      header: "When",
      sortable: true,
      width: "150px",
      value: (row) => Date.parse(row.createdAt),
      render: (row) => (
        <div>
          <p className="whitespace-nowrap text-ink">{relativeTime(row.createdAt)}</p>
          <p className="whitespace-nowrap text-[11px] text-ink-muted">{formatDateTime(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "action",
      header: "Event",
      sortable: true,
      value: (row) => `${row.action} ${row.resource} ${row.resourceId}`,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">
            <code className="text-[11.5px]">{row.action}</code>
          </p>
          <p className="truncate text-[11px] text-ink-muted">
            {row.resource} · {row.resourceId}
          </p>
        </div>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      sortable: true,
      value: (row) => `${row.actorName} ${row.actorType}`,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-ink">{row.actorName}</p>
          <p className="truncate text-[11px] capitalize text-ink-muted">{row.actorType}</p>
        </div>
      ),
    },
    {
      key: "store",
      header: "Tenant",
      sortable: true,
      value: (row) => row.storeName,
      render: (row) =>
        row.storeId ? (
          <Link
            href={`/platform/stores/${row.storeId}`}
            className="truncate text-ink hover:text-primary hover:underline"
          >
            {row.storeName}
          </Link>
        ) : (
          <span className="text-ink-muted">Platform</span>
        ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      value: (row) => ({ critical: 3, warning: 2, info: 1 })[row.severity],
      render: (row) => (
        <Badge tone={SEVERITY_TONE[row.severity]} size="xs">
          {row.severity}
        </Badge>
      ),
    },
    {
      key: "origin",
      header: "Origin",
      align: "right",
      sortable: true,
      value: (row) => `${row.ip} ${row.userAgent}`,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate tabular-nums text-ink-muted">{row.ip}</p>
          <p className="truncate text-[11px] text-ink-muted/70">{row.userAgent.split(")")[0]?.slice(0, 34)}</p>
        </div>
      ),
    },
  ];

  const tenants = Array.from(
    new Map(rows.filter((r) => r.storeId).map((r) => [r.storeId!, r.storeName])).entries(),
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const actions = Array.from(new Set(rows.map((r) => r.action))).sort();

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      searchPlaceholder="Search action, actor, resource id or IP…"
      pageSize={20}
      dense
      emptyMessage="No audit events match those filters."
      filters={[
        {
          key: "severity",
          label: "Severity",
          options: [
            { value: "all", label: "All severities" },
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
            { value: "all", label: "Any actor" },
            { value: "platform", label: "Platform" },
            { value: "merchant", label: "Merchant" },
            { value: "staff", label: "Staff" },
            { value: "system", label: "System" },
            { value: "customer", label: "Customer" },
          ],
          match: (row, value) => row.actorType === value,
        },
        {
          key: "action",
          label: "Event",
          options: [
            { value: "all", label: "All events" },
            ...actions.map((action) => ({ value: action, label: action })),
          ],
          match: (row, value) => row.action === value,
        },
        {
          key: "store",
          label: "Tenant",
          options: [
            { value: "all", label: "All tenants" },
            { value: "platform", label: "Platform only" },
            ...tenants.map(([id, name]) => ({ value: id, label: name })),
          ],
          match: (row, value) => (value === "platform" ? row.storeId === null : row.storeId === value),
        },
      ]}
      toolbarExtra={
        <span className="text-[11.5px] text-ink-muted">Append-only · retained 24 months</span>
      }
    />
  );
}
