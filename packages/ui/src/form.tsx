"use client";

import * as React from "react";
import { cn } from "./cn";

/* ------------------------------- Field ------------------------------ */

export interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
  /** Right-aligned element in the label row, e.g. a "Forgot password?" link. */
  action?: React.ReactNode;
}

export function Field({ label, hint, error, required, htmlFor, className, children, action }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || action) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label
              htmlFor={htmlFor}
              className="text-[10.5px] font-medium uppercase tracking-[0.11em] text-ink-muted"
            >
              {label}
              {required && <span className="ml-1 text-danger">*</span>}
            </label>
          )}
          {action}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-[11.5px] text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[11.5px] text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------- Input ------------------------------ */

const controlBase =
  "w-full rounded-[var(--radius-md)] border border-line bg-surface text-ink placeholder:text-ink-muted/70 " +
  "transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary " +
  "disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-muted";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  sizeVariant?: "sm" | "md" | "lg";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, leading, trailing, sizeVariant = "md", ...props },
  ref,
) {
  const height = sizeVariant === "sm" ? "h-9 text-[13px]" : sizeVariant === "lg" ? "h-[52px] text-[14px]" : "h-11 text-[13.5px]";
  const input = (
    <input
      ref={ref}
      className={cn(
        controlBase,
        height,
        leading ? "pl-10" : "pl-3.5",
        trailing ? "pr-10" : "pr-3.5",
        invalid && "border-danger focus:border-danger focus:ring-danger",
        className,
      )}
      {...props}
    />
  );
  if (!leading && !trailing) return input;
  return (
    <div className="relative">
      {leading && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
          {leading}
        </span>
      )}
      {input}
      {trailing && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">{trailing}</span>}
    </div>
  );
});

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ className, invalid, rows = 4, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          controlBase,
          "px-3.5 py-3 text-[13.5px] leading-relaxed resize-y",
          invalid && "border-danger focus:border-danger focus:ring-danger",
          className,
        )}
        {...props}
      />
    );
  },
);

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  sizeVariant?: "sm" | "md";
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, sizeVariant = "md", children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          controlBase,
          "appearance-none pl-3.5 pr-9",
          sizeVariant === "sm" ? "h-9 text-[12.5px]" : "h-11 text-[13.5px]",
          invalid && "border-danger",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-3.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-muted"
      >
        <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});

/* ---------------------------- Checkbox/Radio ------------------------ */

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  count?: number;
}

export function Checkbox({ label, description, count, className, id, ...props }: CheckboxProps) {
  const generated = React.useId();
  const inputId = id ?? generated;
  return (
    <label
      htmlFor={inputId}
      className={cn("group flex cursor-pointer items-start gap-2.5 select-none", className)}
    >
      <span className="relative mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center">
        <input
          id={inputId}
          type="checkbox"
          className="peer h-[16px] w-[16px] cursor-pointer appearance-none rounded-[3px] border border-line bg-surface transition-colors checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          {...props}
        />
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="pointer-events-none absolute h-3 w-3 scale-75 text-inverse opacity-0 transition peer-checked:scale-100 peer-checked:opacity-100"
        >
          <path d="M2.5 6.2 4.8 8.5 9.5 3.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {(label || description) && (
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] leading-snug text-ink group-hover:text-ink">{label}</span>
            {count != null && <span className="text-[11px] tabular-nums text-ink-muted">{count}</span>}
          </span>
          {description && <span className="mt-0.5 block text-[11.5px] text-ink-muted">{description}</span>}
        </span>
      )}
    </label>
  );
}

export function Radio({ label, description, className, id, ...props }: Omit<CheckboxProps, "count">) {
  const generated = React.useId();
  const inputId = id ?? generated;
  return (
    <label htmlFor={inputId} className={cn("group flex cursor-pointer items-start gap-2.5 select-none", className)}>
      <span className="relative mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center">
        <input
          id={inputId}
          type="radio"
          className="peer h-[16px] w-[16px] cursor-pointer appearance-none rounded-full border border-line bg-surface transition-colors checked:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
          {...props}
        />
        <span className="pointer-events-none absolute h-[7px] w-[7px] scale-0 rounded-full bg-primary transition peer-checked:scale-100" />
      </span>
      {(label || description) && (
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] leading-snug text-ink">{label}</span>
          {description && <span className="mt-0.5 block text-[11.5px] text-ink-muted">{description}</span>}
        </span>
      )}
    </label>
  );
}

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export function Switch({ label, description, className, id, ...props }: SwitchProps) {
  const generated = React.useId();
  const inputId = id ?? generated;
  return (
    <label htmlFor={inputId} className={cn("flex cursor-pointer items-center justify-between gap-4", className)}>
      {(label || description) && (
        <span className="min-w-0">
          <span className="block text-[13px] font-medium text-ink">{label}</span>
          {description && <span className="mt-0.5 block text-[11.5px] leading-relaxed text-ink-muted">{description}</span>}
        </span>
      )}
      <span className="relative inline-flex shrink-0">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className="peer h-6 w-11 cursor-pointer appearance-none rounded-full bg-line transition-colors checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          {...props}
        />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
