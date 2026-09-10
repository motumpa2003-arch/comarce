"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  Plus,
  Save,
} from "lucide-react";
import type { SectionType } from "@obsidian/commerce";
import { Badge, Button, Card, Select, buttonClasses, cn, useToast } from "@obsidian/ui";
import { relativeTime, titleCase } from "@/lib/format";

interface BuilderSection {
  id: string;
  type: string;
  title: string;
  eyebrow?: string;
  subtitle?: string;
  visible: boolean;
  position: number;
  sourceKind?: string;
  sourceValue?: string;
  limit?: number;
}

/** The section library a merchant can add from. */
const SECTION_LIBRARY: { type: SectionType; label: string; note: string }[] = [
  { type: "hero", label: "Hero", note: "Full-bleed campaign carousel" },
  { type: "video_hero", label: "Video hero", note: "Autoplaying brand film" },
  { type: "promo_strip", label: "Promo strip", note: "Thin announcement band" },
  { type: "category_grid", label: "Category grid", note: "Circular or tiled categories" },
  { type: "product_grid", label: "Product grid", note: "Any slice of the catalogue" },
  { type: "carousel", label: "Carousel", note: "Horizontal product rail" },
  { type: "collection_feature", label: "Collection feature", note: "One collection, hero treatment" },
  { type: "editorial_split", label: "Editorial split", note: "Large image plus two panels" },
  { type: "lookbook", label: "Lookbook", note: "Full-width campaign imagery" },
  { type: "testimonial", label: "Testimonials", note: "Customer reviews" },
  { type: "review_wall", label: "Review wall", note: "Dense review mosaic" },
  { type: "faq", label: "FAQ", note: "Accordion of questions" },
  { type: "newsletter", label: "Newsletter", note: "Email capture" },
  { type: "countdown", label: "Countdown", note: "Deal timer" },
  { type: "brand_story", label: "Brand story", note: "Long-form editorial" },
  { type: "trust_bar", label: "Trust bar", note: "Shipping, returns, payment" },
  { type: "logo_cloud", label: "Logo cloud", note: "Brand wordmarks" },
  { type: "recently_viewed", label: "Recently viewed", note: "Per-shopper rail" },
  { type: "recommendations", label: "Recommendations", note: "Algorithmic rail" },
  { type: "rich_text", label: "Rich text", note: "Free-form copy" },
  { type: "image_mosaic", label: "Image mosaic", note: "Asymmetric image grid" },
  { type: "custom_html", label: "Custom HTML", note: "Escape hatch" },
];

export function HomeSectionBuilder({
  sections,
  updatedAt,
}: {
  sections: BuilderSection[];
  updatedAt: string;
}) {
  const [draft, setDraft] = React.useState(sections);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const move = (from: number, to: number) => {
    if (to < 0 || to >= draft.length) return;
    setDraft((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
    setDirty(true);
  };

  const toggle = (id: string) => {
    setDraft((current) => current.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/home-page", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          order: draft.map((s) => s.id),
          visibility: Object.fromEntries(draft.map((s) => [s.id, s.visible])),
        }),
      });
      if (!response.ok) throw new Error((await response.json())?.error ?? "Could not save the layout.");
      toast({
        title: "Home page published",
        description: "Open the storefront to see the new arrangement.",
        tone: "success",
      });
      setDirty(false);
      router.refresh();
    } catch (caught) {
      toast({
        title: "Publish failed",
        description: caught instanceof Error ? caught.message : "Try again.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div>
            <h2 className="text-[12.5px] font-semibold text-ink">Sections</h2>
            <p className="mt-0.5 text-[11.5px] text-ink-muted">
              Drag to reorder, or use the arrows. {draft.filter((s) => s.visible).length} of {draft.length} visible.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" target="_blank" className={buttonClasses("outline", "sm")}>
              <ExternalLink className="h-3.5 w-3.5" />
              Preview
            </Link>
            <Button size="sm" loading={saving} disabled={!dirty} onClick={save}>
              <Save className="h-3.5 w-3.5" />
              {dirty ? "Publish layout" : "Published"}
            </Button>
          </div>
        </div>

        <ul className="divide-y divide-line">
          {draft.map((section, index) => (
            <li
              key={section.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex != null && dragIndex !== index) move(dragIndex, index);
                setDragIndex(null);
              }}
              className={cn(
                "flex items-center gap-3 px-5 py-3 transition-colors",
                dragIndex === index ? "bg-primary/[0.06]" : "hover:bg-muted/50",
                !section.visible && "opacity-55",
              )}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-muted/60" />

              <span className="w-6 shrink-0 text-[11px] tabular-nums text-ink-muted">{index + 1}</span>

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-medium text-ink">
                  {section.title}
                  <Badge tone="outline" size="xs">
                    {titleCase(section.type.replace(/_/g, " "))}
                  </Badge>
                  {!section.visible && (
                    <Badge tone="neutral" size="xs">
                      Hidden
                    </Badge>
                  )}
                </p>
                {(section.subtitle || section.sourceKind) && (
                  <p className="mt-0.5 truncate text-[11.5px] text-ink-muted">
                    {section.subtitle}
                    {section.sourceKind && (
                      <span className="ml-2">
                        source: {section.sourceKind}
                        {section.sourceValue ? ` · ${section.sourceValue}` : ""}
                        {section.limit ? ` · limit ${section.limit}` : ""}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-muted hover:text-ink disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={index === draft.length - 1}
                  aria-label="Move down"
                  className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-muted hover:text-ink disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  aria-label={section.visible ? "Hide section" : "Show section"}
                  className="grid h-7 w-7 place-items-center rounded-[var(--radius-sm)] text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                >
                  {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t border-line px-5 py-3 text-[11px] text-ink-muted">
          Last published {relativeTime(updatedAt)}
        </div>
      </Card>

      <aside className="space-y-4 xl:sticky xl:top-[76px] xl:self-start">
        <Card>
          <h2 className="text-[12.5px] font-semibold text-ink">Add a section</h2>
          <p className="mt-1 text-[11.5px] leading-relaxed text-ink-muted">
            Every section type is a renderer in the storefront. Adding one writes a row to the page — it does not
            touch code.
          </p>
          <Select className="mt-3" defaultValue="">
            <option value="" disabled>
              Choose a section type…
            </option>
            {SECTION_LIBRARY.map((entry) => (
              <option key={entry.type} value={entry.type}>
                {entry.label} — {entry.note}
              </option>
            ))}
          </Select>
          <Button variant="outline" fullWidth className="mt-2.5">
            <Plus className="h-3.5 w-3.5" />
            Add to page
          </Button>
        </Card>

        <Card tone="muted">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Section library</h2>
          <ul className="mt-3 space-y-1.5">
            {SECTION_LIBRARY.map((entry) => (
              <li key={entry.type} className="text-[11.5px] text-ink-muted">
                <span className="text-ink">{entry.label}</span> — {entry.note}
              </li>
            ))}
          </ul>
        </Card>
      </aside>
    </div>
  );
}
