import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CouponsTable } from "@/components/admin/coupons-table";
import { money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const db = await currentStore();

  // Attribute realised discount back to the code that produced it.
  const discountByCode = new Map<string, { orders: number; discount: number; revenue: number }>();
  for (const order of db.orders) {
    if (!order.couponCode || ["cancelled", "refunded"].includes(order.status)) continue;
    const entry = discountByCode.get(order.couponCode) ?? { orders: 0, discount: 0, revenue: 0 };
    entry.orders += 1;
    entry.discount += order.discount;
    entry.revenue += order.total;
    discountByCode.set(order.couponCode, entry);
  }

  const rows = db.coupons.map((coupon) => {
    const performance = discountByCode.get(coupon.code) ?? { orders: 0, discount: 0, revenue: 0 };
    return {
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumSpend: coupon.minimumSpend,
      maximumDiscount: coupon.maximumDiscount,
      eligibility: coupon.customerEligibility,
      usedCount: coupon.usedCount,
      usageLimit: coupon.usageLimit,
      status: coupon.status,
      startsAt: coupon.startsAt,
      endsAt: coupon.endsAt,
      stackable: coupon.stackable,
      attributedOrders: performance.orders,
      attributedDiscount: performance.discount,
      attributedRevenue: performance.revenue,
    };
  });

  const active = rows.filter((r) => r.status === "active");
  const totalDiscount = rows.reduce((n, r) => n + r.attributedDiscount, 0);
  const totalRevenue = rows.reduce((n, r) => n + r.attributedRevenue, 0);

  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description="Discount codes with eligibility rules, spend thresholds and caps. Validation runs on the server, so a code can never be forced by a client."
        breadcrumbs={[{ label: "Marketing" }, { label: "Coupons" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New coupon
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active codes" value={number(active.length)} hint={`${number(rows.length)} configured`} />
        <Stat label="Redemptions" value={number(rows.reduce((n, r) => n + r.attributedOrders, 0))} hint="Orders with a code" />
        <Stat label="Discount given" value={money(totalDiscount)} />
        <Stat
          label="Revenue influenced"
          value={money(totalRevenue)}
          hint={totalDiscount > 0 ? `${(totalRevenue / totalDiscount).toFixed(1)}× return on discount` : undefined}
        />
      </div>

      <CouponsTable rows={rows} />
    </>
  );
}
