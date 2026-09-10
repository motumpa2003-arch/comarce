"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@obsidian/ui";
import type { DetailVariantAttribute } from "@/lib/product-detail";

export function VariantPicker({
  attributes,
  options,
  onChange,
  className,
  compact,
}: {
  attributes: DetailVariantAttribute[];
  options: Record<string, string>;
  onChange: (key: string, value: string) => void;
  className?: string;
  compact?: boolean;
}) {
  if (!attributes.length) return null;

  return (
    <div className={cn("space-y-5", className)}>
      {attributes.map((attribute) => {
        const isSwatch = attribute.inputType === "color" || attribute.options.some((o) => o.swatch);
        const selected = options[attribute.key];
        const selectedLabel = attribute.options.find((o) => o.value === selected)?.label;

        return (
          <div key={attribute.key}>
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.11em] text-ink-muted">
                {attribute.label}
                {selectedLabel && <span className="ml-2 normal-case tracking-normal text-ink">{selectedLabel}</span>}
              </p>
              {attribute.key === "size" && (
                <button
                  type="button"
                  className="text-[11px] text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
                >
                  Size guide
                </button>
              )}
            </div>

            {isSwatch ? (
              <div className="flex flex-wrap gap-2.5">
                {attribute.options.map((option) => {
                  const active = option.value === selected;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange(attribute.key, option.value)}
                      title={`${option.label}${option.available ? "" : " — out of stock"}`}
                      aria-pressed={active}
                      className={cn(
                        "relative grid place-items-center rounded-full border transition-all",
                        compact ? "h-7 w-7" : "h-9 w-9",
                        active
                          ? "border-ink ring-1 ring-ink ring-offset-2 ring-offset-surface"
                          : "border-line hover:border-ink/40",
                        !option.available && "opacity-40",
                      )}
                      style={{ backgroundColor: option.swatch ?? "var(--c-surface-muted)" }}
                    >
                      {active && (
                        <Check
                          className={cn(
                            "h-3.5 w-3.5",
                            isLight(option.swatch) ? "text-obsidian" : "text-white",
                          )}
                        />
                      )}
                      {!option.available && (
                        <span className="absolute h-px w-full rotate-45 bg-danger/70" aria-hidden />
                      )}
                      <span className="sr-only">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {attribute.options.map((option) => {
                  const active = option.value === selected;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange(attribute.key, option.value)}
                      disabled={!option.available}
                      aria-pressed={active}
                      className={cn(
                        "relative min-w-[46px] rounded-[var(--radius-button)] border px-3.5 text-[12.5px] transition-colors",
                        compact ? "h-8" : "h-10",
                        active
                          ? "border-ink bg-ink text-inverse"
                          : "border-line text-ink hover:border-ink/45",
                        !option.available && "cursor-not-allowed text-ink-muted/60 line-through hover:border-line",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Rough luminance check so the tick mark stays readable on pale swatches. */
function isLight(hex?: string): boolean {
  if (!hex || !hex.startsWith("#")) return true;
  const value = hex.slice(1);
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}
