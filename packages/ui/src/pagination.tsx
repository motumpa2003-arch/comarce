import * as React from "react";
import { cn } from "./cn";

/**
 * Placeholder substituted with the target page number in `hrefTemplate`.
 *
 * Pagination is deliberately link-based and free of callbacks: it renders
 * inside server components, and real anchors give middle-click, prefetch and
 * shareable URLs for free.
 */
export const PAGE_TOKEN = "__PAGE__";

export function Pagination({
  page,
  pageCount,
  hrefTemplate,
  className,
  ariaLabel = "Pagination",
}: {
  page: number;
  pageCount: number;
  /** A URL containing PAGE_TOKEN where the page number belongs. */
  hrefTemplate: string;
  className?: string;
  ariaLabel?: string;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => hrefTemplate.replaceAll(PAGE_TOKEN, String(target));
  const pages = pageWindow(page, pageCount);

  const itemClass = (active: boolean, disabled = false) =>
    cn(
      "grid h-9 min-w-9 place-items-center rounded-[var(--radius-sm)] px-2.5 text-[12.5px] tabular-nums transition-colors",
      active ? "bg-accent font-medium text-obsidian" : "text-ink-muted hover:bg-ink/[0.05] hover:text-ink",
      disabled && "pointer-events-none opacity-35",
    );

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} aria-label={ariaLabel}>
      {page <= 1 ? (
        <span className={itemClass(false, true)} aria-hidden>
          ‹
        </span>
      ) : (
        <a href={href(page - 1)} className={itemClass(false)} rel="prev">
          <span aria-hidden>‹</span>
          <span className="sr-only">Previous page</span>
        </a>
      )}

      {pages.map((p, index) =>
        p === "…" ? (
          <span key={`gap-${index}`} className="px-1.5 text-ink-muted">
            …
          </span>
        ) : (
          <a
            key={p}
            href={href(p)}
            className={itemClass(p === page)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </a>
        ),
      )}

      {page >= pageCount ? (
        <span className={itemClass(false, true)} aria-hidden>
          ›
        </span>
      ) : (
        <a href={href(page + 1)} className={itemClass(false)} rel="next">
          <span aria-hidden>›</span>
          <span className="sr-only">Next page</span>
        </a>
      )}
    </nav>
  );
}

function pageWindow(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < pageCount - 1) out.push("…");
  out.push(pageCount);
  return out;
}
