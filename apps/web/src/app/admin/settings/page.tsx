import type { Metadata } from "next";
import { Globe, Store } from "lucide-react";
import { Badge, Card, Field, Input, Select, Switch, Textarea, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Store settings" };

export default async function AdminSettingsPage() {
  const db = await currentStore();
  const store = db.store;

  return (
    <>
      <AdminPageHeader
        title="Store settings"
        description="Identity, locale and the feature flags your plan unlocks."
        breadcrumbs={[{ label: "Settings" }, { label: "Store" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            Save changes
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Store className="h-3.5 w-3.5" />
              Store identity
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name" required>
                <Input defaultValue={store.name} />
              </Field>
              <Field label="Handle" hint="Used in URLs and the subdomain">
                <Input defaultValue={store.slug} />
              </Field>
              <Field label="Wordmark" hint="Shown in the header and footer">
                <Input defaultValue={store.logoText} />
              </Field>
              <Field label="Logo mark" hint="Two-letter monogram">
                <Input defaultValue={store.logoMark} maxLength={3} />
              </Field>
              <Field label="Tagline" className="sm:col-span-2">
                <Input defaultValue={store.tagline} />
              </Field>
              <Field label="Description" className="sm:col-span-2" hint="Used for SEO and the platform directory">
                <Textarea rows={3} defaultValue={store.description} />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <Globe className="h-3.5 w-3.5" />
              Locale and domains
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary currency">
                <Select defaultValue={store.currency}>
                  {["INR", "USD", "EUR", "GBP", "AED", "SGD"].map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Country">
                <Input defaultValue={store.country} />
              </Field>
              <Field label="Locale">
                <Select defaultValue={store.locale}>
                  <option value="en-IN">English (India)</option>
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                </Select>
              </Field>
              <Field label="Timezone">
                <Select defaultValue={store.timezone}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </Select>
              </Field>
              <Field label="Platform domain" hint="Always available">
                <Input defaultValue={store.domain} readOnly />
              </Field>
              <Field label="Custom domain" hint={store.customDomain ? "Verified with SSL" : "Requires Growth or above"}>
                <Input defaultValue={store.customDomain ?? ""} placeholder="shop.yourbrand.com" />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Customer support</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Support email">
                <Input type="email" defaultValue={store.supportEmail} />
              </Field>
              <Field label="Support phone">
                <Input defaultValue={store.supportPhone} />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-[12.5px] font-semibold text-ink">Checkout and policy</h2>
            <p className="mb-4 text-[12px] text-ink-muted">
              These settings feed the pricing engine directly — the cart and invoice both read them.
            </p>
            <div className="space-y-4">
              <Switch defaultChecked label="Guest checkout" description="Allow orders without an account." />
              <Switch defaultChecked label="Free shipping above ₹999" description="Applies to standard delivery." />
              <Switch defaultChecked label="Cash on delivery" description="Available in serviceable pincodes up to ₹20,000." />
              <Switch defaultChecked label="Gift wrapping" description="₹49 per item, opt-in at checkout." />
              <Switch defaultChecked label="30-day returns" description="60 days for Gold and Black tiers." />
              <Switch label="Require phone verification" description="OTP before an order can be placed." />
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Plan and entitlements</h2>
            <div className="mt-3 flex items-center gap-2">
              <Badge tone="accent">{titleCase(store.planId.replace("plan_", ""))}</Badge>
              <span className="text-[11.5px] text-ink-muted">
                since {formatDate(db.subscription.startedAt)}
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-[12.5px]">
              {Object.entries(store.features).map(([feature, enabled]) => (
                <li key={feature} className="flex items-center justify-between gap-3">
                  <span className="text-ink-muted">{titleCase(feature)}</span>
                  <Badge tone={enabled ? "success" : "neutral"} size="xs">
                    {enabled ? "On" : "Off"}
                  </Badge>
                </li>
              ))}
            </ul>
            <button type="button" className={buttonClasses("outline", "xs", true, "mt-4")}>
              Manage subscription
            </button>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Store status</h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Status</dt>
                <dd>
                  <Badge tone={store.status === "active" ? "success" : "warning"} size="xs">
                    {store.status}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Created</dt>
                <dd className="text-ink">{formatDate(store.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Industry</dt>
                <dd className="capitalize text-ink">{store.industry}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-muted">Store ID</dt>
                <dd className="font-mono text-ink">{store.id}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-[12.5px] font-semibold text-danger">Danger zone</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
              Pausing hides the storefront and stops accepting orders. Closing is permanent and removes the
              catalogue after a 30-day grace period.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" className={buttonClasses("outline", "xs", true)}>
                Pause store
              </button>
              <button type="button" className={buttonClasses("ghost", "xs", true, "text-danger")}>
                Close store permanently
              </button>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
