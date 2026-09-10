import type { Metadata } from "next";
import { getDemoStaffMember, getLowStockRecords, listStoreDatabases } from "@obsidian/data";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: { default: "Merchant admin", template: "%s · Obsidian Admin" },
  robots: { index: false, follow: false },
};

/**
 * The admin deliberately does not adopt the tenant storefront theme — an
 * operations console should look the same whichever store you are in, so the
 * muscle memory transfers. Only the accent follows the brand.
 */
const ADMIN_THEME: React.CSSProperties = {
  "--c-obsidian": "#0E120F",
  "--c-primary": "#0B4D3D",
  "--c-primary-hover": "#0F6350",
  "--c-accent": "#C9A227",
  "--c-ivory": "#F7F7F5",
  "--c-surface": "#FFFFFF",
  "--c-surface-muted": "#F6F7F5",
  "--c-border": "#E3E5E0",
  "--c-text": "#14171410",
  "--c-text-muted": "#6B7168",
  "--c-text-inverse": "#F2F3F0",
  "--radius-sm": "5px",
  "--radius-md": "7px",
  "--radius-lg": "12px",
  "--radius-button": "6px",
  "--radius-card": "9px",
  "--font-display-transform": "none",
  "--font-display-tracking": "-0.01em",
  "--font-display-weight": "600",
  "--font-display-family": "var(--stack-body)",
  "--font-base-size": "14px",
} as React.CSSProperties;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const db = await currentStore();
  const staff = getDemoStaffMember(db.store.id);

  const badges = {
    orders: db.orders.filter((o) =>
      ["pending", "payment_pending", "confirmed", "processing"].includes(o.status),
    ).length,
    returns: db.returns.filter((r) => !["completed", "rejected"].includes(r.status)).length,
    lowStock: getLowStockRecords(db.store.id).length,
    reviews: db.reviews.filter((r) => r.status === "pending").length,
    tickets: db.tickets.filter((t) => t.status === "open").length,
  };

  const stores = listStoreDatabases().map((entry) => ({
    id: entry.store.id,
    name: entry.store.name,
    logoMark: entry.store.logoMark,
    industry: entry.store.industry,
  }));

  return (
    <div style={{ ...ADMIN_THEME, "--c-text": "#141714" } as React.CSSProperties} className="min-h-screen bg-muted">
      <AdminSidebar
        storeName={db.store.name}
        storeMark={db.store.logoMark}
        storeDomain={db.store.domain}
        badges={badges}
      />

      <div className="lg:pl-[248px]">
        <AdminTopbar
          storeId={db.store.id}
          stores={stores}
          staff={{
            name: staff.name,
            email: staff.email,
            avatar: staff.avatar,
            role: staff.role,
          }}
          notifications={db.merchantNotifications.slice(0, 10).map((n) => ({
            id: n.id,
            title: n.title,
            body: n.body,
            read: n.read,
            createdAt: n.createdAt,
            actionUrl: n.actionUrl,
            category: n.category,
          }))}
        />
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
