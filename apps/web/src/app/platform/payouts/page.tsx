import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Banknote, Download, PauseCircle } from "lucide-react";
import { getPlans, listAllStores, listStoreDatabases } from "@obsidian/data";
import { Badge, Card, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, RankedBars, SERIES } from "@/components/admin/charts";
import { NOW, formatDate, money, moneyShort, number, relativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Payouts" };

const CYCLE_DAYS = 7;

export default function PlatformPayoutsPage() {
  const stores = listAllStores();
  const plans = getPlans();
  const seeded = listStoreDatabases();

  const feeByPlan = new Map(plans.map((p) => [p.id, p.transactionFeeBps]));
  const planOf = new Map(stores.map((s) => [s.id, s.planId]));

  // A payout is settled order value minus the platform fee and any refunds in
  // the window. Orders that have not been delivered are not yet payable — that
  // is the float that makes a marketplace solvent.
  const payouts = seeded.map((db, index) => {
    const bps = feeByPlan.get(planOf.get(db.store.id) ?? "") ?? 0;

    const settled = db.orders.filter((o) => o.status === "delivered");
    const pending = db.orders.filter((o) =>
      ["confirmed", "processing", "packed", "shipped", "out_for_delivery"].includes(o.status),
    );

    const gross = settled.reduce((n, o) => n + o.total, 0);
    const refunds = db.refunds.reduce((n, r) => n + r.amount, 0);
    const fee = Math.round((gross * bps) / 10_000 / 100) * 100;
    const net = Math.max(0, gross - fee - refunds);

    // A store with an open dispute or a suspended status has its payout held.
    const store = stores.find((s) => s.id === db.store.id);
    const held = store?.status === "suspended" || store?.status === "paused";

    return {
      storeId: db.store.id,
      storeName: db.store.name,
      feeBps: bps,
      gross,
      fee,
      refunds,
      net,
      inFloat: pending.reduce((n, o) => n + o.total, 0),
      status: held ? ("held" as const) : index % 4 === 0 ? ("processing" as const) : ("scheduled" as const),
      nextRunAt: new Date(NOW.getTime() + ((index % CYCLE_DAYS) + 1) * 86_400_000).toISOString(),
      lastPaidAt: new Date(NOW.getTime() - (CYCLE_DAYS + (index % 3)) * 86_400_000).toISOString(),
      account: `•••• ${4000 + index * 137}`,
    };
  });

  const held = payouts.filter((p) => p.status === "held");
  const totalNet = payouts.reduce((n, p) => n + p.net, 0);
  const totalFee = payouts.reduce((n, p) => n + p.fee, 0);
  const totalFloat = payouts.reduce((n, p) => n + p.inFloat, 0);

  return (
    <>
      <AdminPageHeader
        title="Payouts"
        description={`Merchants are paid on a ${CYCLE_DAYS}-day cycle for orders that have been delivered. Value from orders still in transit sits in float and is not payable yet.`}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Export settlement file
          </button>
        }
      />

      {held.length > 0 && (
        <Card className="mb-5 border-warning/40 bg-warning/[0.05]" padded={false}>
          <div className="flex items-center gap-2 border-b border-warning/25 px-5 py-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-[12.5px] font-semibold text-ink">
              {held.length} payout{held.length === 1 ? "" : "s"} held · {money(held.reduce((n, p) => n + p.net, 0))}
            </h2>
          </div>
          <ul className="divide-y divide-warning/15">
            {held.map((payout) => (
              <li key={payout.storeId} className="flex flex-wrap items-center gap-4 px-5 py-3 text-[12.5px]">
                <Link
                  href={`/platform/stores/${payout.storeId}`}
                  className="min-w-0 flex-1 truncate font-medium text-ink hover:text-primary"
                >
                  {payout.storeName}
                </Link>
                <span className="shrink-0 tabular-nums text-ink">{money(payout.net)}</span>
                <span className="shrink-0 text-ink-muted">Store not in good standing</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Payable now" value={money(totalNet)} hint={`${number(payouts.length)} merchants`} />
        <Stat label="In float" value={money(totalFloat)} hint="Orders not yet delivered" />
        <Stat label="Fees retained" value={money(totalFee)} />
        <Stat label="Held" value={money(held.reduce((n, p) => n + p.net, 0))} hint={`${held.length} accounts`} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <Banknote className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">Next settlement run</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Merchant</TH>
                  <TH>Account</TH>
                  <TH align="right">Gross</TH>
                  <TH align="right">Fee</TH>
                  <TH align="right">Refunds</TH>
                  <TH align="right">Net</TH>
                  <TH>Status</TH>
                  <TH align="right">Runs</TH>
                </TR>
              </THead>
              <TBody>
                {[...payouts]
                  .sort((a, b) => b.net - a.net)
                  .map((payout) => (
                    <TR key={payout.storeId}>
                      <TD>
                        <Link
                          href={`/platform/stores/${payout.storeId}`}
                          className="font-medium text-ink hover:text-primary hover:underline"
                        >
                          {payout.storeName}
                        </Link>
                        <span className="mt-0.5 block text-[11px] text-ink-muted">
                          {(payout.feeBps / 100).toFixed(2)}% fee
                        </span>
                      </TD>
                      <TD className="tabular-nums text-ink-muted">{payout.account}</TD>
                      <TD align="right" className="tabular-nums text-ink-muted">
                        {moneyShort(payout.gross)}
                      </TD>
                      <TD align="right" className="tabular-nums text-ink-muted">
                        −{moneyShort(payout.fee)}
                      </TD>
                      <TD align="right" className="tabular-nums text-ink-muted">
                        {payout.refunds ? `−${moneyShort(payout.refunds)}` : "—"}
                      </TD>
                      <TD align="right" className="font-medium tabular-nums text-ink">
                        {money(payout.net)}
                      </TD>
                      <TD>
                        <Badge
                          tone={
                            payout.status === "held"
                              ? "warning"
                              : payout.status === "processing"
                                ? "info"
                                : "success"
                          }
                          size="xs"
                        >
                          {payout.status}
                        </Badge>
                      </TD>
                      <TD align="right" className="whitespace-nowrap text-ink-muted">
                        {payout.status === "held" ? "—" : relativeTime(payout.nextRunAt)}
                      </TD>
                    </TR>
                  ))}
              </TBody>
            </Table>
          </div>
          <p className="border-t border-line px-5 py-3.5 text-[11.5px] leading-relaxed text-ink-muted">
            Net is gross settled value less the platform fee and any refunds issued in the window. A negative balance
            carries to the next cycle rather than being clawed back from the merchant&rsquo;s bank.
          </p>
        </Card>

        <aside className="space-y-4">
          <ChartFrame title="Payable by merchant" description="Net, this run" height={220}>
            <RankedBars
              rows={[...payouts]
                .sort((a, b) => b.net - a.net)
                .map((p) => ({ label: p.storeName, value: p.net }))}
              format="moneyShort"
              color={SERIES[0]}
            />
          </ChartFrame>

          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <PauseCircle className="h-3.5 w-3.5" />
              When we hold
            </h2>
            <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-ink-muted">
              <li>· Store suspended or paused</li>
              <li>· Open dispute above ₹50,000</li>
              <li>· Refund rate above 12% in a rolling 30 days</li>
              <li>· Bank account changed in the last 72 hours</li>
              <li>· KYC documents expired</li>
            </ul>
            <p className="mt-3.5 border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-muted">
              A hold is always explained to the merchant in their admin, with the specific rule that triggered it.
              An unexplained hold is how a platform loses a merchant.
            </p>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Last cycle</h2>
            <p className="mt-2.5 text-[12px] text-ink-muted">
              Completed {formatDate(payouts[0]?.lastPaidAt ?? NOW.toISOString())} · {number(payouts.length)}{" "}
              transfers, no failures.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
