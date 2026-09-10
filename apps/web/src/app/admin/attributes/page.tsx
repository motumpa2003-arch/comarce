import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { INDUSTRY_ATTRIBUTES } from "@obsidian/commerce";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { number, titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Attributes" };

export default async function AdminAttributesPage() {
  const db = await currentStore();

  const byIndustry = new Map<string, typeof db.attributes>();
  for (const attribute of db.attributes) {
    const key = attribute.industry;
    byIndustry.set(key, [...(byIndustry.get(key) ?? []), attribute]);
  }

  const variantDefining = db.attributes.filter((a) => a.variantDefining);
  const filterable = db.attributes.filter((a) => a.filterable);

  return (
    <>
      <AdminPageHeader
        title="Attributes"
        description="The reason this platform is category-agnostic. Nothing in the product model knows about size or RAM — you define attributes here, and the catalogue, variant matrix, storefront facets and specification tables all follow."
        breadcrumbs={[{ label: "Catalog" }, { label: "Attributes" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Plus className="h-3.5 w-3.5" />
            New attribute
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Attributes defined" value={number(db.attributes.length)} />
        <Stat
          label="Variant-defining"
          value={number(variantDefining.length)}
          hint="Generate the variant matrix"
        />
        <Stat label="Filterable" value={number(filterable.length)} hint="Appear as storefront facets" />
        <Stat
          label="Industry presets"
          value={number(Object.keys(INDUSTRY_ATTRIBUTES).length)}
          hint="Available to import"
        />
      </div>

      <div className="space-y-4">
        {[...byIndustry.entries()].map(([industry, attributes]) => (
          <Card key={industry} padded={false}>
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <h2 className="flex items-center gap-2 text-[12.5px] font-semibold capitalize text-ink">
                {industry}
                <span className="font-normal text-ink-muted">{attributes.length} attributes</span>
              </h2>
              <button type="button" className={buttonClasses("ghost", "xs")}>
                Add to this set
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px]">
                <thead className="border-b border-line bg-muted/50">
                  <tr>
                    {["Attribute", "Key", "Type", "Options", "Variant axis", "Facet", "In specs"].map((header) => (
                      <th
                        key={header}
                        className="whitespace-nowrap px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {attributes.map((attribute) => (
                    <tr key={attribute.id} className="hover:bg-muted/50">
                      <td className="px-5 py-2.5">
                        <span className="font-medium text-ink">{attribute.label}</span>
                        {attribute.unit && (
                          <span className="ml-1.5 text-[11px] text-ink-muted">({attribute.unit})</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-ink-muted">
                          {attribute.key}
                        </code>
                      </td>
                      <td className="px-5 py-2.5 text-ink-muted">{titleCase(attribute.inputType)}</td>
                      <td className="px-5 py-2.5">
                        {attribute.options?.length ? (
                          <div className="flex flex-wrap items-center gap-1">
                            {attribute.options.slice(0, 6).map((option) => (
                              <span
                                key={option.value}
                                className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[10.5px] text-ink-muted"
                              >
                                {option.swatch && (
                                  <span
                                    className="h-2.5 w-2.5 rounded-full border border-line"
                                    style={{ backgroundColor: option.swatch }}
                                  />
                                )}
                                {option.label}
                              </span>
                            ))}
                            {attribute.options.length > 6 && (
                              <span className="text-[10.5px] text-ink-muted">
                                +{attribute.options.length - 6}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-ink-muted">Free text</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        {attribute.variantDefining ? (
                          <Badge tone="info" size="xs">
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        {attribute.filterable ? (
                          <Badge tone="success" size="xs">
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        {attribute.displayInSpecs ? (
                          <span className="text-ink">Yes</span>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
