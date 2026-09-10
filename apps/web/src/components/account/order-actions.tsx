"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, XCircle } from "lucide-react";
import { Button, Card, Modal, Textarea, useToast } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";

export function OrderActions({
  orderId,
  orderNumber,
  cancellable,
  returnable,
}: {
  orderId: string;
  orderNumber: string;
  cancellable: boolean;
  returnable: boolean;
}) {
  const [confirming, setConfirming] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  if (!cancellable && !returnable) return null;

  const cancel = async () => {
    setPending(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not cancel this order.");
      toast({ title: "Order cancelled", description: `#${orderNumber} — refund initiated.`, tone: "success" });
      setConfirming(false);
      router.refresh();
    } catch (caught) {
      toast({
        title: "Could not cancel",
        description: caught instanceof Error ? caught.message : "Try again shortly.",
        tone: "danger",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Card padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Order actions</h2>
        </div>
        <div className="space-y-2 p-5">
          {returnable && (
            <ButtonLink href={`/account/orders/${orderId}/return`} variant="outline" fullWidth>
              <RotateCcw className="h-4 w-4" />
              Return or exchange
            </ButtonLink>
          )}
          {cancellable && (
            <Button variant="ghost" fullWidth onClick={() => setConfirming(true)} className="text-danger">
              <XCircle className="h-4 w-4" />
              Cancel order
            </Button>
          )}
          <p className="pt-1 text-[11px] leading-relaxed text-ink-muted">
            {returnable
              ? "Returns are free and collected from your address within two working days."
              : "Orders can be cancelled any time before dispatch."}
          </p>
        </div>
      </Card>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Cancel this order?"
        description={`Order #${orderNumber} will be cancelled and any payment refunded to the original method.`}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Keep order
            </Button>
            <Button variant="danger" loading={pending} onClick={cancel}>
              Cancel order
            </Button>
          </div>
        }
      >
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Tell us why (optional) — it helps us fix the underlying problem."
        />
      </Modal>
    </>
  );
}
