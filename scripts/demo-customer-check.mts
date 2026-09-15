const { getDatabase } = await import("../packages/data/src/database.ts");
const { getDemoCustomer } = await import("../packages/data/src/repositories.ts");

for (const db of getDatabase().stores.slice(0, 3)) {
  const c = getDemoCustomer(db.store.id);
  const orders = db.orders.filter((o) => o.customerId === c.id);
  console.log(db.store.name.padEnd(20), "|", `${c.firstName} ${c.lastName}`.padEnd(20),
    "orders", String(orders.length).padStart(2),
    "| statuses", new Set(orders.map((o) => o.status)).size,
    "| tickets", db.tickets.filter((t) => t.customerId === c.id).length,
    "| returns", db.returns.filter((r) => r.customerId === c.id).length,
    "| reviews", db.reviews.filter((r) => r.customerId === c.id).length);
}
