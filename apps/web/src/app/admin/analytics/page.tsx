import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import {
  buildChannels,
  buildCohorts,
  buildFunnel,
  buildTopProducts,
  summariseKpis,
} from "@obsidian/data";
import { Card, Stat, buttonClasses, cn } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  ChartFrame,
  FunnelBars,
  MultiLineChart,
  OrdersBarChart,
  RankedBars,
  RevenueAreaChart,
  SERIES,
} from "@/components/admin/charts";
import { DashboardRangeTabs } from "@/components/admin/dashboard-range-tabs";
import { money, moneyShort, number, percent } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range = "90" } = await searchParams;
  const db = await currentStore();
  const windowDays = Number(range) || 90;

  const metrics = db.metrics.slice(-windowDays);
  const kpis = summariseKpis(db.metrics, windowDays);
  const funnel = buildFunnel(db.metrics, windowDays);
  const channels = buildChannels(db.store.id, db.metrics);
  const cohorts = buildCohorts(db.store.id, new Date(db.metrics[db.metrics.length - 1]!.date), 8);
  const topProducts = buildTopProducts(db.products, db.orders, 10);

  const categoryRevenue = db.categories
    .filter((c) => c.level === 0)
    .map((category) => ({
      label: category.name,
      value: db.orders
        .flatMap((o) => o.items)
        .filter((item) => db.products.find((p) => p.id === item.productId)?.categoryPath.includes(category.id))
        .reduce((n, item) => n + item.total, 0),
    }))
    .sort((a, b) => b.value - a.value);

  const paymentMix = ["upi", "card", "cod", "netbanking", "wallet", "bnpl"].map((method) => ({
    label: method.toUpperCase(),
    value: db.orders.filter((o) => o.paymentMethod === method).length,
  }));

  // Sessions and conversions share a unit (counts) so they belong on one axis.
  const trafficSeries = metrics.map((point) => ({
    date: point.date,
    sessions: point.visitors,
    addToCart: point.addToCart,
    checkouts: point.checkouts,
  }));

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description={`Store performance over the last ${windowDays} days. Every figure below is computed from the same metric series the dashboard reads.`}
        breadcrumbs={[{ label: "Overview" }, { label: "Analytics" }]}
        actions={
          <>
            <DashboardRangeTabs active={range} />
            <button type="button" className={buttonClasses("outline", "sm")}>
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue" value={money(kpis.revenue)} delta={kpis.revenueDelta} hint="vs previous period" />
        <Stat label="Orders" value={number(kpis.orders)} delta={kpis.ordersDelta} />
        <Stat label="Average order value" value={money(kpis.averageOrderValue)} delta={kpis.averageOrderValueDelta} />
        <Stat label="Conversion rate" value={percent(kpis.conversionRate, 2)} delta={kpis.conversionRateDelta} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Units sold" value={number(kpis.unitsSold)} delta={kpis.unitsSoldDelta} />
        <Stat label="Gross profit" value={money(kpis.grossProfit)} delta={kpis.grossProfitDelta} hint="41% blended margin" />
        <Stat label="Refund rate" value={percent(kpis.refundRate)} delta={kpis.refundRateDelta} invertDelta />
        <Stat label="New customers" value={number(kpis.customers)} delta={kpis.customersDelta} />
      </div>

      <div className="mt-5 space-y-4">
        <ChartFrame
          title="Revenue over time"
          description={`Daily revenue · ${money(kpis.revenue)} in the period`}
          height={300}
          footer={`Best day ${money(Math.max(...metrics.map((m) => m.revenue)))} · quietest ${money(Math.min(...metrics.map((m) => m.revenue)))}`}
        >
          <RevenueAreaChart data={metrics} height={300} />
        </ChartFrame>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartFrame title="Orders per day" description="Volume only — value is charted separately" height={240}>
            <OrdersBarChart data={metrics} height={240} />
          </ChartFrame>

          <ChartFrame
            title="Traffic and intent"
            description="Sessions, add-to-cart and checkouts — all counts, one axis"
            height={240}
            legend={[
              { label: "Sessions", color: SERIES[0] },
              { label: "Added to cart", color: SERIES[1] },
              { label: "Checkouts", color: SERIES[2] },
            ]}
          >
            <MultiLineChart
              data={trafficSeries}
              height={240}
              format="number"
              series={[
                { key: "sessions", label: "Sessions" },
                { key: "addToCart", label: "Added to cart" },
                { key: "checkouts", label: "Checkouts" },
              ]}
            />
          </ChartFrame>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <ChartFrame title="Conversion funnel" description="Sessions through to orders" height={260}>
            <FunnelBars stages={funnel} />
          </ChartFrame>

          <ChartFrame title="Revenue by category" description="Lifetime, all channels" height={260}>
            <RankedBars rows={categoryRevenue.slice(0, 8)} format="moneyShort" color={SERIES[0]} />
          </ChartFrame>

          <ChartFrame title="Payment mix" description="Orders by method" height={260}>
            <RankedBars rows={paymentMix} format="number" color={SERIES[2]} />
          </ChartFrame>
        </div>

        {/* Cohort retention */}
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Cohort retention</h2>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              Share of each monthly cohort that ordered again in later months. Darker means more retained.
            </p>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="text-left text-[11.5px]">
              <thead>
                <tr>
                  <th className="pb-2 pr-4 font-medium text-ink-muted">Cohort</th>
                  <th className="pb-2 pr-4 text-right font-medium text-ink-muted">Size</th>
                  {Array.from({ length: 8 }, (_, i) => (
                    <th key={i} className="px-1.5 pb-2 text-center font-medium text-ink-muted">
                      M{i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.cohort}>
                    <td className="whitespace-nowrap py-1 pr-4 text-ink">{cohort.cohort}</td>
                    <td className="py-1 pr-4 text-right tabular-nums text-ink-muted">{number(cohort.size)}</td>
                    {Array.from({ length: 8 }, (_, i) => {
                      const value = cohort.retention[i];
                      if (value == null) return <td key={i} className="px-1.5 py-1" />;
                      // Single-hue sequential ramp: light means near zero.
                      const intensity = Math.min(1, value / 100);
                      return (
                        <td key={i} className="px-1.5 py-1">
                          <span
                            className="grid h-7 w-11 place-items-center rounded-[3px] text-[10.5px] font-medium tabular-nums"
                            style={{
                              backgroundColor: `color-mix(in srgb, #256abf ${Math.round(intensity * 88)}%, #eef3fb)`,
                              color: intensity > 0.55 ? "#ffffff" : "#0d366b",
                            }}
                          >
                            {value.toFixed(0)}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          {/* Channel table — a table, not a pie: the numbers matter more than the shape. */}
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Acquisition channels</h2>
            </div>
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  {["Channel", "Sessions", "Orders", "Conv.", "Revenue"].map((header, index) => (
                    <th
                      key={header}
                      className={cn(
                        "px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted",
                        index > 0 && "text-right",
                      )}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {channels.map((channel) => (
                  <tr key={channel.channel} className="hover:bg-muted/50">
                    <td className="px-5 py-2.5 text-ink">
                      {channel.channel}
                      <span className="ml-2 text-[11px] tabular-nums text-ink-muted">{channel.share}%</span>
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-ink-muted">
                      {number(channel.sessions)}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-ink-muted">
                      {number(channel.orders)}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-ink-muted">
                      {((channel.orders / Math.max(1, channel.sessions)) * 100).toFixed(2)}%
                    </td>
                    <td className="px-5 py-2.5 text-right font-medium tabular-nums text-ink">
                      {moneyShort(channel.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Top products by revenue</h2>
            </div>
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
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="truncate text-[12px] text-ink hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] text-ink-muted">
                      {product.meta} · {number(product.units)} units
                    </p>
                  </div>
                  <p className="shrink-0 text-[12px] font-medium tabular-nums text-ink">
                    {moneyShort(product.revenue)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
