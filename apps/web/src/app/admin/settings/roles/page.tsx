import type { Metadata } from "next";
import { Check, Minus, Plus, ShieldCheck } from "lucide-react";
import {
  PERMISSION_GROUPS,
  ROLE_PRESETS,
  permissionLabel,
  type PermissionKey,
  type StaffRole,
} from "@obsidian/commerce";
import { Badge, Card, Stat, Table, TBody, TD, TH, THead, TR, buttonClasses, cn } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { number, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Roles & permissions" };

// platform.admin belongs to the operator console, not a merchant's staff list.
const ROLE_ORDER: StaffRole[] = [
  "owner",
  "admin",
  "manager",
  "product_manager",
  "warehouse_manager",
  "marketing",
  "accountant",
  "support",
];

export default async function RolesPage() {
  const db = await currentStore();

  const headcount = new Map<string, number>();
  for (const member of db.staff) {
    headcount.set(member.role, (headcount.get(member.role) ?? 0) + 1);
  }

  const groups = PERMISSION_GROUPS.map((group) => ({
    ...group,
    keys: group.keys.filter((key) => key !== "platform.admin"),
  }));

  // Typed as the full PermissionKey union so it can be tested against a staff
  // member's own list, which may include keys outside the merchant groups.
  const writeKeys: PermissionKey[] = groups
    .flatMap((g) => g.keys)
    .filter((k) => k.endsWith(".write") || k.endsWith(".delete") || k.endsWith(".refund"));
  const isWriteKey = (key: PermissionKey) => writeKeys.includes(key);

  return (
    <>
      <AdminPageHeader
        title="Roles & permissions"
        description="What each role may do. Permissions are checked on the server for every write, so removing one here genuinely stops the action rather than just hiding the button."
        breadcrumbs={[{ label: "Settings" }, { label: "Roles" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            Custom role
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Roles" value={number(ROLE_ORDER.length)} hint="8 presets, no custom roles yet" />
        <Stat label="Staff" value={number(db.staff.length)} hint={`${db.staff.filter((s) => s.status === "active").length} active`} />
        <Stat label="Permissions" value={number(groups.flatMap((g) => g.keys).length)} />
        <Stat
          label="Can change data"
          value={number(db.staff.filter((s) => s.permissions.some(isWriteKey)).length)}
          hint="Hold at least one write permission"
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ROLE_ORDER.map((role) => {
          const preset = ROLE_PRESETS[role];
          const count = headcount.get(role) ?? 0;
          const writes = preset.permissions.filter(isWriteKey).length;
          return (
            <Card key={role} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[13.5px] font-semibold text-ink">{preset.label}</h2>
                {count > 0 && (
                  <Badge tone="neutral" size="xs">
                    {number(count)}
                  </Badge>
                )}
              </div>
              <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-ink-muted">{preset.description}</p>
              <p className="mt-3.5 border-t border-line pt-3 text-[11.5px] text-ink-muted">
                {number(preset.permissions.length)} permissions ·{" "}
                <span className={writes > 6 ? "text-warning" : "text-ink-muted"}>{number(writes)} can write</span>
              </p>
            </Card>
          );
        })}
      </div>

      <Card className="mt-5" padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">Permission matrix</h2>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">
            Read permissions are shown in grey, writes in solid — the distinction that matters when auditing who
            can change what.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH width="230px">Permission</TH>
                {ROLE_ORDER.map((role) => (
                  <TH key={role} align="center">
                    {ROLE_PRESETS[role].label}
                  </TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {groups.map((group) => (
                <>
                  <TR key={`${group.label}-head`}>
                    <TD colSpan={ROLE_ORDER.length + 1} className="bg-muted/60">
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                        {group.label}
                      </span>
                    </TD>
                  </TR>
                  {group.keys.map((key) => (
                    <TR key={key}>
                      <TD>
                        <span className="block text-[12.5px] text-ink">{permissionLabel(key as PermissionKey)}</span>
                        <code className="mt-0.5 block text-[10.5px] text-ink-muted">{key}</code>
                      </TD>
                      {ROLE_ORDER.map((role) => {
                        const has = ROLE_PRESETS[role].permissions.includes(key as PermissionKey);
                        const isWrite = isWriteKey(key as PermissionKey);
                        return (
                          <TD key={role} align="center">
                            {has ? (
                              <Check
                                className={cn(
                                  "mx-auto h-3.5 w-3.5",
                                  isWrite ? "text-success" : "text-ink-muted",
                                )}
                                aria-label="Allowed"
                              />
                            ) : (
                              <Minus className="mx-auto h-3 w-3 text-ink-muted/30" aria-label="Not allowed" />
                            )}
                          </TD>
                        );
                      })}
                    </TR>
                  ))}
                </>
              ))}
            </TBody>
          </Table>
        </div>
      </Card>

      <Card className="mt-5" padded={false}>
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[12.5px] font-semibold text-ink">Who holds what</h2>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Member</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH align="right">Permissions</TH>
              <TH align="right">Can write</TH>
            </TR>
          </THead>
          <TBody>
            {db.staff.map((member) => {
              const writes = member.permissions.filter(isWriteKey).length;
              return (
                <TR key={member.id}>
                  <TD>
                    <span className="block font-medium text-ink">{member.name}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-muted">{member.email}</span>
                  </TD>
                  <TD className="text-ink-muted">{ROLE_PRESETS[member.role].label}</TD>
                  <TD>
                    <Badge
                      tone={
                        member.status === "active" ? "success" : member.status === "invited" ? "warning" : "neutral"
                      }
                      size="xs"
                    >
                      {member.status}
                    </Badge>
                  </TD>
                  <TD align="right" className="tabular-nums text-ink-muted">
                    {number(member.permissions.length)}
                  </TD>
                  <TD align="right" className="tabular-nums text-ink">
                    {number(writes)}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </Card>

      <Card className="mt-5" tone="muted">
        <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
          <ShieldCheck className="h-3.5 w-3.5" />
          Two rules worth keeping
        </h2>
        <p className="mt-2.5 text-[12px] leading-relaxed text-ink-muted">
          A store always has exactly one owner, and the owner role cannot be edited — otherwise it is possible to
          lock yourself out of your own store. And a member may never grant a permission they do not themselves
          hold, which stops privilege escalation through the invite flow.
        </p>
      </Card>
    </>
  );
}
