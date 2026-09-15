"use client";

import * as React from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { formatMoney } from "@obsidian/commerce";

export type AnimatedNumberFormat = "money" | "number" | "percent";

/**
 * Callers may live in a Server Component (e.g. the admin dashboard), so the
 * format has to be a serializable preset rather than a function reference —
 * a function prop can't cross the server/client boundary into this "use
 * client" component.
 */
function formatValue(value: number, format: AnimatedNumberFormat): string {
  switch (format) {
    case "money":
      return formatMoney(Math.round(value), { currency: "INR" });
    case "percent":
      return `${value.toFixed(2)}%`;
    case "number":
    default:
      return new Intl.NumberFormat("en-IN").format(Math.round(value));
  }
}

/**
 * Tweens from the previous numeric value to the next one whenever `value`
 * changes, formatting the in-flight number each frame — a "rolling" counter
 * rather than an instant swap. Falls back to an instant render under
 * reduced motion.
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: AnimatedNumberFormat;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const [display, setDisplay] = React.useState(() => formatValue(value, format));
  const previous = React.useRef(value);

  React.useEffect(() => {
    if (previous.current === value) return;
    if (reduceMotion) {
      previous.current = value;
      setDisplay(formatValue(value, format));
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (current) => setDisplay(formatValue(current, format)),
    });
    previous.current = value;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, format, reduceMotion]);

  return <span className={className}>{display}</span>;
}
