import type { Metadata } from "next";
import { Download, Shield, Trash2 } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Badge, Button, Card, Field, Input, Select, Separator, Switch } from "@obsidian/ui";
import { formatDate, maskPhone } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Settings" };

export default async function AccountSettingsPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display display-case text-[26px] leading-none text-ink">Settings</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Your profile, communication preferences and data controls.
        </p>
      </div>

      <Card>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <Input defaultValue={customer.firstName} />
          </Field>
          <Field label="Last name">
            <Input defaultValue={customer.lastName} />
          </Field>
          <Field label="Email" hint="Used for order updates and receipts.">
            <Input type="email" defaultValue={customer.email} />
          </Field>
          <Field label="Phone" hint={`Currently ${maskPhone(customer.phone)}`}>
            <Input defaultValue={customer.phone} />
          </Field>
          <Field label="Date of birth" hint="We send a birthday voucher.">
            <Input type="date" defaultValue={customer.dateOfBirth?.slice(0, 10)} />
          </Field>
          <Field label="Preferred language">
            <Select defaultValue="en-IN">
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">हिन्दी</option>
              <option value="bn-IN">বাংলা</option>
              <option value="ta-IN">தமிழ்</option>
            </Select>
          </Field>
        </div>
        <div className="mt-6 flex gap-2">
          <Button>Save changes</Button>
          <Button variant="ghost">Discard</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Communication</h2>
        <div className="mt-5 space-y-5">
          <Switch
            defaultChecked={customer.marketingOptIn}
            label="Marketing emails"
            description="New arrivals, sales and the occasional guide. At most twice a week."
          />
          <Separator />
          <Switch
            defaultChecked
            label="Order updates by SMS"
            description="Dispatch, out-for-delivery and delivered notifications."
          />
          <Separator />
          <Switch
            defaultChecked
            label="WhatsApp order tracking"
            description="Live tracking link sent to your WhatsApp number."
          />
          <Separator />
          <Switch
            label="Price-drop alerts"
            description="Tell me when something on my wishlist gets cheaper."
            defaultChecked
          />
          <Separator />
          <Switch label="Product recommendations" description="Personalised picks based on what you buy." />
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
          <Shield className="h-3.5 w-3.5" />
          Security
        </h2>
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-ink">Password</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                Last changed {formatDate(customer.createdAt)}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Change password
            </Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
                Two-factor authentication
                <Badge tone="warning" size="xs">
                  Off
                </Badge>
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                Add an authenticator app for an extra layer on sign-in.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-ink">Active sessions</p>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                2 devices · last seen {formatDate(customer.lastSeenAt)}
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Sign out everywhere
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Your data</h2>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
          Export everything we hold about you, or close your account permanently. Exports arrive by email within
          24 hours as a machine-readable archive.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-3.5 w-3.5" />
            Export my data
          </Button>
          <Button variant="ghost" size="sm" className="text-danger">
            <Trash2 className="h-3.5 w-3.5" />
            Delete my account
          </Button>
        </div>
      </Card>
    </div>
  );
}
