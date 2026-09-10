import type { Metadata } from "next";
import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";
import { Badge, Card, Stat, Switch, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { number, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Notifications" };

const EVENTS: { event: string; label: string; audience: string; channels: string[] }[] = [
  { event: "order_created", label: "Order placed", audience: "Customer + merchant", channels: ["email", "whatsapp", "push"] },
  { event: "payment_success", label: "Payment captured", audience: "Customer", channels: ["email"] },
  { event: "payment_failed", label: "Payment failed", audience: "Customer", channels: ["email", "sms"] },
  { event: "order_shipped", label: "Order shipped", audience: "Customer", channels: ["email", "sms", "whatsapp", "push"] },
  { event: "order_delivered", label: "Order delivered", audience: "Customer", channels: ["email", "push"] },
  { event: "return_approved", label: "Return approved", audience: "Customer", channels: ["email", "sms"] },
  { event: "low_stock", label: "Low stock", audience: "Merchant", channels: ["email", "in_app"] },
  { event: "new_customer", label: "New customer", audience: "Merchant", channels: ["in_app"] },
  { event: "review_received", label: "Review posted", audience: "Merchant", channels: ["email", "in_app"] },
  { event: "abandoned_cart", label: "Cart abandoned", audience: "Customer", channels: ["email", "push"] },
  { event: "price_drop", label: "Price drop", audience: "Customer", channels: ["push", "email"] },
  { event: "back_in_stock", label: "Back in stock", audience: "Customer", channels: ["email", "push"] },
];

const CHANNEL_ICON = {
  email: Mail,
  sms: Smartphone,
  whatsapp: MessageCircle,
  push: Bell,
  in_app: Bell,
} as const;

export default async function AdminNotificationsPage() {
  const db = await currentStore();
  const unread = db.merchantNotifications.filter((n) => !n.read);

  return (
    <>
      <AdminPageHeader
        title="Notifications"
        description="Which events notify whom, on which channel. Transactional messages always send; marketing respects the customer's opt-out."
        breadcrumbs={[{ label: "Settings" }, { label: "Notifications" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            Save preferences
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Events configured" value={number(EVENTS.length)} />
        <Stat label="Channels" value="5" hint="Email, SMS, WhatsApp, push, in-app" />
        <Stat label="Unread merchant alerts" value={number(unread.length)} />
        <Stat
          label="Templates"
          value={number(EVENTS.reduce((n, e) => n + e.channels.length, 0))}
          hint="One per event and channel"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Event matrix</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  <th className="px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                    Event
                  </th>
                  <th className="px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                    Audience
                  </th>
                  {(["email", "sms", "whatsapp", "push", "in_app"] as const).map((channel) => {
                    const Icon = CHANNEL_ICON[channel];
                    return (
                      <th key={channel} className="px-3 py-2.5 text-center">
                        <span className="mx-auto flex flex-col items-center gap-1 text-[9.5px] uppercase tracking-[0.08em] text-ink-muted">
                          <Icon className="h-3.5 w-3.5" />
                          {channel === "in_app" ? "In-app" : titleCase(channel)}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {EVENTS.map((entry) => (
                  <tr key={entry.event} className="hover:bg-muted/40">
                    <td className="px-5 py-2.5">
                      <p className="font-medium text-ink">{entry.label}</p>
                      <code className="font-mono text-[10.5px] text-ink-muted">{entry.event}</code>
                    </td>
                    <td className="px-4 py-2.5 text-[11.5px] text-ink-muted">{entry.audience}</td>
                    {(["email", "sms", "whatsapp", "push", "in_app"] as const).map((channel) => (
                      <td key={channel} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          defaultChecked={entry.channels.includes(channel)}
                          className="h-3.5 w-3.5 accent-[var(--c-primary)]"
                          aria-label={`${entry.label} via ${channel}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Sender identity</h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">From name</dt>
                <dd className="truncate text-ink">{db.store.name}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">From address</dt>
                <dd className="truncate text-ink">{db.store.supportEmail}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">SPF / DKIM</dt>
                <dd>
                  <Badge tone="success" size="xs">
                    Verified
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">SMS sender ID</dt>
                <dd className="font-mono text-ink">OBSIDN</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Global rules</h2>
            <div className="mt-4 space-y-4">
              <Switch
                defaultChecked
                label="Respect marketing opt-out"
                description="Never send promotional messages to opted-out customers."
              />
              <Switch
                defaultChecked
                label="Quiet hours"
                description="No SMS or push between 10 PM and 8 AM local time."
              />
              <Switch defaultChecked label="Batch merchant alerts" description="Group low-stock alerts into one daily digest." />
              <Switch label="Send test copies to staff" description="Cc the owner on every customer template." />
            </div>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Recent merchant alerts</h2>
            </div>
            <ul className="divide-y divide-line">
              {db.merchantNotifications.slice(0, 6).map((notification) => (
                <li key={notification.id} className="px-5 py-2.5">
                  <p className="flex items-center gap-2 text-[12px] font-medium text-ink">
                    {!notification.read && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    {notification.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2x text-[11px] text-ink-muted">{notification.body}</p>
                  <p className="mt-0.5 text-[10.5px] text-ink-muted">{relativeTime(notification.createdAt)}</p>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
