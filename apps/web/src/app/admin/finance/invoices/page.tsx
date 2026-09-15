import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Receipt } from "lucide-react";
import { Badge, Card, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, RankedBars, SERIES } from "@/components/admin/charts";
import { formatDate, money, moneyShort, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Invoices & credit notes" };

export default async function InvoicesPage() {
  const db = await currentStore();

  // Tax invoices are derived from orders rather than stored separately — the
  // order is the source of truth, and an invoice is a view of it at a moment.
  const invoiced = db.orders
    .filter((o) => !["pending", "payment_pending", "payment_failed", "cancelled"].includes(o.status))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const credits = db.refunds
    .slice()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const invoicedTotal = invoiced.reduce((n, o) => n + o.total, 0);
  const creditTotal = credits.reduce((n, r) => n + r.amount, 0);
  const taxTotal = invoiced.reduce((n, o) => n + o.tax, 0);

  // Orders store a single tax figure. The CGST/SGST/IGST split a filing needs
  // is a function of where the parcel went relative to the place of supply, so
  // derive it here the same way the pricing engine does at checkout.
  const homeState = db.warehouses.find((w) => w.isDefault)?.address.state ?? "Karnataka";
  const isIntraState = (order: (typeof invoiced)[number]) =>
    order.shippingAddress.state.trim().toLowerCase() === homeState.trim().toLowerCase();

  const intra = invoiced.filter(isIntraState);
  const inter = invoiced.filter((o) => !isIntraState(o));
  const intraTax = intra.reduce((n, o) => n + o.tax, 0);
  const cgst = Math.round(intraTax / 2);
  const sgst = intraTax - cgst;
  const igst = inter.reduce((n, o) => n + o.tax, 0);

  const orderNumber = new Map(db.orders.map((o) => [o.id, o.orderNumber]));

  return (
    <>
      <AdminPageHeader
        title="Invoices & credit notes"
        description="A tax invoice is generated for every order that reaches payment, and a credit note for every refund. Both carry sequential numbering that never has a gap, because a gap is what an auditor asks about."
        breadcrumbs={[{ label: "Finance" }, { label: "Invoices" }]}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Export for filing
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Invoices" value={number(invoiced.length)} hint={money(invoicedTotal)} />
        <Stat label="Credit notes" value={number(credits.length)} hint={money(creditTotal)} />
        <Stat label="Tax collected" value={money(taxTotal)} hint="GST, inclusive of both splits" />
        <Stat
          label="Net taxable"
          value={money(invoicedTotal - creditTotal - taxTotal)}
          hint="After credits and tax"
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <FileText className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">Tax invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Invoice</TH>
                  <TH>Order</TH>
                  <TH>Customer</TH>
                  <TH align="right">Taxable</TH>
                  <TH align="right">GST</TH>
                  <TH align="right">Total</TH>
                  <TH align="right">Issued</TH>
                </TR>
              </THead>
              <TBody>
                {invoiced.slice(0, 30).map((order, index) => (
                  <TR key={order.id}>
                    <TD>
                      <code className="text-[12px] font-medium text-ink">
                        INV-{String(invoiced.length - index).padStart(5, "0")}
                      </code>
                    </TD>
                    <TD>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TD>
                    <TD className="text-ink-muted">{order.customerName}</TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {money(order.total - order.tax)}
                    </TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {money(order.tax)}
                    </TD>
                    <TD align="right" className="font-medium tabular-nums text-ink">
                      {money(order.total)}
                    </TD>
                    <TD align="right" className="whitespace-nowrap text-ink-muted">
                      {formatDate(order.createdAt)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <p className="border-t border-line px-5 py-3 text-[11.5px] text-ink-muted">
            Showing the 30 most recent of {number(invoiced.length)}.
          </p>
        </Card>

        <aside className="space-y-4">
          <ChartFrame
            title="GST split"
            description={`Place of supply: ${homeState}`}
            height={160}
          >
            <RankedBars
              rows={[
                { label: "Intra-state (CGST + SGST)", value: intra.length },
                { label: "Inter-state (IGST)", value: inter.length },
              ]}
              format="number"
              color={SERIES[0]}
            />
          </ChartFrame>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Tax totals</h2>
            <dl className="mt-3.5 space-y-2 text-[12.5px]">
              {[
                ["CGST", cgst],
                ["SGST", sgst],
                ["IGST", igst],
              ].map(([label, amount]) => (
                <div key={String(label)} className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="tabular-nums text-ink">{moneyShort(Number(amount))}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 border-t border-line pt-2">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="font-medium tabular-nums text-ink">{moneyShort(taxTotal)}</dd>
              </div>
            </dl>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Numbering</h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              Invoice numbers are allocated on payment capture, not on order creation, and are never reused. A
              cancelled order that never reached payment simply has no invoice — it does not leave a hole in the
              sequence.
            </p>
          </Card>
        </aside>
      </div>

      <Card className="mt-5" padded={false}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
          <Receipt className="h-3.5 w-3.5 text-ink-muted" />
          <h2 className="text-[12.5px] font-semibold text-ink">Credit notes</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Credit note</TH>
                <TH>Against order</TH>
                <TH>Reason</TH>
                <TH>Status</TH>
                <TH align="right">Amount</TH>
                <TH align="right">Issued</TH>
              </TR>
            </THead>
            <TBody>
              {credits.slice(0, 20).map((refund, index) => (
                <TR key={refund.id}>
                  <TD>
                    <code className="text-[12px] font-medium text-ink">
                      CRN-{String(credits.length - index).padStart(5, "0")}
                    </code>
                  </TD>
                  <TD>
                    <Link
                      href={`/admin/orders/${refund.orderId}`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {orderNumber.get(refund.orderId) ?? refund.orderId}
                    </Link>
                  </TD>
                  <TD className="text-ink-muted">{refund.reason}</TD>
                  <TD>
                    <Badge
                      tone={
                        refund.status === "completed" ? "success" : refund.status === "failed" ? "danger" : "warning"
                      }
                      size="xs"
                    >
                      {refund.status}
                    </Badge>
                  </TD>
                  <TD align="right" className="font-medium tabular-nums text-ink">
                    {money(refund.amount)}
                  </TD>
                  <TD align="right" className="whitespace-nowrap text-ink-muted">
                    {formatDate(refund.createdAt)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
