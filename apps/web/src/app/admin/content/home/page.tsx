import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { HomeSectionBuilder } from "@/components/admin/home-section-builder";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Home page" };

export default async function AdminHomePage() {
  const db = await currentStore();

  return (
    <>
      <AdminPageHeader
        title="Home page"
        description="The storefront home page is a list of sections held in the database. Reorder or hide one here and the storefront renders the new arrangement on its next request — no deploy."
        breadcrumbs={[{ label: "Storefront" }, { label: "Home page" }]}
      />

      <HomeSectionBuilder
        sections={db.homePage.sections
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((section) => ({
            id: section.id,
            type: section.type,
            title: section.title ?? section.eyebrow ?? section.type,
            eyebrow: section.eyebrow,
            subtitle: section.subtitle,
            visible: section.visible,
            position: section.position,
            sourceKind: section.source?.kind,
            sourceValue: section.source?.value,
            limit: section.source?.limit,
          }))}
        updatedAt={db.homePage.updatedAt}
      />
    </>
  );
}
