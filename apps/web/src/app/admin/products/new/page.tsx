import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { NewProductForm } from "@/components/admin/new-product-form";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "New product" };

export default async function AdminNewProductPage() {
  const db = await currentStore();

  return (
    <>
      <AdminPageHeader
        title="New product"
        description="Pick a category and the attribute set follows — including which attributes generate the variant matrix. Nothing here is specific to one industry."
        breadcrumbs={[
          { label: "Catalog" },
          { label: "Products", href: "/admin/products" },
          { label: "New" },
        ]}
      />

      <NewProductForm
        categories={db.categories
          .filter((c) => c.level === 1)
          .map((c) => ({
            id: c.id,
            name: c.name,
            industry: c.industry,
            parentName: db.categories.find((p) => p.id === c.parentId)?.name ?? "",
          }))}
        brands={db.brands.map((b) => ({ id: b.id, name: b.name, industries: b.industries }))}
        attributes={db.attributes.map((a) => ({
          key: a.key,
          label: a.label,
          inputType: a.inputType,
          industry: a.industry,
          unit: a.unit,
          variantDefining: a.variantDefining,
          options: a.options?.map((o) => ({ value: o.value, label: o.label, swatch: o.swatch })) ?? [],
        }))}
      />
    </>
  );
}
