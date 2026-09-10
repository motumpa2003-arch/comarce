"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar, Badge, type BadgeTone } from "@obsidian/ui";
import { DataTable, type Column } from "./data-table";
import { money, number, relativeTime, titleCase } from "@/lib/format";

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  city: string;
  ordersCount: number;
  lifetimeValue: number;
  averageOrderValue: number;
  loyaltyTier: string;
  loyaltyPoints: number;
  storeCredit: number;
  segments: string[];
  marketingOptIn: boolean;
  lastOrderAt?: string;
  createdAt: string;
  status: string;
}

const SEGMENT_TONE: Record<string, BadgeTone> = {
  vip: "accent",
  high_value: "success",
  repeat: "info",
  new: "neutral",
  inactive: "warning",
  at_risk: "danger",
  coupon_led: "outline",
};

const TIER_TONE: Record<string, BadgeTone> = {
  black: "obsidian",
  gold: "accent",
  silver: "neutral",
  member: "outline",
};

export function CustomersTable({ rows }: { rows: CustomerRow[] }) {
  const columns: Column<CustomerRow>[] = [
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      value: (row) => `${row.name} ${row.email}`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size={32} />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.name}</p>
            <p className="truncate text-[11px] text-ink-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "city",
      header: "Location",
      sortable: true,
      value: (row) => row.city,
      render: (row) => <span className="text-ink-muted">{row.city}</span>,
    },
    {
      key: "tier",
      header: "Tier",
      sortable: true,
      value: (row) => row.loyaltyTier,
      render: (row) => (
        <Badge tone={TIER_TONE[row.loyaltyTier] ?? "neutral"} size="xs">
          {titleCase(row.loyaltyTier)}
        </Badge>
      ),
    },
    {
      key: "segments",
      header: "Segments",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.segments.slice(0, 3).map((segment) => (
            <Badge key={segment} tone={SEGMENT_TONE[segment] ?? "neutral"} size="xs">
              {titleCase(segment)}
            </Badge>
          ))}
          {row.segments.length > 3 && (
            <span className="text-[10.5px] text-ink-muted">+{row.segments.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      align: "right",
      sortable: true,
      value: (row) => row.ordersCount,
      render: (row) => <span className="text-ink">{number(row.ordersCount)}</span>,
    },
    {
      key: "ltv",
      header: "Lifetime value",
      align: "right",
      sortable: true,
      value: (row) => row.lifetimeValue,
      render: (row) => <span className="font-medium text-ink">{money(row.lifetimeValue)}</span>,
    },
    {
      key: "aov",
      header: "AOV",
      align: "right",
      sortable: true,
      value: (row) => row.averageOrderValue,
      render: (row) => <span className="text-ink-muted">{money(row.averageOrderValue)}</span>,
    },
    {
      key: "points",
      header: "Points",
      align: "right",
      sortable: true,
      value: (row) => row.loyaltyPoints,
      render: (row) => <span className="text-ink-muted">{number(row.loyaltyPoints)}</span>,
    },
    {
      key: "last",
      header: "Last order",
      align: "right",
      sortable: true,
      value: (row) => (row.lastOrderAt ? Date.parse(row.lastOrderAt) : 0),
      render: (row) => (
        <span className="text-[11.5px] text-ink-muted">
          {row.lastOrderAt ? relativeTime(row.lastOrderAt) : "Never"}
        </span>
      ),
    },
    {
      key: "go",
      header: "",
      align: "right",
      render: (row) => (
        <Link
          href={`/admin/customers/${row.id}`}
          className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
          aria-label={`Open ${row.name}`}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      hrefFor={(row) => `/admin/customers/${row.id}`}
      searchPlaceholder="Search by name, email or phone…"
      pageSize={15}
      filters={[
        {
          key: "segment",
          label: "Segment",
          options: [
            { value: "vip", label: "VIP" },
            { value: "high_value", label: "High value" },
            { value: "repeat", label: "Repeat" },
            { value: "new", label: "New" },
            { value: "inactive", label: "Inactive" },
            { value: "at_risk", label: "At risk" },
          ],
          match: (row, value) => row.segments.includes(value),
        },
        {
          key: "tier",
          label: "Tier",
          options: [
            { value: "black", label: "Black" },
            { value: "gold", label: "Gold" },
            { value: "silver", label: "Silver" },
            { value: "member", label: "Member" },
          ],
          match: (row, value) => row.loyaltyTier === value,
        },
        {
          key: "marketing",
          label: "Marketing",
          options: [
            { value: "in", label: "Opted in" },
            { value: "out", label: "Opted out" },
          ],
          match: (row, value) => (value === "in" ? row.marketingOptIn : !row.marketingOptIn),
        },
      ]}
      emptyMessage="No customers match those filters."
    />
  );
}
