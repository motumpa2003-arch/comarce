"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, Upload } from "lucide-react";
import { RETURN_REASON_LABELS, type ReturnReason } from "@obsidian/commerce";
import { Button, Card, Checkbox, Radio, Textarea, cn, useToast } from "@obsidian/ui";
import { money } from "@/lib/format";

interface ReturnItem {
  id: string;
  name: string;
  image: string;
  variantTitle: string;
  quantity: number;
  total: number;
}

const RESOLUTIONS: { value: "refund" | "exchange" | "store_credit"; label: string; hint: string }[] = [
  { value: "refund", label: "Refund to original payment", hint: "5–7 working days after quality check" },
  { value: "exchange", label: "Exchange for another size or colour", hint: "Shipped as soon as we receive the return" },
  { value: "store_credit", label: "Store credit", hint: "Instant, and you get 5% extra" },
];

export function ReturnWizard({
  orderId,
  orderNumber,
  items,
}: {
  orderId: string;
  orderNumber: string;
  items: ReturnItem[];
}) {
  const [step, setStep] = React.useState(0);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [reason, setReason] = React.useState<ReturnReason>("size_fit");
  const [comment, setComment] = React.useState("");
  const [resolution, setResolution] = React.useState<"refund" | "exchange" | "store_credit">("refund");
  const [pending, setPending] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const chosen = items.filter((item) => selected.includes(item.id));
  const refundAmount = chosen.reduce((n, item) => n + item.total, 0);
  const bonus = resolution === "store_credit" ? Math.round(refundAmount * 0.05) : 0;

  const submit = async () => {
    setPending(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ itemIds: selected, reason, comment, resolution }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not raise the return.");
      toast({
        title: "Return requested",
        description: `We will collect ${chosen.length} item${chosen.length === 1 ? "" : "s"} within two working days.`,
        tone: "success",
      });
      router.push(`/account/orders/${orderId}`);
      router.refresh();
    } catch (caught) {
      toast({
        title: "Could not raise the return",
        description: caught instanceof Error ? caught.message : "Try again shortly.",
        tone: "danger",
      });
      setPending(false);
    }
  };

  const steps = ["Select items", "Reason", "Resolution", "Confirm"];

  return (
    <div className="mt-7">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((label, index) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11.5px] font-medium",
                index < step
                  ? "border-primary bg-primary text-inverse"
                  : index === step
                    ? "border-ink bg-ink text-inverse"
                    : "border-line text-ink-muted",
              )}
            >
              {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden text-[11px] font-medium uppercase tracking-[0.1em] sm:inline",
                index === step ? "text-ink" : "text-ink-muted",
              )}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <span className={cn("h-px flex-1", index < step ? "bg-primary" : "bg-line")} />
            )}
          </li>
        ))}
      </ol>

      <Card className="mt-7">
        {step === 0 && (
          <div>
            <h2 className="text-[15px] font-medium text-ink">Which items are you returning?</h2>
            <ul className="mt-4 divide-y divide-line">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 py-3.5">
                  <Checkbox
                    checked={selected.includes(item.id)}
                    onChange={() =>
                      setSelected((current) =>
                        current.includes(item.id)
                          ? current.filter((x) => x !== item.id)
                          : [...current, item.id],
                      )
                    }
                  />
                  <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                    {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-ink">{item.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">
                      {item.variantTitle !== "Default" ? `${item.variantTitle} · ` : ""}Qty {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-[13px] tabular-nums text-ink">{money(item.total)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-[15px] font-medium text-ink">Why are you returning these?</h2>
            <div className="mt-4 space-y-2.5">
              {(Object.keys(RETURN_REASON_LABELS) as ReturnReason[]).map((key) => (
                <label
                  key={key}
                  className={cn(
                    "flex cursor-pointer rounded-[var(--radius-card)] border p-3.5 transition-colors",
                    reason === key ? "border-ink bg-muted" : "border-line hover:border-ink/35",
                  )}
                >
                  <Radio
                    name="reason"
                    checked={reason === key}
                    onChange={() => setReason(key)}
                    label={RETURN_REASON_LABELS[key]}
                  />
                </label>
              ))}
            </div>
            <Textarea
              className="mt-4"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add any detail that helps us fix this (optional)"
            />
            <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line p-4 text-[12.5px] text-ink-muted">
              <Upload className="h-4 w-4 shrink-0" />
              Attach photos if the item arrived damaged — it speeds up approval.
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-[15px] font-medium text-ink">How would you like this resolved?</h2>
            <div className="mt-4 space-y-2.5">
              {RESOLUTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer rounded-[var(--radius-card)] border p-3.5 transition-colors",
                    resolution === option.value ? "border-ink bg-muted" : "border-line hover:border-ink/35",
                  )}
                >
                  <Radio
                    name="resolution"
                    checked={resolution === option.value}
                    onChange={() => setResolution(option.value)}
                    label={option.label}
                    description={option.hint}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-[15px] font-medium text-ink">Confirm your return</h2>
            <dl className="mt-4 space-y-2.5 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Order</dt>
                <dd className="text-ink">#{orderNumber}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Items</dt>
                <dd className="text-right text-ink">{chosen.map((c) => c.name).join(", ")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Reason</dt>
                <dd className="text-ink">{RETURN_REASON_LABELS[reason]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Resolution</dt>
                <dd className="text-ink">{RESOLUTIONS.find((r) => r.value === resolution)?.label}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-3">
                <dt className="font-medium text-ink">Refund value</dt>
                <dd className="font-display text-[20px] tabular-nums text-ink">{money(refundAmount + bonus)}</dd>
              </div>
              {bonus > 0 && (
                <p className="text-right text-[11.5px] text-success">Includes {money(bonus)} store-credit bonus</p>
              )}
            </dl>
            <p className="mt-4 text-[12px] leading-relaxed text-ink-muted">
              We will email a pickup slot within two working days. Keep the original packaging and tags where possible.
            </p>
          </div>
        )}

        <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-5">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && selected.length === 0}>
              Continue
            </Button>
          ) : (
            <Button variant="accent" loading={pending} onClick={submit}>
              Submit return request
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
