import type { Metadata } from "next";
import Link from "next/link";
import { Bell, BellOff, CheckCheck, Package, Settings, Tag } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Badge, Button, Card, EmptyState, cn } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDate, number, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Notifications" };

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; tone: "accent" | "info" | "neutral" | "warning" }> = {
  offers: { label: "Offer", icon: <Tag className="h-3.5 w-3.5" />, tone: "accent" },
  orders: { label: "Order", icon: <Package className="h-3.5 w-3.5" />, tone: "info" },
  updates: { label: "Update", icon: <Bell className="h-3.5 w-3.5" />, tone: "neutral" },
  system: { label: "Service", icon: <Settings className="h-3.5 w-3.5" />, tone: "warning" },
  inventory: { label: "Back in stock", icon: <Bell className="h-3.5 w-3.5" />, tone: "info" },
};

export default async function AccountNotificationsPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);

  const items = db.customerNotifications
    .filter((n) => !n.recipientId || n.recipientId === customer.id)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display display-case text-[26px] leading-none text-ink">Notifications</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            {unread > 0 ? `${number(unread)} unread of ${number(items.length)}.` : "You are all caught up."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unread > 0 && (
            <Button size="sm" variant="outline">
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
          <ButtonLink href="/account/preferences" variant="ghost" size="sm">
            <Settings className="h-3.5 w-3.5" />
            Preferences
          </ButtonLink>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="py-4">
          <EmptyState
            icon={<BellOff className="h-6 w-6" />}
            title="Nothing here yet"
            description="Order updates, price drops on saved items and back-in-stock alerts will land here."
            action={<ButtonLink href="/shop">Browse the catalogue</ButtonLink>}
          />
        </Card>
      ) : (
        <Card padded={false}>
          <ul className="divide-y divide-line">
            {items.map((item) => {
              const meta = CATEGORY_META[item.category] ?? CATEGORY_META.updates!;
              return (
                <li
                  key={item.id}
                  className={cn("flex gap-4 px-5 py-4", !item.read && "bg-accent/[0.035]")}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                      item.read ? "bg-muted text-ink-muted" : "bg-accent/15 text-accent",
                    )}
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <Badge tone={meta.tone} size="xs">
                        {meta.label}
                      </Badge>
                      <time
                        dateTime={item.createdAt}
                        title={formatDate(item.createdAt)}
                        className="text-[11px] text-ink-muted"
                      >
                        {relativeTime(item.createdAt)}
                      </time>
                      {!item.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Unread" />
                      )}
                    </div>
                    <p className={cn("mt-1.5 text-[13.5px]", item.read ? "text-ink" : "font-medium text-ink")}>
                      {item.title}
                    </p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{item.body}</p>
                    {item.actionUrl && (
                      <Link
                        href={item.actionUrl}
                        className="mt-2.5 inline-block text-[12px] font-medium text-primary underline-offset-2 hover:underline"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
