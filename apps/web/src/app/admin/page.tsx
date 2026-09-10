import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowRight,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { ORDER_STATUS_META } from "@obsidian/commerce";
import {
  buildChannels,
  buildFunnel,
  buildTopProducts,
  getLowStockRecords,
  summariseKpis,
} from "@obsidian/data";
import { Badge, Stat } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  ChartFrame,
  FunnelBars,
  OrdersBarChart,
  RankedBars,
  RevenueAreaChart,
  SERIES,
  Sparkline,
} from "@/components/admin/charts";
import { DashboardRangeTabs } from "@/components/admin/dashboard-range-tabs";
import { formatDate, money, moneyShort, number, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "30" } = await searchParams;
  const db = await currentStore();

  const windowDays = Number(range) || 30;
  const metrics = db.metrics.slice(-windowDays);
  const kpis = summariseKpis(db.metrics, windowDays);
  const funnel = buildFunnel(db.metrics, windowDays);
  const channels = buildChannels(db.store.id, db.metrics);
  const topProducts = buildTopProducts(db.products, db.orders, 6);
  const lowStock = getLowStockRecords(db.store.id).slice(0, 6);

  const recentOrders = db.orders.slice(0, 7);
  const openOrders = db.orders.filter((o) =>
    ["pending", "payment_pending", "confirmed", "processing", "packed"].includes(o.status),
  );

  const topCategories = db.categories
    .filter((c) => c.level === 0)
    .map((category) => ({
      label: category.name,
      value: db.orders
        .flatMap((o) => o.items)
        .filter((item) => {
          const product = db.products.find((p) => p.id === item.productId);
          return product?.categoryPath.includes(category.id);
        })
        .reduce((n, item) => n + item.total, 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const hour = new Date(db.metrics[db.metrics.length - 1]?.date ?? Date.now()).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <AdminPageHeader
        title={`${greeting}, ${db.store.name}`}
        description={`Here is how the store performed over the last ${windowDays} days.`}
        actions={<DashboardRangeTabs active={range} />}
      />

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Revenue"
          value={money(kpis.revenue)}
          delta={kpis.revenueDelta}
          hint="vs previous period"
          icon={<IndianRupee className="h-4 w-4" />}
        />
        <Stat
          label="Orders"
          value={number(kpis.orders)}
          delta={kpis.ordersDelta}
          hint={`${openOrders.length} awaiting action`}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <Stat
          label="Average order value"
          value={money(kpis.averageOrderValue)}
          delta={kpis.averageOrderValueDelta}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <Stat
          label="Conversion rate"
          value={`${kpis.conversionRate.toFixed(2)}%`}
          delta={kpis.conversionRateDelta}
          hint={`${number(kpis.customers)} new customers`}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Units sold" value={number(kpis.unitsSold)} delta={kpis.unitsSoldDelta} />
        <Stat label="Gross profit" value={money(kpis.grossProfit)} delta={kpis.grossProfitDelta} hint="41% margin" />
        <Stat label="Refund rate" value={`${kpis.refundRate}%`} delta={kpis.refundRateDelta} invertDelta />
        <Stat label="Catalogue" value={number(db.products.length)} hint={`${db.categories.length} categories`} />
      </div>

      {/* Charts */}
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <ChartFrame
          title="Revenue"
          description={`Daily revenue over the last ${windowDays} days · ${money(kpis.revenue)} total`}
          height={280}
          footer={
            <span>
              Peak day {money(Math.max(...metrics.map((m) => m.revenue)))} ·{" "}
              {formatDate(metrics[metrics.length - 1]?.date ?? "")} is the most recent close.
            </span>
          }
        >
          <RevenueAreaChart data={metrics} height={280} />
        </ChartFrame>

        <ChartFrame
          title="Conversion funnel"
          description="Sessions through to placed orders"
          height={280}
        >
          <FunnelBars stages={funnel} />
        </ChartFrame>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <ChartFrame title="Orders per day" description="Volume, not value" height={200}>
          <OrdersBarChart data={metrics} height={200} />
        </ChartFrame>

        <ChartFrame title="Revenue by category" description="Lifetime, all channels" height={200}>
          <RankedBars rows={topCategories} format="moneyShort" color={SERIES[0]} />
        </ChartFrame>

        <ChartFrame
          title="Traffic by channel"
          description="Sessions and revenue, last 30 days"
          height={200}
          footer="Percentages are share of total sessions."
        >
          <div className="h-full overflow-y-auto">
            <table className="w-full text-left text-[11.5px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="pb-1.5 font-medium text-ink-muted">Channel</th>
                  <th className="pb-1.5 text-right font-medium text-ink-muted">Sessions</th>
                  <th className="pb-1.5 text-right font-medium text-ink-muted">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {channels.map((channel) => (
                  <tr key={channel.channel}>
                    <td className="py-1.5 text-ink">
                      {channel.channel}
                      <span className="ml-1.5 tabular-nums text-ink-muted">{channel.share}%</span>
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-ink-muted">{number(channel.sessions)}</td>
                    <td className="py-1.5 text-right tabular-nums text-ink">{moneyShort(channel.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartFrame>
      </div>

      {/* Operational lists */}
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Recent orders"
          action={{ label: "All orders", href: "/admin/orders" }}
        >
          <ul className="divide-y divide-line">
            {recentOrders.map((order) => {
              const meta = ORDER_STATUS_META[order.status];
              return (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[12.5px] font-medium text-ink">
                        #{order.orderNumber}
                        <Badge tone={meta.tone} size="xs">
                          {meta.label}
                        </Badge>
                      </p>
                      <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                        {order.customerName} · {order.itemCount} item{order.itemCount === 1 ? "" : "s"} ·{" "}
                        {relativeTime(order.createdAt)}
                      </p>
                    </div>
                    <p className="shrink-0 text-[13px] font-medium tabular-nums text-ink">{money(order.total)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Top products" action={{ label: "Analytics", href: "/admin/analytics" }}>
            <ul className="divide-y divide-line">
              {topProducts.map((product, index) => (
                <li key={product.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="w-4 shrink-0 text-[11px] tabular-nums text-ink-muted">{index + 1}</span>
                  {product.image && (
                    <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-[3px] bg-muted">
                      <Image src={product.image} alt="" fill sizes="32px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] text-ink">{product.name}</p>
                    <p className="text-[11px] text-ink-muted">{number(product.units)} sold</p>
                  </div>
                  <p className="shrink-0 text-[12px] font-medium tabular-nums text-ink">
                    {moneyShort(product.revenue)}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Low stock"
            badge={
              lowStock.length > 0 ? (
                <Badge tone="warning" size="xs">
                  <AlertTriangle className="h-3 w-3" />
                  {getLowStockRecords(db.store.id).length} SKUs
                </Badge>
              ) : undefined
            }
            action={{ label: "Inventory", href: "/admin/inventory" }}
          >
            <ul className="divide-y divide-line">
              {lowStock.map((record) => {
                const product = db.products.find((p) => p.id === record.productId);
                const variant = product?.variants.find((v) => v.id === record.variantId);
                const available = record.onHand - record.reserved;
                return (
                  <li key={record.id} className="flex items-center gap-3 px-5 py-2.5">
                    <Package className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-ink">{product?.name ?? "Unknown"}</p>
                      <p className="truncate text-[11px] text-ink-muted">
                        {variant?.title} · {variant?.sku}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[12px] font-medium tabular-nums ${
                        available === 0 ? "text-danger" : "text-warning"
                      }`}
                    >
                      {available === 0 ? "Out" : `${available} left`}
                    </span>
                  </li>
                );
              })}
              {lowStock.length === 0 && (
                <li className="px-5 py-8 text-center text-[12px] text-ink-muted">Everything is above reorder point.</li>
              )}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Sparkline strip */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Revenue trend", key: "revenue", color: SERIES[0], value: money(kpis.revenue) },
          { label: "Orders trend", key: "orders", color: SERIES[2], value: number(kpis.orders) },
          { label: "Sessions trend", key: "visitors", color: SERIES[3], value: number(metrics.reduce((n, m) => n + m.visitors, 0)) },
        ].map((entry) => (
          <div key={entry.key} className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-muted">{entry.label}</p>
              <p className="text-[15px] font-semibold tabular-nums text-ink">{entry.value}</p>
            </div>
            <div className="mt-2">
              <Sparkline data={metrics} dataKey={entry.key} color={entry.color} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Panel({
  title,
  action,
  badge,
  children,
}: {
  title: string;
  action?: { label: string; href: string };
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
          {title}
          {badge}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="group inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-ink"
          >
            {action.label}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
