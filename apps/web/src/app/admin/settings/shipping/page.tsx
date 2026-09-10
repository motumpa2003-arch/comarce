import type { Metadata } from "next";
import { Plus, Truck } from "lucide-react";
import { SHIPPING_METHODS } from "@obsidian/commerce";
import { Badge, Card, Field, Input, Stat, Switch, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Shipping" };

const ZONES = [
  { name: "Local — Bengaluru metro", regions: "560xxx", rate: "Free above ₹999, else ₹49", days: "1–2" },
  { name: "Karnataka", regions: "56xxxx, 57xxxx, 58xxxx", rate: "Free above ₹999, else ₹79", days: "2–3" },
  { name: "South India", regions: "TN, KL, AP, TS", rate: "Free above ₹999, else ₹99", days: "3–5" },
  { name: "Rest of India", regions: "All other pincodes", rate: "Free above ₹1,499, else ₹129", days: "4–7" },
  { name: "North East & islands", regions: "78xxxx, 79xxxx, 744xxx", rate: "₹199 flat", days: "6–10" },
];

export default async function AdminShippingSettingsPage() {
  const db = await currentStore();
  const pickupPoints = db.warehouses.filter((w) => w.supportsPickup);

  return (
    <>
      <AdminPageHeader
        title="Shipping"
        description="Delivery methods, zone rates and pickup points. The cart engine reads these to price delivery and to decide when shipping becomes free."
        breadcrumbs={[{ label: "Settings" }, { label: "Shipping" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            Add zone
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Delivery methods" value={number(SHIPPING_METHODS.length)} />
        <Stat label="Zones" value={number(ZONES.length)} hint="19,000+ pincodes covered" />
        <Stat label="Pickup points" value={number(pickupPoints.length)} hint="Retail locations" />
        <Stat label="Free shipping threshold" value={money(99900)} hint="Standard delivery" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card padded={false}>
            <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
              <Truck className="h-3.5 w-3.5 text-ink-muted" />
              <h2 className="text-[12.5px] font-semibold text-ink">Delivery methods</h2>
            </div>
            <ul className="divide-y divide-line">
              {SHIPPING_METHODS.map((method) => (
                <li key={method.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-ink">
                      {method.name}
                      <Badge tone="outline" size="xs">
                        {method.id}
                      </Badge>
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-ink-muted">{method.description}</p>
                  </div>
                  <span className="w-24 shrink-0 text-[11.5px] text-ink-muted">
                    {method.minDays === 0 ? "Same day" : `${method.minDays}–${method.maxDays} days`}
                  </span>
                  <span className="w-20 shrink-0 text-right text-[12.5px] font-medium tabular-nums text-ink">
                    {method.price === 0 ? "Free" : money(method.price)}
                  </span>
                  <button type="button" className={buttonClasses("outline", "xs")}>
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Zone rates</h2>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                Matched by destination pincode, most specific zone first.
              </p>
            </div>
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  {["Zone", "Pincodes", "Rate", "Transit", ""].map((header) => (
                    <th
                      key={header}
                      className="px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ZONES.map((zone) => (
                  <tr key={zone.name} className="hover:bg-muted/50">
                    <td className="px-5 py-3 font-medium text-ink">{zone.name}</td>
                    <td className="px-5 py-3 font-mono text-[11px] text-ink-muted">{zone.regions}</td>
                    <td className="px-5 py-3 text-ink-muted">{zone.rate}</td>
                    <td className="px-5 py-3 text-ink-muted">{zone.days} days</td>
                    <td className="px-5 py-3 text-right">
                      <button type="button" className={buttonClasses("ghost", "xs")}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Pickup points</h2>
            </div>
            <ul className="divide-y divide-line">
              {pickupPoints.map((point) => (
                <li key={point.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-ink">{point.name}</p>
                    <p className="text-[11.5px] text-ink-muted">
                      {point.address.line1}, {point.address.city} {point.address.postalCode}
                    </p>
                  </div>
                  <Badge tone="success" size="xs">
                    Accepting pickups
                  </Badge>
                </li>
              ))}
              {pickupPoints.length === 0 && (
                <li className="px-5 py-8 text-center text-[12px] text-ink-muted">
                  No retail locations offer pickup yet.
                </li>
              )}
            </ul>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Free shipping</h2>
            <Field label="Threshold" hint="Applies to standard delivery only" className="mt-3">
              <Input type="number" defaultValue={999} leading={<span className="text-[13px]">₹</span>} />
            </Field>
            <div className="mt-4 space-y-4">
              <Switch defaultChecked label="Show progress in the cart" description="“Add ₹350 more for free shipping.”" />
              <Switch defaultChecked label="Apply after discounts" description="Measure the threshold post-coupon." />
              <Switch label="Free shipping for VIP tiers" description="Ignore the threshold for Gold and Black." />
            </div>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Carriers</h2>
            <ul className="mt-3 space-y-2 text-[12px]">
              {["Delhivery", "Bluedart Express", "Ecom Express", "XpressBees", "Obsidian Fleet"].map((carrier) => (
                <li key={carrier} className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">{carrier}</span>
                  <Badge tone="success" size="xs">
                    Connected
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
