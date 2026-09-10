import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MessageSquare } from "lucide-react";
import { Avatar, Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { number, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Support" };

export default async function AdminSupportPage() {
  const db = await currentStore();
  const tickets = db.tickets;

  const open = tickets.filter((t) => t.status === "open");
  const pending = tickets.filter((t) => t.status === "pending");
  const urgent = tickets.filter((t) => t.priority === "urgent" || t.priority === "high");
  const avgFirstResponse =
    tickets.length > 0
      ? Math.round(
          tickets.reduce((n, t) => n + (t.firstResponseMinutes ?? 0), 0) / tickets.length,
        )
      : 0;

  const byCategory = [...new Set(tickets.map((t) => t.category))]
    .map((category) => ({
      label: titleCase(category),
      value: tickets.filter((t) => t.category === category).length,
    }))
    .sort((a, b) => b.value - a.value);

  const byAgent = [...new Set(tickets.map((t) => t.assigneeName).filter(Boolean))]
    .map((agent) => ({
      label: agent!,
      value: tickets.filter((t) => t.assigneeName === agent).length,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <AdminPageHeader
        title="Support"
        description="Customer conversations, tied back to the order that caused them. First response target is four working hours."
        breadcrumbs={[{ label: "Customers" }, { label: "Support" }]}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Open tickets" value={number(open.length)} hint={`${number(pending.length)} awaiting customer`} />
        <Stat label="High priority" value={number(urgent.length)} hint="Urgent or high" />
        <Stat
          label="Average first response"
          value={avgFirstResponse >= 60 ? `${(avgFirstResponse / 60).toFixed(1)} h` : `${avgFirstResponse} min`}
          hint="Target: under 4 hours"
        />
        <Stat
          label="Resolved"
          value={`${Math.round((tickets.filter((t) => ["resolved", "closed"].includes(t.status)).length / Math.max(1, tickets.length)) * 100)}%`}
          hint={`${number(tickets.length)} total tickets`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Ticket queue</h2>
            <span className="text-[11.5px] text-ink-muted">Newest first</span>
          </div>
          <ul className="divide-y divide-line">
            {tickets.slice(0, 25).map((ticket) => {
              const last = ticket.messages[ticket.messages.length - 1];
              return (
                <li key={ticket.id} className="p-5 transition-colors hover:bg-muted/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-[12.5px]">
                        <span className="font-mono text-[11px] text-ink-muted">{ticket.reference}</span>
                        <Badge
                          tone={
                            ticket.status === "open"
                              ? "info"
                              : ticket.status === "pending"
                                ? "warning"
                                : "success"
                          }
                          size="xs"
                        >
                          {ticket.status}
                        </Badge>
                        <Badge
                          tone={
                            ticket.priority === "urgent"
                              ? "danger"
                              : ticket.priority === "high"
                                ? "warning"
                                : "outline"
                          }
                          size="xs"
                        >
                          {ticket.priority}
                        </Badge>
                        <Badge tone="outline" size="xs">
                          {titleCase(ticket.category)}
                        </Badge>
                      </p>
                      <p className="mt-1.5 text-[13px] font-medium text-ink">{ticket.subject}</p>
                      <p className="mt-1 line-clamp-2x text-[12px] text-ink-muted">{last?.body}</p>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
                        <span>{ticket.customerName}</span>
                        {ticket.orderNumber && (
                          <Link
                            href={`/admin/orders?q=${ticket.orderNumber}`}
                            className="underline underline-offset-4 hover:text-ink"
                          >
                            #{ticket.orderNumber}
                          </Link>
                        )}
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.messages.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {relativeTime(ticket.updatedAt)}
                        </span>
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {ticket.assigneeName ? (
                        <Avatar name={ticket.assigneeName} size={28} />
                      ) : (
                        <span className="rounded-full border border-dashed border-line px-2.5 py-1 text-[10.5px] text-ink-muted">
                          Unassigned
                        </span>
                      )}
                      <button type="button" className={buttonClasses("outline", "xs")}>
                        Open
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
            {tickets.length === 0 && (
              <li className="px-5 py-14 text-center text-[12.5px] text-ink-muted">No tickets raised.</li>
            )}
          </ul>
        </Card>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Tickets by topic</h2>
            <RankedBars rows={byCategory} format="number" color={SERIES[1]} />
          </Card>

          {byAgent.length > 0 && (
            <Card>
              <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Workload by agent</h2>
              <RankedBars rows={byAgent} format="number" color={SERIES[2]} />
            </Card>
          )}

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">SLA</h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">First response</dt>
                <dd className="text-ink">4 working hours</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Urgent</dt>
                <dd className="text-ink">1 hour</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Resolution</dt>
                <dd className="text-ink">2 working days</dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </>
  );
}
