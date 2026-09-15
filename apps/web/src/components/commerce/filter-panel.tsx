"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles, SlidersHorizontal, X } from "lucide-react";
import type { Facet } from "@obsidian/commerce";
import { Button, Checkbox, Collapsible, Drawer, cn } from "@obsidian/ui";
import { buildCatalogHref, toggleInParam } from "@/lib/catalog-params";
import { money } from "@/lib/format";
import { useUi } from "@/store/ui";

const PARAM_FOR_FACET: Record<string, string> = {
  category: "cat",
  brand: "brand",
  availability: "avail",
  rating: "rating",
};

function paramKey(facetKey: string): string {
  return PARAM_FOR_FACET[facetKey] ?? `a_${facetKey}`;
}

export function FilterPanel({
  facets,
  basePath,
  priceRange,
  className,
  compact,
}: {
  facets: Facet[];
  basePath: string;
  priceRange: { min: number; max: number };
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const search = React.useMemo(() => new URLSearchParams(params.toString()), [params]);

  const navigate = (patch: Record<string, string | string[] | null>) => {
    router.push(buildCatalogHref(basePath, search, patch), { scroll: false });
  };

  const toggle = (facetKey: string, value: string) => {
    const key = paramKey(facetKey);
    if (facetKey === "rating") {
      navigate({ [key]: search.get(key) === value ? null : value });
      return;
    }
    navigate({ [key]: toggleInParam(search, key, value) });
  };

  const isChecked = (facetKey: string, value: string) => {
    const key = paramKey(facetKey);
    const raw = search.get(key) ?? "";
    return facetKey === "rating" ? raw === value : raw.split(",").includes(value);
  };

  const hasFilters = [...search.keys()].some((k) => k !== "sort" && k !== "page" && k !== "q" && k !== "view");

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between pb-1">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => navigate(clearPatch(search))}
            className="text-[11px] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="divide-y divide-line">
        <PriceFilter basePath={basePath} search={search} range={priceRange} onNavigate={navigate} />

        {facets.map((facet) => (
          <Collapsible
            key={facet.key}
            title={facet.label}
            defaultOpen={!compact && ["category", "brand", "availability", "color", "size"].includes(facet.key)}
          >
            {facet.type === "swatch" ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {facet.values.map((value) => {
                  const checked = isChecked(facet.key, value.value);
                  return (
                    <button
                      key={value.value}
                      type="button"
                      title={`${value.label} (${value.count})`}
                      onClick={() => toggle(facet.key, value.value)}
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-full border transition-all",
                        checked
                          ? "border-ink ring-1 ring-ink ring-offset-2 ring-offset-surface"
                          : "border-line hover:border-ink/40",
                      )}
                      style={{ backgroundColor: value.swatch ?? "var(--c-surface-muted)" }}
                    >
                      <span className="sr-only">{value.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <FacetList
                facet={facet}
                isChecked={isChecked}
                onToggle={toggle}
                searchable={facet.values.length > 8}
              />
            )}
          </Collapsible>
        ))}
      </div>

      {!compact && <SidebarPromoCard />}
    </div>
  );
}

function SidebarPromoCard() {
  return (
    <Link
      href="/deals"
      className="group relative mt-6 block overflow-hidden rounded-[var(--radius-card)] bg-obsidian p-5 text-inverse"
    >
      <Sparkles className="h-6 w-6 text-accent" />
      <p className="mt-4 font-display display-case text-[17px] leading-snug text-inverse">
        Upgrade to smarter living
      </p>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-inverse/55">
        Today's best deals, refreshed daily.
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-accent">
        Shop deals
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function FacetList({
  facet,
  isChecked,
  onToggle,
  searchable,
}: {
  facet: Facet;
  isChecked: (key: string, value: string) => boolean;
  onToggle: (key: string, value: string) => void;
  searchable: boolean;
}) {
  const [term, setTerm] = React.useState("");
  const [showAll, setShowAll] = React.useState(false);

  const filtered = term
    ? facet.values.filter((v) => v.label.toLowerCase().includes(term.toLowerCase()))
    : facet.values;
  const visible = showAll ? filtered : filtered.slice(0, 7);

  return (
    <div className="space-y-2.5 pt-1">
      {searchable && (
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={`Search ${facet.label.toLowerCase()}`}
          className="h-8 w-full rounded-[var(--radius-sm)] border border-line bg-surface px-2.5 text-[12px] text-ink outline-none placeholder:text-ink-muted/70 focus:border-primary"
        />
      )}
      {visible.map((value) => (
        <Checkbox
          key={value.value}
          checked={isChecked(facet.key, value.value)}
          onChange={() => onToggle(facet.key, value.value)}
          label={facet.type === "rating" ? <RatingLabel label={value.label} /> : value.label}
          count={value.count}
        />
      ))}
      {filtered.length > 7 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-[11.5px] font-medium text-primary underline underline-offset-4"
        >
          {showAll ? "Show less" : `Show ${filtered.length - 7} more`}
        </button>
      )}
      {filtered.length === 0 && <p className="text-[12px] text-ink-muted">No matches</p>}
    </div>
  );
}

function RatingLabel({ label }: { label: string }) {
  const stars = Number(label.charAt(0));
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-accent" aria-hidden>
        {"★".repeat(stars)}
        <span className="text-line">{"★".repeat(5 - stars)}</span>
      </span>
      <span className="text-ink-muted">&amp; above</span>
    </span>
  );
}

function PriceFilter({
  basePath,
  search,
  range,
  onNavigate,
}: {
  basePath: string;
  search: URLSearchParams;
  range: { min: number; max: number };
  onNavigate: (patch: Record<string, string | null>) => void;
}) {
  const currentMin = Number(search.get("min") ?? range.min);
  const currentMax = Number(search.get("max") ?? range.max);
  const [value, setValue] = React.useState(currentMax);

  React.useEffect(() => setValue(currentMax), [currentMax]);

  const buckets = React.useMemo(() => {
    const span = range.max - range.min;
    if (span <= 0) return [];
    // Snap bucket edges to readable round rupee figures.
    const snap = (value: number) => {
      const rupees = value / 100;
      const magnitude = 10 ** Math.max(2, Math.floor(Math.log10(Math.max(rupees, 1))));
      return Math.round(Math.round(rupees / magnitude) * magnitude) * 100;
    };
    return [0.15, 0.3, 0.55, 1].map((factor, index, all) => ({
      lower: index === 0 ? range.min : snap(range.min + span * all[index - 1]!),
      upper: factor === 1 ? range.max : snap(range.min + span * factor),
    }));
  }, [range]);

  void basePath;

  return (
    <Collapsible title="Price" defaultOpen>
      <div className="pt-1">
        <div className="flex items-center justify-between text-[12px] text-ink">
          <span className="tabular-nums">{money(range.min)}</span>
          <span className="tabular-nums font-medium">{money(value)}</span>
        </div>
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={Math.max(100, Math.round((range.max - range.min) / 200))}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onMouseUp={() => onNavigate({ max: value >= range.max ? null : String(value) })}
          onTouchEnd={() => onNavigate({ max: value >= range.max ? null : String(value) })}
          className="mt-3 h-1 w-full cursor-pointer appearance-none rounded-full bg-line accent-[var(--c-primary)]"
          aria-label="Maximum price"
        />
        <div className="mt-4 flex flex-wrap gap-1.5">
          {buckets.map((bucket) => {
            const active = currentMin === bucket.lower && currentMax === bucket.upper;
            return (
              <button
                key={`${bucket.lower}-${bucket.upper}`}
                type="button"
                onClick={() =>
                  onNavigate(
                    active
                      ? { min: null, max: null }
                      : { min: String(bucket.lower), max: String(bucket.upper) },
                  )
                }
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] tabular-nums transition-colors",
                  active ? "border-ink bg-ink text-inverse" : "border-line text-ink-muted hover:border-ink/35",
                )}
              >
                {money(bucket.lower)} – {money(bucket.upper)}
              </button>
            );
          })}
        </div>
      </div>
    </Collapsible>
  );
}

function clearPatch(search: URLSearchParams): Record<string, null> {
  const patch: Record<string, null> = {};
  for (const key of search.keys()) {
    if (key === "sort" || key === "q" || key === "view") continue;
    patch[key] = null;
  }
  return patch;
}

/* -------------------------- Mobile filter sheet --------------------- */

export function MobileFilterSheet({
  facets,
  basePath,
  priceRange,
  total,
}: {
  facets: Facet[];
  basePath: string;
  priceRange: { min: number; max: number };
  total: number;
}) {
  const open = useUi((s) => s.filtersOpen);
  const toggleFilters = useUi((s) => s.toggleFilters);

  return (
    <Drawer
      open={open}
      onClose={() => toggleFilters(false)}
      side="bottom"
      title="Filters"
      footer={
        <Button fullWidth size="lg" onClick={() => toggleFilters(false)}>
          Show {total} results
        </Button>
      }
    >
      <div className="px-5 pb-4">
        <FilterPanel facets={facets} basePath={basePath} priceRange={priceRange} compact />
      </div>
    </Drawer>
  );
}

/* --------------------------- Applied chips -------------------------- */

export function AppliedFilterChips({
  chips,
  basePath,
}: {
  chips: { key: string; value: string; label: string }[];
  basePath: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  if (!chips.length) return null;

  const remove = (key: string, value: string) => {
    const search = new URLSearchParams(params.toString());
    if (key === "price") {
      router.push(buildCatalogHref(basePath, search, { min: null, max: null }), { scroll: false });
      return;
    }
    if (key === "rating") {
      router.push(buildCatalogHref(basePath, search, { rating: null }), { scroll: false });
      return;
    }
    const remaining = (search.get(key) ?? "").split(",").filter((v) => v && v !== value);
    router.push(buildCatalogHref(basePath, search, { [key]: remaining }), { scroll: false });
  };

  const clearAll = () => {
    const search = new URLSearchParams(params.toString());
    router.push(buildCatalogHref(basePath, search, clearPatch(search)), { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => remove(chip.key, chip.value)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-muted px-3 py-1.5 text-[11.5px] text-ink transition-colors hover:border-ink/35"
        >
          {chip.label}
          <X className="h-3 w-3 text-ink-muted transition-colors group-hover:text-ink" />
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-[11.5px] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
      >
        Clear all
      </button>
    </div>
  );
}
