import { NextResponse } from "next/server";
import type { RecommendationStrategy } from "@obsidian/commerce";
import { getProductsByIds, getRecommendations, getStoreDb } from "@obsidian/data";
import { currentStoreId } from "@/lib/tenant";
import { toCardList } from "@/lib/product-view";

const STRATEGIES: RecommendationStrategy[] = [
  "similar",
  "complete_the_look",
  "frequently_bought_together",
  "also_bought",
  "trending",
  "popular",
  "recently_viewed",
  "for_you",
];

export async function GET(request: Request) {
  const storeId = await currentStoreId();
  const db = getStoreDb(storeId);
  const url = new URL(request.url);

  const raw = url.searchParams.get("strategy") ?? "trending";
  const strategy = (STRATEGIES.includes(raw as RecommendationStrategy) ? raw : "trending") as RecommendationStrategy;
  const limit = Math.min(24, Number(url.searchParams.get("limit") ?? 8) || 8);
  const seedProductId = url.searchParams.get("seed") ?? undefined;
  const ids = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);

  const products =
    strategy === "recently_viewed"
      ? getProductsByIds(storeId, ids).slice(0, limit)
      : getRecommendations(storeId, strategy, { seedProductId, recentlyViewedIds: ids, limit });

  return NextResponse.json({ items: toCardList(products, db) });
}
