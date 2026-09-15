import type { PermissionKey } from "@obsidian/commerce";

export interface AdminNavLink {
  label: string;
  href: string;
  permission?: PermissionKey;
  badgeKey?: "orders" | "returns" | "lowStock" | "reviews" | "tickets";
}

export interface AdminNavGroup {
  label: string;
  icon: string;
  links: AdminNavLink[];
}

/**
 * Merchant admin information architecture.
 *
 * Mirrors the domain modules one-to-one so a merchant's mental model matches
 * the data model: catalog, orders, inventory, customers, marketing, content,
 * finance, shipping, settings.
 */
export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Overview",
    icon: "layout-dashboard",
    links: [
      { label: "Dashboard", href: "/admin" },
      { label: "Analytics", href: "/admin/analytics", permission: "analytics.read" },
      { label: "Sales report", href: "/admin/analytics/sales", permission: "analytics.read" },
      { label: "Product report", href: "/admin/analytics/products", permission: "analytics.read" },
      { label: "Customer report", href: "/admin/analytics/customers", permission: "analytics.read" },
    ],
  },
  {
    label: "Catalog",
    icon: "package",
    links: [
      { label: "Products", href: "/admin/products", permission: "products.read" },
      { label: "Categories", href: "/admin/categories", permission: "products.read" },
      { label: "Collections", href: "/admin/collections", permission: "products.read" },
      { label: "Brands", href: "/admin/brands", permission: "products.read" },
      { label: "Attributes", href: "/admin/attributes", permission: "products.read" },
      { label: "Media", href: "/admin/media", permission: "products.read" },
      { label: "Import", href: "/admin/products/import", permission: "products.write" },
    ],
  },
  {
    label: "Orders",
    icon: "shopping-bag",
    links: [
      { label: "All orders", href: "/admin/orders", permission: "orders.read", badgeKey: "orders" },
      { label: "Returns", href: "/admin/returns", permission: "orders.read", badgeKey: "returns" },
      { label: "Shipments", href: "/admin/shipments", permission: "orders.read" },
    ],
  },
  {
    label: "Inventory",
    icon: "warehouse",
    links: [
      { label: "Stock", href: "/admin/inventory", permission: "inventory.read", badgeKey: "lowStock" },
      { label: "Warehouses", href: "/admin/warehouses", permission: "inventory.read" },
      { label: "Transfers", href: "/admin/transfers", permission: "inventory.read" },
      { label: "Purchase orders", href: "/admin/purchase-orders", permission: "inventory.read" },
      { label: "Suppliers", href: "/admin/suppliers", permission: "inventory.read" },
    ],
  },
  {
    label: "Customers",
    icon: "users",
    links: [
      { label: "All customers", href: "/admin/customers", permission: "customers.read" },
      { label: "Segments", href: "/admin/segments", permission: "customers.read" },
      { label: "Reviews", href: "/admin/reviews", permission: "customers.read", badgeKey: "reviews" },
      { label: "Support", href: "/admin/support", permission: "customers.read", badgeKey: "tickets" },
    ],
  },
  {
    label: "Marketing",
    icon: "megaphone",
    links: [
      { label: "Coupons", href: "/admin/marketing/coupons", permission: "marketing.read" },
      { label: "Promotions", href: "/admin/marketing/promotions", permission: "marketing.read" },
      { label: "Campaigns", href: "/admin/marketing/campaigns", permission: "marketing.read" },
      { label: "Automations", href: "/admin/marketing/automations", permission: "marketing.read" },
      { label: "Loyalty", href: "/admin/marketing/loyalty", permission: "marketing.read" },
    ],
  },
  {
    label: "Storefront",
    icon: "palette",
    links: [
      { label: "Theme", href: "/admin/content/theme", permission: "content.read" },
      { label: "Home page", href: "/admin/content/home", permission: "content.read" },
      { label: "Navigation", href: "/admin/content/navigation", permission: "content.read" },
      { label: "Pages", href: "/admin/content/pages", permission: "content.read" },
      { label: "Blog", href: "/admin/content/blog", permission: "content.read" },
    ],
  },
  {
    label: "Finance",
    icon: "wallet",
    links: [
      { label: "Payments", href: "/admin/finance/payments", permission: "finance.read" },
      { label: "Payouts", href: "/admin/finance/payouts", permission: "finance.read" },
      { label: "Invoices", href: "/admin/finance/invoices", permission: "finance.read" },
      { label: "Reconciliation", href: "/admin/finance/reconciliation", permission: "finance.read" },
      { label: "Taxes", href: "/admin/finance/taxes", permission: "finance.read" },
    ],
  },
  {
    label: "Shipping",
    icon: "truck",
    links: [
      { label: "Zones", href: "/admin/shipping/zones", permission: "settings.read" },
      { label: "Rates", href: "/admin/shipping/rates", permission: "settings.read" },
      { label: "Carriers", href: "/admin/shipping/carriers", permission: "settings.read" },
    ],
  },
  {
    label: "Integrations",
    icon: "plug",
    links: [
      { label: "Apps", href: "/admin/integrations", permission: "settings.read" },
      { label: "Webhooks", href: "/admin/integrations/webhooks", permission: "settings.read" },
      { label: "Logs", href: "/admin/integrations/logs", permission: "settings.read" },
    ],
  },
  {
    label: "Settings",
    icon: "settings",
    links: [
      { label: "Store", href: "/admin/settings", permission: "settings.read" },
      { label: "Staff", href: "/admin/settings/staff", permission: "staff.read" },
      { label: "Roles & permissions", href: "/admin/settings/roles", permission: "staff.read" },
      { label: "Shipping", href: "/admin/settings/shipping", permission: "settings.read" },
      { label: "Notifications", href: "/admin/settings/notifications", permission: "settings.read" },
      { label: "API & webhooks", href: "/admin/settings/api", permission: "settings.read" },
      { label: "Audit log", href: "/admin/settings/audit", permission: "settings.read" },
    ],
  },
];
