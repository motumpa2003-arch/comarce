"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button, Modal, useToast } from "@obsidian/ui";
import { number } from "@/lib/format";

export function ResetDatabaseButton() {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const reset = async () => {
    setPending(true);
    try {
      const response = await fetch("/api/platform/reset", { method: "POST" });
      const data = (await response.json()) as { products?: number; orders?: number; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Reset failed.");
      toast({
        title: "Demo data rebuilt",
        description: `${number(data.products ?? 0)} products and ${number(data.orders ?? 0)} orders regenerated.`,
        tone: "success",
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Could not reset",
        description: error instanceof Error ? error.message : "Unknown error.",
        tone: "danger",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="xs" fullWidth className="mt-4" onClick={() => setOpen(true)}>
        <RotateCcw className="h-3.5 w-3.5" />
        Reset demo data
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Reset demo data?"
        description="Every write made since the server started will be discarded."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Keep my changes
            </Button>
            <Button variant="danger" size="sm" loading={pending} onClick={reset}>
              Reset everything
            </Button>
          </>
        }
      >
        <ul className="space-y-1.5 text-[12.5px] text-ink-muted">
          <li>Orders placed through checkout will disappear.</li>
          <li>Fulfilment progress and returns will revert.</li>
          <li>Inventory adjustments will be undone.</li>
          <li>Theme and homepage edits will return to their presets.</li>
        </ul>
      </Modal>
    </>
  );
}
