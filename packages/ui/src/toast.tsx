"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "danger" | "accent";
  image?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  duration?: number;
}

type ToastInput = Omit<Toast, "id">;

interface ToastContextValue {
  toast: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  // A no-op fallback keeps components usable outside the provider (e.g. tests).
  return ctx ?? { toast: () => "", dismiss: () => {} };
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = `toast_${++counter}`;
      setToasts((current) => [...current.slice(-3), { ...input, id }]);
      const duration = input.duration ?? 4200;
      if (duration > 0) window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2.5 sm:bottom-6 sm:right-6"
            role="region"
            aria-label="Notifications"
          >
            {toasts.map((t) => (
              <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [entered, setEntered] = React.useState(false);
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const accent =
    toast.tone === "success"
      ? "before:bg-success"
      : toast.tone === "danger"
        ? "before:bg-danger"
        : toast.tone === "accent"
          ? "before:bg-accent"
          : "before:bg-primary";

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface p-3.5 pl-4 shadow-xl transition-all duration-300",
        "before:absolute before:inset-y-0 before:left-0 before:w-[3px]",
        accent,
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
    >
      {toast.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={toast.image}
          alt=""
          className="h-12 w-10 shrink-0 rounded-[2px] border border-line object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-snug text-ink">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{toast.description}</p>
        )}
        {toast.action &&
          (toast.action.href ? (
            <a
              href={toast.action.href}
              className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink underline underline-offset-4"
            >
              {toast.action.label}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick?.();
                onDismiss();
              }}
              className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink underline underline-offset-4"
            >
              {toast.action.label}
            </button>
          ))}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
      >
        <svg viewBox="0 0 14 14" className="h-3 w-3" aria-hidden>
          <path d="M3 3l8 8m0-8l-8 8" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
