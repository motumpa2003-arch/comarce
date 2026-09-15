"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Copy, Search, Trash2, X } from "lucide-react";
import { Badge, Button, EmptyState, Input, Modal, Select, cn, useToast } from "@obsidian/ui";
import { number } from "@/lib/format";

export interface MediaItem {
  url: string;
  alt: string;
  source: "product" | "category" | "brand" | "collection" | "content";
  uses: number;
  owners: string[];
}

const SOURCE_LABEL: Record<MediaItem["source"], string> = {
  product: "Product",
  category: "Category",
  brand: "Brand",
  collection: "Collection",
  content: "Content",
};

const PAGE = 48;

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const [query, setQuery] = React.useState("");
  const [source, setSource] = React.useState("all");
  const [shown, setShown] = React.useState(PAGE);
  const [selected, setSelected] = React.useState<MediaItem | null>(null);
  const { toast } = useToast();

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      if (source !== "all" && item.source !== source) return false;
      if (!term) return true;
      return (
        item.alt.toLowerCase().includes(term) ||
        item.owners.some((owner) => owner.toLowerCase().includes(term))
      );
    });
  }, [items, query, source]);

  const visible = filtered.slice(0, shown);

  React.useEffect(() => {
    setShown(PAGE);
  }, [query, source]);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "URL copied", tone: "success" });
    } catch {
      toast({ title: "Could not copy", description: "Your browser blocked clipboard access." });
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by alt text or what uses it…"
            className="pl-9"
          />
        </div>
        <Select value={source} onChange={(e) => setSource(e.target.value)} className="w-auto">
          <option value="all">All sources</option>
          {Object.entries(SOURCE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <span className="text-[11.5px] text-ink-muted">{number(filtered.length)} assets</span>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="No assets match"
          description="Try a different search term, or clear the source filter."
        />
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {visible.map((item) => (
              <li key={item.url}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-[var(--radius-sm)] border border-line bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Image
                    src={item.url}
                    alt={item.alt}
                    fill
                    sizes="(min-width:1280px) 12vw, (min-width:640px) 25vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.uses > 1 && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-obsidian/75 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-inverse">
                      {item.uses}×
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          {shown < filtered.length && (
            <div className="mt-5 text-center">
              <Button variant="outline" size="sm" onClick={() => setShown((s) => s + PAGE)}>
                Load {Math.min(PAGE, filtered.length - shown)} more
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Asset detail"
        size="md"
        footer={
          selected && (
            <>
              <Button variant="ghost" size="sm" onClick={() => copy(selected.url)}>
                <Copy className="h-3.5 w-3.5" />
                Copy URL
              </Button>
              <Button
                variant={selected.uses > 0 ? "outline" : "danger"}
                size="sm"
                disabled={selected.uses > 0}
                title={selected.uses > 0 ? "Still in use — remove it from those items first" : undefined}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {selected.uses > 0 ? "In use" : "Delete"}
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] bg-muted">
              <Image
                src={selected.url}
                alt={selected.alt}
                fill
                sizes="(min-width:640px) 560px, 100vw"
                className="object-contain"
              />
            </div>

            <dl className="space-y-2 text-[12.5px]">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-muted">Source</dt>
                <dd>
                  <Badge tone="outline" size="xs">
                    {SOURCE_LABEL[selected.source]}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-muted">Alt text</dt>
                <dd className="max-w-[60%] text-right text-ink">{selected.alt || "—"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-ink-muted">References</dt>
                <dd className={cn("tabular-nums", selected.uses > 1 ? "text-ink" : "text-ink-muted")}>
                  {number(selected.uses)}
                </dd>
              </div>
            </dl>

            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Used by</p>
              <ul className="mt-2 space-y-1">
                {selected.owners.map((owner) => (
                  <li key={owner} className="flex items-center gap-1.5 text-[12px] text-ink">
                    <Check className="h-3 w-3 text-success" />
                    {owner}
                  </li>
                ))}
                {selected.uses > selected.owners.length && (
                  <li className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                    <X className="h-3 w-3 opacity-40" />
                    and {number(selected.uses - selected.owners.length)} more
                  </li>
                )}
              </ul>
            </div>

            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">URL</p>
              <code className="mt-1.5 block break-all rounded-[var(--radius-sm)] bg-muted px-2.5 py-2 text-[11px] text-ink-muted">
                {selected.url}
              </code>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
