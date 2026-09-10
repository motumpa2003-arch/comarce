import type { Metadata } from "next";
import { ArrowRight, Clock, Plus, Zap } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { money, number, percent, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Automations" };

function describeDelay(minutes: number): string {
  if (minutes === 0) return "Immediately";
  if (minutes < 60) return `After ${minutes} min`;
  if (minutes < 1440) return `After ${Math.round(minutes / 60)} h`;
  return `After ${Math.round(minutes / 1440)} days`;
}

export default async function AdminAutomationsPage() {
  const db = await currentStore();
  const automations = db.automations;
  const active = automations.filter((a) => a.status === "active");
  const revenue = automations.reduce((n, a) => n + a.revenue30d, 0);
  const runs = automations.reduce((n, a) => n + a.runs30d, 0);

  // Group by trigger so the abandoned-cart ladder reads as one flow.
  const byTrigger = new Map<string, typeof automations>();
  for (const automation of automations) {
    byTrigger.set(automation.trigger, [...(byTrigger.get(automation.trigger) ?? []), automation]);
  }

  return (
    <>
      <AdminPageHeader
        title="Automations"
        description="Event-driven flows. A trigger fires, an optional delay elapses, then one or more actions run. The abandoned-cart ladder below is three rules on one trigger."
        breadcrumbs={[{ label: "Marketing" }, { label: "Automations" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New automation
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active flows" value={number(active.length)} hint={`${number(automations.length)} configured`} />
        <Stat label="Runs (30 days)" value={number(runs)} />
        <Stat label="Attributed revenue" value={money(revenue)} hint="Last 30 days" />
        <Stat
          label="Best converting"
          value={percent(Math.max(...automations.map((a) => a.conversionRate)))}
          hint={automations.reduce((best, a) => (a.conversionRate > best.conversionRate ? a : best)).name}
        />
      </div>

      <div className="space-y-4">
        {[...byTrigger.entries()].map(([trigger, rules]) => (
          <Card key={trigger} padded={false}>
            <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <h2 className="text-[12.5px] font-semibold text-ink">
                When <span className="text-primary">{titleCase(trigger.replace(/_/g, " "))}</span>
              </h2>
              <span className="ml-auto text-[11.5px] text-ink-muted">
                {rules.length} rule{rules.length === 1 ? "" : "s"}
              </span>
            </div>

            <ul className="divide-y divide-line">
              {[...rules]
                .sort((a, b) => a.delayMinutes - b.delayMinutes)
                .map((rule) => (
                  <li key={rule.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                    <span className="flex w-32 shrink-0 items-center gap-1.5 text-[11.5px] text-ink-muted">
                      <Clock className="h-3 w-3" />
                      {describeDelay(rule.delayMinutes)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-ink">
                        {rule.name}
                        <Badge tone={rule.status === "active" ? "success" : "warning"} size="xs">
                          {rule.status}
                        </Badge>
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-muted">
                        {rule.actions.map((action, index) => (
                          <span key={`${action.type}-${index}`} className="flex items-center gap-1.5">
                            {index > 0 && <ArrowRight className="h-3 w-3" />}
                            <span className="rounded-full border border-line px-2 py-0.5">
                              {titleCase(action.type)} · {action.template}
                            </span>
                          </span>
                        ))}
                      </p>
                    </div>

                    <dl className="flex shrink-0 flex-wrap gap-x-6 gap-y-1 text-[11.5px]">
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">Runs</dt>
                        <dd className="tabular-nums text-ink">{number(rule.runs30d)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">Conv.</dt>
                        <dd className="tabular-nums text-ink">{percent(rule.conversionRate)}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-muted">Revenue</dt>
                        <dd className="font-medium tabular-nums text-ink">{money(rule.revenue30d)}</dd>
                      </div>
                    </dl>

                    <button type="button" className={buttonClasses("outline", "xs")}>
                      Edit
                    </button>
                  </li>
                ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
