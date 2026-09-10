import type { GeoPoint, ID, ISODate, Money } from "./primitives";

export interface Warehouse {
  id: ID;
  storeId: ID;
  name: string;
  code: string;
  type: "warehouse" | "retail_store" | "dropship" | "3pl";
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  geo: GeoPoint;
  isDefault: boolean;
  fulfilsOnline: boolean;
  supportsPickup: boolean;
  capacityUnits: number;
  usedUnits: number;
  status: "active" | "inactive";
}

export interface InventoryRecord {
  id: ID;
  storeId: ID;
  productId: ID;
  variantId: ID;
  warehouseId: ID;
  onHand: number;
  reserved: number;
  incoming: number;
  reorderPoint: number;
  reorderQuantity: number;
  binLocation?: string;
  updatedAt: ISODate;
}

export type InventoryMovementReason =
  | "purchase"
  | "sale"
  | "return"
  | "damage"
  | "transfer_in"
  | "transfer_out"
  | "adjustment"
  | "reservation"
  | "release"
  | "cycle_count";

export interface InventoryMovement {
  id: ID;
  storeId: ID;
  variantId: ID;
  productId: ID;
  warehouseId: ID;
  delta: number;
  balanceAfter: number;
  reason: InventoryMovementReason;
  referenceType?: "order" | "return" | "transfer" | "purchase_order" | "manual";
  referenceId?: string;
  note?: string;
  actorName: string;
  createdAt: ISODate;
}

export interface StockTransfer {
  id: ID;
  storeId: ID;
  reference: string;
  fromWarehouseId: ID;
  toWarehouseId: ID;
  status: "draft" | "in_transit" | "received" | "cancelled";
  itemCount: number;
  totalUnits: number;
  items: { variantId: ID; productId: ID; quantity: number; received: number }[];
  createdAt: ISODate;
  expectedAt: ISODate;
}

export interface Supplier {
  id: ID;
  storeId: ID;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  leadTimeDays: number;
  paymentTerms: string;
  rating: number;
  openPurchaseOrders: number;
  status: "active" | "inactive";
}

export interface PurchaseOrder {
  id: ID;
  storeId: ID;
  reference: string;
  supplierId: ID;
  warehouseId: ID;
  status: "draft" | "sent" | "partial" | "received" | "cancelled";
  subtotal: Money;
  tax: Money;
  shipping: Money;
  total: Money;
  items: {
    variantId: ID;
    productId: ID;
    name: string;
    quantity: number;
    received: number;
    unitCost: Money;
  }[];
  expectedAt: ISODate;
  createdAt: ISODate;
}
