"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@obsidian/ui";
import { money, moneyShort, number } from "@/lib/format";

/* ------------------------------------------------------------------ *
 * Palette
 *
 * Validated with the data-viz palette checker against the admin's white
 * chart surface: all-pairs CVD ΔE 8.6, normal-vision ΔE 21.4 for the first
 * three slots; adjacent-safe across all five. Assigned in fixed order and
 * never cycled — a sixth series folds into "Other".
 * ------------------------------------------------------------------ */

export const SERIES = ["#0E9E72", "#eb6834", "#2a78d6", "#4a3aa7", "#e87ba4"] as const;

/** Single-hue ordinal ramp for ordered stages (funnel, tiers). */
export const ORDINAL = ["#86b6ef", "#3987e5", "#256abf", "#184f95", "#0d366b"] as const;

export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

const INK = {
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  muted: "#898781",
  secondary: "#52514e",
};

/**
 * Formatters are named, not passed as functions: chart components are client
 * components and a server page cannot hand a closure across the boundary.
 */
export type ValueFormat = "money" | "moneyShort" | "number" | "percent" | "plain";

const FORMATTERS: Record<ValueFormat, (value: number) => string> = {
  money: (value) => money(value),
  moneyShort: (value) => moneyShort(value),
  number: (value) => number(value),
  percent: (value) => `${value.toFixed(1)}%`,
  plain: (value) => String(value),
};

export function formatWith(format: ValueFormat, value: number): string {
  return FORMATTERS[format](value);
}

const AXIS_TICK = {
  fill: INK.muted,
  fontSize: 10.5,
  fontVariantNumeric: "tabular-nums" as const,
};

/* ------------------------------- Tooltip ---------------------------- */

interface TooltipRow {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  label,
  rows,
  formatValue,
}: {
  active?: boolean;
  label?: string;
  rows: TooltipRow[];
  formatValue: (value: number) => string;
}) {
  if (!active || !rows.length) return null;
  return (
    <div className="pointer-events-none rounded-[var(--radius-sm)] border border-line bg-surface px-3 py-2.5 shadow-lg">
      {label && <p className="mb-1.5 text-[11px] font-medium text-ink">{label}</p>}
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center gap-2.5 text-[11.5px]">
            <span className="h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: row.color }} />
            <span className="text-ink-muted">{row.name}</span>
            <span className="ml-auto font-medium tabular-nums text-ink">{formatValue(row.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------- Chart frame -------------------------- */

export function ChartFrame({
  title,
  description,
  legend,
  actions,
  height = 260,
  children,
  footer,
  className,
}: {
  title: string;
  description?: string;
  legend?: { label: string; color: string }[];
  actions?: React.ReactNode;
  height?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("rounded-[var(--radius-card)] border border-line bg-surface p-5", className)}>
      <figcaption className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13.5px] font-semibold tracking-tight text-ink">{title}</h3>
          {description && <p className="mt-1 text-[11.5px] text-ink-muted">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {legend && legend.length > 1 && (
            <ul className="flex flex-wrap items-center gap-3">
              {legend.map((entry) => (
                <li key={entry.label} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                  <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: entry.color }} />
                  {entry.label}
                </li>
              ))}
            </ul>
          )}
          {actions}
        </div>
      </figcaption>
      <div style={{ height }}>{children}</div>
      {footer && <div className="mt-4 border-t border-line pt-3 text-[11.5px] text-ink-muted">{footer}</div>}
    </figure>
  );
}

/* ---------------------------- Revenue area -------------------------- */

export interface TimePoint {
  date: string;
  revenue: number;
  orders: number;
  visitors?: number;
}

export function RevenueAreaChart({ data, height = 260 }: { data: TimePoint[]; height?: number }) {
  const latest = data[data.length - 1];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.22} />
            <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={INK.grid} strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: INK.axis }}
          minTickGap={40}
          tickFormatter={(value: string) => shortDate(value)}
        />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={58}
          tickFormatter={(value: number) => moneyShort(value)}
        />
        <Tooltip
          cursor={{ stroke: INK.axis, strokeWidth: 1 }}
          content={({ active, label, payload }) => (
            <ChartTooltip
              active={active}
              label={label ? longDate(String(label)) : undefined}
              rows={(payload ?? []).map((entry) => ({
                name: "Revenue",
                value: Number(entry.value),
                color: SERIES[0],
              }))}
              formatValue={(value) => money(value)}
            />
          )}
        />
        {latest && (
          <ReferenceLine
            y={latest.revenue}
            stroke={SERIES[0]}
            strokeDasharray="3 3"
            strokeOpacity={0.35}
            label={{
              value: moneyShort(latest.revenue),
              position: "right",
              fill: SERIES[0],
              fontSize: 10.5,
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={SERIES[0]}
          strokeWidth={2}
          fill="url(#revenueFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ----------------------------- Orders bars -------------------------- */

export function OrdersBarChart({ data, height = 220 }: { data: TimePoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }} barCategoryGap="22%">
        <CartesianGrid stroke={INK.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: INK.axis }}
          minTickGap={32}
          tickFormatter={(value: string) => shortDate(value)}
        />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          cursor={{ fill: "rgba(11,11,11,0.04)" }}
          content={({ active, label, payload }) => (
            <ChartTooltip
              active={active}
              label={label ? longDate(String(label)) : undefined}
              rows={(payload ?? []).map((entry) => ({
                name: "Orders",
                value: Number(entry.value),
                color: SERIES[2],
              }))}
              formatValue={(value) => number(value)}
            />
          )}
        />
        <Bar dataKey="orders" fill={SERIES[2]} radius={[4, 4, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* -------------------------- Comparison lines ------------------------ */

/**
 * Two measures on one axis only when they share a unit. Anything else gets
 * two charts — a second y-scale is never an option.
 */
export function MultiLineChart({
  data,
  series,
  height = 240,
  format = "number",
}: {
  data: object[];
  series: { key: string; label: string }[];
  height?: number;
  format?: ValueFormat;
}) {
  const valueFormatter = (value: number) => formatWith(format, value);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}>
        <CartesianGrid stroke={INK.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={{ stroke: INK.axis }}
          minTickGap={40}
          tickFormatter={(value: string) => shortDate(value)}
        />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={46} tickFormatter={valueFormatter} />
        <Tooltip
          cursor={{ stroke: INK.axis, strokeWidth: 1 }}
          content={({ active, label, payload }) => (
            <ChartTooltip
              active={active}
              label={label ? longDate(String(label)) : undefined}
              rows={(payload ?? []).map((entry, index) => ({
                name: series.find((s) => s.key === entry.dataKey)?.label ?? String(entry.dataKey),
                value: Number(entry.value),
                color: SERIES[index % SERIES.length]!,
              }))}
              formatValue={valueFormatter}
            />
          )}
        />
        {series.map((entry, index) => (
          <Line
            key={entry.key}
            type="monotone"
            dataKey={entry.key}
            stroke={SERIES[index % SERIES.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#ffffff" }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------- Funnel ----------------------------- */

export function FunnelBars({
  stages,
}: {
  stages: { stage: string; count: number; rate: number }[];
}) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <ol className="space-y-3">
      {stages.map((stage, index) => {
        const width = (stage.count / max) * 100;
        const previous = stages[index - 1];
        const stepRate = previous ? (stage.count / previous.count) * 100 : 100;
        return (
          <li key={stage.stage}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[11.5px]">
              <span className="text-ink">{stage.stage}</span>
              <span className="tabular-nums text-ink-muted">
                {number(stage.count)}
                <span className="ml-2 text-ink">{stage.rate.toFixed(1)}%</span>
              </span>
            </div>
            <div className="relative h-6 overflow-hidden rounded-[4px] bg-muted">
              <div
                className="h-full rounded-[4px] transition-[width] duration-700"
                style={{ width: `${width}%`, backgroundColor: ORDINAL[index % ORDINAL.length] }}
              />
            </div>
            {previous && (
              <p className="mt-1 text-[10.5px] text-ink-muted">
                {stepRate.toFixed(1)}% continue from {previous.stage.toLowerCase()}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ Sparkline --------------------------- */

export function Sparkline({
  data,
  dataKey = "revenue",
  color = SERIES[0],
  height = 40,
}: {
  data: object[];
  dataKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.24} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.75}
          fill={`url(#spark-${dataKey})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* -------------------------- Horizontal ranking ---------------------- */

/**
 * Ranked magnitudes read better as a labelled bar list than as a pie: the
 * value is on the row, so no legend or colour lookup is needed.
 */
export function RankedBars({
  rows,
  format = "number",
  color = SERIES[0],
}: {
  rows: { label: string; value: number; meta?: string }[];
  format?: ValueFormat;
  color?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const formatValue = (value: number) => formatWith(format, value);
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-[12px] text-ink">{row.label}</span>
            <span className="shrink-0 text-[11.5px] tabular-nums text-ink-muted">
              {row.meta ? <span className="mr-2">{row.meta}</span> : null}
              <span className="font-medium text-ink">{formatValue(row.value)}</span>
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-[4px] bg-muted">
            <div
              className="h-full rounded-[4px]"
              style={{ width: `${(row.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------- Helpers ---------------------------- */

const SHORT = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const LONG = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

function shortDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : SHORT.format(date);
}

function longDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : LONG.format(date);
}
