import type { Metadata } from "next";
import { Check, Plus, Shield, UserPlus } from "lucide-react";
import { PERMISSION_GROUPS, ROLE_PRESETS, type StaffRole } from "@obsidian/commerce";
import { Avatar, Badge, Card, Stat, buttonClasses, cn } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getPlans } from "@obsidian/data";
import { formatDate, number, relativeTime, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Staff & roles" };

export default async function AdminStaffPage() {
  const db = await currentStore();
  const staff = db.staff;
  const rolesInUse = [...new Set(staff.map((s) => s.role))] as StaffRole[];

  return (
    <>
      <AdminPageHeader
        title="Staff & roles"
        description="Role presets bundle permissions; each member's effective permission set is what the server checks on every request."
        breadcrumbs={[{ label: "Settings" }, { label: "Staff & roles" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <UserPlus className="h-3.5 w-3.5" />
            Invite staff
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Team members" value={number(staff.length)} hint={`${staff.filter((s) => s.status === "active").length} active`} />
        <Stat label="Pending invites" value={number(staff.filter((s) => s.status === "invited").length)} />
        <Stat label="Roles in use" value={number(rolesInUse.length)} hint={`${Object.keys(ROLE_PRESETS).length} available`} />
        <Stat
          label="Seat limit"
          value={`${staff.length} / ${getPlans().find((plan) => plan.id === db.store.planId)?.limits.staff ?? "—"}`}
          hint="On the current plan"
        />
      </div>

      <div className="space-y-4">
        <Card padded={false}>
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[12.5px] font-semibold text-ink">Team</h2>
          </div>
          <ul className="divide-y divide-line">
            {staff.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <Avatar src={member.avatar} name={member.name} size={36} />

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-ink">
                    {member.name}
                    <Badge
                      tone={
                        member.status === "active" ? "success" : member.status === "invited" ? "warning" : "neutral"
                      }
                      size="xs"
                    >
                      {member.status}
                    </Badge>
                  </p>
                  <p className="truncate text-[11.5px] text-ink-muted">{member.email}</p>
                </div>

                <div className="w-40 shrink-0">
                  <Badge tone="info" size="xs">
                    {ROLE_PRESETS[member.role].label}
                  </Badge>
                  <p className="mt-1 text-[10.5px] text-ink-muted">
                    {member.permissions.length} permissions
                  </p>
                </div>

                <div className="w-32 shrink-0 text-[11px] text-ink-muted">
                  <p>Active {relativeTime(member.lastActiveAt)}</p>
                  <p>Joined {formatDate(member.createdAt)}</p>
                </div>

                <button
                  type="button"
                  className={buttonClasses("outline", "xs")}
                  disabled={member.role === "owner"}
                >
                  {member.role === "owner" ? "Owner" : "Manage"}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card padded={false}>
          <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <Shield className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">Role permission matrix</h2>
            <span className="ml-auto text-[11.5px] text-ink-muted">
              Server-enforced on every request
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="border-b border-line bg-muted/50">
                <tr>
                  <th className="sticky left-0 bg-muted/50 px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                    Permission
                  </th>
                  {(Object.keys(ROLE_PRESETS) as StaffRole[]).map((role) => (
                    <th
                      key={role}
                      className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted"
                    >
                      {ROLE_PRESETS[role].label.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {PERMISSION_GROUPS.flatMap((group) => [
                  <tr key={`group-${group.label}`} className="bg-muted/30">
                    <td
                      colSpan={Object.keys(ROLE_PRESETS).length + 1}
                      className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-muted"
                    >
                      {group.label}
                    </td>
                  </tr>,
                  ...group.keys.map((key) => (
                    <tr key={key} className="hover:bg-muted/40">
                      <td className="sticky left-0 bg-surface px-5 py-2 font-mono text-[11px] text-ink">{key}</td>
                      {(Object.keys(ROLE_PRESETS) as StaffRole[]).map((role) => {
                        const has = ROLE_PRESETS[role].permissions.includes(key);
                        return (
                          <td key={role} className="px-3 py-2 text-center">
                            {has ? (
                              <Check className="mx-auto h-3.5 w-3.5 text-success" />
                            ) : (
                              <span className="text-ink-muted/40">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )),
                ])}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(ROLE_PRESETS) as StaffRole[]).map((role) => {
            const preset = ROLE_PRESETS[role];
            const count = staff.filter((s) => s.role === role).length;
            return (
              <Card key={role}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[13px] font-semibold text-ink">{preset.label}</h3>
                  {count > 0 && (
                    <Badge tone="outline" size="xs">
                      {count}
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">{preset.description}</p>
                <p className="mt-3 text-[11px] text-ink-muted">
                  {preset.permissions.length} permissions granted
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
