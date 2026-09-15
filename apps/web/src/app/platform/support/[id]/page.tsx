import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Clock, Mail, MessageSquare } from "lucide-react";
import { listAllStores, listStoreDatabases } from "@obsidian/data";
import { Badge, Button, Card, Field, Textarea, buttonClasses, cn } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, formatDateTime, number, relativeTime, titleCase } from "@/lib/format";

function findTicket(id: string) {
  for (const db of listStoreDatabases()) {
    const ticket = db.tickets.find((t) => t.id === id);
    if (ticket) return { ticket, store: db.store };
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const found = findTicket(id);
  return { title: found ? found.ticket.reference : "Ticket" };
}

export default async function PlatformTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = findTicket(id);
  if (!found) notFound();

  const { ticket, store } = found;
  const tenant = listAllStores().find((s) => s.id === store.id);

  const target =
    ticket.priority === "urgent"
      ? "1 hour"
      : ticket.priority === "high"
        ? "4 hours"
        : ticket.priority === "normal"
          ? "1 working day"
          : "3 working days";

  return (
    <>
      <AdminPageHeader
        title={ticket.subject}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-medium text-ink">{ticket.reference}</span>
            <span>Opened {formatDate(ticket.createdAt)}</span>
            <Badge
              tone={ticket.priority === "urgent" ? "danger" : ticket.priority === "high" ? "warning" : "neutral"}
              size="xs"
            >
              {ticket.priority}
            </Badge>
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
          </span>
        }
        breadcrumbs={[{ label: "Support", href: "/platform/support" }, { label: ticket.reference }]}
        actions={
          <Link href="/platform/support" className={buttonClasses("ghost", "sm")}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to queue
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card padded={false}>
            <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
              <MessageSquare className="h-3.5 w-3.5 text-ink-muted" />
              <h2 className="text-[12.5px] font-semibold text-ink">
                Conversation · {number(ticket.messages.length)} message
                {ticket.messages.length === 1 ? "" : "s"}
              </h2>
            </div>
            <ol className="divide-y divide-line">
              {ticket.messages.map((message) => (
                <li key={message.id} className={cn("px-5 py-4", message.authorType === "agent" && "bg-muted/40")}>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="text-[12.5px] font-medium text-ink">{message.author}</span>
                    <Badge tone={message.authorType === "agent" ? "info" : "neutral"} size="xs">
                      {message.authorType === "agent" ? "Operator" : "Merchant"}
                    </Badge>
                    <time
                      dateTime={message.createdAt}
                      title={formatDateTime(message.createdAt)}
                      className="text-[11px] text-ink-muted"
                    >
                      {relativeTime(message.createdAt)}
                    </time>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-ink-muted">
                    {message.body}
                  </p>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Reply</h2>
            <Field className="mt-3.5" hint="The merchant sees this in their admin and by email.">
              <Textarea rows={5} placeholder="Type your reply…" />
            </Field>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm">Send reply</Button>
              <Button size="sm" variant="outline">
                Reply and resolve
              </Button>
              <Button size="sm" variant="ghost">
                Add internal note
              </Button>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Building2 className="h-3.5 w-3.5" />
              Tenant
            </h2>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <Row label="Store" value={store.name} />
              <Row label="Industry" value={titleCase(store.industry)} />
              <Row label="Status" value={titleCase(tenant?.status ?? "—")} />
              <Row label="Domain" value={store.domain} />
            </dl>
            <Link href={`/platform/stores/${store.id}`} className={buttonClasses("outline", "xs", true) + " mt-4"}>
              Open tenant
            </Link>
          </Card>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Ticket</h2>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <Row label="Reference" value={ticket.reference} />
              <Row label="Category" value={titleCase(ticket.category)} />
              <Row label="Raised by" value={ticket.customerName} />
              <Row label="Email" value={ticket.customerEmail} />
              {ticket.orderNumber && <Row label="Order" value={ticket.orderNumber} />}
              <Row label="Assignee" value={ticket.assigneeName ?? "Unassigned"} />
              <Row label="Last update" value={formatDate(ticket.updatedAt)} />
            </dl>
          </Card>

          <Card tone="muted">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
              <Clock className="h-3.5 w-3.5" />
              Response time
            </h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              {ticket.firstResponseMinutes != null
                ? `First replied in ${number(ticket.firstResponseMinutes)} minutes.`
                : "No reply sent yet."}{" "}
              The target for {ticket.priority} priority is {target}.
            </p>
            <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[11.5px] text-ink-muted">
              <Mail className="h-3.5 w-3.5" />
              Replies are written to this tenant&rsquo;s audit trail.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="truncate text-right text-ink">{value}</dd>
    </div>
  );
}
