import type { Metadata } from "next";
import { Download, Plus } from "lucide-react";
import { getPlans, getSubscriptions, listAllStores, listStoreDatabases, monthlyMrr } from "@obsidian/data";
import { Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StoresTable } from "@/components/platform/stores-table";
import { money, number } from "@/lib/format";

export const metadata: Metadata = { title: "Stores" };

export default function PlatformStoresPage() {
  const stores = listAllStores();
  const subscriptions = getSubscriptions();
  const plans = getPlans();
  const seededIds = new Set(listStoreDatabases().map((db) => db.store.id));

  const rows = stores.map((store) => {
    const subscription = subscriptions.find((s) => s.storeId === store.id);
    const plan = plans.find((p) => p.id === store.planId);
    return {
      id: store.id,
      name: store.name,
      logoMark: store.logoMark,
      domain: store.customDomain ?? store.domain,
      industry: store.industry,
      status: store.status,
      planName: plan?.name ?? "—",
      planId: store.planId,
      mrr: subscription ? monthlyMrr(subscription) : 0,
      subscriptionStatus: subscription?.status ?? "none",
      interval: subscription?.interval ?? "monthly",
      renewsAt: subscription?.currentPeriodEnd,
      gmv: store.metrics.gmv,
      orders: store.metrics.orders,
      customers: store.metrics.customers,
      products: store.metrics.products,
      conversionRate: store.metrics.conversionRate,
      createdAt: store.createdAt,
      hasCatalogue: seededIds.has(store.id),
    };
  });

  const mrr = rows
    .filter((r) => ["active", "trialing"].includes(r.subscriptionStatus))
    .reduce((n, r) => n + r.mrr, 0);

  return (
    <>
      <AdminPageHeader
        title="Stores"
        description="Every tenant on the platform. Stores marked “Seeded” have a full demo catalogue you can open in the merchant admin; the rest exist as SaaS records only."
        actions={
          <>
            <button type="button" className={buttonClasses("outline", "sm")}>
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button type="button" className={buttonClasses("primary", "sm")}>
              <Plus className="h-3.5 w-3.5" />
              Provision store
            </button>
          </>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Tenants" value={number(rows.length)} hint={`${rows.filter((r) => r.status === "active").length} active`} />
        <Stat label="Combined MRR" value={money(mrr)} />
        <Stat label="Platform GMV" value={money(rows.reduce((n, r) => n + r.gmv, 0))} hint="Last 30 days" />
        <Stat
          label="Products listed"
          value={number(rows.reduce((n, r) => n + r.products, 0))}
          hint="Across all catalogues"
        />
      </div>

      <StoresTable rows={rows} />
    </>
  );
}
