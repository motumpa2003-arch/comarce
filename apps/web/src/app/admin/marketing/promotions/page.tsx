import type { Metadata } from "next";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, money, number, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Promotions" };

export default async function AdminPromotionsPage() {
  const db = await currentStore();
  const active = db.promotions.filter((p) => p.status === "active");
  const revenue = db.promotions.reduce((n, p) => n + p.revenue, 0);
  const orders = db.promotions.reduce((n, p) => n + p.ordersInfluenced, 0);

  return (
    <>
      <AdminPageHeader
        title="Promotions"
        description="Automatic discounts that need no code — flash sales, spend-and-save thresholds, bundles and clearance. They apply at the cart, before any coupon."
        breadcrumbs={[{ label: "Marketing" }, { label: "Promotions" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New promotion
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Running now" value={number(active.length)} hint={`${number(db.promotions.length)} configured`} />
        <Stat label="Revenue influenced" value={money(revenue)} />
        <Stat label="Orders influenced" value={number(orders)} />
        <Stat
          label="Average uplift"
          value={orders > 0 ? money(Math.round(revenue / orders)) : "—"}
          hint="Per influenced order"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {db.promotions.map((promotion) => (
          <Card key={promotion.id} padded={false} className="overflow-hidden">
            <div className="relative aspect-[21/9] bg-muted">
              {promotion.banner && (
                <Image src={promotion.banner} alt="" fill sizes="480px" className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div>
                  <p className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-accent">
                    {titleCase(promotion.kind.replace(/_/g, " "))}
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-inverse">{promotion.name}</p>
                </div>
                <Badge
                  tone={
                    promotion.status === "active"
                      ? "success"
                      : promotion.status === "scheduled"
                        ? "info"
                        : "neutral"
                  }
                  size="xs"
                >
                  {promotion.status}
                </Badge>
              </div>
            </div>

            <div className="p-4">
              <p className="text-[12.5px] leading-relaxed text-ink-muted">{promotion.description}</p>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Mechanic</dt>
                  <dd className="mt-0.5 text-ink">
                    {promotion.discountPercent
                      ? `${promotion.discountPercent}% off`
                      : promotion.spendThreshold && promotion.saveAmount
                        ? `Spend ${money(promotion.spendThreshold)}, save ${money(promotion.saveAmount)}`
                        : "Bundle pricing"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Window</dt>
                  <dd className="mt-0.5 text-ink-muted">
                    {formatDate(promotion.startsAt)} – {formatDate(promotion.endsAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Revenue</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-ink">{money(promotion.revenue)}</dd>
                </div>
                <div>
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Orders</dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-ink">
                    {number(promotion.ordersInfluenced)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex gap-2">
                <button type="button" className={buttonClasses("outline", "xs")}>
                  Edit
                </button>
                <button type="button" className={buttonClasses("ghost", "xs")}>
                  {promotion.status === "active" ? "Pause" : "Activate"}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
