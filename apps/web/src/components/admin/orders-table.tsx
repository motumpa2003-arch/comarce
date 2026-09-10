"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge, type BadgeTone } from "@obsidian/ui";
import { DataTable, type Column } from "./data-table";
import { money, relativeTime, titleCase } from "@/lib/format";

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  total: number;
  status: string;
  statusLabel: string;
  statusTone: BadgeTone;
  paymentStatus: string;
  paymentMethod: string;
  fulfilmentStatus: string;
  channel: string;
  city: string;
  createdAt: string;
  couponCode?: string;
  image: string;
}

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const columns: Column<OrderRow>[] = [
    {
      key: "order",
      header: "Order",
      sortable: true,
      value: (row) => row.orderNumber,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-[4px] bg-muted">
            {row.image && <Image src={row.image} alt="" fill sizes="32px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink">#{row.orderNumber}</p>
            <p className="text-[11px] text-ink-muted">
              {row.itemCount} item{row.itemCount === 1 ? "" : "s"}
              {row.couponCode ? ` · ${row.couponCode}` : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      value: (row) => row.customerName,
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-ink">{row.customerName}</p>
          <p className="truncate text-[11px] text-ink-muted">{row.city}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      value: (row) => row.statusLabel,
      render: (row) => (
        <Badge tone={row.statusTone} size="xs" dot>
          {row.statusLabel}
        </Badge>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      sortable: true,
      value: (row) => row.paymentStatus,
      render: (row) => (
        <div>
          <Badge
            tone={
              row.paymentStatus === "paid"
                ? "success"
                : row.paymentStatus === "failed"
                  ? "danger"
                  : row.paymentStatus === "refunded"
                    ? "danger"
                    : "warning"
            }
            size="xs"
          >
            {row.paymentStatus.replace(/_/g, " ")}
          </Badge>
          <p className="mt-1 text-[10.5px] uppercase tracking-wide text-ink-muted">{row.paymentMethod}</p>
        </div>
      ),
    },
    {
      key: "fulfilment",
      header: "Fulfilment",
      sortable: true,
      value: (row) => row.fulfilmentStatus,
      render: (row) => (
        <span className="text-[11.5px] text-ink-muted">{titleCase(row.fulfilmentStatus)}</span>
      ),
    },
    {
      key: "channel",
      header: "Channel",
      sortable: true,
      value: (row) => row.channel,
      render: (row) => <span className="text-[11.5px] capitalize text-ink-muted">{row.channel}</span>,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortable: true,
      value: (row) => row.total,
      render: (row) => <span className="font-medium text-ink">{money(row.total)}</span>,
    },
    {
      key: "placed",
      header: "Placed",
      align: "right",
      sortable: true,
      value: (row) => Date.parse(row.createdAt),
      render: (row) => <span className="text-[11.5px] text-ink-muted">{relativeTime(row.createdAt)}</span>,
    },
    {
      key: "go",
      header: "",
      align: "right",
      render: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
          aria-label={`Open order ${row.orderNumber}`}
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
      hrefFor={(row) => `/admin/orders/${row.id}`}
      searchPlaceholder="Search by order number, customer or email…"
      pageSize={15}
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "open", label: "Needs action" },
            { value: "in_transit", label: "In transit" },
            { value: "delivered", label: "Delivered" },
            { value: "returns", label: "Return flow" },
            { value: "cancelled", label: "Cancelled" },
          ],
          match: (row, value) => {
            const groups: Record<string, string[]> = {
              open: ["pending", "payment_pending", "confirmed", "processing", "packed"],
              in_transit: ["shipped", "out_for_delivery"],
              delivered: ["delivered"],
              returns: ["return_requested", "return_approved", "returned", "refund_pending", "refunded"],
              cancelled: ["cancelled"],
            };
            return groups[value]?.includes(row.status) ?? false;
          },
        },
        {
          key: "payment",
          label: "Payment",
          options: [
            { value: "paid", label: "Paid" },
            { value: "pending", label: "Pending" },
            { value: "refunded", label: "Refunded" },
            { value: "failed", label: "Failed" },
          ],
          match: (row, value) => row.paymentStatus === value,
        },
        {
          key: "channel",
          label: "Channel",
          options: [
            { value: "web", label: "Web" },
            { value: "mobile", label: "Mobile app" },
            { value: "pos", label: "POS" },
            { value: "marketplace", label: "Marketplace" },
          ],
          match: (row, value) => row.channel === value,
        },
      ]}
      emptyMessage="No orders match those filters."
    />
  );
}
