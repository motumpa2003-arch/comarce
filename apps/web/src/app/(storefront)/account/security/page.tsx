import type { Metadata } from "next";
import { Clock, Key, Laptop, LogOut, Shield, ShieldCheck, Smartphone } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Badge, Button, Card, Field, Input, Separator, Switch } from "@obsidian/ui";
import { NOW, formatDateTime, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Security" };

/** Sessions are derived from the demo clock so "2 hours ago" stays stable. */
const SESSIONS = [
  {
    id: "s1",
    device: "Chrome on Windows",
    icon: Laptop,
    location: "Bengaluru, Karnataka",
    ip: "49.36.182.44",
    minutesAgo: 0,
    current: true,
  },
  {
    id: "s2",
    device: "Obsidian app on iPhone",
    icon: Smartphone,
    location: "Bengaluru, Karnataka",
    ip: "49.36.182.44",
    minutesAgo: 190,
    current: false,
  },
  {
    id: "s3",
    device: "Safari on macOS",
    icon: Laptop,
    location: "Pune, Maharashtra",
    ip: "103.21.244.17",
    minutesAgo: 3_600,
    current: false,
  },
];

export default async function AccountSecurityPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);
  const at = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000).toISOString();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display display-case text-[26px] leading-none text-ink">Security</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Password, two-factor authentication and every device currently signed in.
        </p>
      </div>

      <Card>
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
          <Key className="h-3.5 w-3.5" />
          Password
        </h2>
        <p className="mt-2 text-[12.5px] text-ink-muted">
          Changing your password signs out every other device immediately. This one stays signed in.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Current password" className="sm:col-span-2">
            <Input type="password" autoComplete="current-password" />
          </Field>
          <Field label="New password" hint="At least 8 characters with a number and a symbol">
            <Input type="password" autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" autoComplete="new-password" />
          </Field>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button size="sm">Update password</Button>
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
          <ShieldCheck className="h-3.5 w-3.5" />
          Two-factor authentication
        </h2>
        <div className="mt-5 space-y-5">
          <Switch
            label="Authenticator app"
            description="A six-digit code from Google Authenticator, 1Password or similar. The most reliable option — it works with no signal."
            defaultChecked
          />
          <Separator />
          <Switch
            label="SMS to +91 ••••• 43210"
            description="A fallback if you lose your authenticator. Less secure than an app, because SIM swaps exist."
          />
          <Separator />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink">Recovery codes</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-muted">
                Ten single-use codes for when you lose both your phone and your authenticator. Store them somewhere
                that is not your phone.
              </p>
            </div>
            <Button size="xs" variant="outline">
              Generate new codes
            </Button>
          </div>
        </div>
      </Card>

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
            <Shield className="h-3.5 w-3.5" />
            Signed-in devices
          </h2>
          <Button size="xs" variant="outline">
            <LogOut className="h-3.5 w-3.5" />
            Sign out everywhere else
          </Button>
        </div>
        <ul className="divide-y divide-line">
          {SESSIONS.map((session) => (
            <li key={session.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-ink-muted">
                <session.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink">
                  {session.device}
                  {session.current && (
                    <Badge tone="success" size="xs">
                      This device
                    </Badge>
                  )}
                </p>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {session.location} · {session.ip}
                </p>
              </div>
              <p className="shrink-0 text-[11.5px] text-ink-muted" title={formatDateTime(at(session.minutesAgo))}>
                {session.current ? "Active now" : relativeTime(at(session.minutesAgo))}
              </p>
              {!session.current && (
                <Button size="xs" variant="ghost">
                  Sign out
                </Button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="muted">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
          <Clock className="h-3.5 w-3.5" />
          Recent security activity
        </h2>
        <ul className="mt-4 space-y-3 text-[12.5px]">
          {[
            { label: "Signed in from Bengaluru", minutes: 0 },
            { label: "Two-factor authentication enabled", minutes: 4_320 },
            { label: "Password changed", minutes: 20_160 },
            { label: "Account created", minutes: null },
          ].map((event) => (
            <li key={event.label} className="flex items-baseline justify-between gap-4">
              <span className="text-ink">{event.label}</span>
              <span className="shrink-0 text-ink-muted">
                {event.minutes === null ? relativeTime(customer.createdAt) : relativeTime(at(event.minutes))}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
