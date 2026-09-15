"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge, cn } from "@obsidian/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDateTime, number, relativeTime } from "@/lib/format";

export interface LogRow {
  id: string;
  source: string;
  operation: string;
  direction: "inbound" | "outbound";
  status: number;
  durationMs: number;
  message: string;
  createdAt: string;
}

export function IntegrationLogTable({ rows }: { rows: LogRow[] }) {
  const columns: Column<LogRow>[] = [
    {
      key: "createdAt",
      header: "When",
      sortable: true,
      width: "140px",
      value: (row) => Date.parse(row.createdAt),
      render: (row) => (
        <div>
          <p className="whitespace-nowrap text-ink">{relativeTime(row.createdAt)}</p>
          <p className="whitespace-nowrap text-[11px] text-ink-muted">{formatDateTime(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Service",
      sortable: true,
      value: (row) => row.source,
      render: (row) => <span className="font-medium text-ink">{row.source}</span>,
    },
    {
      key: "operation",
      header: "Operation",
      sortable: true,
      value: (row) => row.operation,
      render: (row) => (
        <span className="flex items-center gap-1.5">
          {row.direction === "outbound" ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-ink-muted" />
          ) : (
            <ArrowDownLeft className="h-3.5 w-3.5 text-ink-muted" />
          )}
          <code className="text-[12px] text-ink">{row.operation}</code>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      value: (row) => row.status,
      render: (row) => (
        <Badge tone={row.status < 400 ? "success" : row.status < 500 ? "warning" : "danger"} size="xs">
          {row.status}
        </Badge>
      ),
    },
    {
      key: "durationMs",
      header: "Duration",
      align: "right",
      sortable: true,
      value: (row) => row.durationMs,
      render: (row) => (
        <span
          className={cn(
            "tabular-nums",
            row.durationMs > 1500 ? "text-danger" : row.durationMs > 700 ? "text-warning" : "text-ink-muted",
          )}
        >
          {number(row.durationMs)} ms
        </span>
      ),
    },
    {
      key: "message",
      header: "Detail",
      value: (row) => row.message,
      render: (row) => (
        <span className={row.status >= 400 ? "text-ink" : "text-ink-muted"}>{row.message}</span>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      searchPlaceholder="Search service, operation or message…"
      pageSize={20}
      dense
      emptyMessage="No calls match those filters."
      filters={[
        {
          key: "outcome",
          label: "Outcome",
          options: [
            { value: "all", label: "All outcomes" },
            { value: "ok", label: "Succeeded" },
            { value: "client", label: "4xx — our payload" },
            { value: "server", label: "5xx — theirs" },
          ],
          match: (row, value) =>
            value === "ok" ? row.status < 400 : value === "client" ? row.status >= 400 && row.status < 500 : row.status >= 500,
        },
        {
          key: "source",
          label: "Service",
          options: [
            { value: "all", label: "All services" },
            ...[...new Set(rows.map((r) => r.source))].sort().map((s) => ({ value: s, label: s })),
          ],
          match: (row, value) => row.source === value,
        },
        {
          key: "direction",
          label: "Direction",
          options: [
            { value: "all", label: "Both directions" },
            { value: "outbound", label: "Outbound" },
            { value: "inbound", label: "Inbound" },
          ],
          match: (row, value) => row.direction === value,
        },
      ]}
    />
  );
}
