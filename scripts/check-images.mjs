// Verifies candidate Unsplash photo ids resolve, so the seed never ships a dead image.
const ids = process.argv.slice(2);
const results = { ok: [], bad: [] };

async function check(id) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=200&q=60`;
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    if (res.ok && (res.headers.get("content-type") || "").startsWith("image")) results.ok.push(id);
    else results.bad.push(`${id} :: ${res.status}`);
  } catch (e) {
    results.bad.push(`${id} :: ${e.message}`);
  }
}

const queue = [...ids];
const workers = Array.from({ length: 12 }, async () => {
  while (queue.length) {
    const id = queue.shift();
    if (id) await check(id);
  }
});
await Promise.all(workers);

console.log("OK_COUNT", results.ok.length);
console.log(results.ok.join("\n"));
console.log("BAD_COUNT", results.bad.length);
console.log(results.bad.join("\n"));
