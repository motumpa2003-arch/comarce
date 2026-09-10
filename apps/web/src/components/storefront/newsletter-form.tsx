"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button, Checkbox, Input, cn, useToast } from "@obsidian/ui";

export function NewsletterForm({ className, inverse }: { className?: string; inverse?: boolean }) {
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(true);
  const [state, setState] = React.useState<"idle" | "loading" | "done">("idle");
  const { toast } = useToast();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({ title: "Enter a valid email address", tone: "danger" });
      return;
    }
    setState("loading");
    window.setTimeout(() => {
      setState("done");
      toast({
        title: "You are on the list",
        description: `We will send offers and new arrivals to ${email}.`,
        tone: "success",
      });
    }, 700);
  };

  if (state === "done") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-md)] border border-success/30 bg-success/[0.07] px-4 py-3.5",
          className,
        )}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success text-white">
          <Check className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[13px] font-medium text-ink">Subscribed</p>
          <p className="text-[12px] text-ink-muted">Check your inbox for a welcome code.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("max-w-md", className)}>
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          aria-label="Email address"
          className={cn(inverse && "border-white/20 bg-white/5 text-inverse placeholder:text-inverse/40")}
          required
        />
        <Button type="submit" variant="accent" loading={state === "loading"} className="shrink-0">
          Subscribe
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Checkbox
        className="mt-3"
        checked={consent}
        onChange={(e) => setConsent(e.target.checked)}
        label={
          <span className={cn("text-[11.5px]", inverse ? "text-inverse/65" : "text-ink-muted")}>
            I agree to receive updates and offers. Unsubscribe any time.
          </span>
        }
      />
    </form>
  );
}
