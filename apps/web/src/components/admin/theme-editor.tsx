"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, Palette, RotateCcw, Save, Type } from "lucide-react";
import {
  themeToCssVars,
  type Theme,
  type ThemeColors,
  type ThemeLayout,
  type ThemeShape,
  type ThemeTypography,
} from "@obsidian/commerce";
import { Badge, Button, Card, Field, Input, Select, Switch, Tabs, cn, useToast } from "@obsidian/ui";
import { relativeTime, titleCase } from "@/lib/format";

interface EditableTheme {
  id: string;
  name: string;
  preset: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  shape: ThemeShape;
  layout: ThemeLayout;
  updatedAt: string;
}

interface PresetOption {
  id: string;
  name: string;
  description: string;
  industries: string[];
  colors: ThemeColors;
  typography: ThemeTypography;
  shape: ThemeShape;
  layout: ThemeLayout;
}

const COLOR_FIELDS: { key: keyof ThemeColors; label: string; hint: string }[] = [
  { key: "obsidian", label: "Obsidian", hint: "Dark editorial bands, header, footer" },
  { key: "primary", label: "Primary", hint: "Buttons, links, active states" },
  { key: "primaryHover", label: "Primary hover", hint: "Hover state for primary" },
  { key: "accent", label: "Accent", hint: "Badges, eyebrows, metallic detail" },
  { key: "ivory", label: "Ivory", hint: "Light ground for product bands" },
  { key: "surface", label: "Surface", hint: "Cards and page background" },
  { key: "surfaceMuted", label: "Surface muted", hint: "Subtle panels" },
  { key: "border", label: "Border", hint: "Hairlines and dividers" },
  { key: "text", label: "Text", hint: "Body copy" },
  { key: "textMuted", label: "Text muted", hint: "Secondary metadata" },
  { key: "textInverse", label: "Text inverse", hint: "Copy on dark grounds" },
  { key: "sale", label: "Sale", hint: "Discount labels" },
  { key: "success", label: "Success", hint: "Positive states" },
  { key: "warning", label: "Warning", hint: "Low stock, pending" },
  { key: "danger", label: "Danger", hint: "Errors, cancellations" },
];

export function ThemeEditor({
  storeName,
  theme,
  presets,
}: {
  storeName: string;
  theme: EditableTheme;
  presets: PresetOption[];
}) {
  const [draft, setDraft] = React.useState(theme);
  const [tab, setTab] = React.useState("presets");
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const patch = <K extends keyof EditableTheme>(key: K, value: EditableTheme[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  const applyPreset = (preset: PresetOption) => {
    setDraft((current) => ({
      ...current,
      preset: preset.id,
      name: preset.name,
      description: preset.description,
      colors: { ...preset.colors },
      typography: { ...preset.typography },
      shape: { ...preset.shape },
      layout: { ...preset.layout },
    }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/theme", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          preset: draft.preset,
          description: draft.description,
          colors: draft.colors,
          typography: draft.typography,
          shape: draft.shape,
          layout: draft.layout,
        }),
      });
      if (!response.ok) throw new Error((await response.json())?.error ?? "Could not publish the theme.");
      toast({
        title: "Theme published",
        description: "Open the storefront to see it applied.",
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

  const previewStyle = themeToCssVars(draft) as React.CSSProperties;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="min-w-0">
        <Tabs
          items={[
            { value: "presets", label: "Presets" },
            { value: "colors", label: "Colours" },
            { value: "type", label: "Typography" },
            { value: "shape", label: "Shape" },
            { value: "layout", label: "Layout" },
          ]}
          value={tab}
          onChange={setTab}
        />

        <div className="pt-6">
          {tab === "presets" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {presets.map((preset) => {
                const active = preset.id === draft.preset;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "overflow-hidden rounded-[var(--radius-card)] border text-left transition-colors",
                      active ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink/30",
                    )}
                  >
                    <div className="flex h-16">
                      {[preset.colors.obsidian, preset.colors.primary, preset.colors.accent, preset.colors.ivory].map(
                        (colour) => (
                          <span key={colour} className="flex-1" style={{ backgroundColor: colour }} />
                        ),
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-semibold text-ink">{preset.name}</p>
                        {active && (
                          <Badge tone="success" size="xs">
                            <Check className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{preset.description}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {preset.industries.map((industry) => (
                          <Badge key={industry} tone="outline" size="xs" className="capitalize">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "colors" && (
            <Card>
              <h2 className="mb-1 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Palette className="h-3.5 w-3.5" />
                Colour tokens
              </h2>
              <p className="mb-5 text-[12px] text-ink-muted">
                Each token becomes a CSS custom property on the storefront root. Nothing is hard-coded.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {COLOR_FIELDS.map((field) => (
                  <Field key={field.key} label={field.label} hint={field.hint}>
                    <div className="flex items-center gap-2">
                      <label className="relative h-10 w-12 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-line">
                        <input
                          type="color"
                          value={draft.colors[field.key]}
                          onChange={(e) =>
                            patch("colors", { ...draft.colors, [field.key]: e.target.value })
                          }
                          className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer"
                          aria-label={`${field.label} colour`}
                        />
                      </label>
                      <Input
                        value={draft.colors[field.key]}
                        onChange={(e) => patch("colors", { ...draft.colors, [field.key]: e.target.value })}
                        className="font-mono text-[12px] uppercase"
                      />
                    </div>
                  </Field>
                ))}
              </div>
            </Card>
          )}

          {tab === "type" && (
            <Card>
              <h2 className="mb-5 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Type className="h-3.5 w-3.5" />
                Typography
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Display family" hint="CSS font stack for headings">
                  <Input
                    value={draft.typography.displayFamily}
                    onChange={(e) =>
                      patch("typography", { ...draft.typography, displayFamily: e.target.value })
                    }
                    className="font-mono text-[12px]"
                  />
                </Field>
                <Field label="Body family" hint="CSS font stack for copy">
                  <Input
                    value={draft.typography.bodyFamily}
                    onChange={(e) => patch("typography", { ...draft.typography, bodyFamily: e.target.value })}
                    className="font-mono text-[12px]"
                  />
                </Field>
                <Field label="Display weight">
                  <Select
                    value={String(draft.typography.displayWeight)}
                    onChange={(e) =>
                      patch("typography", { ...draft.typography, displayWeight: Number(e.target.value) })
                    }
                  >
                    {[300, 400, 500, 600, 700].map((weight) => (
                      <option key={weight} value={weight}>
                        {weight}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Display case">
                  <Select
                    value={draft.typography.displayTransform}
                    onChange={(e) =>
                      patch("typography", {
                        ...draft.typography,
                        displayTransform: e.target.value as ThemeTypography["displayTransform"],
                      })
                    }
                  >
                    <option value="uppercase">Uppercase — editorial</option>
                    <option value="none">Sentence case — modern</option>
                  </Select>
                </Field>
                <Field label="Display tracking" hint="Letter spacing, e.g. 0.02em">
                  <Input
                    value={draft.typography.displayTracking}
                    onChange={(e) =>
                      patch("typography", { ...draft.typography, displayTracking: e.target.value })
                    }
                  />
                </Field>
                <Field label="Base font size" hint="Body text size, e.g. 15px">
                  <Input
                    value={draft.typography.baseSize}
                    onChange={(e) => patch("typography", { ...draft.typography, baseSize: e.target.value })}
                  />
                </Field>
              </div>
            </Card>
          )}

          {tab === "shape" && (
            <Card>
              <h2 className="mb-5 text-[12.5px] font-semibold text-ink">Shape</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["radiusSm", "Small radius"],
                    ["radiusMd", "Medium radius"],
                    ["radiusLg", "Large radius"],
                    ["buttonRadius", "Button radius"],
                    ["cardRadius", "Card radius"],
                    ["borderWidth", "Border width"],
                  ] as [keyof ThemeShape, string][]
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      value={draft.shape[key]}
                      onChange={(e) => patch("shape", { ...draft.shape, [key]: e.target.value })}
                    />
                  </Field>
                ))}
              </div>
            </Card>
          )}

          {tab === "layout" && (
            <Card>
              <h2 className="mb-5 text-[12.5px] font-semibold text-ink">Layout</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Container width">
                  <Input
                    value={draft.layout.containerWidth}
                    onChange={(e) => patch("layout", { ...draft.layout, containerWidth: e.target.value })}
                  />
                </Field>
                <Field label="Section spacing">
                  <Input
                    value={draft.layout.sectionSpacing}
                    onChange={(e) => patch("layout", { ...draft.layout, sectionSpacing: e.target.value })}
                  />
                </Field>
                <Field label="Product grid columns" hint="Desktop columns on listing pages">
                  <Select
                    value={String(draft.layout.productGridColumns)}
                    onChange={(e) =>
                      patch("layout", {
                        ...draft.layout,
                        productGridColumns: Number(e.target.value) as ThemeLayout["productGridColumns"],
                      })
                    }
                  >
                    {[3, 4, 5].map((columns) => (
                      <option key={columns} value={columns}>
                        {columns} columns
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Product card style">
                  <Select
                    value={draft.layout.productCardStyle}
                    onChange={(e) =>
                      patch("layout", {
                        ...draft.layout,
                        productCardStyle: e.target.value as ThemeLayout["productCardStyle"],
                      })
                    }
                  >
                    {["editorial", "classic", "compact", "overlay"].map((style) => (
                      <option key={style} value={style}>
                        {titleCase(style)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Header style">
                  <Select
                    value={draft.layout.headerStyle}
                    onChange={(e) =>
                      patch("layout", {
                        ...draft.layout,
                        headerStyle: e.target.value as ThemeLayout["headerStyle"],
                      })
                    }
                  >
                    {["solid", "transparent", "bordered"].map((style) => (
                      <option key={style} value={style}>
                        {titleCase(style)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Footer style">
                  <Select
                    value={draft.layout.footerStyle}
                    onChange={(e) =>
                      patch("layout", {
                        ...draft.layout,
                        footerStyle: e.target.value as ThemeLayout["footerStyle"],
                      })
                    }
                  >
                    {["editorial", "minimal", "columns"].map((style) => (
                      <option key={style} value={style}>
                        {titleCase(style)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="space-y-3 sm:col-span-2">
                  <Switch
                    checked={draft.layout.headerSticky}
                    onChange={(e) => patch("layout", { ...draft.layout, headerSticky: e.target.checked })}
                    label="Sticky header"
                    description="Keep the header visible as the shopper scrolls."
                  />
                  <Switch
                    checked={draft.layout.announcementBar}
                    onChange={(e) => patch("layout", { ...draft.layout, announcementBar: e.target.checked })}
                    label="Announcement bar"
                    description="Show the shipping and returns strip above the header."
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Live preview */}
      <aside className="space-y-4 xl:sticky xl:top-[76px] xl:self-start">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12.5px] font-semibold text-ink">{draft.name}</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">
                Updated {relativeTime(draft.updatedAt)}
              </p>
            </div>
            <Badge tone="outline" size="xs" className="capitalize">
              {draft.preset}
            </Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <Button fullWidth loading={saving} onClick={save} disabled={!dirty}>
              <Save className="h-4 w-4" />
              {dirty ? "Publish theme" : "Published"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Reset changes"
              onClick={() => {
                setDraft(theme);
                setDirty(false);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line">
          <div className="flex items-center gap-2 border-b border-line bg-muted px-4 py-2.5">
            <Eye className="h-3.5 w-3.5 text-ink-muted" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">Live preview</p>
          </div>

          {/* The preview is a real slice of the storefront rendered under the draft tokens. */}
          <div style={previewStyle} className="bg-surface">
            <div className="bg-obsidian px-4 py-2 text-[9.5px] text-inverse/70">
              Free shipping on orders above ₹999
            </div>
            <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3">
              <span
                className="text-[13px] text-ink"
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontWeight: "var(--font-display-weight)" as unknown as number,
                  letterSpacing: "var(--font-display-tracking)",
                  textTransform: "var(--font-display-transform)" as React.CSSProperties["textTransform"],
                }}
              >
                {storeName}
              </span>
              <span className="text-[10px] text-ink-muted">Account · Bag</span>
            </div>

            <div className="relative bg-obsidian px-5 py-8">
              <p className="text-[8.5px] uppercase tracking-[0.24em] text-accent">New season</p>
              <p
                className="mt-2 text-[24px] leading-[1.05] text-inverse"
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontWeight: "var(--font-display-weight)" as unknown as number,
                  letterSpacing: "var(--font-display-tracking)",
                  textTransform: "var(--font-display-transform)" as React.CSSProperties["textTransform"],
                }}
              >
                Anything for a brighter{" "}
                <span className="text-accent">tomorrow</span>
              </p>
              <div className="mt-5 flex gap-2">
                <span
                  className="bg-accent px-3.5 py-2 text-[9.5px] font-medium uppercase tracking-[0.1em] text-obsidian"
                  style={{ borderRadius: "var(--radius-button)" }}
                >
                  Shop now
                </span>
                <span
                  className="border border-white/40 px-3.5 py-2 text-[9.5px] font-medium uppercase tracking-[0.1em] text-inverse"
                  style={{ borderRadius: "var(--radius-button)" }}
                >
                  Explore
                </span>
              </div>
            </div>

            <div className="bg-ivory px-4 py-5">
              <p className="text-[8.5px] uppercase tracking-[0.2em] text-accent">Featured</p>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                {["#2b2b2b", "#8d7f6a", "#4a5a52"].map((tone, index) => (
                  <div key={tone}>
                    <div
                      className="aspect-[3/4] w-full"
                      style={{ backgroundColor: tone, borderRadius: "var(--radius-card)" }}
                    />
                    <p className="mt-1.5 truncate text-[9.5px] text-ink">Product {index + 1}</p>
                    <p className="text-[9.5px] font-semibold text-ink">₹2,499</p>
                    {index === 0 && <p className="text-[8.5px] text-sale">20% off</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary px-4 py-4">
              <p className="text-[9.5px] text-inverse/75">Free returns within 30 days</p>
            </div>
          </div>
        </div>

        <Card tone="muted">
          <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Token output</p>
          <pre className="mt-2.5 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-ink-muted">
            {Object.entries(themeToCssVars(draft))
              .map(([key, value]) => `${key}: ${value};`)
              .join("\n")}
          </pre>
        </Card>
      </aside>
    </div>
  );
}
