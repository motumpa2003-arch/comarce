import * as React from "react";
import { cn } from "./cn";

/* ------------------------------- Table ------------------------------ */

export function Table({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-[13px]", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function THead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn("border-b border-line bg-muted/60", className)}>
      {children}
    </thead>
  );
}

export function TH({
  children,
  className,
  align = "left",
  width,
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  width?: string | number;
}) {
  return (
    <th
      scope="col"
      style={width ? { width } : undefined}
      className={cn(
        "px-4 py-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted whitespace-nowrap",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tbody className={cn("divide-y divide-line", className)}>{children}</tbody>;
}

export function TR({
  children,
  className,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "transition-colors",
        onClick && "cursor-pointer",
        selected ? "bg-primary/[0.05]" : "hover:bg-muted/70",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TD({
  children,
  className,
  align = "left",
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-4 py-3 align-middle text-ink",
        align === "right" && "text-right tabular-nums",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </td>
  );
}

/* ------------------------------ Rating ------------------------------ */

export function Rating({
  value,
  count,
  size = 13,
  showValue = true,
  className,
  tone = "accent",
}: {
  value: number;
  count?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
  tone?: "accent" | "success" | "ink";
}) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  const colour = tone === "accent" ? "text-accent" : tone === "success" ? "text-success" : "text-ink";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative inline-block leading-none" style={{ fontSize: size }} aria-hidden>
        <span className="text-line">★★★★★</span>
        <span className={cn("absolute inset-0 overflow-hidden whitespace-nowrap", colour)} style={{ width: `${percent}%` }}>
          ★★★★★
        </span>
      </span>
      {showValue && <span className="text-[12px] font-medium tabular-nums text-ink">{value.toFixed(1)}</span>}
      {count != null && <span className="text-[11.5px] tabular-nums text-ink-muted">({formatCount(count)})</span>}
      <span className="sr-only">
        {value.toFixed(1)} out of 5{count != null ? ` from ${count} reviews` : ""}
      </span>
    </span>
  );
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

/* ---------------------------- Breadcrumb ---------------------------- */

export function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-1.5 text-[11.5px]", className)}>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {item.href && !last ? (
              <a href={item.href} className="text-ink-muted transition-colors hover:text-ink">
                {item.label}
              </a>
            ) : (
              <span className={last ? "text-ink" : "text-ink-muted"} aria-current={last ? "page" : undefined}>
                {item.label}
              </span>
            )}
            {!last && (
              <span className="text-ink-muted/50" aria-hidden>
                /
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/* ------------------------------ Stat tile --------------------------- */

export function Stat({
  label,
  value,
  delta,
  hint,
  icon,
  className,
  invertDelta,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  /** For metrics where down is good, e.g. refund rate. */
  invertDelta?: boolean;
}) {
  const positive = delta != null && (invertDelta ? delta < 0 : delta > 0);
  const negative = delta != null && (invertDelta ? delta > 0 : delta < 0);

  return (
    <div className={cn("rounded-[var(--radius-card)] border border-line bg-surface p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.11em] text-ink-muted">{label}</p>
        {icon && <span className="text-ink-muted/70">{icon}</span>}
      </div>
      <p className="mt-3 font-display text-[28px] leading-none tracking-tight text-ink tabular-nums">{value}</p>
      <div className="mt-2.5 flex items-center gap-2">
        {delta != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11.5px] font-medium tabular-nums",
              positive && "text-success",
              negative && "text-danger",
              !positive && !negative && "text-ink-muted",
            )}
          >
            <span aria-hidden>{delta > 0 ? "▲" : delta < 0 ? "▼" : "—"}</span>
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-[11.5px] text-ink-muted">{hint}</span>}
      </div>
    </div>
  );
}
