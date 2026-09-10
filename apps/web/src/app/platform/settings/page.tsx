import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Globe2, RotateCcw, Server, ShieldCheck, Sparkles } from "lucide-react";
import { getPlans, getSubscriptions, listAllStores } from "@obsidian/data";
import { Badge, Card, Field, Input, Select, Switch, Textarea, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ResetDatabaseButton } from "@/components/platform/reset-database-button";
import { number } from "@/lib/format";

export const metadata: Metadata = { title: "Platform settings" };

const REGIONS = [
  { code: "IN", label: "India — Mumbai (ap-south-1)", live: true },
  { code: "SG", label: "Singapore (ap-southeast-1)", live: true },
  { code: "EU", label: "Ireland (eu-west-1)", live: true },
  { code: "US", label: "N. Virginia (us-east-1)", live: false },
];

const FEATURE_TOGGLES = [
  {
    key: "marketplace",
    label: "Marketplace mode",
    description: "Lets a tenant onboard third-party sellers with split payouts.",
    enabled: true,
  },
  {
    key: "subscriptions",
    label: "Subscribe & save",
    description: "Recurring product subscriptions with pause and skip.",
    enabled: true,
  },
  {
    key: "aiAssistant",
    label: "AI merchandising assistant",
    description: "Description drafting, alt text and collection suggestions.",
    enabled: true,
  },
  {
    key: "b2b",
    label: "B2B pricing",
    description: "Company accounts, price lists, quotes and net terms.",
    enabled: false,
  },
  {
    key: "loyalty",
    label: "Loyalty & rewards",
    description: "Tiers, points accrual and redemption at checkout.",
    enabled: true,
  },
  {
    key: "multiWarehouse",
    label: "Multi-warehouse routing",
    description: "Split fulfilment across warehouses by proximity and stock.",
    enabled: true,
  },
];

export default function PlatformSettingsPage() {
  const stores = listAllStores();
  const plans = getPlans();
  const subscriptions = getSubscriptions();

  const activeStores = stores.filter((s) => s.status === "active").length;
  const trialing = subscriptions.filter((s) => s.status === "trialing").length;

  return (
    <>
      <AdminPageHeader
        title="Platform settings"
        description="Global configuration that applies to every tenant. Store-level settings live inside each merchant admin."
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            Save changes
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Sparkles className="h-3.5 w-3.5" />
              Platform identity
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Platform name" required>
                <Input defaultValue="Obsidian Commerce" />
              </Field>
              <Field label="Console domain" hint="Where operators sign in">
                <Input defaultValue="console.obsidian.dev" />
              </Field>
              <Field label="Tenant subdomain suffix" hint="Every new store gets name.suffix">
                <Input defaultValue=".obsidian.store" />
              </Field>
              <Field label="Support inbox">
                <Input type="email" defaultValue="support@obsidian.dev" />
              </Field>
              <Field label="Status page">
                <Input defaultValue="https://status.obsidian.dev" />
              </Field>
              <Field label="Billing entity" hint="Shown on merchant invoices">
                <Input defaultValue="Obsidian Commerce Pvt Ltd" />
              </Field>
              <Field
                label="Outbound email footer"
                className="sm:col-span-2"
                hint="Appended to every transactional email sent on a tenant's behalf"
              >
                <Textarea
                  rows={2}
                  defaultValue="Sent by Obsidian Commerce on behalf of the merchant. Reply to reach the store directly."
                />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Globe2 className="h-3.5 w-3.5" />
              Regions and residency
            </h2>
            <p className="mb-4 text-[12px] leading-relaxed text-ink-muted">
              A tenant is pinned to one region at creation. Data never leaves it, which is what makes the isolation
              claim in the contract true rather than aspirational.
            </p>
            <ul className="divide-y divide-line">
              {REGIONS.map((region) => (
                <li key={region.code} className="flex items-center justify-between gap-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] text-ink">{region.label}</p>
                    <p className="text-[11px] text-ink-muted">
                      {region.live ? "Accepting new tenants" : "Provisioned, not yet accepting tenants"}
                    </p>
                  </div>
                  <Badge tone={region.live ? "success" : "neutral"} size="xs">
                    {region.live ? "Live" : "Standby"}
                  </Badge>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
              <Field label="Default region for new tenants">
                <Select defaultValue="IN">
                  {REGIONS.filter((r) => r.live).map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Default currency">
                <Select defaultValue="INR">
                  {["INR", "USD", "EUR", "GBP", "AED", "SGD"].map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <CreditCard className="h-3.5 w-3.5" />
              Signup and billing
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Default plan on signup">
                <Select defaultValue={plans.find((p) => p.popular)?.id ?? plans[0]?.id}>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Trial length (days)" hint={`${number(trialing)} tenants are trialing now`}>
                <Input type="number" defaultValue={14} min={0} max={90} />
              </Field>
              <Field label="Invoice number prefix">
                <Input defaultValue="OC-INV-" />
              </Field>
              <Field label="Grace period before suspension (days)">
                <Input type="number" defaultValue={14} min={1} max={60} />
              </Field>
            </div>
            <div className="mt-4 space-y-3.5 border-t border-line pt-4">
              <Switch
                label="Require a card to start a trial"
                description="Reduces throwaway signups but measurably lowers trial starts."
              />
              <Switch
                label="Allow self-serve plan downgrades"
                description="Downgrades apply at the end of the current period, never mid-cycle."
                defaultChecked
              />
              <Switch
                label="Prorate mid-cycle upgrades"
                description="Charge the difference immediately instead of at renewal."
                defaultChecked
              />
              <Switch
                label="Auto-suspend after the dunning window"
                description="Storefront goes offline; data is retained for 30 days."
                defaultChecked
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <ShieldCheck className="h-3.5 w-3.5" />
              Security policy
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Operator session length (hours)">
                <Input type="number" defaultValue={8} min={1} max={72} />
              </Field>
              <Field label="Merchant session length (days)">
                <Input type="number" defaultValue={14} min={1} max={90} />
              </Field>
              <Field label="Failed logins before lockout">
                <Input type="number" defaultValue={5} min={3} max={20} />
              </Field>
              <Field label="Audit retention (months)">
                <Input type="number" defaultValue={24} min={6} max={84} />
              </Field>
              <Field
                label="Operator IP allowlist"
                className="sm:col-span-2"
                hint="One CIDR block per line. Empty means no restriction."
              >
                <Textarea rows={2} defaultValue={"103.21.244.0/22\n49.36.0.0/14"} />
              </Field>
            </div>
            <div className="mt-4 space-y-3.5 border-t border-line pt-4">
              <Switch label="Require MFA for platform operators" description="Enforced at sign-in." defaultChecked />
              <Switch
                label="Require MFA for merchant owners"
                description="Existing owners get a 30-day grace period before enforcement."
              />
              <Switch
                label="Log operator impersonation"
                description="Cannot be turned off — impersonation is always recorded."
                defaultChecked
                disabled
              />
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-[12.5px] font-semibold text-ink">Feature availability</h2>
            <p className="mb-4 text-[12px] leading-relaxed text-ink-muted">
              A global kill switch sits above the per-plan entitlement. Turning a capability off here hides it from
              every tenant regardless of plan — useful when shipping something new to a subset first.
            </p>
            <ul className="divide-y divide-line">
              {FEATURE_TOGGLES.map((feature) => (
                <li key={feature.key} className="py-3.5 first:pt-0 last:pb-0">
                  <Switch
                    label={feature.label}
                    description={feature.description}
                    defaultChecked={feature.enabled}
                  />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Server className="h-3.5 w-3.5" />
              This deployment
            </h2>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <Row label="Tenants" value={number(stores.length)} />
              <Row label="Active" value={number(activeStores)} />
              <Row label="Plans" value={number(plans.length)} />
              <Row label="Data mode" value="In-memory seed" />
              <Row label="Currency" value="INR (paise)" />
              <Row label="Runtime" value="Next.js App Router" />
            </dl>
            <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-relaxed text-ink-muted">
              This build runs against a deterministic in-memory seed so every reviewer sees identical numbers. Writes
              you make — orders, status changes, theme edits — persist for the life of the server process.
            </p>
          </Card>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Multi-tenant isolation</h2>
            <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-ink-muted">
              <li>
                Every query is scoped by <code className="text-[11px]">storeId</code> at the repository layer, so a
                missing filter is a type error rather than a data leak.
              </li>
              <li>Tenants resolve from the host header, then a signed cookie in this demo build.</li>
              <li>Media, search indexes and caches are namespaced per tenant.</li>
              <li>Exports and webhooks carry the tenant id and are signed per store.</li>
            </ul>
            <Link href="/platform/audit-logs" className={buttonClasses("outline", "xs", true) + " mt-4"}>
              Review the audit trail
            </Link>
          </Card>

          <Card className="border-danger/35">
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-danger">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo data
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              Rebuilds the seed from scratch. Orders you placed, status transitions, inventory adjustments and theme
              edits made during this session are discarded and every number returns to its documented baseline.
            </p>
            <ResetDatabaseButton />
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
      <dd className="truncate text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
