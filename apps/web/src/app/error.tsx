"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Root error boundary — catches anything an inner page/layout didn't handle
 * itself. Never render `error.message` here: it's a raw framework/runtime
 * string, not something curated for a shopper or merchant to read.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4 text-inverse">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-accent/30 bg-accent/10 text-accent">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Something broke</p>
        <h1 className="mt-3 font-display display-case text-[28px] leading-tight text-inverse">
          That wasn&rsquo;t supposed to happen
        </h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-inverse/65">
          Our side, not yours. Try again — if it keeps happening, head back home and pick up where you left off.
        </p>
        {error.digest && (
          <p className="mt-4 text-[10.5px] tabular-nums text-inverse/35">Reference {error.digest}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-button)] bg-accent px-6 text-[11.5px] font-medium uppercase tracking-[0.1em] text-obsidian transition-colors hover:brightness-[1.06]"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-[var(--radius-button)] border border-white/25 px-6 text-[11.5px] font-medium uppercase tracking-[0.1em] text-inverse transition-colors hover:border-accent hover:text-accent"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
