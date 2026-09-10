import type { Metadata } from "next";
import { ShieldAlert, UserPlus } from "lucide-react";
import { getPlatformUsers, listAllStores, listStoreDatabases } from "@obsidian/data";
import { Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RankedBars, SERIES } from "@/components/admin/charts";
import { UsersTable, type PlatformUserRow } from "@/components/platform/users-table";
import { number, percent, titleCase } from "@/lib/format";

export const metadata: Metadata = { title: "Users" };

export default function PlatformUsersPage() {
  const stores = listAllStores();
  const storeNames = new Map(stores.map((s) => [s.id, s.name]));
  const users = getPlatformUsers();
  const seeded = listStoreDatabases();

  const rows: PlatformUserRow[] = [];

  for (const user of users) {
    const singleStore = user.storeIds.length === 1 ? user.storeIds[0] : undefined;
    rows.push({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      type: user.type === "platform" ? "platform" : "merchant",
      role: user.type === "platform" ? "Platform operator" : "Store owner",
      storeId: singleStore,
      storeName: singleStore ? (storeNames.get(singleStore) ?? singleStore) : "Platform-wide",
      storeCount: user.storeIds.length,
      mfaEnabled: user.mfaEnabled,
      status: "active",
      createdAt: user.createdAt,
      lastActiveAt: user.lastLoginAt,
    });
  }

  // Store staff are per-tenant records; surface them here so an operator can see
  // the whole identity surface, not just the accounts that pay us.
  const owned = new Set(users.map((u) => u.id));
  for (const db of seeded) {
    for (const member of db.staff) {
      if (owned.has(member.userId)) continue;
      rows.push({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: "—",
        avatar: member.avatar,
        type: "staff",
        role: member.role,
        storeId: member.storeId,
        storeName: storeNames.get(member.storeId) ?? member.storeId,
        storeCount: 1,
        mfaEnabled: member.permissions.includes("settings.write"),
        status: member.status,
        createdAt: member.createdAt,
        lastActiveAt: member.lastActiveAt,
      });
    }
  }

  rows.sort((a, b) => Date.parse(b.lastActiveAt) - Date.parse(a.lastActiveAt));

  const operators = rows.filter((r) => r.type === "platform");
  const merchants = rows.filter((r) => r.type === "merchant");
  const staff = rows.filter((r) => r.type === "staff");
  const withoutMfa = rows.filter((r) => !r.mfaEnabled);

  const byRole = Object.entries(
    staff.reduce<Record<string, number>>((acc, row) => {
      acc[titleCase(row.role)] = (acc[titleCase(row.role)] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Every identity that can sign in: platform operators, store owners and merchant staff. Roles decide what each one may do inside a tenant."
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite operator
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Accounts" value={number(rows.length)} hint="Across every tenant" />
        <Stat label="Operators" value={number(operators.length)} hint="Platform-wide access" />
        <Stat label="Store owners" value={number(merchants.length)} hint={`${number(staff.length)} staff seats`} />
        <Stat
          label="Without MFA"
          value={number(withoutMfa.length)}
          hint={percent((withoutMfa.length / Math.max(1, rows.length)) * 100)}
        />
      </div>

      {withoutMfa.length > 0 && (
        <Card className="mt-5 border-warning/40 bg-warning/[0.05]">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <h2 className="text-[12.5px] font-semibold text-ink">
                {withoutMfa.length} account{withoutMfa.length === 1 ? "" : "s"} without multi-factor auth
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                Filter the table by <span className="font-medium text-ink">MFA missing</span> to see them. Platform
                policy requires MFA on any account holding <code className="text-[11px]">settings.write</code>; the
                enforcement date is configurable under Settings.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <UsersTable rows={rows} />

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Staff by role</h2>
            <RankedBars rows={byRole} format="number" color={SERIES[3]} />
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Access model</h2>
            <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-ink-muted">
              <li>
                <span className="font-medium text-ink">Operators</span> see every tenant but must impersonate to act
                inside one, and impersonation is written to the audit log.
              </li>
              <li>
                <span className="font-medium text-ink">Owners</span> hold all permissions for their own store and can
                invite staff up to their plan&rsquo;s seat limit.
              </li>
              <li>
                <span className="font-medium text-ink">Staff</span> carry an explicit permission list; the server checks
                it on every write, not just in the UI.
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
