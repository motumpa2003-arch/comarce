"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Boxes,
  ExternalLink,
  ImagePlus,
  Layers,
  LineChart,
  Save,
  Search,
  Settings2,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { TAX_CLASSES } from "@obsidian/commerce";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  Rating,
  Select,
  Switch,
  Tabs,
  Textarea,
  cn,
  useToast,
} from "@obsidian/ui";
import { formatDate, money, number, relativeTime, titleCase } from "@/lib/format";

/* ------------------------------- Types ------------------------------ */

interface EditorVariant {
  id: string;
  sku: string;
  title: string;
  options: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock: number;
  reservedStock: number;
  barcode?: string;
  status: string;
}

interface EditorProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: string;
  productType: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  taxClassId: string;
  trackInventory: boolean;
  allowBackorder: boolean;
  shippingRequired: boolean;
  weight?: { value: number; unit: string };
  dimensions?: { length: number; width: number; height: number; unit: string };
  media: { url: string; alt: string }[];
  tags: string[];
  flags: Record<string, boolean>;
  seo: { title?: string; description?: string; keywords?: string[] };
  highlights: string[];
  categoryId: string;
  brandId?: string;
  collectionIds: string[];
  variantAttributeKeys: string[];
  attributes: Record<string, string | number | boolean | string[]>;
  variants: EditorVariant[];
  storefrontHref: string;
}

interface EditorOptions {
  categories: { id: string; name: string; level: number }[];
  brands: { id: string; name: string }[];
  collections: { id: string; name: string }[];
  attributes: {
    key: string;
    label: string;
    inputType: string;
    unit?: string;
    variantDefining: boolean;
    options: { value: string; label: string; swatch?: string }[];
  }[];
  warehouses: { id: string; name: string; code: string }[];
}

export function ProductEditor({
  product,
  options,
  inventory,
  analytics,
  reviews,
  movements,
}: {
  product: EditorProduct;
  options: EditorOptions;
  inventory: {
    id: string;
    variantId: string;
    warehouseId: string;
    onHand: number;
    reserved: number;
    incoming: number;
    reorderPoint: number;
    binLocation?: string;
  }[];
  analytics: {
    views: number;
    uniqueVisitors: number;
    addToCart: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
    returns: number;
    wishlistAdds: number;
  };
  reviews: { id: string; customerName: string; rating: number; title: string; body: string; status: string; createdAt: string }[];
  movements: { id: string; delta: number; reason: string; actorName: string; createdAt: string; referenceId?: string }[];
}) {
  const [tab, setTab] = React.useState("general");
  const [draft, setDraft] = React.useState(product);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const set = <K extends keyof EditorProduct>(key: K, value: EditorProduct[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          status: draft.status,
          price: draft.price,
          compareAtPrice: draft.compareAtPrice,
          shortDescription: draft.shortDescription,
          description: draft.description,
        }),
      });
      if (!response.ok) throw new Error((await response.json())?.error ?? "Could not save.");
      toast({ title: "Product saved", description: draft.name, tone: "success" });
      setDirty(false);
      router.refresh();
    } catch (caught) {
      toast({
        title: "Save failed",
        description: caught instanceof Error ? caught.message : "Try again.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalStock = draft.variants.reduce((n, v) => n + v.stock, 0);
  const margin = draft.costPrice ? Math.round(((draft.price - draft.costPrice) / draft.price) * 100) : null;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <Tabs
          items={[
            { value: "general", label: "General" },
            { value: "variants", label: "Variants", count: draft.variants.length },
            { value: "attributes", label: "Attributes" },
            { value: "inventory", label: "Inventory" },
            { value: "media", label: "Media", count: draft.media.length },
            { value: "seo", label: "SEO" },
            { value: "insights", label: "Insights" },
          ]}
          value={tab}
          onChange={setTab}
        />

        <div className="pt-6">
          {tab === "general" && (
            <div className="space-y-4">
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                  <Settings2 className="h-3.5 w-3.5" />
                  Basics
                </h2>
                <div className="grid gap-4">
                  <Field label="Product name" required>
                    <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
                  </Field>
                  <Field label="Short description" hint="Shown on cards and in search results.">
                    <Input
                      value={draft.shortDescription}
                      onChange={(e) => set("shortDescription", e.target.value)}
                    />
                  </Field>
                  <Field label="Description">
                    <Textarea
                      rows={8}
                      value={draft.description}
                      onChange={(e) => set("description", e.target.value)}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Category" required>
                      <Select value={draft.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                        {options.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.level === 1 ? "— " : ""}
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Brand">
                      <Select value={draft.brandId ?? ""} onChange={(e) => set("brandId", e.target.value)}>
                        <option value="">No brand</option>
                        {options.brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Product type">
                      <Select value={draft.productType} onChange={(e) => set("productType", e.target.value)}>
                        {["physical", "digital", "service", "subscription", "bundle"].map((type) => (
                          <option key={type} value={type}>
                            {titleCase(type)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Pricing</h2>
                <div className="grid gap-4 sm:grid-cols-4">
                  <Field label="Price" required hint="Inclusive of tax">
                    <Input
                      type="number"
                      value={draft.price / 100}
                      onChange={(e) => set("price", Math.round(Number(e.target.value) * 100))}
                      leading={<span className="text-[13px]">₹</span>}
                    />
                  </Field>
                  <Field label="Compare at" hint="Struck-through price">
                    <Input
                      type="number"
                      value={draft.compareAtPrice ? draft.compareAtPrice / 100 : ""}
                      onChange={(e) =>
                        set("compareAtPrice", e.target.value ? Math.round(Number(e.target.value) * 100) : undefined)
                      }
                      leading={<span className="text-[13px]">₹</span>}
                    />
                  </Field>
                  <Field label="Cost price" hint={margin != null ? `${margin}% margin` : "For margin reporting"}>
                    <Input
                      type="number"
                      value={draft.costPrice ? draft.costPrice / 100 : ""}
                      onChange={(e) =>
                        set("costPrice", e.target.value ? Math.round(Number(e.target.value) * 100) : undefined)
                      }
                      leading={<span className="text-[13px]">₹</span>}
                    />
                  </Field>
                  <Field label="Tax class">
                    <Select value={draft.taxClassId} onChange={(e) => set("taxClassId", e.target.value)}>
                      {TAX_CLASSES.map((taxClass) => (
                        <option key={taxClass.id} value={taxClass.id}>
                          {taxClass.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </Card>

              <Card>
                <h2 className="mb-4 text-[12.5px] font-semibold text-ink">Merchandising</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    {Object.entries(draft.flags).map(([key, value]) => (
                      <Switch
                        key={key}
                        checked={value}
                        onChange={(e) => set("flags", { ...draft.flags, [key]: e.target.checked })}
                        label={titleCase(key.replace(/^is/, ""))}
                      />
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.11em] text-ink-muted">
                      Collections
                    </p>
                    <div className="max-h-[180px] space-y-2 overflow-y-auto pr-1">
                      {options.collections.map((collection) => (
                        <Checkbox
                          key={collection.id}
                          checked={draft.collectionIds.includes(collection.id)}
                          onChange={(e) =>
                            set(
                              "collectionIds",
                              e.target.checked
                                ? [...draft.collectionIds, collection.id]
                                : draft.collectionIds.filter((id) => id !== collection.id),
                            )
                          }
                          label={collection.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {tab === "variants" && (
            <Card padded={false}>
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                  <Layers className="h-3.5 w-3.5" />
                  Variant matrix
                  <span className="font-normal text-ink-muted">
                    generated from {draft.variantAttributeKeys.map((k) => titleCase(k)).join(" × ") || "no axes"}
                  </span>
                </h2>
                <Button variant="outline" size="xs">
                  Regenerate
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead className="border-b border-line bg-muted/60">
                    <tr>
                      {["Variant", "SKU", "Price", "Compare at", "Cost", "Stock", "Reserved", "Status"].map((header) => (
                        <th
                          key={header}
                          className="whitespace-nowrap px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {draft.variants.map((variant) => (
                      <tr key={variant.id} className="hover:bg-muted/50">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {variant.options.color && (
                              <span
                                className="h-3.5 w-3.5 shrink-0 rounded-full border border-line"
                                style={{
                                  backgroundColor:
                                    options.attributes
                                      .find((a) => a.key === "color")
                                      ?.options.find((o) => o.value === variant.options.color)?.swatch ?? "#ddd",
                                }}
                              />
                            )}
                            <span className="text-ink">{variant.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-ink-muted">{variant.sku}</td>
                        <td className="px-4 py-2.5 tabular-nums text-ink">{money(variant.price)}</td>
                        <td className="px-4 py-2.5 tabular-nums text-ink-muted">
                          {variant.compareAtPrice ? money(variant.compareAtPrice) : "—"}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-ink-muted">
                          {variant.costPrice ? money(variant.costPrice) : "—"}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2.5 tabular-nums",
                            variant.stock === 0 ? "font-medium text-danger" : "text-ink",
                          )}
                        >
                          {variant.stock}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums text-ink-muted">{variant.reservedStock}</td>
                        <td className="px-4 py-2.5">
                          <Badge tone={variant.status === "active" ? "success" : "neutral"} size="xs">
                            {variant.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === "attributes" && (
            <Card>
              <h2 className="mb-1 text-[12.5px] font-semibold text-ink">Attributes</h2>
              <p className="mb-5 text-[12px] leading-relaxed text-ink-muted">
                These fields come from the store&rsquo;s attribute library, not from the product model. Add an
                attribute in Catalog → Attributes and it becomes available here, on the storefront filters and in
                the specification table.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {options.attributes
                  .filter((attribute) => attribute.key in draft.attributes || attribute.variantDefining)
                  .map((attribute) => {
                    const value = draft.attributes[attribute.key];
                    const isVariantAxis = draft.variantAttributeKeys.includes(attribute.key);
                    return (
                      <Field
                        key={attribute.key}
                        label={
                          <span className="flex items-center gap-2">
                            {attribute.label}
                            {isVariantAxis && (
                              <Badge tone="info" size="xs">
                                variant axis
                              </Badge>
                            )}
                          </span>
                        }
                        hint={attribute.unit ? `Unit: ${attribute.unit}` : undefined}
                      >
                        {isVariantAxis ? (
                          <Input
                            disabled
                            value={[...new Set(draft.variants.map((v) => v.options[attribute.key]).filter(Boolean))]
                              .map((v) => titleCase(String(v)))
                              .join(", ")}
                          />
                        ) : attribute.options.length ? (
                          <Select
                            value={String(value ?? "")}
                            onChange={(e) =>
                              set("attributes", { ...draft.attributes, [attribute.key]: e.target.value })
                            }
                          >
                            <option value="">Not set</option>
                            {attribute.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        ) : typeof value === "boolean" ? (
                          <Switch
                            checked={value}
                            onChange={(e) =>
                              set("attributes", { ...draft.attributes, [attribute.key]: e.target.checked })
                            }
                            label={value ? "Yes" : "No"}
                          />
                        ) : (
                          <Input
                            value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
                            onChange={(e) =>
                              set("attributes", { ...draft.attributes, [attribute.key]: e.target.value })
                            }
                          />
                        )}
                      </Field>
                    );
                  })}
              </div>
            </Card>
          )}

          {tab === "inventory" && (
            <div className="space-y-4">
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                  <Boxes className="h-3.5 w-3.5" />
                  Inventory settings
                </h2>
                <div className="space-y-4">
                  <Switch
                    checked={draft.trackInventory}
                    onChange={(e) => set("trackInventory", e.target.checked)}
                    label="Track inventory"
                    description="Decrement stock when an order is placed and block oversell."
                  />
                  <Switch
                    checked={draft.allowBackorder}
                    onChange={(e) => set("allowBackorder", e.target.checked)}
                    label="Allow backorders"
                    description="Let customers order when stock hits zero."
                  />
                  <Switch
                    checked={draft.shippingRequired}
                    onChange={(e) => set("shippingRequired", e.target.checked)}
                    label="Requires shipping"
                    description="Turn off for digital or service products."
                  />
                </div>
              </Card>

              <Card padded={false}>
                <div className="border-b border-line px-5 py-3.5">
                  <h2 className="text-[12.5px] font-semibold text-ink">Stock by location</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="border-b border-line bg-muted/60">
                      <tr>
                        {["Variant", "Location", "Bin", "On hand", "Reserved", "Available", "Incoming", "Reorder at"].map(
                          (header) => (
                            <th
                              key={header}
                              className="whitespace-nowrap px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                            >
                              {header}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {inventory.map((record) => {
                        const variant = draft.variants.find((v) => v.id === record.variantId);
                        const warehouse = options.warehouses.find((w) => w.id === record.warehouseId);
                        const available = record.onHand - record.reserved;
                        return (
                          <tr key={record.id} className="hover:bg-muted/50">
                            <td className="px-4 py-2.5 text-ink">{variant?.title ?? "—"}</td>
                            <td className="px-4 py-2.5 text-ink-muted">{warehouse?.name ?? record.warehouseId}</td>
                            <td className="px-4 py-2.5 text-ink-muted">{record.binLocation ?? "—"}</td>
                            <td className="px-4 py-2.5 tabular-nums text-ink">{record.onHand}</td>
                            <td className="px-4 py-2.5 tabular-nums text-ink-muted">{record.reserved}</td>
                            <td
                              className={cn(
                                "px-4 py-2.5 tabular-nums font-medium",
                                available <= 0
                                  ? "text-danger"
                                  : available <= record.reorderPoint
                                    ? "text-warning"
                                    : "text-ink",
                              )}
                            >
                              {available}
                            </td>
                            <td className="px-4 py-2.5 tabular-nums text-ink-muted">{record.incoming || "—"}</td>
                            <td className="px-4 py-2.5 tabular-nums text-ink-muted">{record.reorderPoint}</td>
                          </tr>
                        );
                      })}
                      {inventory.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center text-ink-muted">
                            No inventory records for this product.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card padded={false}>
                <div className="border-b border-line px-5 py-3.5">
                  <h2 className="text-[12.5px] font-semibold text-ink">Recent movements</h2>
                </div>
                <ul className="divide-y divide-line">
                  {movements.map((movement) => (
                    <li key={movement.id} className="flex items-center gap-4 px-5 py-2.5 text-[12px]">
                      <span
                        className={cn(
                          "w-12 shrink-0 font-medium tabular-nums",
                          movement.delta >= 0 ? "text-success" : "text-danger",
                        )}
                      >
                        {movement.delta >= 0 ? "+" : ""}
                        {movement.delta}
                      </span>
                      <span className="flex-1 text-ink">{titleCase(movement.reason)}</span>
                      <span className="text-ink-muted">{movement.referenceId ?? movement.actorName}</span>
                      <span className="w-24 shrink-0 text-right text-ink-muted">
                        {relativeTime(movement.createdAt)}
                      </span>
                    </li>
                  ))}
                  {movements.length === 0 && (
                    <li className="px-5 py-8 text-center text-[12px] text-ink-muted">No movements recorded.</li>
                  )}
                </ul>
              </Card>
            </div>
          )}

          {tab === "media" && (
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[12.5px] font-semibold text-ink">Media</h2>
                <Button variant="outline" size="xs">
                  <ImagePlus className="h-3.5 w-3.5" />
                  Add media
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {draft.media.map((media, index) => (
                  <div key={media.url} className="group relative">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-sm)] border border-line bg-muted">
                      <Image src={media.url} alt={media.alt} fill sizes="200px" className="object-cover" />
                    </div>
                    {index === 0 && (
                      <Badge tone="obsidian" size="xs" className="absolute left-2 top-2">
                        Primary
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "media",
                          draft.media.filter((m) => m.url !== media.url),
                        )
                      }
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-surface/90 text-ink-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-dashed border-line text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[11.5px]">Upload</span>
                </button>
              </div>
            </Card>
          )}

          {tab === "seo" && (
            <Card>
              <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Search className="h-3.5 w-3.5" />
                Search engine listing
              </h2>
              <div className="mb-6 rounded-[var(--radius-sm)] border border-line bg-muted p-4">
                <p className="text-[13px] text-[#1a0dab]">{draft.seo.title ?? draft.name}</p>
                <p className="mt-0.5 text-[11.5px] text-[#006621]">
                  obsidian.commerce.dev/product/{draft.slug}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-ink-muted">
                  {draft.seo.description ?? draft.shortDescription}
                </p>
              </div>
              <div className="grid gap-4">
                <Field label="Meta title" hint={`${(draft.seo.title ?? draft.name).length}/60 characters`}>
                  <Input
                    value={draft.seo.title ?? ""}
                    onChange={(e) => set("seo", { ...draft.seo, title: e.target.value })}
                    placeholder={draft.name}
                  />
                </Field>
                <Field
                  label="Meta description"
                  hint={`${(draft.seo.description ?? "").length}/160 characters`}
                >
                  <Textarea
                    rows={3}
                    value={draft.seo.description ?? ""}
                    onChange={(e) => set("seo", { ...draft.seo, description: e.target.value })}
                    placeholder={draft.shortDescription}
                  />
                </Field>
                <Field label="URL handle">
                  <Input value={draft.slug} onChange={(e) => set("slug", e.target.value)} />
                </Field>
                <Field label="Tags" hint="Comma separated. Used for search and smart collections.">
                  <Input
                    value={draft.tags.join(", ")}
                    onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()))}
                  />
                </Field>
              </div>
            </Card>
          )}

          {tab === "insights" && (
            <div className="space-y-4">
              <Card>
                <h2 className="mb-4 flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                  <LineChart className="h-3.5 w-3.5" />
                  Performance
                </h2>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Views", value: number(analytics.views) },
                    { label: "Unique visitors", value: number(analytics.uniqueVisitors) },
                    { label: "Added to cart", value: number(analytics.addToCart) },
                    { label: "Units purchased", value: number(analytics.purchases) },
                    { label: "Conversion", value: `${analytics.conversionRate}%` },
                    { label: "Revenue", value: money(analytics.revenue) },
                    { label: "Returns", value: number(analytics.returns) },
                    { label: "Wishlist adds", value: number(analytics.wishlistAdds) },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <dt className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-muted">
                        {metric.label}
                      </dt>
                      <dd className="mt-1 text-[19px] font-semibold tabular-nums text-ink">{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              </Card>

              <Card padded={false}>
                <div className="border-b border-line px-5 py-3.5">
                  <h2 className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                    <Star className="h-3.5 w-3.5" />
                    Latest reviews
                  </h2>
                </div>
                <ul className="divide-y divide-line">
                  {reviews.map((review) => (
                    <li key={review.id} className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Rating value={review.rating} size={11} showValue={false} />
                        <span className="text-[12px] font-medium text-ink">{review.customerName}</span>
                        <Badge
                          tone={review.status === "approved" ? "success" : "warning"}
                          size="xs"
                        >
                          {review.status}
                        </Badge>
                        <span className="ml-auto text-[11px] text-ink-muted">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="mt-1.5 text-[12.5px] font-medium text-ink">{review.title}</p>
                      <p className="mt-0.5 line-clamp-2x text-[12px] text-ink-muted">{review.body}</p>
                    </li>
                  ))}
                  {reviews.length === 0 && (
                    <li className="px-5 py-8 text-center text-[12px] text-ink-muted">No reviews yet.</li>
                  )}
                </ul>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside className="space-y-4 xl:sticky xl:top-[76px] xl:self-start">
        <Card>
          <Field label="Status">
            <Select value={draft.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">Active — visible on the storefront</option>
              <option value="draft">Draft — hidden</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <div className="mt-4 flex gap-2">
            <Button fullWidth loading={saving} onClick={save} disabled={!dirty}>
              <Save className="h-4 w-4" />
              {dirty ? "Save changes" : "Saved"}
            </Button>
          </div>
          <Link
            href={draft.storefrontHref}
            target="_blank"
            className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-ink-muted transition-colors hover:text-ink"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View on storefront
          </Link>
        </Card>

        <Card>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-muted">At a glance</h3>
          <dl className="mt-3 space-y-2.5 text-[12.5px]">
            <Row label="SKU" value={draft.sku} />
            <Row label="Variants" value={String(draft.variants.length)} />
            <Row label="Total stock" value={number(totalStock)} />
            <Row label="Price" value={money(draft.price)} />
            {margin != null && <Row label="Margin" value={`${margin}%`} />}
            <Row label="Units sold" value={number(analytics.purchases)} />
            <Row label="Revenue" value={money(analytics.revenue)} />
          </dl>
        </Card>

        <Card tone="muted">
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            AI assistant
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-muted">
            Generate a description, SEO copy and tags from the product name and attributes.
          </p>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            className="mt-3"
            onClick={() =>
              toast({
                title: "AI copywriter",
                description: "Available on Growth and above. Connect a provider in Settings → Integrations.",
              })
            }
          >
            Generate copy
          </Button>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="truncate font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}
