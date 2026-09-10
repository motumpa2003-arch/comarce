"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Play, X } from "lucide-react";
import { cn } from "@obsidian/ui";

export interface GalleryMedia {
  url: string;
  alt: string;
  type: string;
}

export function ProductGallery({
  media,
  activeUrl,
  badge,
}: {
  media: GalleryMedia[];
  /** Variant-driven image; selecting a colour jumps the gallery to it. */
  activeUrl?: string;
  badge?: React.ReactNode;
}) {
  const [index, setIndex] = React.useState(0);
  const [zoom, setZoom] = React.useState(false);
  const [origin, setOrigin] = React.useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = React.useState(false);
  const touchStart = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!activeUrl) return;
    const found = media.findIndex((m) => m.url === activeUrl);
    if (found >= 0) setIndex(found);
  }, [activeUrl, media]);

  const current = media[index] ?? media[0];
  const go = (delta: number) => setIndex((i) => (i + delta + media.length) % media.length);

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, media.length]);

  if (!current) return null;

  return (
    <>
      <div className="flex gap-3 lg:gap-4">
        {/* Thumbnail rail */}
        <div className="hidden w-[74px] shrink-0 flex-col gap-2.5 sm:flex">
          {media.map((item, i) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-[3/4] overflow-hidden rounded-[var(--radius-sm)] border transition-all",
                i === index ? "border-ink" : "border-line opacity-70 hover:opacity-100",
              )}
            >
              <Image src={item.url} alt="" fill sizes="74px" className="object-cover" />
              {item.type === "video" && (
                <span className="absolute inset-0 grid place-items-center bg-obsidian/35 text-inverse">
                  <Play className="h-4 w-4 fill-current" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main stage */}
        <div className="min-w-0 flex-1">
          <div
            className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-muted"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={onMove}
            onTouchStart={(e) => (touchStart.current = e.touches[0]?.clientX ?? null)}
            onTouchEnd={(e) => {
              const start = touchStart.current;
              const end = e.changedTouches[0]?.clientX;
              if (start != null && end != null && Math.abs(end - start) > 40) go(end < start ? 1 : -1);
              touchStart.current = null;
            }}
          >
            <Image
              key={current.url}
              src={current.url}
              alt={current.alt}
              fill
              priority
              sizes="(min-width:1024px) 45vw, 100vw"
              className={cn(
                "animate-fade-in object-cover transition-transform duration-300",
                zoom ? "scale-[1.9]" : "scale-100",
              )}
              style={zoom ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
            />

            {badge && <div className="absolute left-4 top-4 flex flex-col gap-1.5">{badge}</div>}

            <button
              type="button"
              onClick={() => setLightbox(true)}
              aria-label="Open full screen"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/50 bg-white/85 text-ink opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
            >
              <Expand className="h-3.5 w-3.5" />
            </button>

            {media.length > 1 && (
              <>
                <GalleryArrow direction="left" onClick={() => go(-1)} />
                <GalleryArrow direction="right" onClick={() => go(1)} />
              </>
            )}

            <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
              {media.map((item, i) => (
                <span
                  key={item.url}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-5 bg-obsidian" : "w-1.5 bg-obsidian/30",
                  )}
                />
              ))}
            </div>
          </div>

          <p className="mt-2.5 hidden text-center text-[11px] text-ink-muted lg:block">
            Hover to zoom · click the expand icon for full screen
          </p>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-obsidian/95 p-4">
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/25 text-inverse transition-colors hover:border-accent hover:text-accent"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-4 grid h-11 w-11 place-items-center rounded-full border border-white/25 text-inverse hover:border-accent hover:text-accent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="relative h-full max-h-[86vh] w-full max-w-4xl">
            <Image src={current.url} alt={current.alt} fill sizes="90vw" className="object-contain" />
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-4 grid h-11 w-11 place-items-center rounded-full border border-white/25 text-inverse hover:border-accent hover:text-accent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="absolute bottom-6 text-[12px] tabular-nums text-inverse/60">
            {index + 1} / {media.length}
          </p>
        </div>
      )}
    </>
  );
}

function GalleryArrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "left" ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-white/85 text-ink backdrop-blur transition-opacity",
        "opacity-0 group-hover:opacity-100 max-sm:opacity-100",
        direction === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
