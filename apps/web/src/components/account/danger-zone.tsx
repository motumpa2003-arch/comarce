"use client";

import * as React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button, Card, Field, Input, Modal, useToast } from "@obsidian/ui";

/**
 * Account deletion.
 *
 * The confirmation asks you to type your own email rather than "DELETE" — it
 * is the one string you cannot type by muscle memory on the wrong account, and
 * it makes the target of the action explicit.
 */
export function DangerZone({ email, orderCount }: { email: string; orderCount: number }) {
  const [open, setOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const { toast } = useToast();

  const matches = confirm.trim().toLowerCase() === email.toLowerCase();

  const remove = async () => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setPending(false);
    setOpen(false);
    setConfirm("");
    toast({
      title: "Nothing was deleted",
      description:
        "This demo has no account store, so the request stops here. In production it would begin a 14-day grace period.",
      tone: "accent",
    });
  };

  return (
    <>
      <Card className="border-danger/35">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-danger">
          <AlertTriangle className="h-3.5 w-3.5" />
          Delete account
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
          Closes your account and removes your profile, addresses, wishlist, reviews and support history. Order
          records are kept but unlinked from your identity, because tax law requires them for eight years.
        </p>
        <ul className="mt-4 space-y-1.5 text-[12px] text-ink-muted">
          <li>· Any store credit or unspent points are forfeited</li>
          <li>· Active orders and open returns must finish first</li>
          <li>· You have 14 days to change your mind before it is permanent</li>
        </ul>
        <Button variant="outline" size="sm" className="mt-5 text-danger" onClick={() => setOpen(true)}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete my account
        </Button>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete your account?"
        description="This starts a 14-day grace period. After that it cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Keep my account
            </Button>
            <Button variant="danger" size="sm" disabled={!matches} loading={pending} onClick={remove}>
              Delete account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            You have <span className="font-medium text-ink">{orderCount}</span> order
            {orderCount === 1 ? "" : "s"} on this account. Their records stay for tax purposes, with your name and
            contact details removed.
          </p>
          <Field
            label="Type your email to confirm"
            hint={email}
            error={confirm.length > 0 && !matches ? "That does not match the email on this account." : undefined}
          >
            <Input
              value={confirm}
              autoComplete="off"
              aria-invalid={confirm.length > 0 && !matches}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={email}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
