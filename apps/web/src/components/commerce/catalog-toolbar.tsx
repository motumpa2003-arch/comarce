"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { SORT_OPTIONS, type SortKey } from "@obsidian/commerce";
import { Select, cn } from "@obsidian/ui";
import { buildCatalogHref } from "@/lib/catalog-params";
import { number } from "@/lib/format";
import { useUi } from "@/store/ui";

export function CatalogToolbar({
  basePath,
  total,
  page,
  pageSize,
  activeSort,
  view,
  appliedCount,
  className,
}: {
  basePath: string;
  total: number;
  page: number;
  pageSize: number;
  activeSort: SortKey;
  view: "grid" | "list";
  appliedCount: number;
  className?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const toggleFilters = useUi((s) => s.toggleFilters);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const navigate = (patch: Record<string, string | null>) => {
    router.push(buildCatalogHref(basePath, new URLSearchParams(params.toString()), patch), { scroll: false });
  };

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-[12.5px] text-ink-muted">
        Showing{" "}
        <span className="font-medium text-ink tabular-nums">
          {number(from)}–{number(to)}
        </span>{" "}
        of <span className="font-medium text-ink tabular-nums">{number(total)}</span> products
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleFilters(true)}
          className="flex h-9 items-center gap-2 rounded-[var(--radius-button)] border border-line px-3.5 text-[12px] font-medium text-ink transition-colors hover:border-ink/35 lg:hidden"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {appliedCount > 0 && (
            <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9.5px] font-bold text-obsidian">
              {appliedCount}
            </span>
          )}
        </button>

        <label className="flex items-center gap-2">
          <span className="hidden text-[11.5px] text-ink-muted sm:inline">Sort by</span>
          <Select
            sizeVariant="sm"
            value={activeSort}
            onChange={(e) => navigate({ sort: e.target.value })}
            className="min-w-[168px]"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <div className="hidden items-center rounded-[var(--radius-button)] border border-line sm:flex">
          <button
            type="button"
            onClick={() => navigate({ view: null })}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={cn(
              "grid h-9 w-9 place-items-center transition-colors",
              view === "grid" ? "bg-ink text-inverse" : "text-ink-muted hover:text-ink",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => navigate({ view: "list" })}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={cn(
              "grid h-9 w-9 place-items-center transition-colors",
              view === "list" ? "bg-ink text-inverse" : "text-ink-muted hover:text-ink",
            )}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
