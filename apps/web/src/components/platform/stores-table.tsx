"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@obsidian/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDate, money, moneyShort, number, percent, titleCase } from "@/lib/format";

export interface StoreRow {
  id: string;
  name: string;
  logoMark: string;
  domain: string;
  industry: string;
  status: string;
  planName: string;
  planId: string;
  mrr: number;
  subscriptionStatus: string;
  interval: string;
  renewsAt?: string;
  gmv: number;
  orders: number;
  customers: number;
  products: number;
  conversionRate: number;
  createdAt: string;
  hasCatalogue: boolean;
}

export function StoresTable({ rows }: { rows: StoreRow[] }) {
  const columns: Column<StoreRow>[] = [
    {
      key: "store",
      header: "Store",
      sortable: true,
      value: (row) => `${row.name} ${row.domain}`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[5px] bg-obsidian text-[10px] font-bold text-accent">
            {row.logoMark}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-medium text-ink">
              {row.name}
              {row.hasCatalogue && (
                <Badge tone="info" size="xs">
                  Seeded
                </Badge>
              )}
            </p>
            <p className="truncate text-[11px] text-ink-muted">{row.domain}</p>
          </div>
        </div>
      ),
    },
    {
      key: "industry",
      header: "Vertical",
      sortable: true,
      value: (row) => row.industry,
      render: (row) => <span className="capitalize text-ink-muted">{row.industry}</span>,
    },
    {
      key: "plan",
      header: "Plan",
      sortable: true,
      value: (row) => row.mrr,
      render: (row) => (
        <div>
          <Badge tone="outline" size="xs">
            {row.planName}
          </Badge>
          <p className="mt-1 text-[11px] tabular-nums text-ink-muted">
            {money(row.mrr)}/mo · {row.interval}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      value: (row) => row.status,
      render: (row) => (
        <div className="space-y-1">
          <Badge
            tone={
              row.status === "active"
                ? "success"
                : row.status === "trial"
                  ? "info"
                  : row.status === "suspended"
                    ? "danger"
                    : row.status === "closed"
                      ? "neutral"
                      : "warning"
            }
            size="xs"
          >
            {row.status}
          </Badge>
          {row.subscriptionStatus !== row.status && (
            <Badge tone={row.subscriptionStatus === "past_due" ? "danger" : "outline"} size="xs">
              {row.subscriptionStatus.replace("_", " ")}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "gmv",
      header: "GMV (30d)",
      align: "right",
      sortable: true,
      value: (row) => row.gmv,
      render: (row) => <span className="font-medium text-ink">{moneyShort(row.gmv)}</span>,
    },
    {
      key: "orders",
      header: "Orders",
      align: "right",
      sortable: true,
      value: (row) => row.orders,
      render: (row) => <span className="text-ink-muted">{number(row.orders)}</span>,
    },
    {
      key: "customers",
      header: "Customers",
      align: "right",
      sortable: true,
      value: (row) => row.customers,
      render: (row) => <span className="text-ink-muted">{number(row.customers)}</span>,
    },
    {
      key: "products",
      header: "Products",
      align: "right",
      sortable: true,
      value: (row) => row.products,
      render: (row) => <span className="text-ink-muted">{number(row.products)}</span>,
    },
    {
      key: "conversion",
      header: "Conv.",
      align: "right",
      sortable: true,
      value: (row) => row.conversionRate,
      render: (row) => <span className="text-ink-muted">{percent(row.conversionRate, 2)}</span>,
    },
    {
      key: "created",
      header: "Joined",
      align: "right",
      sortable: true,
      value: (row) => Date.parse(row.createdAt),
      render: (row) => <span className="text-[11.5px] text-ink-muted">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "go",
      header: "",
      align: "right",
      render: (row) => (
        <Link
          href={`/platform/stores/${row.id}`}
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
      hrefFor={(row) => `/platform/stores/${row.id}`}
      searchPlaceholder="Search by store name or domain…"
      pageSize={15}
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "active", label: "Active" },
            { value: "trial", label: "Trial" },
            { value: "paused", label: "Paused" },
            { value: "suspended", label: "Suspended" },
            { value: "closed", label: "Closed" },
          ],
          match: (row, value) => row.status === value,
        },
        {
          key: "plan",
          label: "Plan",
          options: [...new Set(rows.map((r) => r.planName))].map((plan) => ({ value: plan, label: plan })),
          match: (row, value) => row.planName === value,
        },
        {
          key: "industry",
          label: "Vertical",
          options: [...new Set(rows.map((r) => r.industry))].map((industry) => ({
            value: industry,
            label: titleCase(industry),
          })),
          match: (row, value) => row.industry === value,
        },
        {
          key: "catalogue",
          label: "Catalogue",
          options: [
            { value: "seeded", label: "Seeded demo data" },
            { value: "record", label: "SaaS record only" },
          ],
          match: (row, value) => (value === "seeded" ? row.hasCatalogue : !row.hasCatalogue),
        },
      ]}
      emptyMessage="No stores match those filters."
    />
  );
}
