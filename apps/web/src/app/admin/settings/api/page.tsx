import type { Metadata } from "next";
import { AlertTriangle, Copy, Key, Plus, Webhook as WebhookIcon } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, number, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "API & webhooks" };

const ENDPOINTS = [
  { method: "GET", path: "/v1/products", note: "List and filter the catalogue" },
  { method: "GET", path: "/v1/products/:id", note: "Single product with variants" },
  { method: "POST", path: "/v1/products", note: "Create a product" },
  { method: "PATCH", path: "/v1/products/:id", note: "Update fields or status" },
  { method: "GET", path: "/v1/orders", note: "List orders with filters" },
  { method: "POST", path: "/v1/orders/:id/status", note: "Advance the state machine" },
  { method: "GET", path: "/v1/inventory", note: "Stock by variant and location" },
  { method: "POST", path: "/v1/inventory/adjust", note: "Write an adjustment movement" },
  { method: "GET", path: "/v1/customers", note: "List customers and segments" },
  { method: "POST", path: "/v1/coupons/validate", note: "Server-side coupon validation" },
];

export default async function AdminApiPage() {
  const db = await currentStore();
  const keys = db.apiKeys;
  const webhooks = db.webhooks;
  const failing = webhooks.filter((w) => w.status === "failing");

  return (
    <>
      <AdminPageHeader
        title="API & webhooks"
        description="Programmatic access to the same engine the storefront and admin use. Keys are scoped to permissions; webhooks are signed with a per-endpoint secret."
        breadcrumbs={[{ label: "Settings" }, { label: "API & webhooks" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            Create API key
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active keys" value={number(keys.filter((k) => !k.revokedAt).length)} hint={`${number(keys.length)} total`} />
        <Stat label="Webhook endpoints" value={number(webhooks.length)} hint={`${failing.length} failing`} />
        <Stat
          label="Deliveries (24h)"
          value={number(webhooks.reduce((n, w) => n + w.deliveries24h, 0))}
        />
        <Stat
          label="Failures (24h)"
          value={number(webhooks.reduce((n, w) => n + w.failures24h, 0))}
          hint="Retried with backoff"
        />
      </div>

      <div className="space-y-4">
        {failing.length > 0 && (
          <Card className="border-danger/40 bg-danger/[0.04]">
            <p className="flex items-center gap-2 text-[12.5px] font-medium text-danger">
              <AlertTriangle className="h-4 w-4" />
              {failing.length} webhook endpoint{failing.length === 1 ? "" : "s"} failing
            </p>
            <p className="mt-1.5 text-[12px] text-ink-muted">
              {failing.map((w) => w.url).join(", ")} — deliveries are retried with exponential backoff for 24 hours,
              then dropped.
            </p>
          </Card>
        )}

        <Card padded={false}>
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <Key className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">API keys</h2>
          </div>
          <ul className="divide-y divide-line">
            {keys.map((key) => (
              <li key={key.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-ink">
                    {key.name}
                    {key.revokedAt ? (
                      <Badge tone="danger" size="xs">
                        Revoked
                      </Badge>
                    ) : (
                      <Badge tone="success" size="xs">
                        Active
                      </Badge>
                    )}
                    <Badge tone={key.prefix.includes("live") ? "obsidian" : "outline"} size="xs">
                      {key.prefix.includes("live") ? "Live" : "Test"}
                    </Badge>
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-mono text-[11px] text-ink-muted">
                    {key.prefix}••••••••••••••••
                    <Copy className="h-3 w-3" />
                  </p>
                  <p className="mt-1 flex flex-wrap gap-1">
                    {key.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-ink-muted"
                      >
                        {scope}
                      </span>
                    ))}
                  </p>
                </div>

                <div className="w-40 shrink-0 text-[11px] text-ink-muted">
                  <p>Created {formatDate(key.createdAt)}</p>
                  <p>
                    {key.lastUsedAt ? `Last used ${relativeTime(key.lastUsedAt)}` : "Never used"}
                  </p>
                </div>

                <button
                  type="button"
                  className={buttonClasses("ghost", "xs", false, key.revokedAt ? undefined : "text-danger")}
                  disabled={Boolean(key.revokedAt)}
                >
                  {key.revokedAt ? "Revoked" : "Revoke"}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card padded={false}>
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <WebhookIcon className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">Webhook endpoints</h2>
            <button type="button" className={buttonClasses("outline", "xs", false, "ml-auto")}>
              Add endpoint
            </button>
          </div>
          <ul className="divide-y divide-line">
            {webhooks.map((webhook) => (
              <li key={webhook.id} className="px-5 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-mono text-[11.5px] text-ink">{webhook.url}</span>
                      <Badge
                        tone={
                          webhook.status === "active" ? "success" : webhook.status === "failing" ? "danger" : "warning"
                        }
                        size="xs"
                      >
                        {webhook.status}
                      </Badge>
                    </p>
                    <p className="mt-1.5 flex flex-wrap gap-1">
                      {webhook.topics.map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-ink-muted"
                        >
                          {topic}
                        </span>
                      ))}
                    </p>
                    <p className="mt-1.5 font-mono text-[10.5px] text-ink-muted">
                      Signing secret {webhook.secretPrefix}••••••••
                    </p>
                  </div>

                  <dl className="flex shrink-0 gap-x-5 text-[11.5px]">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">Sent 24h</dt>
                      <dd className="tabular-nums text-ink">{number(webhook.deliveries24h)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">Failed</dt>
                      <dd
                        className={
                          webhook.failures24h > 0 ? "tabular-nums text-danger" : "tabular-nums text-ink-muted"
                        }
                      >
                        {number(webhook.failures24h)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Admin API reference</h2>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              Versioned REST. Bearer-authenticated with an API key; every request is scoped to this store.
            </p>
          </div>
          <ul className="divide-y divide-line">
            {ENDPOINTS.map((endpoint) => (
              <li key={endpoint.path + endpoint.method} className="flex items-center gap-4 px-5 py-2.5">
                <span
                  className={
                    endpoint.method === "GET"
                      ? "w-14 shrink-0 rounded-[3px] bg-primary/10 px-2 py-0.5 text-center font-mono text-[10px] font-semibold text-primary"
                      : "w-14 shrink-0 rounded-[3px] bg-accent/15 px-2 py-0.5 text-center font-mono text-[10px] font-semibold text-ink"
                  }
                >
                  {endpoint.method}
                </span>
                <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-ink">{endpoint.path}</code>
                <span className="hidden shrink-0 text-[11.5px] text-ink-muted sm:block">{endpoint.note}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
