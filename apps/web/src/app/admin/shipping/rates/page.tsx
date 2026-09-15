import type { Metadata } from "next";
import { Calculator, Plus, Scale, Timer } from "lucide-react";
import { SHIPPING_METHODS } from "@obsidian/commerce";
import { Badge, Card, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RateCalculator } from "@/components/admin/rate-calculator";
import { RATE_TABLE } from "@/lib/shipping-rates";
import { money, number } from "@/lib/format";

export const metadata: Metadata = { title: "Shipping rates" };

export default function ShippingRatesPage() {
  const methodName = new Map(SHIPPING_METHODS.map((m) => [m.id, m.name]));
  const zones = [...new Set(RATE_TABLE.map((r) => r.zone))];
  const cheapest = Math.min(...RATE_TABLE.map((r) => r.price));
  const dearest = Math.max(...RATE_TABLE.map((r) => r.price));

  return (
    <>
      <AdminPageHeader
        title="Shipping rates"
        description="Weight bands per zone and method. The cart picks the first band whose range contains the parcel's billable weight, then applies the free-shipping threshold if the order clears it."
        breadcrumbs={[{ label: "Shipping" }, { label: "Rates" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            Add rate
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Rates configured" value={number(RATE_TABLE.length)} hint={`Across ${zones.length} zones`} />
        <Stat label="Cheapest band" value={money(cheapest)} hint="Metro, under 500 g" />
        <Stat label="Dearest band" value={money(dearest)} hint="Rest of India, over 2 kg" />
        <Stat label="Methods" value={number(SHIPPING_METHODS.length)} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card padded={false}>
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <Scale className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">Rate table</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Zone</TH>
                  <TH>Method</TH>
                  <TH align="right">Weight band</TH>
                  <TH align="right">Rate</TH>
                  <TH align="right">Free over</TH>
                  <TH align="right">Transit</TH>
                </TR>
              </THead>
              <TBody>
                {RATE_TABLE.map((rate, index) => (
                  <TR key={`${rate.zone}-${rate.method}-${index}`}>
                    <TD className="font-medium text-ink">{rate.zone}</TD>
                    <TD>
                      <Badge tone="outline" size="xs">
                        {methodName.get(rate.method) ?? rate.method}
                      </Badge>
                    </TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {rate.minG === 0 ? "up to" : `${number(rate.minG)} –`} {number(rate.maxG)} g
                    </TD>
                    <TD align="right" className="font-medium tabular-nums text-ink">
                      {money(rate.price)}
                    </TD>
                    <TD align="right" className="tabular-nums text-ink-muted">
                      {rate.freeOver ? money(rate.freeOver) : "never"}
                    </TD>
                    <TD align="right" className="text-ink-muted">
                      {rate.days}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
          <p className="border-t border-line px-5 py-3.5 text-[11.5px] leading-relaxed text-ink-muted">
            Billable weight is the greater of actual weight and volumetric weight
            (L × W × H in cm ÷ 5000). A large light parcel is charged on its volume, which is how carriers bill us.
          </p>
        </Card>

        <aside className="space-y-4">
          <Card>
            <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Calculator className="h-3.5 w-3.5" />
              Rate calculator
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
              Check what a shopper would be quoted before you publish a change.
            </p>
            <RateCalculator rates={RATE_TABLE} methodNames={Object.fromEntries(methodName)} />
          </Card>

          <Card tone="muted">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
              <Timer className="h-3.5 w-3.5" />
              Transit is a promise
            </h2>
            <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
              Transit days here are what the product page shows as a delivery estimate. Set them from what the
              carrier actually achieves, not from its marketing — an estimate that misses is the single biggest
              driver of support tickets.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
