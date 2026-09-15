import type { Metadata } from "next";
import { Database, Download, Eye, FileText, ShieldCheck } from "lucide-react";
import { getCustomerOrders, getDemoCustomer } from "@obsidian/data";
import { Card, Separator, Switch, Table, TBody, TD, TH, THead, TR } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { DangerZone } from "@/components/account/danger-zone";
import { formatDate, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Privacy & data" };

export default async function AccountPrivacyPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);
  const orders = getCustomerOrders(db.store.id, customer.id);
  const reviews = db.reviews.filter((r) => r.customerId === customer.id);
  const tickets = db.tickets.filter((t) => t.customerId === customer.id);

  // What an export would actually contain, counted from the real records
  // rather than asserted — so the page cannot drift from the data.
  const holdings = [
    { label: "Profile", detail: "Name, email, phone, date of birth", count: 1, retention: "Until you delete the account" },
    { label: "Addresses", detail: "Delivery and billing addresses", count: customer.addresses.length, retention: "Until removed" },
    { label: "Orders", detail: "Items, amounts, delivery addresses", count: orders.length, retention: "8 years (tax law)" },
    { label: "Reviews & questions", detail: "Public content under your display name", count: reviews.length, retention: "Until you delete them" },
    { label: "Support tickets", detail: "Messages between you and support", count: tickets.length, retention: "3 years" },
    { label: "Loyalty ledger", detail: "Points earned and redeemed", count: 1, retention: "Until you delete the account" },
    { label: "Browsing history", detail: "Recently viewed, wishlist, compare", count: 0, retention: "This browser only — never sent to us" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display display-case text-[26px] leading-none text-ink">Privacy & data</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Exactly what we hold, how long we keep it, and the controls to take it back.
        </p>
      </div>

      <Card padded={false}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Database className="h-3.5 w-3.5 text-ink-muted" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">What we hold</h2>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Data</TH>
              <TH align="right">Records</TH>
              <TH>Retention</TH>
            </TR>
          </THead>
          <TBody>
            {holdings.map((row) => (
              <TR key={row.label}>
                <TD>
                  <span className="block text-[12.5px] font-medium text-ink">{row.label}</span>
                  <span className="mt-0.5 block text-[11px] text-ink-muted">{row.detail}</span>
                </TD>
                <TD align="right" className="tabular-nums text-ink-muted">
                  {row.count === 0 ? "—" : number(row.count)}
                </TD>
                <TD className="text-ink-muted">{row.retention}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
        <p className="border-t border-line px-5 py-3.5 text-[11.5px] leading-relaxed text-ink-muted">
          Order records are kept for eight years because tax law requires it — that is the one thing account deletion
          cannot remove, though it is unlinked from your identity.
        </p>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
          <Eye className="h-3.5 w-3.5" />
          Consent
        </h2>
        <div className="mt-5 space-y-5">
          <Switch
            label="Marketing messages"
            description="Campaigns, offers and new arrivals. Turning this off never affects order updates."
            defaultChecked={customer.marketingOptIn}
          />
          <Separator />
          <Switch
            label="Personalisation"
            description="Use my order and browsing history to rank products and build recommendations."
            defaultChecked
          />
          <Separator />
          <Switch
            label="Analytics cookies"
            description="Aggregated page and funnel measurement. Not tied to your name or email."
            defaultChecked
          />
          <Separator />
          <Switch
            label="Share data with advertising partners"
            description="Off by default and we do not sell personal data. Turning this on allows audience matching on ad platforms."
          />
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
          <Download className="h-3.5 w-3.5" />
          Export your data
        </h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
          A machine-readable copy of everything in the table above. We build it and email a download link that
          expires after 24 hours; it usually takes a few minutes.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href="#" variant="outline" size="sm">
            <FileText className="h-3.5 w-3.5" />
            Request JSON export
          </ButtonLink>
          <ButtonLink href="#" variant="ghost" size="sm">
            Request CSV export
          </ButtonLink>
        </div>
        <p className="mt-4 text-[11.5px] text-ink-muted">
          Last export requested: never. Account created {formatDate(customer.createdAt)}.
        </p>
      </Card>

      <DangerZone email={customer.email} orderCount={orders.length} />

      <Card tone="muted">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
          <p className="text-[12px] leading-relaxed text-ink-muted">
            This is a demo build. Nothing on this page is connected to a real data store, and no export or deletion
            actually runs — the controls show what the flow looks like, including the parts that are deliberately
            irreversible.
          </p>
        </div>
      </Card>
    </div>
  );
}
