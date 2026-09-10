"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import { Input, Select, cn } from "@obsidian/ui";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: string;
  sortable?: boolean;
  /** Value used for sorting and free-text search. */
  value?: (row: T) => string | number;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  hrefFor?: (row: T) => string;
  searchPlaceholder?: string;
  /** Optional segmented filters rendered next to the search box. */
  filters?: { key: string; label: string; options: { value: string; label: string }[]; match: (row: T, value: string) => boolean }[];
  emptyMessage?: string;
  pageSize?: number;
  toolbarExtra?: React.ReactNode;
  dense?: boolean;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  hrefFor,
  searchPlaceholder = "Search…",
  filters = [],
  emptyMessage = "Nothing to show yet.",
  pageSize = 12,
  toolbarExtra,
  dense,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [active, setActive] = React.useState<Record<string, string>>({});
  const [page, setPage] = React.useState(1);

  const searchable = React.useMemo(() => columns.filter((c) => c.value), [columns]);

  const filtered = React.useMemo(() => {
    let out = rows;

    for (const filter of filters) {
      const value = active[filter.key];
      if (value && value !== "all") out = out.filter((row) => filter.match(row, value));
    }

    const term = query.trim().toLowerCase();
    if (term) {
      out = out.filter((row) =>
        searchable.some((column) => String(column.value!(row)).toLowerCase().includes(term)),
      );
    }

    if (sort) {
      const column = columns.find((c) => c.key === sort.key);
      if (column?.value) {
        out = [...out].sort((a, b) => {
          const av = column.value!(a);
          const bv = column.value!(b);
          const result =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv), undefined, { numeric: true });
          return sort.dir === "asc" ? result : -result;
        });
      }
    }
    return out;
  }, [rows, filters, active, query, searchable, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * pageSize, current * pageSize);

  React.useEffect(() => setPage(1), [query, active, sort]);

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev?.key === key ? (prev.dir === "asc" ? { key, dir: "desc" } : null) : { key, dir: "asc" },
    );
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line p-3">
        <div className="min-w-[200px] flex-1">
          <Input
            sizeVariant="sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            leading={<Search className="h-3.5 w-3.5" />}
            aria-label="Search table"
          />
        </div>
        {filters.map((filter) => (
          <Select
            key={filter.key}
            sizeVariant="sm"
            className="w-auto min-w-[140px]"
            aria-label={filter.label}
            value={active[filter.key] ?? "all"}
            onChange={(e) => setActive({ ...active, [filter.key]: e.target.value })}
          >
            <option value="all">{filter.label}: all</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ))}
        {toolbarExtra}
        <span className="ml-auto shrink-0 text-[11.5px] tabular-nums text-ink-muted">
          {filtered.length} {filtered.length === 1 ? "row" : "rows"}
        </span>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-line bg-muted/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  className={cn(
                    "whitespace-nowrap px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                  )}
                >
                  {column.sortable && column.value ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-ink",
                        column.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {column.header}
                      {sort?.key === column.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-[13px] text-ink-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visible.map((row) => {
                const href = hrefFor?.(row);
                return (
                  <tr key={rowKey(row)} className="group transition-colors hover:bg-muted/60">
                    {columns.map((column, index) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-4 align-middle text-[12.5px] text-ink",
                          dense ? "py-2" : "py-3",
                          column.align === "right" && "text-right tabular-nums",
                          column.align === "center" && "text-center",
                          column.className,
                        )}
                      >
                        {href && index === 0 ? (
                          <Link href={href} className="block">
                            {column.render(row)}
                          </Link>
                        ) : (
                          column.render(row)
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-[11.5px] tabular-nums text-ink-muted">
            Page {current} of {pageCount}
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current <= 1}
              className="rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-[11.5px] text-ink transition-colors hover:border-ink/30 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={current >= pageCount}
              className="rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-[11.5px] text-ink transition-colors hover:border-ink/30 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
