import { cn } from "./cn";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "obsidian"
  | "outline"
  | "ghost"
  | "subtle"
  | "danger"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-inverse hover:bg-primary-hover active:bg-primary shadow-[0_1px_0_rgba(0,0,0,0.04)]",
  accent:
    "bg-accent text-obsidian hover:brightness-[1.06] active:brightness-95 font-medium",
  obsidian: "bg-obsidian text-inverse hover:bg-obsidian/90",
  outline:
    "border border-line bg-transparent text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
  ghost: "bg-transparent text-ink hover:bg-ink/[0.05]",
  subtle: "bg-muted text-ink hover:bg-line/60",
  danger: "bg-danger text-white hover:brightness-110",
  link: "bg-transparent text-ink underline underline-offset-4 decoration-line hover:decoration-ink px-0",
};

const SIZES: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-[11px] gap-1.5",
  sm: "h-9 px-3.5 text-[12px] gap-2",
  md: "h-11 px-5 text-[12.5px] gap-2",
  lg: "h-[52px] px-8 text-[13px] gap-2.5",
  icon: "h-11 w-11 p-0",
  "icon-sm": "h-9 w-9 p-0",
};

/**
 * Plain class-string helper — deliberately kept out of the "use client"
 * `button.tsx` file, since several Server Component pages style a raw
 * `<button>`/`<a>` themselves with this instead of rendering `<Button>`.
 * A plain function export from a "use client" module can't be called
 * directly from a Server Component.
 */
export const buttonClasses = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  fullWidth = false,
  className?: string,
) =>
  cn(
    "relative inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-button)]",
    "font-medium uppercase tracking-[0.09em] transition-[background-color,border-color,color,filter,box-shadow] duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    "disabled:pointer-events-none disabled:opacity-45",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );
