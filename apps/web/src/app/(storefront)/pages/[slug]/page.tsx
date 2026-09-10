import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@obsidian/data";
import { Breadcrumb, Container } from "@obsidian/ui";
import { PageSections } from "@/components/storefront/sections";
import { currentStore, currentStoreId } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(await currentStoreId(), slug);
  if (!page) return { title: "Page not found" };
  return { title: page.seo.title ?? page.title, description: page.seo.description };
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await currentStore();
  const page = getPageBySlug(db.store.id, slug);
  if (!page) notFound();

  return (
    <>
      <div className="border-b border-line bg-muted">
        <Container className="py-3.5">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: page.title }]} />
        </Container>
      </div>
      <PageSections page={page} db={db} />
    </>
  );
}
