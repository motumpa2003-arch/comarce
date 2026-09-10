"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input, Tabs } from "@obsidian/ui";

const TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "In progress" },
  { value: "delivered", label: "Delivered" },
  { value: "returns", label: "Returns" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderFilterTabs({
  active,
  counts,
  initialQuery,
}: {
  active: string;
  counts: Record<string, number>;
  initialQuery: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = React.useState(initialQuery);

  const push = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    router.push(qs ? `/account/orders?${qs}` : "/account/orders", { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Tabs
        variant="pill"
        items={TABS.map((tab) => ({ ...tab, count: counts[tab.value] }))}
        value={active}
        onChange={(value) => push({ status: value === "all" ? null : value })}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          push({ q: query.trim() || null });
        }}
        className="w-full sm:w-64"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sizeVariant="sm"
          placeholder="Search orders or products"
          aria-label="Search orders"
          leading={<Search className="h-3.5 w-3.5" />}
        />
      </form>
    </div>
  );
}
