import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import {
  buildChannels,
  buildCohorts,
  buildFunnel,
  SEED_NOW,
  summariseKpis,
} from "@obsidian/data";
import { Badge, Card, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses, cn } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChartFrame, MultiLineChart, RankedBars, RevenueAreaChart, SERIES } from "@/components/admin/charts";
import { compact, money, moneyShort, number, percent } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

const REPORTS = {
  sales: { title: "Sales", description: "Revenue, orders and basket size over time, with the weekday pattern intact." },
  products: { title: "Products", description: "What sells, what gets looked at and never bought, and what is quietly dead." },
  customers: { title: "Customers", description: "Acquisition, repeat rate and the cohort retention curve." },
  funnel: { title: "Funnel", description: "Where visitors leave, stage by stage." },
  channels: { title: "Channels", description: "Where traffic comes from and what each source is actually worth." },
} as const;

type ReportKey = keyof typeof REPORTS;

export function generateStaticParams() {
  return Object.keys(REPORTS).map((report) => ({ report }));
}

export async function generateMetadata({ params }: { params: Promise<{ report: string }> }): Promise<Metadata> {
  const { report } = await params;
  const meta = REPORTS[report as ReportKey];
  return { title: meta ? `${meta.title} report` : "Report" };
}

export default async function AnalyticsReportPage({ params }: { params: Promise<{ report: string }> }) {
  const { report } = await params;
  const meta = REPORTS[report as ReportKey];
  if (!meta) notFound();

  const db = await currentStore();
  const kpis = summariseKpis(db.metrics, 30);
  const previous = summariseKpis(db.metrics.slice(0, -30), 30);

  return (
    <>
      <AdminPageHeader
        title={`${meta.title} report`}
        description={meta.description}
        breadcrumbs={[{ label: "Analytics", href: "/admin/analytics" }, { label: meta.title }]}
        actions={
          <>
            <Link href="/admin/analytics" className={buttonClasses("ghost", "sm")}>
              <ArrowLeft className="h-3.5 w-3.5" />
              All reports
            </Link>
            <button type="button" className={buttonClasses("outline", "sm")}>
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </>
        }
      />

      <nav aria-label="Reports" className="mb-5 flex flex-wrap gap-1.5">
        {(Object.keys(REPORTS) as ReportKey[]).map((key) => (
          <Link
            key={key}
            href={`/admin/analytics/${key}`}
            className={cn(
              "rounded-[var(--radius-sm)] px-3 py-1.5 text-[12px] transition-colors",
              key === report
                ? "bg-ink font-medium text-inverse"
                : "border border-line text-ink-muted hover:border-ink/30 hover:text-ink",
            )}
          >
            {REPORTS[key].title}
          </Link>
        ))}
      </nav>

      {report === "sales" && <SalesReport db={db} kpis={kpis} previous={previous} />}
      {report === "products" && <ProductsReport db={db} />}
      {report === "customers" && <CustomersReport db={db} />}
      {report === "funnel" && <FunnelReport db={db} />}
      {report === "channels" && <ChannelsReport db={db} />}
    </>
  );
}

type Db = Awaited<ReturnType<typeof currentStore>>;
type Kpis = ReturnType<typeof summariseKpis>;

function delta(current: number, before: number): number {
  if (!before) return 0;
  return Number((((current - before) / before) * 100).toFixed(1));
}

function SalesReport({ db, kpis, previous }: { db: Db; kpis: Kpis; previous: Kpis }) {
  const last90 = db.metrics.slice(-90);

  // Weekday pattern, which is the thing a flat monthly total hides.
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const byWeekday = weekdayNames.map((label, index) => {
    const points = last90.filter((p) => new Date(p.date).getDay() === index);
    const revenue = points.reduce((n, p) => n + p.revenue, 0);
    return { label, value: points.length ? Math.round(revenue / points.length) : 0 };
  });

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue" value={money(kpis.revenue)} delta={delta(kpis.revenue, previous.revenue)} />
        <Stat label="Orders" value={number(kpis.orders)} delta={delta(kpis.orders, previous.orders)} />
        <Stat
          label="Average order"
          value={money(kpis.averageOrderValue)}
          delta={delta(kpis.averageOrderValue, previous.averageOrderValue)}
        />
        <Stat label="Units sold" value={number(kpis.unitsSold)} delta={delta(kpis.unitsSold, previous.unitsSold)} />
      </div>

      <div className="mt-5 space-y-4">
        <ChartFrame title="Revenue" description="Daily, last 90 days" height={300}>
          <RevenueAreaChart data={last90} height={300} />
        </ChartFrame>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartFrame
            title="Cart to order"
            description="Daily, last 90 days"
            height={260}
            legend={[
              { label: "Added to cart", color: SERIES[0] },
              { label: "Reached checkout", color: SERIES[1] },
              { label: "Ordered", color: SERIES[2] },
            ]}
            footer="The gap between the top two lines is the cart abandonment worth chasing."
          >
            <MultiLineChart
              height={260}
              format="number"
              data={last90.map((p) => ({
                date: p.date,
                addToCart: p.addToCart,
                checkouts: p.checkouts,
                orders: p.orders,
              }))}
              series={[
                { key: "addToCart", label: "Added to cart" },
                { key: "checkouts", label: "Reached checkout" },
                { key: "orders", label: "Ordered" },
              ]}
            />
          </ChartFrame>

          <ChartFrame
            title="Average revenue by weekday"
            description="Last 90 days"
            height={260}
            footer="Staff the warehouse against this curve, not against the weekly average."
          >
            <RankedBars rows={byWeekday} format="moneyShort" color={SERIES[0]} />
          </ChartFrame>
        </div>
      </div>
    </>
  );
}

function ProductsReport({ db }: { db: Db }) {
  const active = db.products.filter((p) => p.status === "active");

  const top = [...active].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 12);
  // High traffic, no sales: the most actionable list on this page.
  const looked = [...active]
    .filter((p) => p.views > 400 && p.unitsSold < 40)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  const dead = [...active].filter((p) => p.unitsSold === 0).slice(0, 10);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Active products" value={number(active.length)} hint={`${number(db.products.length)} total`} />
        <Stat label="Units sold" value={compact(active.reduce((n, p) => n + p.unitsSold, 0))} />
        <Stat label="Viewed, rarely bought" value={number(looked.length)} hint="High traffic, low conversion" />
        <Stat label="No sales" value={number(dead.length)} hint="Candidates to archive" invertDelta />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Best sellers</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH align="right">Units</TH>
                  <TH align="right">Views</TH>
                  <TH align="right">Conversion</TH>
                  <TH align="right">Revenue</TH>
                </TR>
              </THead>
              <TBody>
                {top.map((product) => (
                  <TR key={product.id}>
                    <TD>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-ink hover:text-primary hover:underline"
                      >
                        {product.name}
                      </Link>
                      <span className="mt-0.5 block text-[11px] text-ink-muted">{product.sku}</span>
                    </TD>
                    <TD align="right" className="tabular-nums text-ink">
                      {number(product.unitsSold)}
                    </TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {compact(product.views)}
                    </TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {percent((product.unitsSold / Math.max(1, product.views)) * 100, 2)}
                    </TD>
                    <TD align="right" className="tabular-nums text-ink">
                      {moneyShort(product.unitsSold * product.price)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Looked at, not bought</h2>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
                Traffic is arriving and leaving. Usually price, imagery or a missing size.
              </p>
            </div>
            <ul className="divide-y divide-line">
              {looked.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="min-w-0 truncate text-[12.5px] text-ink hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <span className="shrink-0 text-[11.5px] tabular-nums text-ink-muted">
                    {compact(product.views)} views
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">No sales at all</h2>
            </div>
            <ul className="divide-y divide-line">
              {dead.length === 0 ? (
                <li className="px-5 py-4 text-[12.5px] text-ink-muted">Everything has sold at least once.</li>
              ) : (
                dead.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="min-w-0 truncate text-[12.5px] text-ink hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <Badge tone="neutral" size="xs">
                      {product.totalStock} in stock
                    </Badge>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}

function CustomersReport({ db }: { db: Db }) {
  const cohorts = buildCohorts(db.store.id, SEED_NOW, 8);
  const customers = db.customers;
  const repeat = customers.filter((c) => c.ordersCount > 1);

  const byTier = Object.entries(
    customers.reduce<Record<string, number>>((acc, c) => {
      acc[c.loyaltyTier] = (acc[c.loyaltyTier] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label: label.charAt(0).toUpperCase() + label.slice(1), value }))
    .sort((a, b) => b.value - a.value);

  const ltv = customers.reduce((n, c) => n + c.lifetimeValue, 0) / Math.max(1, customers.length);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Customers" value={number(customers.length)} />
        <Stat
          label="Repeat rate"
          value={percent((repeat.length / Math.max(1, customers.length)) * 100)}
          hint={`${number(repeat.length)} bought more than once`}
        />
        <Stat label="Average lifetime value" value={money(Math.round(ltv))} />
        <Stat
          label="Average orders"
          value={(customers.reduce((n, c) => n + c.ordersCount, 0) / Math.max(1, customers.length)).toFixed(1)}
          hint="Per customer"
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Cohort retention</h2>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              Share of each signup month still ordering, by month since. The diagonal is incomplete by definition —
              recent cohorts have had less time.
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Cohort</TH>
                  <TH align="right">Size</TH>
                  {Array.from({ length: 6 }, (_, i) => (
                    <TH key={i} align="center">
                      M{i}
                    </TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {cohorts.map((cohort) => (
                  <TR key={cohort.cohort}>
                    <TD className="font-medium text-ink">{cohort.cohort}</TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {number(cohort.size)}
                    </TD>
                    {Array.from({ length: 6 }, (_, i) => {
                      const value = cohort.retention[i];
                      return (
                        <TD key={i} align="center">
                          {value == null ? (
                            <span className="text-ink-muted/30">—</span>
                          ) : (
                            <span
                              className="inline-block rounded-[3px] px-1.5 py-0.5 text-[11.5px] tabular-nums"
                              style={{
                                backgroundColor: `color-mix(in srgb, var(--c-primary) ${Math.round(value)}%, transparent)`,
                                color: value > 45 ? "var(--c-inverse)" : "var(--c-ink)",
                              }}
                            >
                              {Math.round(value)}%
                            </span>
                          )}
                        </TD>
                      );
                    })}
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        </Card>

        <aside className="space-y-4">
          <ChartFrame title="By loyalty tier" description="All customers" height={220}>
            <RankedBars rows={byTier} format="number" color={SERIES[0]} />
          </ChartFrame>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Reading this</h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              M0 is always 100% — it is the month they bought. What matters is M1: if it holds above 20% the second
              purchase is happening, and everything after that is comparatively cheap.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}

function FunnelReport({ db }: { db: Db }) {
  const stages = buildFunnel(db.metrics, 30);
  const first = stages[0]?.count ?? 1;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Entered" value={compact(first)} hint="Sessions, last 30 days" />
        <Stat label="Completed" value={compact(stages[stages.length - 1]?.count ?? 0)} />
        <Stat
          label="End-to-end"
          value={percent(((stages[stages.length - 1]?.count ?? 0) / Math.max(1, first)) * 100, 2)}
        />
        <Stat label="Stages" value={number(stages.length)} />
      </div>

      <Card className="mt-5" padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">Where people leave</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            The drop between two stages is worth more attention than any single stage total.
          </p>
        </div>
        <ul className="divide-y divide-line">
          {stages.map((stage, index) => {
            const share = (stage.count / Math.max(1, first)) * 100;
            const prev = stages[index - 1]?.count;
            const drop = prev ? ((prev - stage.count) / prev) * 100 : 0;
            return (
              <li key={stage.stage} className="px-5 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium text-ink">{stage.stage}</span>
                  <span className="flex items-baseline gap-3 text-[12px]">
                    <span className="tabular-nums text-ink">{compact(stage.count)}</span>
                    <span className="tabular-nums text-ink-muted">{percent(share)}</span>
                    {index > 0 && (
                      <span className={drop > 55 ? "tabular-nums text-danger" : "tabular-nums text-ink-muted"}>
                        −{percent(drop)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(1, share)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

function ChannelsReport({ db }: { db: Db }) {
  const channels = buildChannels(db.store.id, db.metrics);
  const totalRevenue = channels.reduce((n, c) => n + c.revenue, 0);
  const totalSessions = channels.reduce((n, c) => n + c.sessions, 0);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Channels" value={number(channels.length)} />
        <Stat label="Sessions" value={compact(totalSessions)} />
        <Stat label="Revenue" value={money(totalRevenue)} />
        <Stat
          label="Revenue per session"
          value={money(Math.round(totalRevenue / Math.max(1, totalSessions)))}
          hint="Blended across every source"
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">By source</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Channel</TH>
                  <TH align="right">Sessions</TH>
                  <TH align="right">Orders</TH>
                  <TH align="right">Conversion</TH>
                  <TH align="right">Revenue</TH>
                  <TH align="right">Per session</TH>
                </TR>
              </THead>
              <TBody>
                {channels.map((channel) => (
                  <TR key={channel.channel}>
                    <TD className="font-medium text-ink">{channel.channel}</TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {compact(channel.sessions)}
                    </TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {number(channel.orders)}
                    </TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {percent((channel.orders / Math.max(1, channel.sessions)) * 100, 2)}
                    </TD>
                    <TD align="right" className="font-medium tabular-nums text-ink">
                      {moneyShort(channel.revenue)}
                    </TD>
                    <TD align="right" className="tabular-nums text-ink">
                      {money(Math.round(channel.revenue / Math.max(1, channel.sessions)))}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <p className="border-t border-line px-5 py-3.5 text-[11.5px] leading-relaxed text-ink-muted">
            Revenue per session is the column to budget against. A channel with high volume and low value is a cost
            centre wearing a growth costume.
          </p>
        </Card>

        <aside className="space-y-4">
          <ChartFrame title="Revenue share" description="Last 30 days" height={230}>
            <RankedBars
              rows={channels.map((c) => ({ label: c.channel, value: c.revenue }))}
              format="moneyShort"
              color={SERIES[0]}
            />
          </ChartFrame>

          <ChartFrame title="Conversion by channel" description="Percent of sessions" height={230}>
            <RankedBars
              rows={channels.map((c) => ({
                label: c.channel,
                value: Number(((c.orders / Math.max(1, c.sessions)) * 100).toFixed(2)),
              }))}
              format="percent"
              color={SERIES[2]}
            />
          </ChartFrame>
        </aside>
      </div>
    </>
  );
}
