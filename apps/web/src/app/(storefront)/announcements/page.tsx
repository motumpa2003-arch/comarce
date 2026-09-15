import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Megaphone, Package, Settings, Tag } from "lucide-react";
import { Badge, Card, Container, EmptyState, Section, SectionHeading } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { HubHeader } from "@/components/commerce/hub-header";
import { formatDate, number, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Store updates, offers and service notices in one place.",
};

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; tone: "accent" | "info" | "neutral" | "warning" }> = {
  offers: { label: "Offers", icon: <Tag className="h-3.5 w-3.5" />, tone: "accent" },
  orders: { label: "Orders", icon: <Package className="h-3.5 w-3.5" />, tone: "info" },
  updates: { label: "Updates", icon: <Megaphone className="h-3.5 w-3.5" />, tone: "neutral" },
  system: { label: "Service", icon: <Settings className="h-3.5 w-3.5" />, tone: "warning" },
  inventory: { label: "Back in stock", icon: <Bell className="h-3.5 w-3.5" />, tone: "info" },
};

export default async function AnnouncementsPage() {
  const db = await currentStore();

  // Store-wide notices only: anything addressed to one shopper belongs in their
  // account, not on a public page.
  const notices = db.customerNotifications
    .filter((n) => !n.recipientId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const promotions = db.promotions
    .filter((p) => p.status === "active")
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));

  const grouped = new Map<string, typeof notices>();
  for (const notice of notices) {
    const list = grouped.get(notice.category) ?? [];
    list.push(notice);
    grouped.set(notice.category, list);
  }

  return (
    <>
      <HubHeader
        eyebrow="Noticeboard"
        title="Announcements"
        description="Everything the store has published recently — campaigns, policy changes and service notices — newest first. Order-specific updates stay private to your account."
        stats={[
          { value: number(notices.length), label: "Notices" },
          { value: number(promotions.length), label: "Live campaigns" },
          { value: String(grouped.size), label: "Categories" },
        ]}
      />

      {promotions.length > 0 && (
        <Section tone="ivory" spacing="tight">
          <Container>
            <SectionHeading eyebrow="Running now" title="Live campaigns" size="sm" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {promotions.map((promotion) => (
                <Card key={promotion.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[13.5px] font-medium text-ink">{promotion.name}</h3>
                    <Badge tone="accent" size="xs">
                      Live
                    </Badge>
                  </div>
                  <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-muted">
                    {promotion.description}
                  </p>
                  <p className="mt-3.5 border-t border-line pt-3 text-[11.5px] text-ink-muted">
                    {formatDate(promotion.startsAt)}
                    {promotion.endsAt && ` — ${formatDate(promotion.endsAt)}`}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="surface" spacing="default">
        <Container>
          {notices.length === 0 ? (
            <EmptyState
              icon={<Megaphone className="h-6 w-6" />}
              title="Nothing announced yet"
              description="Store-wide notices will appear here. Order updates go straight to your account and your inbox."
              action={<ButtonLink href="/shop">Browse the catalogue</ButtonLink>}
            />
          ) : (
            <>
              <SectionHeading eyebrow="All notices" title="Latest first" size="sm" />
              <ol className="mt-7 border-t border-line">
                {notices.map((notice) => {
                  const meta = CATEGORY_META[notice.category] ?? CATEGORY_META.updates!;
                  return (
                    <li key={notice.id} className="border-b border-line py-5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <Badge tone={meta.tone} size="xs">
                          <span className="flex items-center gap-1.5">
                            {meta.icon}
                            {meta.label}
                          </span>
                        </Badge>
                        <time
                          dateTime={notice.createdAt}
                          className="text-[11.5px] text-ink-muted"
                          title={formatDate(notice.createdAt)}
                        >
                          {relativeTime(notice.createdAt)}
                        </time>
                      </div>
                      <h3 className="mt-2.5 text-[14px] font-medium text-ink">{notice.title}</h3>
                      <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-muted">{notice.body}</p>
                      {notice.actionUrl && (
                        <Link
                          href={notice.actionUrl}
                          className="mt-3 inline-block text-[12px] font-medium text-primary underline-offset-2 hover:underline"
                        >
                          Open
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </Container>
      </Section>
    </>
  );
}
