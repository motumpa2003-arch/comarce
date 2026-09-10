import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RETURN_REASON_LABELS, RETURN_STATUS_META } from "@obsidian/commerce";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { money, number, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Returns" };

export default async function AdminReturnsPage() {
  const db = await currentStore();
  const open = db.returns.filter((r) => !["completed", "rejected"].includes(r.status));
  const refundValue = db.returns.reduce((n, r) => n + r.refundAmount, 0);

  const reasonCounts = Object.keys(RETURN_REASON_LABELS)
    .map((reason) => ({
      label: RETURN_REASON_LABELS[reason]!,
      value: db.returns.filter((r) => r.reason === reason).length,
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);

  const returnRate = db.orders.length
    ? ((db.returns.length / db.orders.length) * 100).toFixed(1)
    : "0.0";

  return (
    <>
      <AdminPageHeader
        title="Returns"
        description="Every return moves through request → approval → pickup → quality check → refund. Approving one restocks the units and writes an inventory movement."
        breadcrumbs={[{ label: "Orders" }, { label: "Returns" }]}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open returns" value={number(open.length)} hint="Awaiting a decision or pickup" />
        <Stat label="Total returns" value={number(db.returns.length)} hint={`${returnRate}% of orders`} />
        <Stat label="Refund exposure" value={money(refundValue)} hint="If all are approved" />
        <Stat
          label="Exchanges requested"
          value={number(db.returns.filter((r) => r.resolution === "exchange").length)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card padded={false}>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Return queue</h2>
            <span className="text-[11.5px] text-ink-muted">{db.returns.length} requests</span>
          </div>
          <ul className="divide-y divide-line">
            {db.returns.map((request) => {
              const meta = RETURN_STATUS_META[request.status];
              return (
                <li key={request.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-ink">
                        <Link href={`/admin/orders/${request.orderId}`} className="hover:text-primary">
                          #{request.orderNumber}
                        </Link>
                        <Badge tone={meta.tone} size="xs">
                          {meta.label}
                        </Badge>
                        <Badge tone="outline" size="xs" className="capitalize">
                          {request.resolution.replace("_", " ")}
                        </Badge>
                      </p>
                      <p className="mt-1 text-[11.5px] text-ink-muted">
                        {request.customerName} · {RETURN_REASON_LABELS[request.reason]} ·{" "}
                        {relativeTime(request.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <p className="text-[13px] font-medium tabular-nums text-ink">{money(request.refundAmount)}</p>
                      {request.status === "requested" && (
                        <>
                          <button type="button" className={buttonClasses("primary", "xs")}>
                            Approve
                          </button>
                          <button type="button" className={buttonClasses("ghost", "xs", false, "text-danger")}>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-3">
                    {request.items.map((item) => (
                      <li key={item.orderItemId} className="flex items-center gap-2.5">
                        <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-[3px] bg-muted">
                          {item.image && <Image src={item.image} alt="" fill sizes="36px" className="object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-[11.5px] text-ink">{item.name}</p>
                          <p className="text-[11px] text-ink-muted">
                            ×{item.quantity} · {money(item.amount)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {request.comment && (
                    <p className="mt-3 rounded-[var(--radius-sm)] bg-muted px-3 py-2 text-[11.5px] italic text-ink-muted">
                      “{request.comment}”
                    </p>
                  )}

                  <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {request.timeline.map((step) => (
                      <li key={step.status} className="flex items-center gap-1.5 text-[10.5px] text-ink-muted">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {step.label}
                      </li>
                    ))}
                  </ol>
                </li>
              );
            })}
            {db.returns.length === 0 && (
              <li className="px-5 py-12 text-center text-[12.5px] text-ink-muted">
                No returns raised. That is the ideal state.
              </li>
            )}
          </ul>
        </Card>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Why customers return</h2>
            <RankedBars rows={reasonCounts} format="number" color={SERIES[1]} />
          </Card>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Resolution mix</h2>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              {(["refund", "exchange", "store_credit"] as const).map((resolution) => (
                <div key={resolution} className="flex items-baseline justify-between gap-3">
                  <dt className="capitalize text-ink-muted">{resolution.replace("_", " ")}</dt>
                  <dd className="tabular-nums text-ink">
                    {number(db.returns.filter((r) => r.resolution === resolution).length)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Return policy</h2>
            <ul className="mt-2.5 space-y-1.5 text-[12px] text-ink-muted">
              <li>· 30 days from delivery, 60 for Gold and Black tiers</li>
              <li>· Free pickup in serviceable pincodes</li>
              <li>· Refund on the original method in 5–7 working days</li>
              <li>· Store credit is instant, with a 5% bonus</li>
            </ul>
            <Link href="/admin/settings" className={buttonClasses("outline", "xs", true, "mt-4")}>
              Edit policy
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
