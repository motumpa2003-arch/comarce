"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Bell, Search, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Skeleton, Switch, useToast } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { useHydrated, useSearchHistory } from "@/store/shopper";

/**
 * Search history lives in browser storage, so this renders its skeleton on the
 * server pass and resolves after the persisted store has hydrated.
 */
export function SavedSearchList() {
  const recent = useSearchHistory((s) => s.recent);
  const clear = useSearchHistory((s) => s.clear);
  const hydrated = useHydrated();
  const { toast } = useToast();
  const [alerts, setAlerts] = React.useState<Record<string, boolean>>({});

  if (!hydrated) {
    return (
      <Card padded={false}>
        <ul className="divide-y divide-line">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  if (recent.length === 0) {
    return (
      <Card className="py-4">
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No saved searches yet"
          description="Search the catalogue and your terms will collect here, so a search you run often is always one tap away."
          action={<ButtonLink href="/shop">Browse the catalogue</ButtonLink>}
        />
      </Card>
    );
  }

  return (
    <>
      <Card padded={false}>
        <ul className="divide-y divide-line">
          {recent.map((term) => (
            <li key={term} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-ink-muted">
                <Search className="h-3.5 w-3.5" />
              </span>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="block truncate text-[13.5px] font-medium text-ink hover:text-primary"
                >
                  {term}
                </Link>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {alerts[term] ? "Alerting on new matches" : "No alert set"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Switch
                  aria-label={`Alert me about new matches for ${term}`}
                  checked={Boolean(alerts[term])}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setAlerts((a) => ({ ...a, [term]: on }));
                    toast({
                      title: on ? `Alert set for “${term}”` : `Alert removed for “${term}”`,
                      description: on
                        ? "We would email you when something new matches. Not wired up in this demo build."
                        : undefined,
                    });
                  }}
                />
                <Link
                  href={`/search?q=${encodeURIComponent(term)}`}
                  aria-label={`Run the search for ${term}`}
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[11.5px] text-ink-muted">
          <Bell className="h-3.5 w-3.5" />
          Alerts are per-browser in this build and send nothing.
        </p>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            clear();
            toast({ title: "Search history cleared" });
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear history
        </Button>
      </div>
    </>
  );
}
