"use client";

import Image from "next/image";
import Link from "next/link";
import { KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { Badge } from "@obsidian/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDate, relativeTime, titleCase } from "@/lib/format";

export interface PlatformUserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  type: "platform" | "merchant" | "staff";
  role: string;
  storeId?: string;
  storeName: string;
  storeCount: number;
  mfaEnabled: boolean;
  status: string;
  createdAt: string;
  lastActiveAt: string;
}

const TYPE_TONE = {
  platform: "accent",
  merchant: "info",
  staff: "neutral",
} as const;

export function UsersTable({ rows }: { rows: PlatformUserRow[] }) {
  const columns: Column<PlatformUserRow>[] = [
    {
      key: "user",
      header: "User",
      sortable: true,
      value: (row) => `${row.name} ${row.email} ${row.phone}`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <Image
            src={row.avatar}
            alt=""
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.name}</p>
            <p className="truncate text-[11px] text-ink-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Account",
      sortable: true,
      value: (row) => row.type,
      render: (row) => (
        <div className="space-y-1">
          <Badge tone={TYPE_TONE[row.type]} size="xs">
            {row.type === "platform" ? "Operator" : titleCase(row.type)}
          </Badge>
          <p className="text-[11px] text-ink-muted">{titleCase(row.role)}</p>
        </div>
      ),
    },
    {
      key: "store",
      header: "Access",
      sortable: true,
      value: (row) => row.storeName,
      render: (row) =>
        row.storeId ? (
          <Link
            href={`/platform/stores/${row.storeId}`}
            className="text-ink hover:text-primary hover:underline"
          >
            {row.storeName}
          </Link>
        ) : (
          <span className="text-ink-muted">
            {row.storeCount > 1 ? `All ${row.storeCount} stores` : row.storeName}
          </span>
        ),
    },
    {
      key: "mfa",
      header: "MFA",
      align: "center",
      sortable: true,
      value: (row) => (row.mfaEnabled ? 1 : 0),
      render: (row) =>
        row.mfaEnabled ? (
          <span className="inline-flex items-center gap-1 text-[11.5px] text-success">
            <ShieldCheck className="h-3.5 w-3.5" />
            On
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11.5px] text-danger">
            <ShieldOff className="h-3.5 w-3.5" />
            Off
          </span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      value: (row) => row.status,
      render: (row) => (
        <Badge
          tone={row.status === "active" ? "success" : row.status === "invited" ? "warning" : "neutral"}
          size="xs"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "lastActiveAt",
      header: "Last active",
      align: "right",
      sortable: true,
      value: (row) => Date.parse(row.lastActiveAt),
      render: (row) => <span className="text-ink-muted">{relativeTime(row.lastActiveAt)}</span>,
    },
    {
      key: "createdAt",
      header: "Joined",
      align: "right",
      sortable: true,
      value: (row) => Date.parse(row.createdAt),
      render: (row) => <span className="text-ink-muted">{formatDate(row.createdAt)}</span>,
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      searchPlaceholder="Search by name, email or phone…"
      pageSize={15}
      emptyMessage="No accounts match those filters."
      filters={[
        {
          key: "type",
          label: "Account type",
          options: [
            { value: "all", label: "All accounts" },
            { value: "platform", label: "Operators" },
            { value: "merchant", label: "Store owners" },
            { value: "staff", label: "Staff" },
          ],
          match: (row, value) => row.type === value,
        },
        {
          key: "mfa",
          label: "MFA",
          options: [
            { value: "all", label: "Any MFA state" },
            { value: "on", label: "MFA enabled" },
            { value: "off", label: "MFA missing" },
          ],
          match: (row, value) => (value === "on" ? row.mfaEnabled : !row.mfaEnabled),
        },
        {
          key: "status",
          label: "Status",
          options: [
            { value: "all", label: "Any status" },
            { value: "active", label: "Active" },
            { value: "invited", label: "Invited" },
            { value: "disabled", label: "Disabled" },
          ],
          match: (row, value) => row.status === value,
        },
      ]}
      toolbarExtra={
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <KeyRound className="h-3.5 w-3.5" />
          Passwords are never stored or shown here
        </span>
      }
    />
  );
}
