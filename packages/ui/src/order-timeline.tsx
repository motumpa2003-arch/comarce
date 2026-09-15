"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./cn";

/* --------------------------- Happy-path bar -------------------------- */

export interface HappyPathStep {
  label: string;
}

/**
 * The 6-segment "order happy path" bar — each segment fills with a spring
 * instead of an instant colour swap. `currentStep` < 0 renders nothing
 * (the caller's convention for "order left the happy path", e.g. cancelled).
 */
export function OrderHappyPathStepper({
  steps,
  currentStep,
  className,
}: {
  steps: HappyPathStep[];
  currentStep: number;
  className?: string;
}) {
  if (currentStep < 0) return null;

  return (
    <ol className={cn("hidden grid-cols-6 gap-2 sm:grid", className)}>
      {steps.map((step, index) => {
        const done = index <= currentStep;
        return (
          <li key={step.label}>
            <span className="relative block h-1 overflow-hidden rounded-full bg-line">
              <motion.span
                initial={false}
                animate={{ scaleX: done ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 22, delay: index * 0.04 }}
                className="absolute inset-0 origin-left rounded-full bg-primary"
              />
            </span>
            <p
              className={cn(
                "mt-2 text-[10.5px] uppercase tracking-[0.08em]",
                done ? "font-medium text-ink" : "text-ink-muted",
              )}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ Timeline ------------------------------ */

export interface OrderTimelineEvent {
  id: string;
  label: string;
  /** Pre-formatted secondary line — date/time, location, actor, etc. */
  meta: string;
  description?: string;
}

/**
 * Vertical event timeline. Expects events already ordered most-recent-first
 * (index 0 is treated as the active/current state). The connecting line
 * draws in from the top and each dot pops in with a short stagger.
 */
export function OrderTimeline({
  events,
  className,
}: {
  events: OrderTimelineEvent[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <ol className={cn("relative space-y-5 pl-6", className)}>
      <motion.span
        aria-hidden
        initial={reduceMotion ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: "top" }}
        className="absolute inset-y-1 left-0 w-px bg-line"
      />
      {events.map((event, index) => (
        <motion.li
          key={event.id}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <motion.span
            initial={reduceMotion ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.1, type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "absolute -left-[29px] grid h-[18px] w-[18px] place-items-center rounded-full border-2 bg-surface",
              index === 0 ? "border-primary" : "border-line",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", index === 0 ? "bg-primary" : "bg-line")} />
          </motion.span>
          <p className="text-[13px] font-medium text-ink">{event.label}</p>
          {event.description && <p className="mt-0.5 text-[12px] text-ink-muted">{event.description}</p>}
          <p className="mt-0.5 text-[11.5px] text-ink-muted">{event.meta}</p>
        </motion.li>
      ))}
    </ol>
  );
}
