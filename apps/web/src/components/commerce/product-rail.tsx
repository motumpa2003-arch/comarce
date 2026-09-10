"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@obsidian/ui";
import { ProductCard, type ProductCardStyle } from "./product-card";
import type { ProductCardData } from "@/lib/product-view";

/**
 * Horizontally scrolling product rail with real scroll snapping — arrows
 * page by one viewport width rather than a fixed pixel guess, so the rail
 * behaves at every breakpoint.
 */
export function ProductRail({
  products,
  title,
  eyebrow,
  ctaLabel,
  ctaHref,
  variant = "editorial",
  className,
  itemWidth = "min(260px,72vw)",
  inverse,
}: {
  products: ProductCardData[];
  title?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  variant?: ProductCardStyle;
  className?: string;
  itemWidth?: string;
  inverse?: boolean;
}) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const sync = React.useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    sync();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const page = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <div className={className}>
      {(title || ctaHref) && (
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
            )}
            {title && (
              <h2
                className={cn(
                  "font-display display-case text-[26px] leading-tight sm:text-[32px]",
                  inverse ? "text-inverse" : "text-ink",
                )}
              >
                {title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-4">
            {ctaHref && (
              <Link
                href={ctaHref}
                className={cn(
                  "group inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em]",
                  inverse ? "text-inverse" : "text-ink",
                )}
              >
                {ctaLabel ?? "View all"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <div className="hidden gap-1.5 sm:flex">
              <RailButton direction="left" disabled={atStart} onClick={() => page(-1)} inverse={inverse} />
              <RailButton direction="right" disabled={atEnd} onClick={() => page(1)} inverse={inverse} />
            </div>
          </div>
        </div>
      )}

      <div
        ref={scroller}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:gap-5"
      >
        {products.map((product) => (
          <div key={product.id} className="shrink-0 snap-start" style={{ width: itemWidth }}>
            <ProductCard product={product} variant={variant} sizes="260px" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RailButton({
  direction,
  disabled,
  onClick,
  inverse,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  inverse?: boolean;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border transition-colors disabled:opacity-30",
        inverse
          ? "border-white/25 text-inverse hover:border-accent hover:text-accent"
          : "border-line text-ink hover:border-ink/45",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
