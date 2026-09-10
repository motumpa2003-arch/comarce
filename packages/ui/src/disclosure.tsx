"use client";

import * as React from "react";
import { cn } from "./cn";

/* -------------------------------- Tabs ------------------------------ */

export interface TabItem {
  value: string;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

export function Tabs({
  items,
  value,
  onChange,
  variant = "underline",
  className,
  size = "md",
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: "underline" | "pill" | "segment";
  className?: string;
  size?: "sm" | "md";
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const enabled = items.filter((i) => !i.disabled);
    const index = enabled.findIndex((i) => i.value === value);
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const next = event.key === "ArrowRight" ? index + 1 : index - 1;
      const target = enabled[(next + enabled.length) % enabled.length];
      if (target) onChange(target.value);
    }
  };

  if (variant === "segment") {
    return (
      <div
        ref={listRef}
        role="tablist"
        onKeyDown={onKeyDown}
        className={cn("inline-flex rounded-[var(--radius-md)] border border-line bg-muted p-0.5", className)}
      >
        {items.map((item) => (
          <button
            key={item.value}
            role="tab"
            aria-selected={value === item.value}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-[calc(var(--radius-md)-2px)] px-3.5 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-40",
              value === item.value ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
            {item.count != null && <span className="ml-1.5 tabular-nums opacity-60">{item.count}</span>}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <div ref={listRef} role="tablist" onKeyDown={onKeyDown} className={cn("flex flex-wrap gap-2", className)}>
        {items.map((item) => (
          <button
            key={item.value}
            role="tab"
            aria-selected={value === item.value}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-40",
              value === item.value
                ? "border-ink bg-ink text-inverse"
                : "border-line bg-transparent text-ink-muted hover:border-ink/35 hover:text-ink",
            )}
          >
            {item.label}
            {item.count != null && <span className="ml-1.5 tabular-nums opacity-60">{item.count}</span>}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={onKeyDown}
      className={cn("flex gap-6 overflow-x-auto border-b border-line", className)}
    >
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          disabled={item.disabled}
          onClick={() => onChange(item.value)}
          className={cn(
            "relative shrink-0 whitespace-nowrap border-b-2 pb-3 pt-1 font-medium uppercase tracking-[0.09em] transition-colors disabled:opacity-40",
            size === "sm" ? "text-[10.5px]" : "text-[11.5px]",
            value === item.value
              ? "border-accent text-ink"
              : "border-transparent text-ink-muted hover:text-ink",
          )}
        >
          {item.label}
          {item.count != null && <span className="ml-1.5 tabular-nums opacity-60">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------- Accordion ---------------------------- */

export function Accordion({
  items,
  defaultOpen = [],
  allowMultiple = true,
  className,
  itemClassName,
}: {
  items: { id: string; title: React.ReactNode; content: React.ReactNode; meta?: React.ReactNode }[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
  className?: string;
  itemClassName?: string;
}) {
  const [open, setOpen] = React.useState<string[]>(defaultOpen);

  const toggle = (id: string) =>
    setOpen((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : allowMultiple
          ? [...current, id]
          : [id],
    );

  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id} className={itemClassName}>
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-ink"
            >
              <span className="flex min-w-0 items-center gap-3 text-[13.5px] font-medium text-ink">
                {item.title}
                {item.meta}
              </span>
              <svg
                viewBox="0 0 14 14"
                aria-hidden
                className={cn("h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform duration-300", isOpen && "rotate-45")}
              >
                <path d="M7 1.5v11M1.5 7h11" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="pb-5 pr-8 text-[13px] leading-relaxed text-ink-muted">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- Collapsible -------------------------- */

export function Collapsible({
  title,
  children,
  defaultOpen = true,
  className,
  action,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex flex-1 items-center justify-between gap-3 py-3 text-left"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">{title}</span>
          <svg
            viewBox="0 0 12 12"
            aria-hidden
            className={cn("h-3 w-3 text-ink-muted transition-transform duration-300", open && "rotate-180")}
          >
            <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {action}
      </div>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
