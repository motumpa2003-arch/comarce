import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Gavel, ShieldAlert } from "lucide-react";
import { listAllStores, listStoreDatabases } from "@obsidian/data";
import { Badge, Card, Progress, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, RankedBars, SERIES } from "@/components/admin/charts";
import { NOW, daysBetween, formatDate, money, number, percent, relativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Disputes" };

const REASONS = [
  "Item not received",
  "Item not as described",
  "Unauthorised transaction",
  "Duplicate charge",
  "Credit not processed",
  "Subscription cancelled",
] as const;

const STAGES = ["evidence_due", "under_review", "won", "lost"] as const;

export default function PlatformDisputesPage() {
  const stores = listAllStores();
  const seeded = listStoreDatabases();

  // Disputes are raised against real seeded orders so every row opens onto
  // something a reviewer can actually inspect.
  const disputes = seeded
    .flatMap((db) =>
      db.orders
        .filter((o) => ["delivered", "refunded", "cancelled"].includes(o.status))
        .slice(0, 4)
        .map((order, index) => {
          const openedDays = 3 + ((index * 7) % 46);
          const stage = STAGES[(order.orderNumber.charCodeAt(4) + index) % STAGES.length]!;
          return {
            id: `dsp_${order.id}`,
            storeId: db.store.id,
            storeName: db.store.name,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            amount: order.total,
            reason: REASONS[(order.orderNumber.charCodeAt(6) + index) % REASONS.length]!,
            stage,
            network: order.paymentMethod === "card" ? "Card network" : "UPI mandate",
            openedAt: new Date(NOW.getTime() - openedDays * 86_400_000).toISOString(),
            evidenceDueAt: new Date(NOW.getTime() + (14 - openedDays) * 86_400_000).toISOString(),
          };
        }),
    )
    .sort((a, b) => Date.parse(b.openedAt) - Date.parse(a.openedAt));

  const open = disputes.filter((d) => d.stage === "evidence_due" || d.stage === "under_review");
  const won = disputes.filter((d) => d.stage === "won");
  const lost = disputes.filter((d) => d.stage === "lost");
  const atRisk = open.reduce((n, d) => n + d.amount, 0);
  const winRate = (won.length / Math.max(1, won.length + lost.length)) * 100;

  const urgent = open
    .filter((d) => d.stage === "evidence_due")
    .sort((a, b) => Date.parse(a.evidenceDueAt) - Date.parse(b.evidenceDueAt));

  const byReason = Object.entries(
    disputes.reduce<Record<string, number>>((acc, d) => {
      acc[d.reason] = (acc[d.reason] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const storeGmv = new Map(stores.map((s) => [s.id, s.metrics.gmv]));

  return (
    <>
      <AdminPageHeader
        title="Disputes"
        description="Chargebacks and payment disputes across every tenant. Evidence has a hard deadline set by the network — miss it and the dispute is lost regardless of merit."
      />

      {urgent.length > 0 && (
        <Card className="mb-5 border-danger/40 bg-danger/[0.04]" padded={false}>
          <div className="flex items-center gap-2 border-b border-danger/25 px-5 py-3">
            <Clock className="h-4 w-4 text-danger" />
            <h2 className="text-[12.5px] font-semibold text-danger">
              {urgent.length} dispute{urgent.length === 1 ? "" : "s"} need evidence
            </h2>
          </div>
          <ul className="divide-y divide-danger/15">
            {urgent.slice(0, 5).map((dispute) => {
              const days = daysBetween(dispute.evidenceDueAt);
              return (
                <li key={dispute.id} className="flex flex-wrap items-center gap-4 px-5 py-3 text-[12.5px]">
                  <Link
                    href={`/platform/stores/${dispute.storeId}`}
                    className="min-w-0 flex-1 truncate font-medium text-ink hover:text-primary"
                  >
                    {dispute.storeName}
                  </Link>
                  <span className="shrink-0 text-ink-muted">{dispute.orderNumber}</span>
                  <span className="shrink-0 tabular-nums text-ink">{money(dispute.amount)}</span>
                  <span className={days <= 3 ? "shrink-0 font-medium text-danger" : "shrink-0 text-ink-muted"}>
                    due {relativeTime(dispute.evidenceDueAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open" value={number(open.length)} hint={`${number(disputes.length)} all time`} />
        <Stat label="At risk" value={money(atRisk)} />
        <Stat label="Win rate" value={percent(winRate)} hint={`${won.length} won, ${lost.length} lost`} />
        <Stat
          label="Dispute rate"
          value={percent((disputes.length / Math.max(1, seeded.reduce((n, d) => n + d.orders.length, 0))) * 100, 2)}
          hint="Of all orders"
          invertDelta
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <Gavel className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">All disputes</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Tenant</TH>
                  <TH>Order</TH>
                  <TH>Reason</TH>
                  <TH align="right">Amount</TH>
                  <TH>Stage</TH>
                  <TH align="right">Opened</TH>
                  <TH align="right">Evidence due</TH>
                </TR>
              </THead>
              <TBody>
                {disputes.slice(0, 24).map((dispute) => (
                  <TR key={dispute.id}>
                    <TD>
                      <Link
                        href={`/platform/stores/${dispute.storeId}`}
                        className="font-medium text-ink hover:text-primary hover:underline"
                      >
                        {dispute.storeName}
                      </Link>
                      <span className="mt-0.5 block text-[11px] text-ink-muted">{dispute.network}</span>
                    </TD>
                    <TD className="text-ink-muted">
                      {dispute.orderNumber}
                      <span className="mt-0.5 block text-[11px]">{dispute.customerName}</span>
                    </TD>
                    <TD className="text-ink-muted">{dispute.reason}</TD>
                    <TD align="right" className="font-medium tabular-nums text-ink">
                      {money(dispute.amount)}
                    </TD>
                    <TD>
                      <Badge
                        tone={
                          dispute.stage === "won"
                            ? "success"
                            : dispute.stage === "lost"
                              ? "danger"
                              : dispute.stage === "evidence_due"
                                ? "warning"
                                : "info"
                        }
                        size="xs"
                      >
                        {dispute.stage.replace("_", " ")}
                      </Badge>
                    </TD>
                    <TD align="right" className="whitespace-nowrap text-ink-muted">
                      {formatDate(dispute.openedAt)}
                    </TD>
                    <TD align="right" className="whitespace-nowrap text-ink-muted">
                      {dispute.stage === "won" || dispute.stage === "lost"
                        ? "—"
                        : relativeTime(dispute.evidenceDueAt)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <p className="border-t border-line px-5 py-3 text-[11.5px] text-ink-muted">
            Showing the 24 most recent of {number(disputes.length)}.
          </p>
        </Card>

        <aside className="space-y-4">
          <ChartFrame title="By reason" description="All disputes" height={240}>
            <RankedBars rows={byReason} format="number" color={SERIES[1]} />
          </ChartFrame>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Dispute rate by tenant</h2>
            <p className="mt-1 text-[11.5px] text-ink-muted">
              Above 0.75% a payment network puts the account into a monitoring programme.
            </p>
            <ul className="mt-4 space-y-3">
              {seeded.map((db) => {
                const count = disputes.filter((d) => d.storeId === db.store.id).length;
                const rate = (count / Math.max(1, db.orders.length)) * 100;
                return (
                  <li key={db.store.id}>
                    <div className="flex items-baseline justify-between gap-3 text-[12px]">
                      <span className="min-w-0 truncate text-ink">{db.store.name}</span>
                      <span className="shrink-0 tabular-nums text-ink-muted">{percent(rate, 2)}</span>
                    </div>
                    <Progress
                      className="mt-1.5"
                      value={Math.min(100, (rate / 1.5) * 100)}
                      tone={rate > 0.75 ? "danger" : rate > 0.4 ? "warning" : "success"}
                      height={4}
                    />
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card tone="muted">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
              <ShieldAlert className="h-3.5 w-3.5" />
              Evidence that wins
            </h2>
            <ul className="mt-2.5 space-y-1.5 text-[12px] text-ink-muted">
              <li>· Delivery confirmation with a signature or photo</li>
              <li>· AVS and CVV match from the original authorisation</li>
              <li>· The customer&rsquo;s own messages acknowledging receipt</li>
              <li>· Prior undisputed orders to the same address</li>
              <li>· The refund policy as shown at the time of purchase</li>
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
