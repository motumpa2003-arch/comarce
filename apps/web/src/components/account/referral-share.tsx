"use client";

import * as React from "react";
import { Check, Copy, Mail, MessageCircle, Share2 } from "lucide-react";
import { Button, Card, Input, useToast } from "@obsidian/ui";

/**
 * The share block. Copy uses the clipboard API with a manual-select fallback,
 * because clipboard writes are blocked outside a secure context and a button
 * that silently does nothing is worse than one that hands you the text.
 */
export function ReferralShare({ code, friendDiscount }: { code: string; friendDiscount: string }) {
  const [copied, setCopied] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const link = typeof window === "undefined" ? `/signup?ref=${code}` : `${window.location.origin}/signup?ref=${code}`;
  const message = `Use my code ${code} for ${friendDiscount} off your first order.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      toast({ title: "Link copied", tone: "success" });
    } catch {
      inputRef.current?.select();
      toast({
        title: "Copy it manually",
        description: "Your browser blocked clipboard access, so the link is selected and ready to copy.",
      });
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Join me", text: message, url: link });
        return;
      } catch {
        // The user dismissed the sheet — nothing to report.
        return;
      }
    }
    copy();
  };

  return (
    <Card>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Your code</h2>

      <p className="mt-4 font-display display-case text-[32px] leading-none tracking-[0.1em] text-ink">{code}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Input
          ref={inputRef}
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Referral link"
          className="min-w-0 flex-1 font-mono text-[12px]"
        />
        <Button variant={copied ? "outline" : "primary"} onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={share}>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.location.href = `https://wa.me/?text=${encodeURIComponent(`${message} ${link}`)}`;
          }}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.location.href = `mailto:?subject=${encodeURIComponent("Something you might like")}&body=${encodeURIComponent(`${message}\n\n${link}`)}`;
          }}
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </Button>
      </div>
    </Card>
  );
}
