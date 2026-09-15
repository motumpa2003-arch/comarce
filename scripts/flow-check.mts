/** End-to-end flow smoke test against a running dev server. */
const BASE = process.env.BASE ?? "http://localhost:3100";

const get = async (path: string) => {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, res };
};
const json = async (path: string, init: RequestInit) => {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
};

// Pick a real product off the storefront API so the order references live data.
const search = await fetch(`${BASE}/api/search?q=tee`).then((r) => r.json());
const hit = (search.suggestions ?? []).find((s: any) => s.type === "product");
if (!hit) throw new Error("no product suggestion from /api/search");
const slug = hit.href.replace("/product/", "");
const detail = await fetch(`${BASE}/api/products/${slug}`).then((r) => r.json());
const product = detail.detail ?? detail.product ?? detail;
const variant = product.variants?.find((v: any) => (v.available ?? 0) > 0) ?? product.variants?.[0];
if (!variant) throw new Error("no variant on " + slug);

const lines = [
  {
    id: `line_${variant.id}`,
    productId: product.id,
    variantId: variant.id,
    slug: product.slug,
    name: product.name,
    brandName: product.brand?.name,
    variantTitle: variant.title,
    options: variant.options ?? {},
    image: variant.image ?? product.media?.[0]?.url ?? "",
    unitPrice: variant.price,
    quantity: 2,
    maxQuantity: Math.max(1, variant.available ?? 1),
    addedAt: new Date().toISOString(),
  },
];

const placed = await json("/api/orders", {
  method: "POST",
  body: JSON.stringify({
    lines,
    contact: { name: "Test Shopper", email: "tester@example.com", phone: "+91 90000 00000" },
    shippingAddress: {
      id: "addr_test", label: "home", firstName: "Test", lastName: "Shopper",
      phone: "+91 90000 00000", line1: "12 Palm Grove", line2: "Indiranagar",
      city: "Bengaluru", state: "Karnataka", postalCode: "560038", country: "India",
      isDefaultShipping: true, isDefaultBilling: true,
    },
    shippingMethodId: "standard",
    paymentMethod: "upi",
  }),
});
console.log("POST /api/orders ->", placed.status, JSON.stringify(placed.body));
const orderId = (placed.body as any)?.orderId;
if (!orderId) throw new Error("order not created");

for (const [label, path] of [
  ["invoice", `/api/orders/${orderId}/invoice`],
  ["success page", `/checkout/success?order=${orderId}`],
  ["account order", `/account/orders/${orderId}`],
  ["admin order", `/admin/orders/${orderId}`],
] as const) {
  const { status } = await get(path);
  console.log(`${label.padEnd(14)} -> ${status}`);
}

for (const status of ["processing", "packed", "shipped", "out_for_delivery", "delivered"]) {
  const r = await json(`/api/orders/${orderId}/status`, { method: "POST", body: JSON.stringify({ next: status }) });
  console.log(`advance -> ${status.padEnd(17)} ${r.status} ${JSON.stringify(r.body).slice(0, 120)}`);
}

const reset = await json("/api/platform/reset", { method: "POST" });
console.log("reset ->", reset.status, JSON.stringify(reset.body));
const after = await get(`/account/orders/${orderId}`);
console.log("order after reset ->", after.status, "(404 expected: the live order was discarded)");
