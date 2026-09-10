import type { PermissionKey, StaffRole } from "../types/tenancy";

export const ALL_PERMISSIONS: PermissionKey[] = [
  "products.read", "products.write", "products.delete",
  "orders.read", "orders.write", "orders.refund",
  "inventory.read", "inventory.write",
  "customers.read", "customers.write",
  "marketing.read", "marketing.write",
  "content.read", "content.write",
  "analytics.read",
  "finance.read", "finance.write",
  "settings.read", "settings.write",
  "staff.read", "staff.write",
  "platform.admin",
];

export const PERMISSION_GROUPS: { label: string; keys: PermissionKey[] }[] = [
  { label: "Catalog", keys: ["products.read", "products.write", "products.delete"] },
  { label: "Orders", keys: ["orders.read", "orders.write", "orders.refund"] },
  { label: "Inventory", keys: ["inventory.read", "inventory.write"] },
  { label: "Customers", keys: ["customers.read", "customers.write"] },
  { label: "Marketing", keys: ["marketing.read", "marketing.write"] },
  { label: "Content", keys: ["content.read", "content.write"] },
  { label: "Analytics", keys: ["analytics.read"] },
  { label: "Finance", keys: ["finance.read", "finance.write"] },
  { label: "Settings & staff", keys: ["settings.read", "settings.write", "staff.read", "staff.write"] },
];

export const ROLE_PRESETS: Record<StaffRole, { label: string; description: string; permissions: PermissionKey[] }> = {
  owner: {
    label: "Owner",
    description: "Full control including billing, staff and store deletion.",
    permissions: ALL_PERMISSIONS.filter((p) => p !== "platform.admin"),
  },
  admin: {
    label: "Administrator",
    description: "Everything except transferring ownership.",
    permissions: ALL_PERMISSIONS.filter((p) => p !== "platform.admin"),
  },
  manager: {
    label: "Store manager",
    description: "Day-to-day operations across catalog, orders and customers.",
    permissions: [
      "products.read", "products.write",
      "orders.read", "orders.write",
      "inventory.read", "inventory.write",
      "customers.read", "customers.write",
      "marketing.read", "content.read", "analytics.read", "settings.read",
    ],
  },
  product_manager: {
    label: "Product manager",
    description: "Owns the catalogue, merchandising and content.",
    permissions: [
      "products.read", "products.write", "products.delete",
      "inventory.read", "content.read", "content.write",
      "marketing.read", "analytics.read",
    ],
  },
  warehouse_manager: {
    label: "Warehouse manager",
    description: "Stock, transfers, purchase orders and fulfilment.",
    permissions: ["inventory.read", "inventory.write", "orders.read", "orders.write", "products.read"],
  },
  support: {
    label: "Customer support",
    description: "Reads orders and customers, raises returns and refunds.",
    permissions: ["orders.read", "orders.write", "orders.refund", "customers.read", "customers.write", "products.read"],
  },
  marketing: {
    label: "Marketing",
    description: "Campaigns, coupons, content and performance reporting.",
    permissions: ["marketing.read", "marketing.write", "content.read", "content.write", "customers.read", "analytics.read", "products.read"],
  },
  accountant: {
    label: "Accountant",
    description: "Financial reporting, payouts, invoices and taxes.",
    permissions: ["finance.read", "finance.write", "orders.read", "analytics.read"],
  },
};

export function can(permissions: PermissionKey[], required: PermissionKey): boolean {
  return permissions.includes(required) || permissions.includes("platform.admin");
}

export function canAny(permissions: PermissionKey[], required: PermissionKey[]): boolean {
  return required.some((r) => can(permissions, r));
}

export function permissionLabel(key: PermissionKey): string {
  const [resource, action] = key.split(".");
  const actionLabel = { read: "View", write: "Manage", delete: "Delete", refund: "Refund", admin: "Administer" }[
    action ?? "read"
  ];
  return `${actionLabel} ${resource}`;
}
