import type { Metadata } from "next";
import { Mail, MessageCircle, Plus, Send, Smartphone } from "lucide-react";
import { Badge, Card, Progress, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { formatDate, money, number, percent, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Campaigns" };

const CHANNEL_ICON = {
  email: Mail,
  sms: Smartphone,
  whatsapp: MessageCircle,
  push: Send,
  in_app: Send,
} as const;

export default async function AdminCampaignsPage() {
  const db = await currentStore();
  const campaigns = db.campaigns;
  const sent = campaigns.filter((c) => c.status === "sent");

  const revenue = campaigns.reduce((n, c) => n + c.revenue, 0);
  const delivered = sent.reduce((n, c) => n + c.delivered, 0);
  const opened = sent.reduce((n, c) => n + c.opened, 0);
  const clicked = sent.reduce((n, c) => n + c.clicked, 0);

  const byChannel = [...new Set(campaigns.map((c) => c.channel))]
    .map((channel) => ({
      label: titleCase(channel.replace("_", " ")),
      value: campaigns.filter((c) => c.channel === channel).reduce((n, c) => n + c.revenue, 0),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <AdminPageHeader
        title="Campaigns"
        description="One-off sends across email, SMS, WhatsApp and push. Audiences come from customer segments, so a campaign always targets a real behavioural cohort."
        breadcrumbs={[{ label: "Marketing" }, { label: "Campaigns" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New campaign
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Attributed revenue" value={money(revenue)} hint={`${number(campaigns.length)} campaigns`} />
        <Stat
          label="Open rate"
          value={percent(delivered ? (opened / delivered) * 100 : 0)}
          hint={`${number(opened)} opens`}
        />
        <Stat
          label="Click rate"
          value={percent(opened ? (clicked / opened) * 100 : 0)}
          hint={`${number(clicked)} clicks`}
        />
        <Stat
          label="Scheduled"
          value={number(campaigns.filter((c) => c.status === "scheduled").length)}
          hint="Queued to send"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">All campaigns</h2>
          </div>
          <ul className="divide-y divide-line">
            {campaigns.map((campaign) => {
              const Icon = CHANNEL_ICON[campaign.channel];
              const openRate = campaign.delivered ? (campaign.opened / campaign.delivered) * 100 : 0;
              const clickRate = campaign.opened ? (campaign.clicked / campaign.opened) * 100 : 0;
              const convRate = campaign.clicked ? (campaign.converted / campaign.clicked) * 100 : 0;

              return (
                <li key={campaign.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink">
                          {campaign.name}
                          <Badge
                            tone={
                              campaign.status === "sent"
                                ? "success"
                                : campaign.status === "sending"
                                  ? "progress"
                                  : campaign.status === "scheduled"
                                    ? "info"
                                    : campaign.status === "paused"
                                      ? "warning"
                                      : "neutral"
                            }
                            size="xs"
                          >
                            {campaign.status}
                          </Badge>
                          <Badge tone="outline" size="xs">
                            {titleCase(campaign.segmentKey.replace("_", " "))}
                          </Badge>
                        </p>
                        <p className="mt-1 text-[12px] text-ink">{campaign.subject}</p>
                        <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">{campaign.preview}</p>
                        <p className="mt-1.5 text-[11px] text-ink-muted">
                          {campaign.sentAt
                            ? `Sent ${relativeTime(campaign.sentAt)}`
                            : campaign.scheduledAt
                              ? `Scheduled for ${formatDate(campaign.scheduledAt)}`
                              : `Created ${relativeTime(campaign.createdAt)}`}
                          {" · "}
                          {number(campaign.recipients)} recipients
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-semibold tabular-nums text-ink">{money(campaign.revenue)}</p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        {number(campaign.converted)} conversions
                      </p>
                    </div>
                  </div>

                  {campaign.delivered > 0 && (
                    <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-3.5 sm:grid-cols-4">
                      <Metric label="Delivered" value={number(campaign.delivered)} />
                      <Metric label="Open rate" value={percent(openRate)} progress={openRate} />
                      <Metric label="Click rate" value={percent(clickRate)} progress={clickRate} />
                      <Metric label="Conversion" value={percent(convRate)} progress={convRate} />
                    </dl>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Revenue by channel</h2>
            <RankedBars rows={byChannel} format="moneyShort" color={SERIES[0]} />
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Sending limits</h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Email</dt>
                <dd className="text-ink">50,000 / month</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">SMS</dt>
                <dd className="text-ink">10,000 / month</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">WhatsApp</dt>
                <dd className="text-ink">Metered per template</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Push</dt>
                <dd className="text-ink">Unlimited</dd>
              </div>
            </dl>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
              Customers who opt out of marketing are excluded automatically; transactional messages always send.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Metric({ label, value, progress }: { label: string; value: string; progress?: number }) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-semibold tabular-nums text-ink">{value}</dd>
      {progress != null && <Progress className="mt-1.5" value={Math.min(100, progress)} height={4} />}
    </div>
  );
}
