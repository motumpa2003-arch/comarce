import type { Metadata } from "next";
import { THEME_PRESETS } from "@obsidian/commerce";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ThemeEditor } from "@/components/admin/theme-editor";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Theme" };

export default async function AdminThemePage() {
  const db = await currentStore();

  return (
    <>
      <AdminPageHeader
        title="Theme"
        description="The storefront reads colour, type, shape and layout from these tokens as CSS custom properties. Changing a value restyles every page — no component changes, no redeploy."
        breadcrumbs={[{ label: "Storefront" }, { label: "Theme" }]}
      />

      <ThemeEditor
        storeName={db.store.name}
        theme={{
          id: db.theme.id,
          name: db.theme.name,
          preset: db.theme.preset,
          description: db.theme.description,
          colors: db.theme.colors,
          typography: db.theme.typography,
          shape: db.theme.shape,
          layout: db.theme.layout,
          updatedAt: db.theme.updatedAt,
        }}
        presets={THEME_PRESETS.map((preset) => ({
          id: preset.id,
          name: preset.name,
          description: preset.description,
          industries: preset.industries,
          colors: preset.colors,
          typography: preset.typography,
          shape: preset.shape,
          layout: preset.layout,
        }))}
      />
    </>
  );
}
