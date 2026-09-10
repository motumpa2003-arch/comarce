import type { Metadata } from "next";
import { PageSections } from "@/components/storefront/sections";
import { currentStore } from "@/lib/tenant";

export async function generateMetadata(): Promise<Metadata> {
  const db = await currentStore();
  return {
    title: db.homePage.seo.title,
    description: db.homePage.seo.description,
  };
}

export default async function HomePage() {
  const db = await currentStore();
  return <PageSections page={db.homePage} db={db} />;
}
