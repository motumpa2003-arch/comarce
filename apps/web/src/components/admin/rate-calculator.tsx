"use client";

import * as React from "react";
import { Field, Input, Select } from "@obsidian/ui";
import { money } from "@/lib/format";

interface Rate {
  zone: string;
  method: string;
  minG: number;
  maxG: number;
  price: number;
  freeOver: number;
  days: string;
}

/**
 * Applies the same rules the cart does: first band whose range contains the
 * billable weight wins, then the free-shipping threshold overrides the price.
 * Keeping the logic visible here is the point — a merchant can see *why* a
 * quote came out the way it did.
 */
export function RateCalculator({
  rates,
  methodNames,
}: {
  rates: Rate[];
  methodNames: Record<string, string>;
}) {
  const zones = React.useMemo(() => [...new Set(rates.map((r) => r.zone))], [rates]);
  const [zone, setZone] = React.useState(zones[0] ?? "");
  const [weight, setWeight] = React.useState("750");
  const [orderValue, setOrderValue] = React.useState("2500");

  const grams = Math.max(0, Number(weight) || 0);
  const valueMinor = Math.max(0, Math.round((Number(orderValue) || 0) * 100));

  const quotes = rates
    .filter((r) => r.zone === zone && grams >= r.minG && grams <= r.maxG)
    .map((rate) => {
      const free = rate.freeOver > 0 && valueMinor >= rate.freeOver;
      return { ...rate, charged: free ? 0 : rate.price, free };
    });

  return (
    <div className="mt-4 space-y-3.5">
      <Field label="Zone">
        <Select value={zone} onChange={(e) => setZone(e.target.value)}>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight (g)">
          <Input
            type="number"
            min={0}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="tabular-nums"
          />
        </Field>
        <Field label="Order value (₹)">
          <Input
            type="number"
            min={0}
            value={orderValue}
            onChange={(e) => setOrderValue(e.target.value)}
            className="tabular-nums"
          />
        </Field>
      </div>

      <div className="rounded-[var(--radius-md)] border border-line bg-muted/50 p-3.5">
        {quotes.length === 0 ? (
          <p className="text-[12px] leading-relaxed text-ink-muted">
            No rate covers {grams} g in this zone, so checkout would block this address. Add a band that includes
            this weight.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {quotes.map((quote) => (
              <li key={`${quote.method}-${quote.minG}`} className="flex items-baseline justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] text-ink">
                    {methodNames[quote.method] ?? quote.method}
                  </span>
                  <span className="block text-[11px] text-ink-muted">
                    {quote.days}
                    {quote.free && " · free shipping threshold met"}
                  </span>
                </span>
                <span
                  className={
                    quote.free
                      ? "shrink-0 text-[13px] font-semibold text-success"
                      : "shrink-0 text-[13px] font-semibold tabular-nums text-ink"
                  }
                >
                  {quote.charged === 0 ? "Free" : money(quote.charged)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
