"use client";

import * as React from "react";
import { Tabs } from "@obsidian/ui";
import { ProductGrid } from "@/components/commerce/product-card";
import type { ProductCardData } from "@/lib/product-view";

export interface ProductTabGroup {
  value: string;
  label: string;
  products: ProductCardData[];
}

export function ProductTabs({
  groups,
  columns = 6,
}: {
  groups: ProductTabGroup[];
  columns?: 4 | 5 | 6;
}) {
  const [active, setActive] = React.useState(groups[0]?.value ?? "");
  const current = groups.find((g) => g.value === active) ?? groups[0];

  return (
    <div>
      <Tabs
        className="mb-8 justify-center border-none sm:justify-start"
        variant="pill"
        items={groups.map((g) => ({ value: g.value, label: g.label }))}
        value={active}
        onChange={setActive}
      />
      <ProductGrid products={current?.products ?? []} columns={columns} />
    </div>
  );
}
