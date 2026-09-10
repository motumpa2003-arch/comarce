import * as React from "react";
import { cn } from "./cn";

export type BadgeTone =
  | "neutral"
  | "info"
  | "progress"
  | "success"
  | "warning"
  | "danger"
  | "accent"
  | "obsidian"
  | "sale"
  | "outline";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-ink/[0.06] text-ink-muted",
  info: "bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary",
  progress: "bg-[color-mix(in_srgb,var(--c-primary)_16%,transparent)] text-primary",
  success: "bg-[color-mix(in_srgb,var(--c-success)_14%,transparent)] text-success",
  warning: "bg-[color-mix(in_srgb,var(--c-warning)_16%,transparent)] text-warning",
  danger: "bg-[color-mix(in_srgb,var(--c-danger)_12%,transparent)] text-danger",
  accent: "bg-accent text-obsidian",
  obsidian: "bg-obsidian text-inverse",
  sale: "bg-sale text-white",
  outline: "border border-line text-ink-muted bg-transparent",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: "xs" | "sm";
  dot?: boolean;
}

export function Badge({ className, tone = "neutral", size = "sm", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] font-medium uppercase tracking-[0.08em] whitespace-nowrap",
        size === "xs" ? "px-1.5 py-0.5 text-[9.5px]" : "px-2 py-1 text-[10px]",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
