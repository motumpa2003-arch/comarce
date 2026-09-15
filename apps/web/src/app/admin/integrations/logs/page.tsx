import type { Metadata } from "next";
import { Badge, Card, Stat } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { IntegrationLogTable, type LogRow } from "@/components/admin/integration-log-table";
import { NOW, number, percent } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Integration logs" };

const SOURCES = ["Razorpay", "Shiprocket", "Postmark", "ClearTax", "Plausible"] as const;
const OPERATIONS: Record<string, string[]> = {
  Razorpay: ["payment.capture", "payment.refund", "settlement.fetch"],
  Shiprocket: ["rate.quote", "shipment.book", "label.print", "tracking.poll"],
  Postmark: ["email.send", "template.render"],
  ClearTax: ["invoice.push", "hsn.validate", "gstr1.export"],
  Plausible: ["event.batch"],
};

/**
 * Deterministic log rows so the page reads the same on every load. Real
 * deployments stream these from the integration gateway.
 */
function buildRows(): LogRow[] {
  const rows: LogRow[] = [];
  let seed = 20260915;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  for (let i = 0; i < 140; i++) {
    const source = SOURCES[Math.floor(next() * SOURCES.length)]!;
    const ops = OPERATIONS[source]!;
    const operation = ops[Math.floor(next() * ops.length)]!;
    const roll = next();
    const failing = source === "ClearTax";
    const ok = failing ? roll > 0.72 : roll > 0.06;
    const status = ok ? 200 : roll > 0.03 ? 422 : 500;
    rows.push({
      id: `log_${i}`,
      source,
      operation,
      direction: operation.includes("poll") || operation.includes("fetch") ? "inbound" : "outbound",
      status,
      durationMs: Math.round(60 + next() * (ok ? 540 : 2400)),
      message: ok
        ? "OK"
        : status === 422
          ? "Validation failed: hsn_code missing on 2 line items"
          : "Upstream timeout after 3 attempts",
      createdAt: new Date(NOW.getTime() - Math.round(next() * 72 * 3_600_000)).toISOString(),
    });
  }
  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export default async function IntegrationLogsPage() {
  await currentStore();
  const rows = buildRows();
  const failed = rows.filter((r) => r.status >= 400);
  const slow = rows.filter((r) => r.durationMs > 1000);
  const p95 = [...rows].sort((a, b) => a.durationMs - b.durationMs)[Math.floor(rows.length * 0.95)];

  return (
    <>
      <AdminPageHeader
        title="Integration logs"
        description="Every call in and out of a connected service over the last 72 hours. A 4xx is our payload; a 5xx is theirs — the distinction decides who you chase."
        breadcrumbs={[{ label: "Integrations", href: "/admin/integrations" }, { label: "Logs" }]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Calls (72h)" value={number(rows.length)} />
        <Stat
          label="Error rate"
          value={percent((failed.length / Math.max(1, rows.length)) * 100, 1)}
          hint={`${number(failed.length)} failed`}
          invertDelta
        />
        <Stat label="Over 1 second" value={number(slow.length)} />
        <Stat label="p95 latency" value={`${number(p95?.durationMs ?? 0)} ms`} />
      </div>

      <Card className="mt-5" padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">Call log</h2>
          <Badge tone="neutral" size="xs">
            Retained 30 days
          </Badge>
        </div>
        <div className="p-4">
          <IntegrationLogTable rows={rows} />
        </div>
      </Card>
    </>
  );
}
