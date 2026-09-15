import type { Metadata } from "next";
import { FlaskConical, GitBranch, Users2 } from "lucide-react";
import { getPlans, listAllStores } from "@obsidian/data";
import { Badge, Card, Progress, Stat, Switch } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { NOW, formatDate, number, percent } from "@/lib/format";

export const metadata: Metadata = { title: "Feature flags" };

type Rollout =
  | { kind: "off" }
  | { kind: "all" }
  | { kind: "percent"; value: number }
  | { kind: "plans"; plans: string[] }
  | { kind: "stores"; stores: string[] };

const FLAGS: {
  key: string;
  name: string;
  description: string;
  rollout: Rollout;
  owner: string;
  createdDaysAgo: number;
  permanent: boolean;
}[] = [
  {
    key: "checkout.express",
    name: "Express checkout",
    description: "One-tap checkout for returning shoppers with a saved address and payment method.",
    rollout: { kind: "percent", value: 25 },
    owner: "Commerce",
    createdDaysAgo: 18,
    permanent: false,
  },
  {
    key: "search.semantic",
    name: "Semantic search",
    description: "Embedding-based ranking layered over the keyword index, with the keyword result as a floor.",
    rollout: { kind: "plans", plans: ["plan_professional", "plan_enterprise"] },
    owner: "Discovery",
    createdDaysAgo: 42,
    permanent: false,
  },
  {
    key: "pdp.video",
    name: "Product video",
    description: "Video in the product gallery, autoplaying muted on desktop only.",
    rollout: { kind: "all" },
    owner: "Storefront",
    createdDaysAgo: 96,
    permanent: true,
  },
  {
    key: "admin.bulk-edit",
    name: "Bulk product edit",
    description: "Edit price, status and collections across a filtered selection in one pass.",
    rollout: { kind: "percent", value: 60 },
    owner: "Admin",
    createdDaysAgo: 11,
    permanent: false,
  },
  {
    key: "b2b.pricelists",
    name: "B2B price lists",
    description: "Company accounts with negotiated price lists, quotes and net payment terms.",
    rollout: { kind: "stores", stores: ["formline", "voltwire"] },
    owner: "Commerce",
    createdDaysAgo: 7,
    permanent: false,
  },
  {
    key: "ai.descriptions",
    name: "AI description drafting",
    description: "Generates a first-draft product description from the attribute set.",
    rollout: { kind: "plans", plans: ["plan_growth", "plan_professional", "plan_enterprise"] },
    owner: "Catalog",
    createdDaysAgo: 63,
    permanent: false,
  },
  {
    key: "checkout.wallet-first",
    name: "Wallet-first payment order",
    description: "Reorders the payment list to put wallets above cards. Reverted after a conversion drop.",
    rollout: { kind: "off" },
    owner: "Commerce",
    createdDaysAgo: 34,
    permanent: false,
  },
];

export default function FeatureFlagsPage() {
  const stores = listAllStores();
  const plans = getPlans();
  const planName = new Map(plans.map((p) => [p.id, p.name]));
  const storeName = new Map(stores.map((s) => [s.id, s.name]));

  const reach = (rollout: Rollout): number => {
    switch (rollout.kind) {
      case "off":
        return 0;
      case "all":
        return stores.length;
      case "percent":
        return Math.round((stores.length * rollout.value) / 100);
      case "plans":
        return stores.filter((s) => rollout.plans.includes(s.planId)).length;
      case "stores":
        return rollout.stores.length;
    }
  };

  const describe = (rollout: Rollout): string => {
    switch (rollout.kind) {
      case "off":
        return "Off everywhere";
      case "all":
        return "Everyone";
      case "percent":
        return `${rollout.value}% of tenants`;
      case "plans":
        return rollout.plans.map((p) => planName.get(p) ?? p).join(", ");
      case "stores":
        return rollout.stores.map((s) => storeName.get(s) ?? s).join(", ");
    }
  };

  const live = FLAGS.filter((f) => f.rollout.kind !== "off");
  const partial = FLAGS.filter((f) => f.rollout.kind === "percent" || f.rollout.kind === "stores");
  const stale = FLAGS.filter((f) => !f.permanent && f.createdDaysAgo > 60);

  return (
    <>
      <AdminPageHeader
        title="Feature flags"
        description="Global rollout control. A flag is a temporary thing — anything still partially rolled out after sixty days is either finished or abandoned, and both need a decision."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Flags" value={number(FLAGS.length)} hint={`${live.length} live`} />
        <Stat label="Partial rollouts" value={number(partial.length)} />
        <Stat label="Permanent" value={number(FLAGS.filter((f) => f.permanent).length)} hint="No longer a flag" />
        <Stat label="Stale" value={number(stale.length)} hint="Older than 60 days" invertDelta />
      </div>

      {stale.length > 0 && (
        <Card className="mt-5 border-warning/40 bg-warning/[0.05]">
          <div className="flex items-start gap-3">
            <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <h2 className="text-[12.5px] font-semibold text-ink">
                {stale.length} flag{stale.length === 1 ? "" : "s"} older than sixty days
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                {stale.map((f) => f.name).join(", ")}. Every one of these is a branch in the code that someone has
                to reason about. Ship it to everyone or delete it.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-5 space-y-3">
        {FLAGS.map((flag) => {
          const covered = reach(flag.rollout);
          const share = (covered / Math.max(1, stores.length)) * 100;
          const isStale = !flag.permanent && flag.createdDaysAgo > 60;
          return (
            <Card key={flag.key} padded={false}>
              <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <h2 className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-ink">
                    {flag.name}
                    <code className="rounded-[3px] bg-muted px-1.5 py-0.5 text-[11px] font-normal text-ink-muted">
                      {flag.key}
                    </code>
                    {flag.permanent && (
                      <Badge tone="success" size="xs">
                        Permanent
                      </Badge>
                    )}
                    {isStale && (
                      <Badge tone="warning" size="xs">
                        Stale
                      </Badge>
                    )}
                  </h2>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{flag.description}</p>
                  <p className="mt-2.5 text-[11.5px] text-ink-muted">
                    {flag.owner} · created{" "}
                    {formatDate(new Date(NOW.getTime() - flag.createdDaysAgo * 86_400_000).toISOString())}
                  </p>
                </div>

                <div className="w-full shrink-0 sm:w-[220px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.1em] text-ink-muted">Rollout</span>
                    <Switch
                      aria-label={`Enable ${flag.name}`}
                      defaultChecked={flag.rollout.kind !== "off"}
                    />
                  </div>
                  <p className="mt-2 text-[12.5px] text-ink">{describe(flag.rollout)}</p>
                  <Progress
                    className="mt-2"
                    value={share}
                    tone={share === 0 ? "danger" : share >= 100 ? "success" : "primary"}
                    height={5}
                  />
                  <p className="mt-1.5 text-[11px] tabular-nums text-ink-muted">
                    {number(covered)} of {number(stores.length)} tenants · {percent(share)}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Card tone="muted">
          <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
            <FlaskConical className="h-3.5 w-3.5" />
            Rollout order
          </h2>
          <ol className="mt-3 space-y-1.5 text-[12px] text-ink-muted">
            <li>1. Internal tenants only</li>
            <li>2. One friendly merchant who agreed to it</li>
            <li>3. 5% of tenants, watching error rate and conversion</li>
            <li>4. 25%, then 60%, holding a day at each step</li>
            <li>5. Everyone, then delete the flag within two weeks</li>
          </ol>
        </Card>

        <Card tone="muted">
          <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
            <Users2 className="h-3.5 w-3.5" />
            Targeting
          </h2>
          <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
            Percentage rollouts hash on tenant id, so a store never flickers between variants between requests. Plan
            targeting is evaluated on every request, which means a tenant that upgrades gets the feature
            immediately rather than at the next deploy.
          </p>
        </Card>
      </div>
    </>
  );
}
