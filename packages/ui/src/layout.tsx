import * as React from "react";
import { cn } from "./cn";

/** Page container honouring the active theme's max content width. */
export function Container({
  className,
  children,
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "default" | "wide" | "narrow" | "full" }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-10",
        size === "default" && "max-w-[var(--container-width)]",
        size === "wide" && "max-w-[1680px]",
        size === "narrow" && "max-w-[880px]",
        size === "full" && "max-w-none px-0 sm:px-0 lg:px-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Vertical rhythm wrapper with an optional tonal ground. */
export function Section({
  className,
  children,
  tone = "surface",
  spacing = "default",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  tone?: "surface" | "ivory" | "muted" | "obsidian" | "primary" | "none";
  spacing?: "none" | "tight" | "default" | "loose";
}) {
  return (
    <section
      className={cn(
        tone === "surface" && "bg-surface text-ink",
        tone === "ivory" && "bg-ivory text-ink",
        tone === "muted" && "bg-muted text-ink",
        tone === "obsidian" && "bg-obsidian text-inverse",
        tone === "primary" && "bg-primary text-inverse",
        spacing === "tight" && "py-10 sm:py-12",
        spacing === "default" && "py-14 sm:py-20",
        spacing === "loose" && "py-20 sm:py-28",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

/**
 * Editorial section heading — eyebrow, display title and an optional trailing
 * action, used across the storefront so every band reads the same way.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
  inverse,
  size = "md",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  inverse?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-4",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn("min-w-0", align === "center" && "max-w-2xl")}>
        {eyebrow && (
          <p
            className={cn(
              "mb-2.5 text-[10.5px] font-medium uppercase tracking-[0.22em]",
              inverse ? "text-accent" : "text-accent",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "font-display uppercase leading-[1.05] tracking-[0.02em]",
            size === "sm" && "text-[22px] sm:text-[26px]",
            size === "md" && "text-[26px] sm:text-[34px]",
            size === "lg" && "text-[32px] sm:text-[46px]",
            inverse ? "text-inverse" : "text-ink",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "mt-3 max-w-2xl text-[13.5px] leading-relaxed",
              inverse ? "text-inverse/70" : "text-ink-muted",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Thin gold rule used as an editorial divider. */
export function Rule({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn("h-px w-14 bg-accent", inverse && "bg-accent/80", className)}
    />
  );
}

export function ScrollRow({
  children,
  className,
  itemClassName,
}: {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <div
      className={cn(
        "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {React.Children.map(children, (child, index) => (
        <div key={index} className={cn("shrink-0 snap-start", itemClassName)}>
          {child}
        </div>
      ))}
    </div>
  );
}
