const { getDatabase } = await import("../packages/data/src/database.ts");
const db = getDatabase();
const f = db.flagship;
const picks = ["headphones", "laptops-computers", "skincare", "sofas-lounge", "coffee-tea", "footwear", "watches"];
for (const slug of picks) {
  const cat = f.categories.find((c: any) => c.slug === slug);
  const p = f.products.find((p: any) => p.categoryId === cat?.id && p.status === "active");
  if (p) console.log(slug.padEnd(20), "->", p.slug, "|", p.name, "| variants", p.variants.length, "| reviews", f.reviews.filter((r:any)=>r.productId===p.id).length);
}
console.log("\nCategories:", f.categories.filter((c:any)=>c.level===0).map((c:any)=>c.slug).join(", "));
console.log("Collections:", f.collections.slice(0,6).map((c:any)=>c.slug).join(", "));
console.log("Brands:", f.brands.slice(0,5).map((b:any)=>b.slug).join(", "));
console.log("Order:", f.orders[0].id, f.orders[0].orderNumber, f.orders[0].status);
