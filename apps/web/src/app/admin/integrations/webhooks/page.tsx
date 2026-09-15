import type { Metadata } from "next";
import { AlertTriangle, Plus, Webhook } from "lucide-react";
import { Badge, Card, Progress, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, number, percent } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Webhooks" };

export default async function WebhooksPage() {
  const db = await currentStore();
  const hooks = db.webhooks;

  const deliveries = hooks.reduce((n, h) => n + h.deliveries24h, 0);
  const failures = hooks.reduce((n, h) => n + h.failures24h, 0);
  const failing = hooks.filter((h) => h.status === "failing");
  const topics = [...new Set(hooks.flatMap((h) => h.topics))].sort();

  return (
    <>
      <AdminPageHeader
        title="Webhooks"
        description="Outbound events, signed with a per-endpoint secret. Failed deliveries retry with exponential backoff for 24 hours, then the endpoint is marked failing and stops receiving."
        breadcrumbs={[{ label: "Integrations", href: "/admin/integrations" }, { label: "Webhooks" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            Add endpoint
          </button>
        }
      />

      {failing.length > 0 && (
        <Card className="mb-5 border-danger/40 bg-danger/[0.04]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            <div className="min-w-0">
              <h2 className="text-[12.5px] font-semibold text-ink">
                {failing.length} endpoint{failing.length === 1 ? "" : "s"} failing
              </h2>
              <p className="mt-1 break-all text-[12px] leading-relaxed text-ink-muted">
                {failing.map((h) => h.url).join(", ")} — retries are exhausted and events are being dropped. Fix the
                endpoint, then replay from the delivery log.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Endpoints" value={number(hooks.length)} hint={`${failing.length} failing`} />
        <Stat label="Deliveries (24h)" value={number(deliveries)} />
        <Stat
          label="Failure rate"
          value={percent((failures / Math.max(1, deliveries)) * 100, 2)}
          hint={`${number(failures)} failed`}
          invertDelta
        />
        <Stat label="Topics in use" value={number(topics.length)} />
      </div>

      <div className="mt-5 space-y-3">
        {hooks.map((hook) => {
          const rate = (hook.failures24h / Math.max(1, hook.deliveries24h)) * 100;
          return (
            <Card key={hook.id} padded={false}>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
                <div className="flex min-w-0 items-start gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-ink-muted">
                    <Webhook className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink">
                      <code className="break-all text-[12.5px]">{hook.url}</code>
                      <Badge
                        tone={
                          hook.status === "active" ? "success" : hook.status === "failing" ? "danger" : "warning"
                        }
                        size="xs"
                      >
                        {hook.status}
                      </Badge>
                    </h2>
                    <p className="mt-1 text-[11.5px] text-ink-muted">
                      Signing secret <code className="text-[11px]">{hook.secretPrefix}…</code> · created{" "}
                      {formatDate(hook.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" className={buttonClasses("outline", "xs")}>
                    Send test
                  </button>
                  <button type="button" className={buttonClasses("ghost", "xs")}>
                    Rotate secret
                  </button>
                  <button type="button" className={buttonClasses("ghost", "xs", false, "text-danger")}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    Subscribed topics
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {hook.topics.map((topic) => (
                      <code
                        key={topic}
                        className="rounded-[3px] border border-line px-1.5 py-0.5 text-[11px] text-ink-muted"
                      >
                        {topic}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="lg:border-l lg:border-line lg:pl-8">
                  <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                    <span className="text-ink-muted">Delivered (24h)</span>
                    <span className="tabular-nums text-ink">{number(hook.deliveries24h)}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between gap-3 text-[12.5px]">
                    <span className="text-ink-muted">Failed</span>
                    <span className={rate > 5 ? "tabular-nums text-danger" : "tabular-nums text-ink"}>
                      {number(hook.failures24h)}
                    </span>
                  </div>
                  <Progress
                    className="mt-2.5"
                    value={100 - rate}
                    tone={rate > 20 ? "danger" : rate > 5 ? "warning" : "success"}
                    height={4}
                  />
                  <p className="mt-1.5 text-[11px] text-ink-muted">{percent(100 - rate, 1)} success</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-5" padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">Available topics</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Every event the platform emits. Subscribe only to what you consume — an endpoint that acknowledges and
            discards still counts against your rate limit.
          </p>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Topic</TH>
              <TH>Fires when</TH>
              <TH align="right">Subscribers</TH>
            </TR>
          </THead>
          <TBody>
            {(
              [
                ["order.created", "An order is placed and payment is authorised"],
                ["order.updated", "Any order field changes, including status"],
                ["order.fulfilled", "Every item on an order has shipped"],
                ["order.cancelled", "An order is cancelled before dispatch"],
                ["payment.succeeded", "A payment is captured"],
                ["refund.created", "A refund is issued against an order"],
                ["inventory.updated", "Stock on hand changes for any variant"],
                ["product.created", "A product is published"],
                ["customer.created", "A customer account is created"],
                ["review.created", "A review passes moderation"],
              ] as const
            ).map(([topic, when]) => (
              <TR key={topic}>
                <TD>
                  <code className="text-[12px] text-ink">{topic}</code>
                </TD>
                <TD className="text-ink-muted">{when}</TD>
                <TD align="right" className="tabular-nums text-ink-muted">
                  {hooks.filter((h) => (h.topics as string[]).includes(topic)).length}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
