import type { Metadata } from "next";
import { Bell, Globe, Mail, MessageSquare, Smartphone } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Button, Card, Field, Select, Separator, Switch, Table, TBody, TD, TH, THead, TR } from "@obsidian/ui";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Preferences" };

/**
 * A channel matrix rather than a flat list of switches. Transactional rows are
 * locked on — you cannot opt out of being told your order shipped — and the
 * page says so instead of showing a toggle that silently refuses to move.
 */
const MATRIX = [
  { id: "order", label: "Order updates", note: "Confirmation, dispatch, delivery", locked: true, email: true, sms: true, push: true, whatsapp: true },
  { id: "delivery", label: "Delivery exceptions", note: "Failed attempts, address queries", locked: true, email: true, sms: true, push: true, whatsapp: true },
  { id: "returns", label: "Returns & refunds", note: "Pickup scheduled, refund issued", locked: true, email: true, sms: true, push: false, whatsapp: true },
  { id: "backinstock", label: "Back in stock", note: "Items you asked to be told about", locked: false, email: true, sms: false, push: true, whatsapp: false },
  { id: "pricedrop", label: "Price drops", note: "On wishlist and recently viewed", locked: false, email: true, sms: false, push: true, whatsapp: false },
  { id: "offers", label: "Offers & campaigns", note: "Sales, new drops, member events", locked: false, email: false, sms: false, push: false, whatsapp: false },
  { id: "reviews", label: "Review reminders", note: "A nudge two weeks after delivery", locked: false, email: true, sms: false, push: false, whatsapp: false },
  { id: "loyalty", label: "Points & tier changes", note: "Balance updates and tier moves", locked: false, email: true, sms: false, push: true, whatsapp: false },
];

const CHANNELS = [
  { key: "email", label: "Email", icon: Mail },
  { key: "sms", label: "SMS", icon: MessageSquare },
  { key: "push", label: "Push", icon: Bell },
  { key: "whatsapp", label: "WhatsApp", icon: Smartphone },
] as const;

export default async function AccountPreferencesPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display display-case text-[26px] leading-none text-ink">Preferences</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          What we send you, where we send it, and how the store reads for you.
        </p>
      </div>

      <Card padded={false}>
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Message types</h2>
          <p className="mt-1.5 text-[12px] text-ink-muted">
            Rows marked <span className="text-ink">always on</span> are transactional — they are about an order you
            placed, so we send them regardless of marketing preferences.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Message</TH>
                {CHANNELS.map((channel) => (
                  <TH key={channel.key} align="center">
                    <span className="flex items-center justify-center gap-1.5">
                      <channel.icon className="h-3.5 w-3.5" />
                      {channel.label}
                    </span>
                  </TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {MATRIX.map((row) => (
                <TR key={row.id}>
                  <TD>
                    <span className="block text-[12.5px] font-medium text-ink">{row.label}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-muted">
                      {row.note}
                      {row.locked && " · always on"}
                    </span>
                  </TD>
                  {CHANNELS.map((channel) => (
                    <TD key={channel.key} align="center">
                      <input
                        type="checkbox"
                        aria-label={`${row.label} via ${channel.label}`}
                        defaultChecked={row[channel.key]}
                        disabled={row.locked}
                        className="h-4 w-4 cursor-pointer accent-[var(--c-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </TD>
                  ))}
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
          <p className="text-[11.5px] text-ink-muted">
            Marketing currently {customer.marketingOptIn ? "enabled" : "disabled"} on this account.
          </p>
          <Button size="sm">Save preferences</Button>
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
          <Globe className="h-3.5 w-3.5" />
          Locale
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Language">
            <Select defaultValue={db.store.locale}>
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">हिन्दी</option>
              <option value="bn-IN">বাংলা</option>
              <option value="ta-IN">தமிழ்</option>
              <option value="mr-IN">मराठी</option>
            </Select>
          </Field>
          <Field label="Currency" hint="Prices are converted at checkout">
            <Select defaultValue={db.store.currency}>
              {["INR", "USD", "EUR", "GBP", "AED", "SGD"].map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Time zone">
            <Select defaultValue={db.store.timezone}>
              <option value="Asia/Kolkata">India Standard Time (GMT+5:30)</option>
              <option value="Asia/Dubai">Gulf Standard Time (GMT+4)</option>
              <option value="Asia/Singapore">Singapore (GMT+8)</option>
              <option value="Europe/London">United Kingdom (GMT)</option>
            </Select>
          </Field>
          <Field label="Measurement units" hint="Used in size and spec tables">
            <Select defaultValue="metric">
              <option value="metric">Metric (cm, kg)</option>
              <option value="imperial">Imperial (in, lb)</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Shopping experience</h2>
        <div className="mt-5 space-y-5">
          <Switch
            label="Remember recently viewed products"
            description="Kept in this browser only. Turning this off clears the history immediately."
            defaultChecked
          />
          <Separator />
          <Switch
            label="Personalised recommendations"
            description="Uses your own order and browsing history to rank products. With this off you see the store-wide ranking."
            defaultChecked
          />
          <Separator />
          <Switch
            label="Show out-of-stock products in listings"
            description="Useful if you want to request a restock alert rather than never seeing the item."
          />
          <Separator />
          <Switch
            label="Reduce motion"
            description="Turns off parallax, auto-advancing carousels and hover zoom across the storefront."
          />
        </div>
        <div className="mt-6">
          <Button size="sm">Save changes</Button>
        </div>
      </Card>
    </div>
  );
}
