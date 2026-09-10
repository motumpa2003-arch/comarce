"use client";

import * as React from "react";

/**
 * Deal timer. The end time is derived once on mount so the server render and
 * the first client paint agree, then it ticks locally.
 */
export function CountdownTimer({ hours = 62 }: { hours?: number }) {
  const [remaining, setRemaining] = React.useState(hours * 3600);

  React.useEffect(() => {
    const id = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const days = Math.floor(remaining / 86400);
  const hrs = Math.floor((remaining % 86400) / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;

  const cells = [
    { value: days, label: "Days" },
    { value: hrs, label: "Hours" },
    { value: mins, label: "Mins" },
    { value: secs, label: "Secs" },
  ];

  return (
    <div className="flex gap-2.5">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="min-w-[62px] rounded-[var(--radius-md)] border border-white/15 bg-white/[0.06] px-3 py-2.5 text-center backdrop-blur"
        >
          <p className="font-display text-[24px] leading-none tabular-nums text-inverse">
            {String(cell.value).padStart(2, "0")}
          </p>
          <p className="mt-1.5 text-[9.5px] uppercase tracking-[0.16em] text-inverse/55">{cell.label}</p>
        </div>
      ))}
    </div>
  );
}
