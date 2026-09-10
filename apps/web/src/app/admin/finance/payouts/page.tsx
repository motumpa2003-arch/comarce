import type { Metadata } from "next";
import { Banknote, Download, Landmark } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Payouts" };

export default async function AdminPayoutsPage() {
  const db = await currentStore();

  // Weekly settlement batches, derived from the captured payments ledger.
  const captured = db.payments.filter((p) => p.status === "captured");
  const byWeek = new Map<string, { gross: number; fees: number; net: number; count: number }>();

  for (const payment of captured) {
    const date = new Date(payment.createdAt);
    const monday = new Date(date);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    const entry = byWeek.get(key) ?? { gross: 0, fees: 0, net: 0, count: 0 };
    entry.gross += payment.amount;
    entry.fees += payment.fee;
    entry.net += payment.netAmount;
    entry.count += 1;
    byWeek.set(key, entry);
  }

  const batches = [...byWeek.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12)
    .map(([week, totals], index) => ({
      week,
      ...totals,
      status: index === 0 ? "pending" : index === 1 ? "in_transit" : "settled",
      reference: `PO-${week.replace(/-/g, "")}`,
    }));

  const pending = batches.filter((b) => b.status !== "settled").reduce((n, b) => n + b.net, 0);
  const settled = batches.filter((b) => b.status === "settled").reduce((n, b) => n + b.net, 0);

  return (
    <>
      <AdminPageHeader
        title="Payouts"
        description="Settlement batches from the payment gateway. Each batch nets gateway fees off gross capture for the week."
        breadcrumbs={[{ label: "Finance" }, { label: "Payouts" }]}
        actions={
          <button type="button" className={buttonClasses("outline", "sm")}>
            <Download className="h-3.5 w-3.5" />
            Download statements
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pending settlement" value={money(pending)} hint="Next two cycles" />
        <Stat label="Settled to date" value={money(settled)} hint={`${number(batches.length)} batches`} />
        <Stat
          label="Fees withheld"
          value={money(batches.reduce((n, b) => n + b.fees, 0))}
          hint="Gateway charges"
        />
        <Stat label="Payout cycle" value="Weekly" hint="Every Monday, T+2" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Settlement batches</h2>
          </div>
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-muted/50">
              <tr>
                {["Reference", "Week starting", "Transactions", "Gross", "Fees", "Net payout", "Status"].map(
                  (header, index) => (
                    <th
                      key={header}
                      className={
                        index >= 2
                          ? "whitespace-nowrap px-5 py-2.5 text-right text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                          : "whitespace-nowrap px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                      }
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {batches.map((batch) => (
                <tr key={batch.week} className="hover:bg-muted/50">
                  <td className="px-5 py-3 font-mono text-[11px] text-ink">{batch.reference}</td>
                  <td className="px-5 py-3 text-ink-muted">{formatDate(batch.week)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink-muted">{number(batch.count)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink-muted">{money(batch.gross)}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-ink-muted">− {money(batch.fees)}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums text-ink">{money(batch.net)}</td>
                  <td className="px-5 py-3 text-right">
                    <Badge
                      tone={
                        batch.status === "settled" ? "success" : batch.status === "in_transit" ? "progress" : "warning"
                      }
                      size="xs"
                    >
                      {batch.status.replace("_", " ")}
                    </Badge>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-ink-muted">
                    No settlements yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <aside className="space-y-4">
          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Landmark className="h-3.5 w-3.5" />
              Bank account
            </h2>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Account name</dt>
                <dd className="truncate text-ink">{db.store.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Account</dt>
                <dd className="font-mono text-ink">•••• 4821</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">IFSC</dt>
                <dd className="font-mono text-ink">HDFC0001234</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Verified</dt>
                <dd>
                  <Badge tone="success" size="xs">
                    Yes
                  </Badge>
                </dd>
              </div>
            </dl>
            <button type="button" className={buttonClasses("outline", "xs", true, "mt-4")}>
              Change account
            </button>
          </Card>

          <Card tone="muted">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
              <Banknote className="h-3.5 w-3.5 text-accent" />
              How payouts work
            </h2>
            <ul className="mt-3 space-y-1.5 text-[12px] text-ink-muted">
              <li>· Captured payments are batched Monday to Sunday</li>
              <li>· The batch is initiated the following Monday</li>
              <li>· Funds land in two working days (T+2)</li>
              <li>· Gateway fees and refunds are netted off first</li>
              <li>· COD collections settle on a separate 15-day cycle</li>
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
