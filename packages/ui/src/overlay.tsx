"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

/* --------------------------- Shared plumbing ------------------------ */

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

/** Locks body scroll while any overlay is open, refcounted for nesting. */
let lockCount = 0;
function useScrollLock(active: boolean) {
  React.useEffect(() => {
    if (!active) return;
    lockCount += 1;
    const { body } = document;
    if (lockCount === 1) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      body.dataset.prevOverflow = body.style.overflow;
      body.dataset.prevPadding = body.style.paddingRight;
      body.style.overflow = "hidden";
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }
    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        body.style.overflow = body.dataset.prevOverflow ?? "";
        body.style.paddingRight = body.dataset.prevPadding ?? "";
        delete body.dataset.prevOverflow;
        delete body.dataset.prevPadding;
      }
    };
  }, [active]);
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useFocusTrap(active: boolean, ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  React.useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusFirst = () => {
      const target = node?.querySelector<HTMLElement>("[data-autofocus]") ?? node?.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? node)?.focus({ preventScroll: true });
    };
    const id = window.setTimeout(focusFirst, 30);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKeyDown, true);
      previous?.focus?.({ preventScroll: true });
    };
  }, [active, onClose, ref]);
}

/** Keeps the element mounted through its exit transition. */
function usePresence(open: boolean, duration = 260) {
  const [present, setPresent] = React.useState(open);
  const [entered, setEntered] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setPresent(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      return () => cancelAnimationFrame(raf);
    }
    setEntered(false);
    const id = window.setTimeout(() => setPresent(false), duration);
    return () => window.clearTimeout(id);
  }, [open, duration]);

  return { present, entered };
}

/* ------------------------------- Modal ------------------------------ */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** On small screens, slide up from the bottom like a native sheet. */
  mobileSheet?: boolean;
  className?: string;
  hideClose?: boolean;
}

const MODAL_SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
  full: "sm:max-w-[min(1200px,95vw)]",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  mobileSheet = true,
  className,
  hideClose,
}: ModalProps) {
  const mounted = useMounted();
  const { present, entered } = usePresence(open);
  const panelRef = React.useRef<HTMLDivElement>(null);
  useScrollLock(present);
  useFocusTrap(open, panelRef, onClose);

  if (!mounted || !present) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-obsidian/55 backdrop-blur-[2px] transition-opacity duration-250",
          entered ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden bg-surface shadow-2xl outline-none transition-all duration-250",
          mobileSheet ? "rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-lg)]" : "rounded-[var(--radius-lg)]",
          MODAL_SIZES[size],
          entered
            ? "translate-y-0 opacity-100 sm:scale-100"
            : cn("opacity-0 sm:scale-[0.98]", mobileSheet ? "translate-y-6" : "translate-y-2"),
          className,
        )}
      >
        {mobileSheet && (
          <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line sm:hidden" aria-hidden />
        )}
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div className="min-w-0">
              {title && <h2 className="font-display text-[19px] leading-tight tracking-tight text-ink">{title}</h2>}
              {description && <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{description}</p>}
            </div>
            {!hideClose && <CloseButton onClick={onClose} />}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line bg-muted px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------- Drawer ----------------------------- */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left" | "bottom";
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  className?: string;
  hideHeader?: boolean;
}

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  description,
  children,
  footer,
  width = "min(460px,100vw)",
  className,
  hideHeader,
}: DrawerProps) {
  const mounted = useMounted();
  const { present, entered } = usePresence(open, 320);
  const panelRef = React.useRef<HTMLDivElement>(null);
  useScrollLock(present);
  useFocusTrap(open, panelRef, onClose);

  if (!mounted || !present) return null;

  const hidden =
    side === "right" ? "translate-x-full" : side === "left" ? "-translate-x-full" : "translate-y-full";

  return createPortal(
    <div className="fixed inset-0 z-[130]">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-obsidian/55 backdrop-blur-[2px] transition-opacity duration-300",
          entered ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        style={side === "bottom" ? undefined : { width }}
        className={cn(
          "absolute flex flex-col bg-surface shadow-2xl outline-none transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          side === "right" && "right-0 top-0 h-full max-w-full",
          side === "left" && "left-0 top-0 h-full max-w-full",
          side === "bottom" && "bottom-0 left-0 right-0 max-h-[88vh] rounded-t-[var(--radius-xl)]",
          entered ? "translate-x-0 translate-y-0" : hidden,
          className,
        )}
      >
        {side === "bottom" && <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line" aria-hidden />}
        {!hideHeader && (
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              {title && (
                <h2 className="font-display text-[17px] uppercase leading-tight tracking-[0.08em] text-ink">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-[12px] text-ink-muted">{description}</p>}
            </div>
            <CloseButton onClick={onClose} />
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-line bg-surface px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* ---------------------------- Close button -------------------------- */

export function CloseButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      className={cn(
        "-mr-1.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
        <path d="M3.5 3.5l9 9m0-9l-9 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/* ------------------------------ Popover ----------------------------- */

export function Popover({
  trigger,
  children,
  align = "end",
  className,
  panelClassName,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  align?: "start" | "end" | "center";
  className?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] z-50 min-w-[200px] origin-top overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface py-1.5 shadow-xl",
            align === "end" && "right-0",
            align === "start" && "left-0",
            align === "center" && "left-1/2 -translate-x-1/2",
            panelClassName,
          )}
        >
          {typeof children === "function" ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  icon,
  danger,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition-colors",
        danger ? "text-danger hover:bg-danger/[0.08]" : "text-ink hover:bg-ink/[0.05]",
        disabled && "pointer-events-none opacity-45",
        className,
      )}
    >
      {icon && <span className="shrink-0 text-ink-muted">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}
