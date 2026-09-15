"use client";

import * as React from "react";
import { Gift, ShoppingBag } from "lucide-react";
import { Button, Card, Field, Input, Textarea, cn, useToast } from "@obsidian/ui";
import { money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useUi } from "@/store/ui";

const AMOUNTS = [50000, 100000, 250000, 500000, 1000000];

const DESIGNS = [
  { id: "obsidian", label: "Obsidian", from: "#080908", to: "#063F32" },
  { id: "gold", label: "Gold leaf", from: "#1a1608", to: "#C9A227" },
  { id: "emerald", label: "Emerald", from: "#063F32", to: "#0A5A48" },
  { id: "ivory", label: "Ivory", from: "#F4F0E7", to: "#C9B294" },
];

export function GiftCardPicker() {
  const [amount, setAmount] = React.useState(AMOUNTS[1]!);
  const [custom, setCustom] = React.useState("");
  const [design, setDesign] = React.useState(DESIGNS[0]!);
  const [recipient, setRecipient] = React.useState({ name: "", email: "", message: "" });
  const add = useCart((s) => s.add);
  const openCart = useUi((s) => s.openCart);
  const { toast } = useToast();

  const value = custom ? Math.max(50000, Math.min(5000000, Number(custom) * 100)) : amount;
  const light = design.id === "ivory";

  const addToBag = () => {
    add({
      productId: `giftcard_${design.id}_${value}`,
      variantId: `giftcard_${design.id}_${value}`,
      slug: "gift-cards",
      name: `${design.label} gift card`,
      variantTitle: money(value),
      options: { design: design.label, value: String(value) },
      image: "",
      unitPrice: value,
      maxQuantity: 5,
    });
    toast({
      title: "Gift card added",
      description: `${design.label} · ${money(value)}${recipient.email ? ` for ${recipient.email}` : ""}`,
      tone: "accent",
    });
    openCart();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
      {/* Preview */}
      <div>
        {/* A single premium surface gets the gold sweep — reserve this for
            the card itself, not the whole page. */}
        <div className="border-draw max-w-lg rounded-[var(--radius-lg)] p-1">
          <div
            className="relative flex aspect-[1.6/1] w-full flex-col justify-between overflow-hidden rounded-[calc(var(--radius-lg)-4px)] p-7 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${design.from}, ${design.to})` }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative flex items-start justify-between">
              <div>
                <p
                  className={cn(
                    "font-display display-case text-[20px] tracking-[0.16em]",
                    light ? "text-obsidian" : "text-inverse",
                  )}
                >
                  Obsidian
                </p>
                <p
                  className={cn(
                    "mt-1 text-[9px] uppercase tracking-[0.3em]",
                    light ? "text-obsidian/60" : "text-inverse/55",
                  )}
                >
                  Gift card
                </p>
              </div>
              <Gift className={cn("h-6 w-6", light ? "text-obsidian/70" : "text-accent")} />
            </div>
            <div className="relative">
              <p
                className={cn(
                  "font-display text-[42px] leading-none tabular-nums",
                  light ? "text-obsidian" : "text-accent",
                )}
              >
                {money(value)}
              </p>
              <p
                className={cn(
                  "mt-2 text-[11px] tracking-[0.14em]",
                  light ? "text-obsidian/55" : "text-inverse/50",
                )}
              >
                OBS-XXXX-XXXX-XXXX · valid 24 months
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Card design</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {DESIGNS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setDesign(option)}
                aria-pressed={design.id === option.id}
                className={cn(
                  "h-11 w-20 rounded-[var(--radius-sm)] border-2 transition-all",
                  design.id === option.id ? "border-ink" : "border-transparent hover:border-line",
                )}
                style={{ background: `linear-gradient(135deg, ${option.from}, ${option.to})` }}
              >
                <span className="sr-only">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <h2 className="font-display display-case text-[22px] text-ink">Choose an amount</h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {AMOUNTS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setAmount(option);
                setCustom("");
              }}
              className={cn(
                "rounded-[var(--radius-button)] border px-4 py-2.5 text-[13px] font-medium tabular-nums transition-colors",
                !custom && amount === option
                  ? "border-ink bg-ink text-inverse"
                  : "border-line text-ink hover:border-ink/40",
              )}
            >
              {money(option)}
            </button>
          ))}
        </div>

        <Field label="Or enter a custom amount" hint="Between ₹500 and ₹50,000" className="mt-5">
          <Input
            type="number"
            min={500}
            max={50000}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="e.g. 3500"
            leading={<span className="text-[13px]">₹</span>}
          />
        </Field>

        <div className="mt-6 space-y-4 border-t border-line pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Recipient</p>
          <Field label="Their name">
            <Input
              value={recipient.name}
              onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
              placeholder="Who is it for?"
            />
          </Field>
          <Field label="Their email" hint="We deliver the card here within minutes.">
            <Input
              type="email"
              value={recipient.email}
              onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
              placeholder="name@example.com"
            />
          </Field>
          <Field label="Message" hint="Optional, up to 200 characters">
            <Textarea
              rows={3}
              maxLength={200}
              value={recipient.message}
              onChange={(e) => setRecipient({ ...recipient, message: e.target.value })}
              placeholder="Happy birthday — pick something you actually want."
            />
          </Field>
        </div>

        <Button size="lg" fullWidth variant="accent" className="mt-6" onClick={addToBag}>
          <ShoppingBag className="h-4 w-4" />
          Add {money(value)} gift card to bag
        </Button>
        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
          Gift cards are not refundable once part of the balance is spent, and cannot be exchanged for cash.
        </p>
      </Card>
    </div>
  );
}
