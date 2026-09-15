"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button, useToast } from "@obsidian/ui";
import { useCompare, useHydrated } from "@/store/shopper";

/**
 * Bridges the persisted compare list and the URL.
 *
 * The page itself is server-rendered from `?ids=`, which keeps the comparison
 * shareable and lets the spec table be built on the server. This component
 * makes the two agree: on arrival it seeds the URL from saved state, and
 * thereafter it treats the URL as the source of truth, so removing a column
 * with a plain link also drops it from storage.
 */
export function CompareSync({ ids }: { ids: string[] }) {
  const items = useCompare((s) => s.items);
  const remove = useCompare((s) => s.remove);
  const clear = useCompare((s) => s.clear);
  const hydrated = useHydrated();
  const router = useRouter();
  const { toast } = useToast();

  const urlKey = ids.join(",");
  const storeKey = items.map((i) => i.id).join(",");

  React.useEffect(() => {
    if (!hydrated) return;

    // Arrived with a bare /compare but something saved: put it in the URL.
    if (!urlKey && storeKey) {
      router.replace(`/compare?ids=${storeKey}`);
      return;
    }
    if (!urlKey) return;

    // Otherwise the URL wins — drop anything it no longer lists.
    const keep = new Set(ids);
    for (const item of items) {
      if (!keep.has(item.id)) remove(item.id);
    }
  }, [hydrated, urlKey, storeKey, ids, items, remove, router]);

  if (!ids.length) return null;

  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() => {
        clear();
        toast({ title: "Comparison cleared" });
        router.replace("/compare");
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
      Clear all
    </Button>
  );
}
