import type { Metadata } from "next";
import Link from "next/link";
import { Ban, Eye, Flag, ShieldAlert, ShieldCheck } from "lucide-react";
import { listAllStores, listStoreDatabases } from "@obsidian/data";
import { Badge, Card, Progress, Stat, Switch, Table, TBody, TD, TH, THead, TR } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, RankedBars, SERIES } from "@/components/admin/charts";
import { NOW, money, number, percent, relativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Risk" };

/**
 * Rules are ordered by how aggressively they act. Anything that blocks a real
 * order needs a much higher bar than something that merely flags for review,
 * so the action column is the first thing an operator should read.
 */
const RULES = [
  {
    id: "r_velocity",
    name: "Card velocity",
    detail: "More than 4 distinct cards from one device in 30 minutes",
    action: "block" as const,
    enabled: true,
    triggered30d: 41,
    falsePositives: 2,
  },
  {
    id: "r_mismatch",
    name: "Billing / shipping mismatch on high value",
    detail: "Different states and order above ₹50,000",
    action: "review" as const,
    enabled: true,
    triggered30d: 128,
    falsePositives: 37,
  },
  {
    id: "r_firstorder",
    name: "First order, express, high value",
    detail: "New account, same-day delivery, above ₹75,000",
    action: "review" as const,
    enabled: true,
    triggered30d: 64,
    falsePositives: 19,
  },
  {
    id: "r_reship",
    name: "Known reshipper address",
    detail: "Delivery address matches a freight-forwarding list",
    action: "block" as const,
    enabled: true,
    triggered30d: 17,
    falsePositives: 0,
  },
  {
    id: "r_refund",
    name: "Serial refunder",
    detail: "More than 5 refunds in 90 days on one account",
    action: "flag" as const,
    enabled: true,
    triggered30d: 23,
    falsePositives: 4,
  },
  {
    id: "r_bin",
    name: "High-risk card BIN",
    detail: "Issuing bank on the platform watchlist",
    action: "review" as const,
    enabled: false,
    triggered30d: 0,
    falsePositives: 0,
  },
];

export default function PlatformRiskPage() {
  const stores = listAllStores();
  const seeded = listStoreDatabases();
  const storeName = new Map(stores.map((s) => [s.id, s.name]));

  // Signals hang off real orders, so an operator can open the order behind any
  // one of them rather than looking at an abstract score.
  const signals = seeded
    .flatMap((db) =>
      db.orders
        .filter((o) => o.total > 50_000_00 || o.paymentStatus === "failed")
        .slice(0, 5)
        .map((order, index) => {
          const rule = RULES[(order.orderNumber.charCodeAt(5) + index) % RULES.length]!;
          const score = 40 + ((order.orderNumber.charCodeAt(7) + index * 13) % 58);
          return {
            id: `sig_${order.id}`,
            storeId: db.store.id,
            storeName: storeName.get(db.store.id) ?? db.store.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            amount: order.total,
            rule: rule.name,
            action: rule.action,
            score,
            // Spread across the window using the order number too — keying on
            // the slice index alone stamped every tenant's first signal "just now".
            at: new Date(
              NOW.getTime() -
                (((order.orderNumber.charCodeAt(8) * 7 + index * 23) % 68) + 1) * 3_600_000,
            ).toISOString(),
            outcome:
              score > 85 ? ("blocked" as const) : score > 65 ? ("review" as const) : ("released" as const),
          };
        }),
    )
    .sort((a, b) => b.score - a.score);

  const blocked = signals.filter((s) => s.outcome === "blocked");
  const inReview = signals.filter((s) => s.outcome === "review");
  const enabled = RULES.filter((r) => r.enabled);
  const triggered = RULES.reduce((n, r) => n + r.triggered30d, 0);
  const falsePositives = RULES.reduce((n, r) => n + r.falsePositives, 0);

  return (
    <>
      <AdminPageHeader
        title="Risk"
        description="Fraud rules and the signals they produce. Every rule shows its own false-positive count, because a rule that blocks good orders costs more than the fraud it prevents."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active rules" value={number(enabled.length)} hint={`${RULES.length} configured`} />
        <Stat label="Triggered (30d)" value={number(triggered)} />
        <Stat
          label="False positives"
          value={percent((falsePositives / Math.max(1, triggered)) * 100)}
          hint={`${number(falsePositives)} of ${number(triggered)}`}
          invertDelta
        />
        <Stat label="Awaiting review" value={number(inReview.length)} hint={`${blocked.length} blocked`} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card padded={false}>
            <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
              <Flag className="h-3.5 w-3.5 text-ink-muted" />
              <h2 className="text-[12.5px] font-semibold text-ink">Recent signals</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <TR>
                    <TH>Order</TH>
                    <TH>Tenant</TH>
                    <TH>Rule</TH>
                    <TH align="right">Amount</TH>
                    <TH align="right">Score</TH>
                    <TH>Outcome</TH>
                    <TH align="right">When</TH>
                  </TR>
                </THead>
                <TBody>
                  {signals.slice(0, 18).map((signal) => (
                    <TR key={signal.id}>
                      <TD>
                        <span className="block font-medium text-ink">{signal.orderNumber}</span>
                        <span className="mt-0.5 block text-[11px] text-ink-muted">{signal.customerName}</span>
                      </TD>
                      <TD>
                        <Link
                          href={`/platform/stores/${signal.storeId}`}
                          className="text-ink hover:text-primary hover:underline"
                        >
                          {signal.storeName}
                        </Link>
                      </TD>
                      <TD className="text-ink-muted">{signal.rule}</TD>
                      <TD align="right" className="tabular-nums text-ink">
                        {money(signal.amount)}
                      </TD>
                      <TD align="right">
                        <span
                          className={
                            signal.score > 85
                              ? "font-medium tabular-nums text-danger"
                              : signal.score > 65
                                ? "font-medium tabular-nums text-warning"
                                : "tabular-nums text-ink-muted"
                          }
                        >
                          {signal.score}
                        </span>
                      </TD>
                      <TD>
                        <Badge
                          tone={
                            signal.outcome === "blocked"
                              ? "danger"
                              : signal.outcome === "review"
                                ? "warning"
                                : "success"
                          }
                          size="xs"
                        >
                          {signal.outcome}
                        </Badge>
                      </TD>
                      <TD align="right" className="whitespace-nowrap text-ink-muted">
                        {relativeTime(signal.at)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Rules</h2>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                Evaluated in order. The most severe action any rule returns is the one applied.
              </p>
            </div>
            <ul className="divide-y divide-line">
              {RULES.map((rule) => {
                const fpRate = (rule.falsePositives / Math.max(1, rule.triggered30d)) * 100;
                return (
                  <li key={rule.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink">
                          {rule.name}
                          <Badge
                            tone={
                              rule.action === "block" ? "danger" : rule.action === "review" ? "warning" : "neutral"
                            }
                            size="xs"
                          >
                            <span className="flex items-center gap-1">
                              {rule.action === "block" ? (
                                <Ban className="h-3 w-3" />
                              ) : rule.action === "review" ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <Flag className="h-3 w-3" />
                              )}
                              {rule.action}
                            </span>
                          </Badge>
                        </p>
                        <p className="mt-1 text-[12px] text-ink-muted">{rule.detail}</p>
                        {rule.triggered30d > 0 && (
                          <p className="mt-2 text-[11.5px] text-ink-muted">
                            {number(rule.triggered30d)} triggers in 30 days ·{" "}
                            <span className={fpRate > 25 ? "text-danger" : "text-ink-muted"}>
                              {percent(fpRate)} false positive
                            </span>
                          </p>
                        )}
                      </div>
                      <Switch aria-label={`Enable ${rule.name}`} defaultChecked={rule.enabled} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <aside className="space-y-4">
          <ChartFrame title="Triggers by rule" description="Last 30 days" height={240}>
            <RankedBars
              rows={RULES.filter((r) => r.triggered30d > 0).map((r) => ({
                label: r.name,
                value: r.triggered30d,
              }))}
              format="number"
              color={SERIES[1]}
            />
          </ChartFrame>

          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <ShieldAlert className="h-3.5 w-3.5" />
              False-positive cost
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              The mismatch rule accounts for most of the review queue and rejects nearly a third of genuine orders it
              touches. Tightening its threshold would cut manual review substantially with little fraud exposure.
            </p>
            <ul className="mt-4 space-y-3">
              {RULES.filter((r) => r.triggered30d > 0).map((rule) => {
                const fpRate = (rule.falsePositives / Math.max(1, rule.triggered30d)) * 100;
                return (
                  <li key={rule.id}>
                    <div className="flex items-baseline justify-between gap-3 text-[11.5px]">
                      <span className="min-w-0 truncate text-ink">{rule.name}</span>
                      <span className="shrink-0 tabular-nums text-ink-muted">{percent(fpRate)}</span>
                    </div>
                    <Progress
                      className="mt-1.5"
                      value={fpRate}
                      tone={fpRate > 25 ? "danger" : fpRate > 12 ? "warning" : "success"}
                      height={4}
                    />
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card tone="muted">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
              <ShieldCheck className="h-3.5 w-3.5" />
              Escalation
            </h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              A blocked order is never silently dropped. The shopper sees a generic decline, the merchant sees the
              rule that fired, and the signal lands here — so a mistake is visible to someone who can reverse it
              within minutes.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
