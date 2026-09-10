"use client";

import * as React from "react";
import { ImagePlus, Sparkles } from "lucide-react";
import { TAX_CLASSES, generateVariantMatrix } from "@obsidian/commerce";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  Select,
  Switch,
  Textarea,
  cn,
  useToast,
} from "@obsidian/ui";
import { money, titleCase } from "@/lib/format";

interface CategoryOption {
  id: string;
  name: string;
  industry: string;
  parentName: string;
}

interface AttributeOption {
  key: string;
  label: string;
  inputType: string;
  industry: string;
  unit?: string;
  variantDefining: boolean;
  options: { value: string; label: string; swatch?: string }[];
}

export function NewProductForm({
  categories,
  brands,
  attributes,
}: {
  categories: CategoryOption[];
  brands: { id: string; name: string; industries: string[] }[];
  attributes: AttributeOption[];
}) {
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id ?? "");
  const [name, setName] = React.useState("");
  const [price, setPrice] = React.useState(0);
  const [compareAt, setCompareAt] = React.useState(0);
  const [taxClassId, setTaxClassId] = React.useState("gst-18");
  const [brandId, setBrandId] = React.useState("");
  const [selected, setSelected] = React.useState<Record<string, string[]>>({});
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();

  const category = categories.find((c) => c.id === categoryId);
  const industry = category?.industry;

  // The attribute set follows the category's industry — this is the whole point.
  const relevant = React.useMemo(
    () => attributes.filter((a) => a.industry === industry || a.industry === "all"),
    [attributes, industry],
  );
  const variantAxes = relevant.filter((a) => a.variantDefining && a.options.length > 0);
  const specAttributes = relevant.filter((a) => !a.variantDefining);

  const eligibleBrands = React.useMemo(
    () => (industry ? brands.filter((b) => b.industries.includes(industry)) : brands),
    [brands, industry],
  );

  // Reset axis choices whenever the industry changes — the old keys no longer apply.
  React.useEffect(() => {
    setSelected({});
    setBrandId("");
  }, [industry]);

  const optionSets = variantAxes
    .map((axis) => ({ key: axis.key, values: selected[axis.key] ?? [] }))
    .filter((set) => set.values.length > 0);

  const matrix = optionSets.length ? generateVariantMatrix(optionSets).slice(0, 24) : [];

  const toggleValue = (key: string, value: string) =>
    setSelected((current) => {
      const existing = current[key] ?? [];
      return {
        ...current,
        [key]: existing.includes(value) ? existing.filter((v) => v !== value) : [...existing, value],
      };
    });

  const create = () => {
    if (!name.trim() || price <= 0) {
      toast({ title: "Add a name and price", tone: "danger" });
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast({
        title: "Product created as draft",
        description: `${name} · ${matrix.length || 1} variant${matrix.length === 1 ? "" : "s"} generated.`,
        tone: "success",
      });
    }, 700);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Card>
          <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Basics</h2>
          <div className="grid gap-4">
            <Field label="Product name" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Essential Heavyweight Tee"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category" required hint={industry ? `Industry: ${titleCase(industry)}` : undefined}>
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {categories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.parentName} → {option.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Brand"
                hint={
                  eligibleBrands.length < brands.length
                    ? `${eligibleBrands.length} brands sell in this industry`
                    : undefined
                }
              >
                <Select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                  <option value="">No brand</option>
                  {eligibleBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Short description" hint="One line, shown on cards and in search.">
              <Input placeholder="What makes this worth buying?" />
            </Field>
            <Field label="Description">
              <Textarea rows={6} placeholder="Materials, fit, specification, care…" />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Price" required hint="Inclusive of tax">
              <Input
                type="number"
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                leading={<span className="text-[13px]">₹</span>}
              />
            </Field>
            <Field label="Compare at" hint="Struck-through price">
              <Input
                type="number"
                value={compareAt || ""}
                onChange={(e) => setCompareAt(Number(e.target.value) || 0)}
                leading={<span className="text-[13px]">₹</span>}
              />
            </Field>
            <Field label="Cost price" hint="For margin reporting">
              <Input type="number" leading={<span className="text-[13px]">₹</span>} />
            </Field>
            <Field label="Tax class">
              <Select value={taxClassId} onChange={(e) => setTaxClassId(e.target.value)}>
                {TAX_CLASSES.map((taxClass) => (
                  <option key={taxClass.id} value={taxClass.id}>
                    {taxClass.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          {compareAt > price && price > 0 && (
            <p className="mt-3 text-[12px] text-success">
              Shows as {Math.round(((compareAt - price) / compareAt) * 100)}% off ·{" "}
              {money((compareAt - price) * 100)} saving
            </p>
          )}
        </Card>

        <Card>
          <h2 className="text-[12.5px] font-semibold text-ink">Variant axes</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
            {variantAxes.length > 0
              ? `${titleCase(industry ?? "")} products can vary by ${variantAxes.map((a) => a.label.toLowerCase()).join(" and ")}. Pick the values you stock and the matrix generates below.`
              : "This category has no variant-defining attributes, so the product will have a single default variant."}
          </p>

          <div className="mt-4 space-y-5">
            {variantAxes.map((axis) => (
              <div key={axis.key}>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
                  {axis.label}
                  <span className="ml-2 font-mono normal-case tracking-normal">{axis.key}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {axis.options.map((option) => {
                    const active = (selected[axis.key] ?? []).includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleValue(axis.key, option.value)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-[var(--radius-button)] border px-3 py-1.5 text-[12px] transition-colors",
                          active ? "border-ink bg-ink text-inverse" : "border-line text-ink hover:border-ink/40",
                        )}
                      >
                        {option.swatch && (
                          <span
                            className="h-3 w-3 rounded-full border border-line"
                            style={{ backgroundColor: option.swatch }}
                          />
                        )}
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {matrix.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-[var(--radius-sm)] border border-line">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-muted px-4 py-2.5">
                <p className="text-[11.5px] font-medium text-ink">
                  {matrix.length} variant{matrix.length === 1 ? "" : "s"} will be created
                </p>
                <p className="text-[11px] text-ink-muted">SKUs are generated automatically</p>
              </div>
              <table className="w-full text-left text-[12px]">
                <thead className="border-b border-line">
                  <tr>
                    {optionSets.map((set) => (
                      <th key={set.key} className="px-4 py-2 text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                        {variantAxes.find((a) => a.key === set.key)?.label}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-right text-[10px] uppercase tracking-[0.08em] text-ink-muted">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {matrix.slice(0, 12).map((combo, index) => (
                    <tr key={index}>
                      {optionSets.map((set) => (
                        <td key={set.key} className="px-4 py-1.5 text-ink">
                          {variantAxes
                            .find((a) => a.key === set.key)
                            ?.options.find((o) => o.value === combo[set.key])?.label ?? combo[set.key]}
                        </td>
                      ))}
                      <td className="px-4 py-1.5 text-right tabular-nums text-ink-muted">
                        {price > 0 ? money(price * 100) : "—"}
                      </td>
                    </tr>
                  ))}
                  {matrix.length > 12 && (
                    <tr>
                      <td colSpan={optionSets.length + 1} className="px-4 py-2 text-[11px] text-ink-muted">
                        and {matrix.length - 12} more
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {specAttributes.length > 0 && (
          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Specification</h2>
            <p className="mt-1 text-[12px] text-ink-muted">
              These appear in the storefront specification table and, where filterable, as facets.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {specAttributes.map((attribute) => (
                <Field
                  key={attribute.key}
                  label={attribute.label}
                  hint={attribute.unit ? `Unit: ${attribute.unit}` : undefined}
                >
                  {attribute.options.length > 0 ? (
                    <Select defaultValue="">
                      <option value="">Not set</option>
                      {attribute.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  ) : attribute.inputType === "boolean" ? (
                    <Switch label="Yes" />
                  ) : (
                    <Input type={attribute.inputType === "number" ? "number" : "text"} />
                  )}
                </Field>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[12.5px] font-semibold text-ink">Media</h2>
            <Button variant="outline" size="xs">
              <ImagePlus className="h-3.5 w-3.5" />
              Add media
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <button
                key={index}
                type="button"
                className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px]">{index === 0 ? "Primary" : "Upload"}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-[76px] xl:self-start">
        <Card>
          <Field label="Status">
            <Select defaultValue="draft">
              <option value="draft">Draft — hidden from the storefront</option>
              <option value="active">Active — publish immediately</option>
            </Select>
          </Field>
          <Button fullWidth className="mt-4" loading={saving} onClick={create}>
            Create product
          </Button>
          <Button variant="ghost" fullWidth className="mt-2">
            Save and add another
          </Button>
        </Card>

        <Card>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-muted">Summary</h3>
          <dl className="mt-3 space-y-2 text-[12.5px]">
            <Row label="Category" value={category ? `${category.parentName} → ${category.name}` : "—"} />
            <Row label="Industry" value={industry ? titleCase(industry) : "—"} />
            <Row label="Attribute set" value={`${relevant.length} attributes`} />
            <Row label="Variant axes" value={variantAxes.map((a) => a.label).join(", ") || "None"} />
            <Row label="Variants" value={String(matrix.length || 1)} />
            <Row label="Price" value={price > 0 ? money(price * 100) : "—"} />
          </dl>
        </Card>

        <Card tone="muted">
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI assistant
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
            Give it a product name and it drafts the description, highlights, SEO copy, tags and attribute values.
          </p>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            className="mt-3"
            onClick={() =>
              toast({
                title: "AI product creation",
                description: "Available on Growth and above. Connect a provider in Settings → Integrations.",
              })
            }
          >
            Draft from name
          </Button>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="truncate text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
