import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Headphones, TrendingUp } from "lucide-react";
import { listAllStores, listStoreDatabases } from "@obsidian/data";
import { Badge, Card, Stat, Table, TBody, TD, TH, THead, TR } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, RankedBars, SERIES } from "@/components/admin/charts";
import { NOW, number, percent, relativeTime, titleCase } from "@/lib/format";

export const metadata: Metadata = { title: "Support" };

const OPERATORS = ["Subarna M.", "Neha P.", "Ishan T.", "Ritu B."];

export default function PlatformSupportPage() {
  const stores = listAllStores();
  const seeded = listStoreDatabases();
  const storeName = new Map(stores.map((s) => [s.id, s.name]));

  // Merchant-raised tickets across every tenant, which is what a platform desk
  // actually handles — shopper tickets stay with the merchant.
  const tickets = seeded
    .flatMap((db) =>
      db.tickets.slice(0, 8).map((ticket, index) => ({
        id: ticket.id,
        storeId: db.store.id,
        storeName: storeName.get(db.store.id) ?? db.store.id,
        number: ticket.reference,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        assignee: OPERATORS[(ticket.reference.charCodeAt(3) + index) % OPERATORS.length]!,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        firstReplyMins: ticket.firstResponseMinutes ?? 12 + ((ticket.reference.charCodeAt(5) + index * 17) % 340),
      })),
    )
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

  const open = tickets.filter((t) => t.status === "open" || t.status === "pending");
  const urgent = tickets.filter((t) => t.priority === "urgent" && t.status !== "closed");
  const breached = open.filter((t) => t.firstReplyMins > 240);
  const median = [...tickets].sort((a, b) => a.firstReplyMins - b.firstReplyMins)[
    Math.floor(tickets.length / 2)
  ];

  const byCategory = Object.entries(
    tickets.reduce<Record<string, number>>((acc, t) => {
      acc[titleCase(t.category)] = (acc[titleCase(t.category)] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const byAssignee = Object.entries(
    open.reduce<Record<string, number>>((acc, t) => {
      acc[t.assignee] = (acc[t.assignee] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <AdminPageHeader
        title="Support"
        description="Tickets raised by merchants against the platform. Shopper tickets belong to the merchant and are handled inside their own admin — these are ours."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open" value={number(open.length)} hint={`${number(tickets.length)} all time`} />
        <Stat label="Urgent" value={number(urgent.length)} />
        <Stat
          label="Median first reply"
          value={`${number(median?.firstReplyMins ?? 0)} min`}
          hint="Target: under 4 hours"
        />
        <Stat
          label="SLA breached"
          value={number(breached.length)}
          hint={percent((breached.length / Math.max(1, open.length)) * 100)}
          invertDelta
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <Headphones className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">Queue</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Ticket</TH>
                  <TH>Tenant</TH>
                  <TH>Category</TH>
                  <TH>Priority</TH>
                  <TH>Status</TH>
                  <TH>Assignee</TH>
                  <TH align="right">Updated</TH>
                </TR>
              </THead>
              <TBody>
                {tickets.slice(0, 24).map((ticket) => (
                  <TR key={ticket.id}>
                    <TD>
                      <Link
                        href={`/platform/support/${ticket.id}`}
                        className="font-medium text-ink hover:text-primary hover:underline"
                      >
                        {ticket.number}
                      </Link>
                      <span className="mt-0.5 block max-w-[280px] truncate text-[11px] text-ink-muted">
                        {ticket.subject}
                      </span>
                    </TD>
                    <TD>
                      <Link
                        href={`/platform/stores/${ticket.storeId}`}
                        className="text-ink hover:text-primary hover:underline"
                      >
                        {ticket.storeName}
                      </Link>
                    </TD>
                    <TD className="text-ink-muted">{titleCase(ticket.category)}</TD>
                    <TD>
                      <Badge
                        tone={
                          ticket.priority === "urgent"
                            ? "danger"
                            : ticket.priority === "high"
                              ? "warning"
                              : "neutral"
                        }
                        size="xs"
                      >
                        {ticket.priority}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge
                        tone={
                          ticket.status === "open"
                            ? "info"
                            : ticket.status === "pending"
                              ? "warning"
                              : ticket.status === "resolved"
                                ? "success"
                                : "neutral"
                        }
                        size="xs"
                      >
                        {ticket.status}
                      </Badge>
                    </TD>
                    <TD className="text-ink-muted">{ticket.assignee}</TD>
                    <TD align="right" className="whitespace-nowrap text-ink-muted">
                      {relativeTime(ticket.updatedAt)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <p className="border-t border-line px-5 py-3 text-[11.5px] text-ink-muted">
            Showing the 24 most recently updated of {number(tickets.length)}.
          </p>
        </Card>

        <aside className="space-y-4">
          <ChartFrame title="By category" description="All tickets" height={220}>
            <RankedBars rows={byCategory} format="number" color={SERIES[2]} />
          </ChartFrame>

          <ChartFrame title="Open per operator" description="Current load" height={190}>
            <RankedBars rows={byAssignee} format="number" color={SERIES[0]} />
          </ChartFrame>

          <Card tone="muted">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
              <Clock className="h-3.5 w-3.5" />
              Service levels
            </h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              {[
                ["Urgent", "1 hour", "Storefront down, payments failing"],
                ["High", "4 hours", "A flow broken for one tenant"],
                ["Normal", "1 working day", "Questions and configuration"],
                ["Low", "3 working days", "Feature requests"],
              ].map(([priority, target, scope]) => (
                <div key={priority}>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="font-medium text-ink">{priority}</dt>
                    <dd className="shrink-0 tabular-nums text-ink-muted">{target}</dd>
                  </div>
                  <p className="text-[11px] text-ink-muted">{scope}</p>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <TrendingUp className="h-3.5 w-3.5" />
              What drives volume
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              The top category is the one worth fixing in the product, not staffing for. A ticket that should never
              have been raised is the cheapest one to prevent.
            </p>
            <p className="mt-3 text-[12px] text-ink-muted">
              Busiest right now: <span className="font-medium text-ink">{byCategory[0]?.label ?? "—"}</span> at{" "}
              {percent(((byCategory[0]?.value ?? 0) / Math.max(1, tickets.length)) * 100)} of all tickets.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
