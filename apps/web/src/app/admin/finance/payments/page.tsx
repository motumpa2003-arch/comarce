import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { formatDate, money, number, percent, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Payments" };

export default async function AdminPaymentsPage() {
  const db = await currentStore();
  const payments = db.payments;

  const captured = payments.filter((p) => p.status === "captured");
  const gross = captured.reduce((n, p) => n + p.amount, 0);
  const fees = captured.reduce((n, p) => n + p.fee, 0);
  const net = captured.reduce((n, p) => n + p.netAmount, 0);
  const refunded = db.refunds.reduce((n, r) => n + r.amount, 0);

  const byMethod = [...new Set(payments.map((p) => p.method))]
    .map((method) => ({
      label: method.toUpperCase(),
      value: payments.filter((p) => p.method === method).reduce((n, p) => n + p.amount, 0),
    }))
    .sort((a, b) => b.value - a.value);

  const byGateway = [...new Set(payments.map((p) => p.gateway))]
    .map((gateway) => ({
      label: titleCase(gateway),
      value: payments.filter((p) => p.gateway === gateway).length,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Captured, pending and refunded transactions with gateway fees separated out, so net settlement is always visible."
        breadcrumbs={[{ label: "Finance" }, { label: "Payments" }]}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Export ledger
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Gross captured" value={money(gross)} hint={`${number(captured.length)} transactions`} />
        <Stat
          label="Gateway fees"
          value={money(fees)}
          hint={gross > 0 ? percent((fees / gross) * 100, 2) + " of gross" : undefined}
        />
        <Stat label="Net settled" value={money(net)} hint="After fees" />
        <Stat label="Refunded" value={money(refunded)} hint={`${number(db.refunds.length)} refunds`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  {["Reference", "Order", "Method", "Gateway", "Status", "Amount", "Fee", "Net", "Date"].map(
                    (header, index) => (
                      <th
                        key={header}
                        className={
                          index >= 5
                            ? "whitespace-nowrap px-4 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                            : "whitespace-nowrap px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                        }
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.slice(0, 40).map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/50">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-ink-muted">{payment.reference}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/orders/${payment.orderId}`} className="text-ink hover:text-primary">
                        #{payment.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 uppercase text-ink-muted">{payment.method}</td>
                    <td className="px-4 py-2.5 text-ink-muted">{titleCase(payment.gateway)}</td>
                    <td className="px-4 py-2.5">
                      <Badge
                        tone={
                          payment.status === "captured"
                            ? "success"
                            : payment.status === "failed"
                              ? "danger"
                              : payment.status === "refunded"
                                ? "danger"
                                : "warning"
                        }
                        size="xs"
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-ink">
                      {money(payment.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-muted">{money(payment.fee)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{money(payment.netAmount)}</td>
                    <td className="px-4 py-2.5 text-right text-ink-muted">{formatDate(payment.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Volume by method</h2>
            <RankedBars rows={byMethod} format="moneyShort" color={SERIES[0]} />
          </Card>

          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Transactions by gateway</h2>
            <RankedBars rows={byGateway} format="number" color={SERIES[2]} />
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Recent refunds</h2>
            </div>
            <ul className="divide-y divide-line">
              {db.refunds.slice(0, 6).map((refund) => (
                <li key={refund.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-[12px]">
                  <div className="min-w-0">
                    <Link href={`/admin/orders/${refund.orderId}`} className="text-ink hover:text-primary">
                      #{refund.orderNumber}
                    </Link>
                    <p className="truncate text-[11px] text-ink-muted">{refund.reason}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium tabular-nums text-ink">{money(refund.amount)}</p>
                    <Badge tone={refund.status === "completed" ? "success" : "warning"} size="xs">
                      {refund.status}
                    </Badge>
                  </div>
                </li>
              ))}
              {db.refunds.length === 0 && (
                <li className="px-5 py-8 text-center text-[12px] text-ink-muted">No refunds issued.</li>
              )}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
