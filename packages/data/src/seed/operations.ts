import {
  major,
  type InventoryMovement,
  type InventoryMovementReason,
  type InventoryRecord,
  type Product,
  type PurchaseOrder,
  type StockTransfer,
  type Supplier,
  type Warehouse,
} from "@obsidian/commerce";
import { Rng } from "../rng";
import { CITIES } from "./people";

const WAREHOUSE_BLUEPRINTS: { name: string; code: string; city: string; type: Warehouse["type"] }[] = [
  { name: "Bengaluru Fulfilment Centre", code: "BLR-FC1", city: "Bengaluru", type: "warehouse" },
  { name: "Mumbai Distribution Hub", code: "BOM-DH1", city: "Mumbai", type: "warehouse" },
  { name: "Delhi NCR Warehouse", code: "DEL-WH1", city: "New Delhi", type: "warehouse" },
  { name: "Hyderabad Micro-Fulfilment", code: "HYD-MF1", city: "Hyderabad", type: "warehouse" },
  { name: "Obsidian Indiranagar Store", code: "BLR-ST1", city: "Bengaluru", type: "retail_store" },
  { name: "Obsidian Bandra Store", code: "BOM-ST1", city: "Mumbai", type: "retail_store" },
  { name: "Kolkata Partner 3PL", code: "CCU-3PL", city: "Kolkata", type: "3pl" },
  { name: "Chennai Dropship Node", code: "MAA-DS1", city: "Chennai", type: "dropship" },
];

export function buildWarehouses(storeId: string, count = 8): Warehouse[] {
  const rng = new Rng(`${storeId}:warehouses`);
  return WAREHOUSE_BLUEPRINTS.slice(0, count).map((bp, index) => {
    const city = CITIES.find((c) => c.city === bp.city) ?? CITIES[0]!;
    const capacity = bp.type === "retail_store" ? rng.int(1200, 4000) : rng.int(20000, 120000);
    return {
      id: `wh_${storeId}_${bp.code.toLowerCase()}`,
      storeId,
      name: bp.name,
      code: bp.code,
      type: bp.type,
      address: {
        line1: `Plot ${rng.int(10, 90)}, ${bp.type === "retail_store" ? "High Street" : "Industrial Area Phase II"}`,
        city: city.city,
        state: city.state,
        postalCode: rng.pick(city.pincodes),
        country: "India",
      },
      geo: { lat: city.lat, lng: city.lng },
      isDefault: index === 0,
      fulfilsOnline: bp.type !== "dropship" ? true : rng.bool(0.6),
      supportsPickup: bp.type === "retail_store",
      capacityUnits: capacity,
      usedUnits: Math.round(capacity * rng.float(0.35, 0.88)),
      status: rng.bool(0.95) ? "active" : "inactive",
    };
  });
}

export interface InventoryBundle {
  records: InventoryRecord[];
  movements: InventoryMovement[];
}

export function buildInventory({
  storeId,
  products,
  warehouses,
  referenceDate,
  movementsPerRecord = 3,
}: {
  storeId: string;
  products: Product[];
  warehouses: Warehouse[];
  referenceDate: Date;
  movementsPerRecord?: number;
}): InventoryBundle {
  const rng = new Rng(`${storeId}:inventory`);
  const records: InventoryRecord[] = [];
  const movements: InventoryMovement[] = [];
  const onlineWarehouses = warehouses.filter((w) => w.status === "active");
  if (!onlineWarehouses.length) return { records, movements };

  const actors = ["Ops Bot", "Priya Nair", "Vikram Rao", "Warehouse Scanner", "Rahul Mehta"];

  for (const product of products) {
    for (const variant of product.variants) {
      // Spread each variant's stock across two or three locations.
      const locations = rng.sample(onlineWarehouses, rng.int(1, Math.min(3, onlineWarehouses.length)));
      let remaining = variant.stock;
      locations.forEach((warehouse, index) => {
        const isLast = index === locations.length - 1;
        const onHand = isLast ? remaining : Math.round(remaining * rng.float(0.3, 0.7));
        remaining -= onHand;
        const reserved = Math.min(onHand, Math.round(variant.reservedStock / locations.length));

        const recordId = `inv_${variant.id}_${warehouse.id}`;
        records.push({
          id: recordId,
          storeId,
          productId: product.id,
          variantId: variant.id,
          warehouseId: warehouse.id,
          onHand,
          reserved,
          incoming: rng.bool(0.22) ? rng.int(10, 200) : 0,
          reorderPoint: rng.int(6, 25),
          reorderQuantity: rng.int(25, 180),
          binLocation: `${String.fromCharCode(65 + rng.int(0, 12))}-${rng.int(1, 40)}-${rng.int(1, 8)}`,
          updatedAt: rng.pastDate(referenceDate, 0, 20).toISOString(),
        });

        let balance = onHand;
        for (let m = 0; m < movementsPerRecord; m++) {
          const reason = rng.weighted<InventoryMovementReason>([
            ["sale", 46],
            ["purchase", 18],
            ["return", 8],
            ["adjustment", 8],
            ["transfer_in", 6],
            ["transfer_out", 6],
            ["damage", 4],
            ["cycle_count", 4],
          ]);
          const delta =
            reason === "sale" || reason === "damage" || reason === "transfer_out"
              ? -rng.int(1, 8)
              : rng.int(1, 40);
          const before = balance;
          balance = Math.max(0, balance - delta);
          movements.push({
            id: `mv_${recordId}_${m}`,
            storeId,
            variantId: variant.id,
            productId: product.id,
            warehouseId: warehouse.id,
            delta,
            balanceAfter: before,
            reason,
            referenceType: reason === "sale" ? "order" : reason === "purchase" ? "purchase_order" : "manual",
            referenceId: reason === "sale" ? `OD${rng.int(100000000, 999999999)}` : undefined,
            actorName: rng.pick(actors),
            createdAt: rng.pastDate(referenceDate, 0, 120).toISOString(),
          });
        }
      });
    }
  }

  movements.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return { records, movements };
}

/* ----------------------------- Suppliers ---------------------------- */

const SUPPLIER_BLUEPRINTS = [
  { name: "Coimbatore Knits Pvt Ltd", contact: "S. Ramesh", country: "India", terms: "Net 30" },
  { name: "Shenzhen Component Works", contact: "Li Wei", country: "China", terms: "Net 45" },
  { name: "Tiruppur Garment Collective", contact: "M. Lakshmi", country: "India", terms: "Net 15" },
  { name: "Milan Leather Atelier", contact: "Giulia Rossi", country: "Italy", terms: "50% advance" },
  { name: "Coorg Estates Coffee", contact: "A. Ponnappa", country: "India", terms: "Net 7" },
  { name: "Jodhpur Woodcraft", contact: "R. Singh", country: "India", terms: "Net 30" },
  { name: "Seoul Optics Co.", contact: "Park Ji-ho", country: "South Korea", terms: "Net 60" },
  { name: "Kochi Botanicals", contact: "Anjali Menon", country: "India", terms: "Net 21" },
  { name: "Pune Precision Metals", contact: "D. Kulkarni", country: "India", terms: "Net 30" },
  { name: "Bangkok Packaging Group", contact: "Somchai P.", country: "Thailand", terms: "Net 45" },
];

export function buildSuppliers(storeId: string): Supplier[] {
  const rng = new Rng(`${storeId}:suppliers`);
  return SUPPLIER_BLUEPRINTS.map((bp, index) => ({
    id: `sup_${storeId}_${index}`,
    storeId,
    name: bp.name,
    contactName: bp.contact,
    email: `orders@${bp.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 14)}.example`,
    phone: `+91 ${rng.int(70000, 99999)} ${rng.int(10000, 99999)}`,
    country: bp.country,
    leadTimeDays: rng.int(5, 45),
    paymentTerms: bp.terms,
    rating: rng.float(3.4, 4.9, 1),
    openPurchaseOrders: rng.int(0, 6),
    status: rng.bool(0.9) ? "active" : "inactive",
  }));
}

export function buildPurchaseOrders({
  storeId,
  products,
  suppliers,
  warehouses,
  referenceDate,
  count = 18,
}: {
  storeId: string;
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  referenceDate: Date;
  count?: number;
}): PurchaseOrder[] {
  const rng = new Rng(`${storeId}:purchase-orders`);
  if (!products.length || !suppliers.length || !warehouses.length) return [];

  return Array.from({ length: count }, (_, index) => {
    const supplier = rng.pick(suppliers);
    const warehouse = rng.pick(warehouses);
    const status = rng.weighted<PurchaseOrder["status"]>([
      ["received", 42],
      ["sent", 22],
      ["partial", 14],
      ["draft", 14],
      ["cancelled", 8],
    ]);
    const lines = rng.sample(products, rng.int(2, 6)).flatMap((product) => {
      const variant = rng.pick(product.variants);
      const quantity = rng.int(20, 400);
      const received = status === "received" ? quantity : status === "partial" ? Math.round(quantity * rng.float(0.2, 0.8)) : 0;
      return [{
        variantId: variant.id,
        productId: product.id,
        name: `${product.name} — ${variant.title}`,
        quantity,
        received,
        unitCost: variant.costPrice ?? Math.round(variant.price * 0.55),
      }];
    });
    const subtotal = lines.reduce((n, l) => n + l.quantity * l.unitCost, 0);
    const tax = Math.round(subtotal * 0.18);
    const shipping = major(rng.int(500, 9000));

    return {
      id: `po_${storeId}_${index}`,
      storeId,
      reference: `PO-${2600 + index}`,
      supplierId: supplier.id,
      warehouseId: warehouse.id,
      status,
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping,
      items: lines,
      expectedAt: rng.futureDate(referenceDate, -30, 45).toISOString(),
      createdAt: rng.pastDate(referenceDate, 2, 120).toISOString(),
    };
  });
}

export function buildStockTransfers({
  storeId,
  products,
  warehouses,
  referenceDate,
  count = 10,
}: {
  storeId: string;
  products: Product[];
  warehouses: Warehouse[];
  referenceDate: Date;
  count?: number;
}): StockTransfer[] {
  const rng = new Rng(`${storeId}:transfers`);
  if (warehouses.length < 2 || !products.length) return [];

  return Array.from({ length: count }, (_, index) => {
    const [from, to] = rng.sample(warehouses, 2);
    const items = rng.sample(products, rng.int(2, 5)).map((product) => {
      const variant = rng.pick(product.variants);
      const quantity = rng.int(5, 120);
      return { variantId: variant.id, productId: product.id, quantity, received: 0 };
    });
    const status = rng.weighted<StockTransfer["status"]>([
      ["received", 45],
      ["in_transit", 30],
      ["draft", 17],
      ["cancelled", 8],
    ]);
    if (status === "received") items.forEach((i) => (i.received = i.quantity));

    return {
      id: `trf_${storeId}_${index}`,
      storeId,
      reference: `TR-${4100 + index}`,
      fromWarehouseId: from!.id,
      toWarehouseId: to!.id,
      status,
      itemCount: items.length,
      totalUnits: items.reduce((n, i) => n + i.quantity, 0),
      items,
      createdAt: rng.pastDate(referenceDate, 1, 90).toISOString(),
      expectedAt: rng.futureDate(referenceDate, -10, 20).toISOString(),
    };
  });
}
