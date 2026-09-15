import type { Metadata } from "next";
import { Banknote, CreditCard, Info, Plus, Smartphone, Trash2, Wallet } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Badge, Button, Card, EmptyState, Separator } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { money } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Payment methods" };

/**
 * Saved instruments. Only the network, last four digits and expiry are ever
 * held here — the card number itself lives with the gateway, which is what
 * keeps this page out of PCI scope.
 */
const CARDS = [
  { id: "pm_1", network: "Visa", last4: "6411", expiry: "08 / 28", holder: "P. Sharma", primary: true },
  { id: "pm_2", network: "Mastercard", last4: "2290", expiry: "01 / 27", holder: "P. Sharma", primary: false },
];

const UPI = [{ id: "upi_1", handle: "priya@okaxis", verified: true }];

export default async function PaymentMethodsPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display display-case text-[26px] leading-none text-ink">Payment methods</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            Saved instruments for faster checkout, plus your store credit balance.
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5" />
          Add method
        </Button>
      </div>

      <Card className="border-accent/40 bg-accent/[0.05]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 text-accent">
              <Wallet className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">Store credit</p>
              <p className="mt-0.5 font-display text-[24px] leading-none text-ink">{money(customer.storeCredit)}</p>
            </div>
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-ink-muted">
            Applied automatically at checkout before any other method. Credit from returns is issued instantly and
            never expires.
          </p>
        </div>
      </Card>

      <Card padded={false}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <CreditCard className="h-3.5 w-3.5 text-ink-muted" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Cards</h2>
        </div>
        <ul className="divide-y divide-line">
          {CARDS.map((card) => (
            <li key={card.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="grid h-10 w-14 shrink-0 place-items-center rounded-[5px] border border-line bg-muted text-[10px] font-semibold uppercase tracking-[0.08em] text-ink">
                {card.network}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium tabular-nums text-ink">
                  •••• •••• •••• {card.last4}
                  {card.primary && (
                    <Badge tone="success" size="xs">
                      Default
                    </Badge>
                  )}
                </p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {card.holder} · expires {card.expiry}
                </p>
              </div>
              {!card.primary && (
                <Button size="xs" variant="ghost">
                  Make default
                </Button>
              )}
              <Button size="xs" variant="ghost" className="text-danger">
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card padded={false}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Smartphone className="h-3.5 w-3.5 text-ink-muted" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">UPI</h2>
        </div>
        {UPI.length === 0 ? (
          <div className="px-5 py-8">
            <EmptyState
              icon={<Smartphone className="h-5 w-5" />}
              title="No UPI handle saved"
              description="Save a handle to skip typing it at checkout."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {UPI.map((upi) => (
              <li key={upi.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="grid h-10 w-14 shrink-0 place-items-center rounded-[5px] border border-line bg-muted text-[10px] font-semibold uppercase tracking-[0.08em] text-ink">
                  UPI
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink">
                    {upi.handle}
                    {upi.verified && (
                      <Badge tone="info" size="xs">
                        Verified
                      </Badge>
                    )}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-ink-muted">Collect request sent at checkout</p>
                </div>
                <Button size="xs" variant="ghost" className="text-danger">
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padded={false}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Banknote className="h-3.5 w-3.5 text-ink-muted" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            Also available at checkout
          </h2>
        </div>
        <ul className="divide-y divide-line text-[12.5px]">
          {[
            { label: "Net banking", note: "58 banks supported" },
            { label: "Wallets", note: "Paytm, PhonePe, Amazon Pay" },
            { label: "Cash on delivery", note: "Orders under ₹20,000, serviceable pincodes" },
            { label: "EMI", note: "From ₹5,000, 3 to 24 months" },
            { label: "Gift card", note: "Apply any balance at checkout" },
          ].map((method) => (
            <li key={method.label} className="flex items-baseline justify-between gap-4 px-5 py-3">
              <span className="text-ink">{method.label}</span>
              <span className="shrink-0 text-ink-muted">{method.note}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="muted">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
          <div>
            <p className="text-[12.5px] font-medium text-ink">Card numbers are never stored here</p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
              What you see above is a token from our payment partner plus the last four digits. The full number, CVV
              and PIN never reach our servers, which is the only reason this page can exist without dragging the
              whole platform into PCI scope.
            </p>
            <Separator className="my-4" />
            <ButtonLink href="/pages/privacy" variant="outline" size="xs">
              Read the privacy policy
            </ButtonLink>
          </div>
        </div>
      </Card>
    </div>
  );
}
