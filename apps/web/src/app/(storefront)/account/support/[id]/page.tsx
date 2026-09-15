import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Package, Paperclip } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Badge, Button, Card, Field, Textarea, cn } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDate, formatDateTime, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const db = await currentStore();
  const ticket = db.tickets.find((t) => t.id === id);
  return { title: ticket ? ticket.reference : "Ticket" };
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);

  const ticket = db.tickets.find((t) => t.id === id);
  // A customer may only open their own ticket. Treating someone else's as
  // not-found is deliberate: confirming it exists would leak that it does.
  if (!ticket || ticket.customerId !== customer.id) notFound();

  const order = ticket.orderNumber ? db.orders.find((o) => o.orderNumber === ticket.orderNumber) : undefined;
  const closed = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="space-y-6">
      <div>
        <ButtonLink href="/account/support" variant="ghost" size="xs" className="-ml-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          All tickets
        </ButtonLink>

        <h1 className="mt-3 font-display display-case text-[24px] leading-tight text-ink">{ticket.subject}</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-muted">
          <span className="font-medium text-ink">{ticket.reference}</span>
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
          <span>{titleCase(ticket.category)}</span>
          <span>Opened {formatDate(ticket.createdAt)}</span>
        </div>
      </div>

      {order && (
        <Card tone="muted">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 shrink-0 text-ink-muted" />
              <div>
                <p className="text-[12.5px] font-medium text-ink">About order {order.orderNumber}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                  {order.status.replace(/_/g, " ")}
                </p>
              </div>
            </div>
            <ButtonLink href={`/account/orders/${order.id}`} variant="outline" size="xs">
              View order
            </ButtonLink>
          </div>
        </Card>
      )}

      <Card padded={false}>
        <ol className="divide-y divide-line">
          {ticket.messages.map((message) => {
            const mine = message.authorType === "customer";
            return (
              <li key={message.id} className={cn("px-5 py-4", !mine && "bg-muted/40")}>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-[12.5px] font-medium text-ink">{mine ? "You" : message.author}</span>
                  {!mine && (
                    <Badge tone="info" size="xs">
                      Support
                    </Badge>
                  )}
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
            );
          })}
        </ol>
      </Card>

      {closed ? (
        <Card>
          <p className="text-[13px] text-ink">This ticket is {ticket.status}.</p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
            If the problem comes back, replying here reopens it with the whole history attached — you will not have
            to explain it again.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              Reopen ticket
            </Button>
            <ButtonLink href="/contact" variant="ghost" size="sm">
              Start a new ticket
            </ButtonLink>
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Reply</h2>
          <Field className="mt-3.5">
            <Textarea rows={4} placeholder="Add to this conversation…" />
          </Field>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm">Send reply</Button>
            <Button size="sm" variant="ghost">
              <Paperclip className="h-3.5 w-3.5" />
              Attach a photo
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-3.5 text-[11.5px] text-ink-muted">
            <Clock className="h-3.5 w-3.5" />
            {ticket.firstResponseMinutes != null
              ? `We first replied in ${ticket.firstResponseMinutes} minutes.`
              : "We reply within four working hours on weekdays."}
          </p>
        </Card>
      )}

      <p className="text-[11.5px] text-ink-muted">
        Prefer email? Reply to any message from{" "}
        <Link href={`mailto:${db.store.supportEmail}`} className="text-primary underline-offset-2 hover:underline">
          {db.store.supportEmail}
        </Link>{" "}
        quoting {ticket.reference} and it lands in this same thread.
      </p>
    </div>
  );
}
