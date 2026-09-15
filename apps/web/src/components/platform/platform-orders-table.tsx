"use client";

import Link from "next/link";
import { Badge } from "@obsidian/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDate, money, relativeTime, titleCase } from "@/lib/format";

export interface PlatformOrderRow {
  id: string;
  storeId: string;
  storeName: string;
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  fee: number;
  refunded: number;
  createdAt: string;
}

const STATUS_TONE: Record<string, "success" | "info" | "warning" | "danger" | "neutral"> = {
  delivered: "success",
  shipped: "info",
  out_for_delivery: "info",
  packed: "info",
  processing: "info",
  confirmed: "info",
  pending: "warning",
  payment_pending: "warning",
  return_requested: "warning",
  return_approved: "warning",
  refund_pending: "warning",
  payment_failed: "danger",
  cancelled: "danger",
  returned: "neutral",
  refunded: "neutral",
};

export function PlatformOrdersTable({ rows }: { rows: PlatformOrderRow[] }) {
  const columns: Column<PlatformOrderRow>[] = [
    {
      key: "orderNumber",
      header: "Order",
      sortable: true,
      value: (row) => row.orderNumber,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{row.orderNumber}</p>
          <p className="truncate text-[11px] text-ink-muted">{row.customerName}</p>
        </div>
      ),
    },
    {
      key: "store",
      header: "Tenant",
      sortable: true,
      value: (row) => row.storeName,
      render: (row) => (
        <Link href={`/platform/stores/${row.storeId}`} className="text-ink hover:text-primary hover:underline">
          {row.storeName}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      value: (row) => row.status,
      render: (row) => (
        <Badge tone={STATUS_TONE[row.status] ?? "neutral"} size="xs">
          {row.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      sortable: true,
      value: (row) => `${row.paymentStatus} ${row.paymentMethod}`,
      render: (row) => (
        <div className="min-w-0">
          <p
            className={
              row.paymentStatus === "failed"
                ? "text-[12px] font-medium text-danger"
                : row.paymentStatus === "paid"
                  ? "text-[12px] text-success"
                  : "text-[12px] text-ink-muted"
            }
          >
            {titleCase(row.paymentStatus)}
          </p>
          <p className="text-[11px] uppercase tracking-[0.08em] text-ink-muted">
            {row.paymentMethod.replace("_", " ")}
          </p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortable: true,
      value: (row) => row.total,
      render: (row) => <span className="font-medium tabular-nums text-ink">{money(row.total)}</span>,
    },
    {
      key: "fee",
      header: "Fee",
      align: "right",
      sortable: true,
      value: (row) => row.fee,
      render: (row) => <span className="tabular-nums text-ink-muted">{money(row.fee)}</span>,
    },
    {
      key: "refunded",
      header: "Refunded",
      align: "right",
      sortable: true,
      value: (row) => row.refunded,
      render: (row) =>
        row.refunded > 0 ? (
          <span className="tabular-nums text-danger">{money(row.refunded)}</span>
        ) : (
          <span className="text-ink-muted/40">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "Placed",
      align: "right",
      sortable: true,
      value: (row) => Date.parse(row.createdAt),
      render: (row) => (
        <span className="whitespace-nowrap text-ink-muted" title={formatDate(row.createdAt)}>
          {relativeTime(row.createdAt)}
        </span>
      ),
    },
  ];

  const tenants = [...new Map(rows.map((r) => [r.storeId, r.storeName])).entries()].sort((a, b) =>
    a[1].localeCompare(b[1]),
  );

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      searchPlaceholder="Search order number or customer…"
      pageSize={20}
      dense
      emptyMessage="No orders match those filters."
      filters={[
        {
          key: "tenant",
          label: "Tenant",
          options: [
            { value: "all", label: "All tenants" },
            ...tenants.map(([id, name]) => ({ value: id, label: name })),
          ],
          match: (row, value) => row.storeId === value,
        },
        {
          key: "payment",
          label: "Payment",
          options: [
            { value: "all", label: "Any payment state" },
            { value: "paid", label: "Paid" },
            { value: "pending", label: "Pending" },
            { value: "failed", label: "Failed" },
            { value: "refunded", label: "Refunded" },
          ],
          match: (row, value) => row.paymentStatus === value,
        },
        {
          key: "status",
          label: "Order status",
          options: [
            { value: "all", label: "Any status" },
            ...[...new Set(rows.map((r) => r.status))]
              .sort()
              .map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
          ],
          match: (row, value) => row.status === value,
        },
        {
          key: "refunds",
          label: "Refunds",
          options: [
            { value: "all", label: "All orders" },
            { value: "yes", label: "Has a refund" },
          ],
          match: (row) => row.refunded > 0,
        },
      ]}
    />
  );
}
