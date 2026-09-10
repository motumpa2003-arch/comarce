import * as React from "react";
import { cn } from "./cn";

/* ------------------------------- Card ------------------------------- */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  hoverable?: boolean;
  tone?: "surface" | "muted" | "obsidian";
}

export function Card({ className, padded = true, hoverable, tone = "surface", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border transition-colors",
        tone === "obsidian"
          ? "border-white/10 bg-obsidian text-inverse"
          : tone === "muted"
            ? "border-line bg-muted"
            : "border-line bg-surface",
        padded && "p-5",
        hoverable && "hover:border-ink/25",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {title && <h3 className="text-[14px] font-semibold tracking-tight text-ink">{title}</h3>}
        {description && <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{description}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ----------------------------- Separator ---------------------------- */

export function Separator({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(orientation === "horizontal" ? "h-px w-full" : "h-full w-px", "bg-line", className)}
    />
  );
}

/* ------------------------------ Skeleton ---------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[var(--radius-sm)] bg-ink/[0.07]", className)} />;
}

/* ---------------------------- Empty state --------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      {icon && (
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-line bg-muted text-ink-muted">
          {icon}
        </div>
      )}
      <h3 className="font-display text-[19px] tracking-tight text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ------------------------------- Avatar ----------------------------- */

export function Avatar({
  src,
  name,
  size = 36,
  className,
}: {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-muted text-ink-muted",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} width={size} height={size} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span className="font-medium tracking-wide">{initials}</span>
      )}
    </span>
  );
}

/* ------------------------------ Progress ---------------------------- */

export function Progress({
  value,
  className,
  tone = "primary",
  height = 6,
}: {
  value: number;
  className?: string;
  tone?: "primary" | "accent" | "success" | "warning" | "danger";
  height?: number;
}) {
  const toneClass = {
    primary: "bg-primary",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  }[tone];

  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-ink/[0.08]", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", toneClass)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
