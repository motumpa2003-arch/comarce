"use client";

import { useRouter } from "next/navigation";
import { Tabs } from "@obsidian/ui";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "12 months" },
];

export function DashboardRangeTabs({ active }: { active: string }) {
  const router = useRouter();
  return (
    <Tabs
      variant="segment"
      items={RANGES}
      value={active}
      onChange={(value) => router.push(value === "30" ? "/admin" : `/admin?range=${value}`)}
    />
  );
}
