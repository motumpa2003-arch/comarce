import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, Mail, MessageCircle, Phone } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Accordion, Badge, Card } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDate, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Help & support" };

export default async function SupportPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);
  const tickets = db.tickets.filter((t) => t.customerId === customer.id).slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display display-case text-[26px] leading-none text-ink">Help &amp; support</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Most questions are answered below. Our team replies within four working hours.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ChannelCard
          icon={<MessageCircle className="h-4 w-4" />}
          title="Live chat"
          detail="9 AM – 9 PM IST, every day"
          action="Start a chat"
        />
        <ChannelCard
          icon={<Mail className="h-4 w-4" />}
          title="Email"
          detail={db.store.supportEmail}
          action="Send an email"
        />
        <ChannelCard
          icon={<Phone className="h-4 w-4" />}
          title="Phone"
          detail={db.store.supportPhone}
          action="Call support"
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display display-case text-[20px] text-ink">
            <LifeBuoy className="h-4 w-4" />
            Your tickets
          </h2>
          <ButtonLink href="/contact" variant="outline" size="sm">
            Raise a ticket
          </ButtonLink>
        </div>

        {tickets.length ? (
          <Card padded={false}>
            <ul className="divide-y divide-line">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium text-ink-muted">{ticket.reference}</span>
                      <Badge
                        tone={
                          ticket.status === "resolved" || ticket.status === "closed"
                            ? "success"
                            : ticket.status === "pending"
                              ? "warning"
                              : "info"
                        }
                        size="xs"
                      >
                        {ticket.status}
                      </Badge>
                      {ticket.orderNumber && (
                        <span className="text-[11px] text-ink-muted">#{ticket.orderNumber}</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[13.5px] text-ink">{ticket.subject}</p>
                    <p className="mt-1 line-clamp-2x text-[12px] text-ink-muted">
                      {ticket.messages[ticket.messages.length - 1]?.body}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11.5px] text-ink-muted">{relativeTime(ticket.updatedAt)}</p>
                    <p className="mt-0.5 text-[11px] text-ink-muted">{formatDate(ticket.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card className="text-center text-[13px] text-ink-muted">
            You have not raised any tickets. That is a good sign.
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display display-case text-[20px] text-ink">Common questions</h2>
        <Accordion
          items={db.faqs.slice(0, 8).map((faq) => ({
            id: faq.id,
            title: faq.question,
            content: faq.answer,
            meta: (
              <Badge tone="outline" size="xs">
                {faq.category}
              </Badge>
            ),
          }))}
        />
        <Link
          href="/faq"
          className="mt-5 inline-block text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink underline underline-offset-4"
        >
          See all FAQs
        </Link>
      </section>
    </div>
  );
}

function ChannelCard({
  icon,
  title,
  detail,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  action: string;
}) {
  return (
    <Card>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">{icon}</span>
      <p className="mt-3 text-[13.5px] font-medium text-ink">{title}</p>
      <p className="mt-1 truncate text-[12px] text-ink-muted">{detail}</p>
      <p className="mt-3 text-[11.5px] font-medium uppercase tracking-[0.1em] text-ink underline underline-offset-4">
        {action}
      </p>
    </Card>
  );
}
