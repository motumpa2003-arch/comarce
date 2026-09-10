"use client";

import { Badge, Progress } from "@obsidian/ui";
import { DataTable, type Column } from "./data-table";
import { formatDate, money, number, titleCase } from "@/lib/format";

export interface CouponRow {
  id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  value: number;
  minimumSpend?: number;
  maximumDiscount?: number;
  eligibility: string;
  usedCount: number;
  usageLimit?: number;
  status: string;
  startsAt: string;
  endsAt: string;
  stackable: boolean;
  attributedOrders: number;
  attributedDiscount: number;
  attributedRevenue: number;
}

function describeValue(row: CouponRow): string {
  switch (row.type) {
    case "percentage":
      return `${row.value}% off`;
    case "fixed":
      return `${money(row.value)} off`;
    case "free_shipping":
      return "Free shipping";
    case "buy_x_get_y":
      return "Buy 2 get 1";
    case "tiered":
      return `${row.value}%+ tiered`;
    default:
      return titleCase(row.type);
  }
}

export function CouponsTable({ rows }: { rows: CouponRow[] }) {
  const columns: Column<CouponRow>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      value: (row) => `${row.code} ${row.title}`,
      render: (row) => (
        <div className="min-w-0">
          <p className="font-mono text-[12px] font-semibold uppercase tracking-wide text-ink">{row.code}</p>
          <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">{row.title}</p>
        </div>
      ),
    },
    {
      key: "value",
      header: "Discount",
      sortable: true,
      value: (row) => row.value,
      render: (row) => (
        <div>
          <p className="text-ink">{describeValue(row)}</p>
          <p className="text-[11px] text-ink-muted">
            {row.minimumSpend ? `min ${money(row.minimumSpend)}` : "no minimum"}
            {row.maximumDiscount ? ` · cap ${money(row.maximumDiscount)}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "eligibility",
      header: "Who",
      sortable: true,
      value: (row) => row.eligibility,
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge tone={row.eligibility === "all" ? "outline" : "info"} size="xs">
            {row.eligibility === "all" ? "Everyone" : titleCase(row.eligibility)}
          </Badge>
          {row.stackable && (
            <Badge tone="accent" size="xs">
              Stackable
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      sortable: true,
      value: (row) => row.usedCount,
      render: (row) => (
        <div className="min-w-[110px]">
          <p className="text-[11.5px] tabular-nums text-ink">
            {number(row.usedCount)}
            {row.usageLimit ? ` / ${number(row.usageLimit)}` : ""}
          </p>
          {row.usageLimit && (
            <Progress
              className="mt-1"
              value={(row.usedCount / row.usageLimit) * 100}
              tone={row.usedCount / row.usageLimit > 0.85 ? "warning" : "primary"}
              height={4}
            />
          )}
        </div>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      align: "right",
      sortable: true,
      value: (row) => row.attributedOrders,
      render: (row) => <span className="text-ink">{number(row.attributedOrders)}</span>,
    },
    {
      key: "discount",
      header: "Discount given",
      align: "right",
      sortable: true,
      value: (row) => row.attributedDiscount,
      render: (row) => <span className="text-ink-muted">{money(row.attributedDiscount)}</span>,
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      sortable: true,
      value: (row) => row.attributedRevenue,
      render: (row) => <span className="font-medium text-ink">{money(row.attributedRevenue)}</span>,
    },
    {
      key: "window",
      header: "Active window",
      sortable: true,
      value: (row) => Date.parse(row.endsAt),
      render: (row) => (
        <div className="text-[11.5px] text-ink-muted">
          <p>{formatDate(row.startsAt)}</p>
          <p>to {formatDate(row.endsAt)}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      value: (row) => row.status,
      render: (row) => (
        <Badge
          tone={
            row.status === "active"
              ? "success"
              : row.status === "scheduled"
                ? "info"
                : row.status === "expired"
                  ? "neutral"
                  : "danger"
          }
          size="xs"
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      searchPlaceholder="Search by code or title…"
      pageSize={14}
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "active", label: "Active" },
            { value: "scheduled", label: "Scheduled" },
            { value: "expired", label: "Expired" },
            { value: "disabled", label: "Disabled" },
          ],
          match: (row, value) => row.status === value,
        },
        {
          key: "type",
          label: "Type",
          options: [
            { value: "percentage", label: "Percentage" },
            { value: "fixed", label: "Fixed amount" },
            { value: "free_shipping", label: "Free shipping" },
            { value: "buy_x_get_y", label: "Buy X get Y" },
            { value: "tiered", label: "Tiered" },
          ],
          match: (row, value) => row.type === value,
        },
        {
          key: "eligibility",
          label: "Audience",
          options: [
            { value: "all", label: "Everyone" },
            { value: "new", label: "New customers" },
            { value: "vip", label: "VIP" },
            { value: "specific", label: "Specific customers" },
          ],
          match: (row, value) => row.eligibility === value,
        },
      ]}
      emptyMessage="No coupons match those filters."
    />
  );
}
