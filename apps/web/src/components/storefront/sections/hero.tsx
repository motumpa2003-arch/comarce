"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  images: string[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  overlayWord?: string;
  stats?: HeroStat[];
  autoplayMs?: number;
  words?: string[];
}

/**
 * The editorial hero: full-bleed imagery, a serif headline that breaks across
 * three lines, and a slow crossfade between campaign frames.
 */
export function Hero({
  eyebrow,
  title,
  subtitle,
  images,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  overlayWord,
  stats = [],
  autoplayMs = 6500,
  words = ["Shop", "Explore", "Experience", "Belong"],
}: HeroProps) {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = images.length || 1;

  React.useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => window.clearInterval(id);
  }, [paused, count, autoplayMs]);

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  // Break the headline so the last word can take the accent colour.
  const parts = title.split(" ");
  const lastWord = parts.length > 2 ? parts.pop() : undefined;
  const head = parts.join(" ");

  return (
    <section
      className="relative isolate overflow-hidden bg-obsidian text-inverse"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Frames */}
      <div className="absolute inset-0">
        {images.map((src, i) => (
          <div
            key={src}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
              i === index ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={cn(
                "object-cover object-[68%_center] transition-transform duration-[9000ms] ease-out sm:object-[60%_center]",
                i === index ? "scale-105" : "scale-100",
              )}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-transparent to-obsidian/45" />
      </div>

      <div className="relative mx-auto flex min-h-[560px] max-w-[var(--container-width)] flex-col justify-center px-4 py-16 sm:min-h-[640px] sm:px-6 lg:min-h-[680px] lg:px-10">
        <div className="max-w-[640px]">
          {eyebrow && (
            <p className="mb-5 text-[10.5px] font-medium uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
          )}
          <h1 className="font-display display-case text-[clamp(38px,7.2vw,76px)] leading-[0.98] text-inverse">
            {head}
            {lastWord && (
              <>
                <br />
                <span className="text-accent">{lastWord}</span>
              </>
            )}
          </h1>
          {subtitle && (
            <p className="mt-6 max-w-md text-[14px] leading-relaxed text-inverse/75">{subtitle}</p>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            {ctaLabel && ctaHref && (
              <ButtonLink href={ctaHref} variant="accent" size="lg">
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            )}
            {secondaryCtaLabel && secondaryCtaHref && (
              <ButtonLink
                href={secondaryCtaHref}
                size="lg"
                variant="outline"
                className="border-white/35 text-inverse hover:border-inverse hover:bg-white/[0.06]"
              >
                {secondaryCtaLabel}
              </ButtonLink>
            )}
          </div>

          {stats.length > 0 && (
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/[0.12] pt-7">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-number text-[24px] leading-none tabular-nums text-accent">{stat.value}</dd>
                  <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.16em] text-inverse/55">{stat.label}</p>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Vertical word list */}
        <ul className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 space-y-3 text-right xl:block">
          {words.map((word) => (
            <li
              key={word}
              className="text-[10.5px] font-medium uppercase tracking-[0.34em] text-inverse/45"
            >
              {word}
            </li>
          ))}
        </ul>

        {/* Overlay statement */}
        {overlayWord && (
          <p className="pointer-events-none absolute bottom-24 right-10 hidden max-w-[190px] text-right font-display text-[17px] leading-snug text-inverse/75 lg:block">
            {overlayWord}
          </p>
        )}

        {/* Controls */}
        {count > 1 && (
          <div className="absolute bottom-8 right-4 flex items-center gap-4 sm:right-6 lg:right-10">
            <span className="font-display text-[13px] tabular-nums text-inverse/55">
              <span className="text-accent">{String(index + 1).padStart(2, "0")}</span>
              <span className="mx-1.5">/</span>
              {String(count).padStart(2, "0")}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous slide"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-inverse transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next slide"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-inverse transition-colors hover:border-accent hover:text-accent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
