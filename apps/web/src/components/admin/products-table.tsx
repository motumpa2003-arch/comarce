"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { Badge, Rating } from "@obsidian/ui";
import { DataTable, type Column } from "./data-table";
import { money, number, relativeTime } from "@/lib/format";

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  image: string;
  sku: string;
  brand: string;
  category: string;
  industry: string;
  status: string;
  price: number;
  compareAtPrice?: number;
  discount: number;
  variants: number;
  stock: number;
  unitsSold: number;
  rating: number;
  ratingCount: number;
  updatedAt: string;
}

export function ProductsTable({
  rows,
  categories,
  brands,
}: {
  rows: ProductRow[];
  categories: string[];
  brands: string[];
}) {
  const columns: Column<ProductRow>[] = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      value: (row) => `${row.name} ${row.sku} ${row.brand}`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-[4px] bg-muted">
            {row.image && <Image src={row.image} alt="" fill sizes="36px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.name}</p>
            <p className="truncate text-[11px] text-ink-muted">
              {row.sku} · {row.brand}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      value: (row) => row.category,
      render: (row) => <span className="text-ink-muted">{row.category}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      value: (row) => row.status,
      render: (row) => (
        <Badge
          tone={row.status === "active" ? "success" : row.status === "draft" ? "warning" : "neutral"}
          size="xs"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      sortable: true,
      value: (row) => row.price,
      render: (row) => (
        <div>
          <p className="font-medium text-ink">{money(row.price)}</p>
          {row.discount > 0 && <p className="text-[11px] text-sale">{row.discount}% off</p>}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      align: "right",
      sortable: true,
      value: (row) => row.stock,
      render: (row) => (
        <span
          className={
            row.stock === 0 ? "font-medium text-danger" : row.stock <= 12 ? "font-medium text-warning" : "text-ink"
          }
        >
          {row.stock === 0 ? "Out" : number(row.stock)}
        </span>
      ),
    },
    {
      key: "variants",
      header: "Variants",
      align: "right",
      sortable: true,
      value: (row) => row.variants,
      render: (row) => <span className="text-ink-muted">{row.variants}</span>,
    },
    {
      key: "sold",
      header: "Sold",
      align: "right",
      sortable: true,
      value: (row) => row.unitsSold,
      render: (row) => <span className="text-ink-muted">{number(row.unitsSold)}</span>,
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      value: (row) => row.rating,
      render: (row) => <Rating value={row.rating} count={row.ratingCount} size={11} showValue={false} />,
    },
    {
      key: "updated",
      header: "Updated",
      sortable: true,
      value: (row) => Date.parse(row.updatedAt),
      render: (row) => <span className="text-[11.5px] text-ink-muted">{relativeTime(row.updatedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/admin/products/${row.id}`}
            className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/product/${row.slug}`}
            target="_blank"
            className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
            aria-label={`View ${row.name} on the storefront`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(row) => row.id}
      hrefFor={(row) => `/admin/products/${row.id}`}
      searchPlaceholder="Search by name, SKU or brand…"
      pageSize={14}
      filters={[
        {
          key: "status",
          label: "Status",
          options: [
            { value: "active", label: "Active" },
            { value: "draft", label: "Draft" },
            { value: "archived", label: "Archived" },
          ],
          match: (row, value) => row.status === value,
        },
        {
          key: "category",
          label: "Category",
          options: categories.map((c) => ({ value: c, label: c })),
          match: (row, value) => row.category === value,
        },
        {
          key: "brand",
          label: "Brand",
          options: brands.map((b) => ({ value: b, label: b })),
          match: (row, value) => row.brand === value,
        },
        {
          key: "stock",
          label: "Stock",
          options: [
            { value: "out", label: "Out of stock" },
            { value: "low", label: "Low (≤12)" },
            { value: "ok", label: "Healthy" },
          ],
          match: (row, value) =>
            value === "out" ? row.stock === 0 : value === "low" ? row.stock > 0 && row.stock <= 12 : row.stock > 12,
        },
      ]}
      emptyMessage="No products match those filters."
    />
  );
}
