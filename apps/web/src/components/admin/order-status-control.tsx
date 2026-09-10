"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { Button, MenuItem, Popover, useToast } from "@obsidian/ui";

/**
 * Drives the order state machine. The list of legal next statuses comes from
 * the engine, so the UI can never offer an illegal transition — and the server
 * rejects one anyway if it is attempted directly.
 */
export function OrderStatusControl({
  orderId,
  orderNumber,
  status,
  statusLabel,
  primary,
  transitions,
}: {
  orderId: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  primary: { label: string; next: string } | null;
  transitions: { value: string; label: string }[];
}) {
  const [pending, setPending] = React.useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const advance = async (next: string, label: string) => {
    setPending(next);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ next, actor: "Merchant" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not update the order.");
      toast({
        title: `Order #${orderNumber} → ${label}`,
        description: "The customer has been notified and the timeline updated.",
        tone: "success",
      });
      router.refresh();
    } catch (caught) {
      toast({
        title: "Update rejected",
        description: caught instanceof Error ? caught.message : "Try again.",
        tone: "danger",
      });
    } finally {
      setPending(null);
    }
  };

  if (transitions.length === 0) {
    return (
      <span className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-button)] border border-line px-3.5 text-[11.5px] text-ink-muted">
        <Check className="h-3.5 w-3.5 text-success" />
        {statusLabel} — no further action
      </span>
    );
  }

  const secondary = transitions.filter((t) => t.value !== primary?.next);

  return (
    <div className="flex items-center gap-1.5">
      {primary && (
        <Button size="sm" loading={pending === primary.next} onClick={() => advance(primary.next, primary.label)}>
          {primary.label}
        </Button>
      )}

      {secondary.length > 0 && (
        <Popover
          align="end"
          panelClassName="w-[220px]"
          trigger={({ toggle, open }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-label="More status changes"
              className="grid h-9 w-9 place-items-center rounded-[var(--radius-button)] border border-line text-ink transition-colors hover:border-ink/30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          )}
        >
          {({ close }) => (
            <div>
              <p className="px-3.5 pb-2 pt-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Move from {statusLabel}
              </p>
              {secondary.map((transition) => (
                <MenuItem
                  key={transition.value}
                  danger={["cancelled", "refunded", "rejected"].includes(transition.value)}
                  onClick={() => {
                    close();
                    advance(transition.value, transition.label);
                  }}
                >
                  {transition.label}
                </MenuItem>
              ))}
            </div>
          )}
        </Popover>
      )}

      <span className="sr-only">Current status: {status}</span>
    </div>
  );
}
