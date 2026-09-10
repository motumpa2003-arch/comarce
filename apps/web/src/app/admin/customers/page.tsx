import type { Metadata } from "next";
import { Download, Mail } from "lucide-react";
import { Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CustomersTable } from "@/components/admin/customers-table";
import { money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const db = await currentStore();

  const rows = db.customers.map((customer) => ({
    id: customer.id,
    name: `${customer.firstName} ${customer.lastName}`,
    email: customer.email,
    phone: customer.phone,
    avatar: customer.avatar,
    city: customer.addresses[0]?.city ?? "—",
    ordersCount: customer.ordersCount,
    lifetimeValue: customer.lifetimeValue,
    averageOrderValue: customer.averageOrderValue,
    loyaltyTier: customer.loyaltyTier,
    loyaltyPoints: customer.loyaltyPoints,
    storeCredit: customer.storeCredit,
    segments: customer.segments,
    marketingOptIn: customer.marketingOptIn,
    lastOrderAt: customer.lastOrderAt,
    createdAt: customer.createdAt,
    status: customer.status,
  }));

  const totalLtv = rows.reduce((n, r) => n + r.lifetimeValue, 0);
  const vip = rows.filter((r) => r.segments.includes("vip"));
  const inactive = rows.filter((r) => r.segments.includes("inactive"));
  const optedIn = rows.filter((r) => r.marketingOptIn);

  return (
    <>
      <AdminPageHeader
        title="Customers"
        description={`${number(rows.length)} customer records, segmented automatically from order behaviour. Segments drive campaign audiences and coupon eligibility.`}
        breadcrumbs={[{ label: "Customers" }, { label: "All customers" }]}
        actions={
          <>
            <button type="button" className={buttonClasses("outline", "sm")}>
              <Mail className="h-3.5 w-3.5" />
              Email selection
            </button>
            <button type="button" className={buttonClasses("outline", "sm")}>
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total lifetime value" value={money(totalLtv)} hint="Across all customers" />
        <Stat
          label="Average LTV"
          value={money(Math.round(totalLtv / Math.max(1, rows.length)))}
          hint={`${number(rows.reduce((n, r) => n + r.ordersCount, 0))} orders total`}
        />
        <Stat label="VIP customers" value={number(vip.length)} hint={`${money(vip.reduce((n, r) => n + r.lifetimeValue, 0))} combined`} />
        <Stat
          label="Marketing opt-in"
          value={`${Math.round((optedIn.length / Math.max(1, rows.length)) * 100)}%`}
          hint={`${number(inactive.length)} inactive to win back`}
        />
      </div>

      <CustomersTable rows={rows} />
    </>
  );
}
