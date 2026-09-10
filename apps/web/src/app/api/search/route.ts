import { NextResponse } from "next/server";
import { getStoreDb, suggestCatalog } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";
import { money } from "@/lib/format";

const TRENDING = [
  "wireless headphones",
  "running shoes",
  "linen shirt",
  "air fryer",
  "vitamin c serum",
  "office chair",
  "smart watch",
  "single origin coffee",
];

export async function GET(request: Request) {
  const storeId = await currentStoreId();
  const url = new URL(request.url);
  const term = (url.searchParams.get("q") ?? "").trim();
  const db = getStoreDb(storeId);

  if (term.length < 2) {
    return NextResponse.json({
      term,
      suggestions: [],
      trending: TRENDING,
      categories: db.categories
        .filter((c) => c.level === 0)
        .slice(0, 8)
        .map((c) => ({ label: c.name, href: `/category/${c.slug}`, image: c.image })),
      popular: db.products
        .filter((p) => p.status === "active" && p.flags.bestseller)
        .slice(0, 4)
        .map((p) => ({
          id: p.id,
          label: p.name,
          sublabel: money(p.price),
          image: p.media[0]?.url,
          href: `/product/${p.slug}`,
        })),
    });
  }

  const suggestions = suggestCatalog(storeId, term, 8).map((s) => {
    if (s.type !== "product") return s;
    const product = db.products.find((p) => p.id === s.id);
    if (!product) return s;
    const brand = db.brands.find((b) => b.id === product.brandId);
    return {
      ...s,
      sublabel: [brand?.name, money(product.price)].filter(Boolean).join(" · "),
    };
  });

  return NextResponse.json({ term, suggestions, trending: TRENDING, categories: [], popular: [] });
}
