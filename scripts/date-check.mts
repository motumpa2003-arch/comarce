const { getDatabase, SEED_NOW } = await import("../packages/data/src/database.ts");
const db = getDatabase();
const now = SEED_NOW.getTime();
let future = 0;
const samples: string[] = [];
const check = (label: string, iso?: string) => {
  if (!iso) return;
  if (Date.parse(iso) > now) { future++; if (samples.length < 8) samples.push(`${label} ${iso}`); }
};
for (const s of db.stores) {
  for (const m of s.staff) { check("staff.lastActiveAt", m.lastActiveAt); check("staff.createdAt", m.createdAt); }
  for (const o of s.orders) check("order.createdAt", o.createdAt);
  for (const r of s.reviews) check("review.createdAt", r.createdAt);
  for (const t of s.tickets) check("ticket.createdAt", t.createdAt);
  for (const a of s.auditLog) check("audit.createdAt", a.createdAt);
  for (const c of s.customers) check("customer.createdAt", c.createdAt);
}
for (const u of db.users) { check("user.lastLoginAt", u.lastLoginAt); check("user.createdAt", u.createdAt); }
for (const a of db.auditLog) check("platformAudit.createdAt", a.createdAt);
for (const st of db.allStores) check("store.createdAt", st.createdAt);
console.log({ futureDatedRecords: future, samples });

// staff name variety
const names = new Set<string>();
let total = 0;
for (const s of db.stores) for (const m of s.staff) { names.add(m.name); total++; }
console.log({ staffRecords: total, distinctStaffNames: names.size });
