import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Download, Scale } from "lucide-react";
import { Badge, Card, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { NOW, formatDate, money, moneyShort, number, percent } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Reconciliation" };

const GATEWAY_FEE_BPS = 200; // 2% — what the gateway keeps

export default async function ReconciliationPage() {
  const db = await currentStore();

  // Settlement batches: what the gateway says it sent us, matched against the
  // orders we think it covers. The whole job is finding the rows that disagree.
  const captured = db.payments
    .filter((p) => p.status === "captured")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const day = 86_400_000;
  const batches = Array.from({ length: 6 }, (_, index) => {
    const start = NOW.getTime() - (index + 1) * 2 * day;
    const end = start + 2 * day;
    const payments = captured.filter((p) => {
      const at = Date.parse(p.createdAt);
      return at >= start && at < end;
    });

    const gross = payments.reduce((n, p) => n + p.amount, 0);
    const fees = Math.round((gross * GATEWAY_FEE_BPS) / 10_000 / 100) * 100;
    const refunds = db.refunds
      .filter((r) => {
        const at = Date.parse(r.createdAt);
        return at >= start && at < end;
      })
      .reduce((n, r) => n + r.amount, 0);

    const expected = gross - fees - refunds;
    // Two batches carry a deliberate variance so the matching work is visible.
    const variance = index === 1 ? -118_900 : index === 4 ? 46_500 : 0;

    return {
      id: `stl_${index}`,
      reference: `SETL-${String(2418 - index).padStart(6, "0")}`,
      periodStart: new Date(start).toISOString(),
      periodEnd: new Date(end).toISOString(),
      settledAt: new Date(end + day).toISOString(),
      count: payments.length,
      gross,
      fees,
      refunds,
      expected,
      received: expected + variance,
      variance,
    };
  });

  const unmatched = batches.filter((b) => b.variance !== 0);
  const totalVariance = unmatched.reduce((n, b) => n + b.variance, 0);
  const totalReceived = batches.reduce((n, b) => n + b.received, 0);
  const totalFees = batches.reduce((n, b) => n + b.fees, 0);

  const exceptions = [
    {
      reference: batches[1]!.reference,
      kind: "Refund settled in a later batch",
      detail: "A refund issued on the last day of the window cleared after the cut-off.",
      amount: -118_900,
      action: "Carries into the next batch. No action needed.",
      severity: "info" as const,
    },
    {
      reference: batches[4]!.reference,
      kind: "Chargeback reversal credited",
      detail: "A dispute won in a prior period was credited back into this settlement.",
      amount: 46_500,
      action: "Match against the dispute record and close.",
      severity: "info" as const,
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Reconciliation"
        description="What the gateway settled against what the order book says it owed. A batch that matches to the rupee needs no attention; the two that do not are the entire job."
        breadcrumbs={[{ label: "Finance" }, { label: "Reconciliation" }]}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Export statement
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Settled" value={money(totalReceived)} hint={`${batches.length} batches`} />
        <Stat label="Gateway fees" value={money(totalFees)} hint={percent(GATEWAY_FEE_BPS / 100, 2)} />
        <Stat
          label="Unmatched"
          value={number(unmatched.length)}
          hint={`${money(Math.abs(totalVariance))} in variance`}
          invertDelta
        />
        <Stat
          label="Match rate"
          value={percent(((batches.length - unmatched.length) / Math.max(1, batches.length)) * 100)}
        />
      </div>

      {unmatched.length > 0 ? (
        <Card className="mt-5 border-warning/40 bg-warning/[0.05]" padded={false}>
          <div className="flex items-center gap-2 border-b border-warning/25 px-5 py-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-[12.5px] font-semibold text-ink">
              {unmatched.length} batch{unmatched.length === 1 ? "" : "es"} do not balance
            </h2>
          </div>
          <ul className="divide-y divide-warning/15">
            {exceptions.map((exception) => (
              <li key={exception.reference} className="px-5 py-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-[12.5px] font-medium text-ink">
                    {exception.reference} · {exception.kind}
                  </p>
                  <p
                    className={
                      exception.amount < 0
                        ? "shrink-0 text-[12.5px] font-medium tabular-nums text-danger"
                        : "shrink-0 text-[12.5px] font-medium tabular-nums text-success"
                    }
                  >
                    {exception.amount < 0 ? "−" : "+"}
                    {money(Math.abs(exception.amount))}
                  </p>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{exception.detail}</p>
                <p className="mt-1 text-[11.5px] text-ink-muted">{exception.action}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card className="mt-5 border-success/35 bg-success/[0.04]">
          <p className="flex items-center gap-2 text-[12.5px] text-ink">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Every batch balances to the rupee.
          </p>
        </Card>
      )}

      <Card className="mt-5" padded={false}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
          <Scale className="h-3.5 w-3.5 text-ink-muted" />
          <h2 className="text-[12.5px] font-semibold text-ink">Settlement batches</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH>Reference</TH>
                <TH>Period</TH>
                <TH align="right">Payments</TH>
                <TH align="right">Gross</TH>
                <TH align="right">Fees</TH>
                <TH align="right">Refunds</TH>
                <TH align="right">Expected</TH>
                <TH align="right">Received</TH>
                <TH align="right">Variance</TH>
              </TR>
            </THead>
            <TBody>
              {batches.map((batch) => (
                <TR key={batch.id}>
                  <TD>
                    <code className="text-[12px] font-medium text-ink">{batch.reference}</code>
                    <span className="mt-0.5 block text-[11px] text-ink-muted">
                      settled {formatDate(batch.settledAt)}
                    </span>
                  </TD>
                  <TD className="whitespace-nowrap text-ink-muted">
                    {formatDate(batch.periodStart)} – {formatDate(batch.periodEnd)}
                  </TD>
                  <TD align="right" className="tabular-nums text-ink-muted">
                    {number(batch.count)}
                  </TD>
                  <TD align="right" className="tabular-nums text-ink-muted">
                    {moneyShort(batch.gross)}
                  </TD>
                  <TD align="right" className="tabular-nums text-ink-muted">
                    −{moneyShort(batch.fees)}
                  </TD>
                  <TD align="right" className="tabular-nums text-ink-muted">
                    {batch.refunds ? `−${moneyShort(batch.refunds)}` : "—"}
                  </TD>
                  <TD align="right" className="tabular-nums text-ink-muted">
                    {money(batch.expected)}
                  </TD>
                  <TD align="right" className="font-medium tabular-nums text-ink">
                    {money(batch.received)}
                  </TD>
                  <TD align="right">
                    {batch.variance === 0 ? (
                      <Badge tone="success" size="xs">
                        Matched
                      </Badge>
                    ) : (
                      <span
                        className={
                          batch.variance < 0
                            ? "font-medium tabular-nums text-danger"
                            : "font-medium tabular-nums text-warning"
                        }
                      >
                        {batch.variance < 0 ? "−" : "+"}
                        {money(Math.abs(batch.variance))}
                      </span>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
        <p className="border-t border-line px-5 py-3.5 text-[11.5px] leading-relaxed text-ink-muted">
          Expected is gross captured less gateway fees and refunds in the window. A variance is almost always timing
          — a refund or dispute landing either side of the cut-off — and resolves itself in the next batch. A
          variance that persists across two batches is the one to escalate.
        </p>
      </Card>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-[12.5px] font-semibold text-ink">How matching works</h2>
          <ol className="mt-3 space-y-1.5 text-[12px] leading-relaxed text-ink-muted">
            <li>1. Pull the gateway statement for the window</li>
            <li>2. Sum captured payments against the same window from the order book</li>
            <li>3. Subtract the fee at the contracted rate, not the one on the invoice</li>
            <li>4. Subtract refunds that cleared inside the window</li>
            <li>5. Anything left over is a genuine exception</li>
          </ol>
        </Card>

        <Card tone="muted">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Fee check</h2>
          <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
            Fees are recomputed from the contracted basis points rather than trusted from the statement. It is the
            cheapest control in finance and it catches the most expensive mistake — a rate that quietly changed at
            renewal.
          </p>
          <p className="mt-3 text-[12px] text-ink-muted">
            Contracted rate: <span className="font-medium text-ink">{percent(GATEWAY_FEE_BPS / 100, 2)}</span> ·
            charged this period:{" "}
            <span className="font-medium text-ink">
              {percent((totalFees / Math.max(1, batches.reduce((n, b) => n + b.gross, 0))) * 100, 2)}
            </span>
          </p>
          <Link
            href="/admin/finance/payments"
            className="mt-3 inline-block text-[12px] font-medium text-primary underline-offset-2 hover:underline"
          >
            Open the payment log
          </Link>
        </Card>
      </div>
    </>
  );
}
