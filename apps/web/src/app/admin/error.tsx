"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/** Scoped to /admin so a broken page keeps the sidebar/topbar and only
 * replaces the content area — merchants don't lose their place in the app. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-full border border-danger/25 bg-danger/[0.06] text-danger">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="font-display text-[19px] tracking-tight text-ink">This page hit an error</h1>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">
        Nothing you did caused this. Try again, or come back to it in a moment.
      </p>
      {error.digest && <p className="mt-3 text-[11px] tabular-nums text-ink-muted/70">Reference {error.digest}</p>}
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-[var(--radius-button)] bg-primary px-5 text-[12px] font-medium text-inverse transition-colors hover:bg-primary-hover"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}
