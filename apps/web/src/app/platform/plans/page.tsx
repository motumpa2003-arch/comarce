import type { Metadata } from "next";
import { Check, Plus } from "lucide-react";
import { aggregateMrr, getPlans, getSubscriptions, isBilling } from "@obsidian/data";
import { Badge, Card, Stat, buttonClasses, cn } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { money, number, percent } from "@/lib/format";

export const metadata: Metadata = { title: "Plans" };

const LIMIT_ROWS: { key: keyof ReturnType<typeof getPlans>[number]["limits"]; label: string }[] = [
  { key: "products", label: "Products" },
  { key: "staff", label: "Staff seats" },
  { key: "monthlyOrders", label: "Monthly orders" },
  { key: "storageGb", label: "Media storage (GB)" },
  { key: "warehouses", label: "Warehouses" },
  { key: "customDomain", label: "Custom domain" },
  { key: "apiAccess", label: "API access" },
  { key: "advancedAnalytics", label: "Advanced analytics" },
  { key: "abandonedCart", label: "Abandoned cart" },
  { key: "marketplace", label: "Marketplace mode" },
];

function formatLimit(value: number | boolean): React.ReactNode {
  if (typeof value === "boolean") {
    return value ? <Check className="mx-auto h-3.5 w-3.5 text-success" /> : <span className="text-ink-muted/40">—</span>;
  }
  return value >= 1_000_000 ? "Unlimited" : number(value);
}

export default function PlatformPlansPage() {
  const plans = getPlans();
  const subscriptions = getSubscriptions();

  const stats = plans.map((plan) => {
    const active = subscriptions.filter((s) => s.planId === plan.id && isBilling(s));
    const mrr = aggregateMrr(active);
    return { plan, stores: active.length, mrr };
  });

  const totalMrr = stats.reduce((n, s) => n + s.mrr, 0);

  return (
    <>
      <AdminPageHeader
        title="Plans"
        description="Subscription tiers and the entitlements each one unlocks. Limits are enforced server-side, so a store on Starter cannot create a fourth warehouse by calling the API."
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New plan
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Plans" value={number(plans.length)} />
        <Stat label="Total MRR" value={money(totalMrr)} />
        <Stat
          label="Paying stores"
          value={number(stats.reduce((n, s) => n + s.stores, 0))}
        />
        <Stat
          label="Average revenue per store"
          value={money(Math.round(totalMrr / Math.max(1, stats.reduce((n, s) => n + s.stores, 0))))}
        />
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ plan, stores, mrr }) => (
          <Card key={plan.id} className={cn(plan.popular && "border-accent ring-1 ring-accent")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">{plan.name}</h2>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{plan.tagline}</p>
              </div>
              {plan.popular && (
                <Badge tone="accent" size="xs">
                  Popular
                </Badge>
              )}
            </div>

            <p className="mt-4 font-display text-[26px] leading-none text-ink">
              {money(plan.monthlyPrice)}
              <span className="ml-1 text-[12px] font-normal text-ink-muted">/mo</span>
            </p>
            <p className="mt-1 text-[11.5px] text-ink-muted">
              {money(plan.annualPrice)} annually · {percent(plan.transactionFeeBps / 100, 2)} transaction fee
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3.5 text-[12px]">
              <div>
                <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Stores</dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-ink">{number(stores)}</dd>
              </div>
              <div>
                <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">MRR</dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-ink">{money(mrr)}</dd>
              </div>
            </dl>

            <ul className="mt-4 space-y-1.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-[11.5px] text-ink-muted">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                  {feature}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">Entitlement matrix</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            What each plan permits. These values are read by the server on every write.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-muted/50">
              <tr>
                <th className="px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                  Entitlement
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    className="px-4 py-2.5 text-center text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {LIMIT_ROWS.map((row) => (
                <tr key={row.key} className="hover:bg-muted/40">
                  <td className="px-5 py-2.5 text-ink">{row.label}</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-4 py-2.5 text-center tabular-nums text-ink-muted">
                      {formatLimit(plan.limits[row.key])}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-muted/30">
                <td className="px-5 py-2.5 font-medium text-ink">Transaction fee</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="px-4 py-2.5 text-center tabular-nums text-ink">
                    {percent(plan.transactionFeeBps / 100, 2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
