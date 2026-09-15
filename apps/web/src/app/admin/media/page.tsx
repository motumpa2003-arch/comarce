import type { Metadata } from "next";
import { HardDrive, Image as ImageIcon, Upload } from "lucide-react";
import { Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MediaGrid, type MediaItem } from "@/components/admin/media-grid";
import { number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Media library" };

export default async function MediaLibraryPage() {
  const db = await currentStore();

  // The library is the union of every asset the catalogue and content already
  // reference, with usage counted — so "unused" here means genuinely orphaned,
  // not merely absent from a manifest somebody forgot to update.
  const usage = new Map<string, MediaItem>();

  const track = (url: string, alt: string, source: MediaItem["source"], owner: string) => {
    if (!url) return;
    const existing = usage.get(url);
    if (existing) {
      existing.uses += 1;
      if (!existing.owners.includes(owner) && existing.owners.length < 4) existing.owners.push(owner);
      return;
    }
    usage.set(url, { url, alt, source, uses: 1, owners: [owner] });
  };

  for (const product of db.products) {
    for (const media of product.media) track(media.url, media.alt, "product", product.name);
  }
  for (const category of db.categories) track(category.image, category.name, "category", category.name);
  for (const brand of db.brands) {
    track(brand.logo, brand.name, "brand", brand.name);
    if (brand.cover) track(brand.cover, brand.name, "brand", brand.name);
  }
  for (const collection of db.collections) track(collection.image, collection.name, "collection", collection.name);
  for (const post of db.blogPosts) track(post.cover, post.title, "content", post.title);
  for (const section of db.homePage.sections) {
    if (section.image) track(section.image, section.title ?? "Home section", "content", section.title ?? "Home");
    for (const image of section.images ?? []) {
      track(image, section.title ?? "Home section", "content", section.title ?? "Home");
    }
  }

  const items = [...usage.values()].sort((a, b) => b.uses - a.uses);
  const bySource = (source: MediaItem["source"]) => items.filter((i) => i.source === source).length;

  // Every asset is a CDN reference rather than an upload, so storage is what a
  // real library would hold if these were uploaded at typical retail sizes.
  const estimatedMb = Math.round(items.length * 0.42);

  return (
    <>
      <AdminPageHeader
        title="Media library"
        description="Every image the storefront references, with what uses it. Deleting an asset that is still in use breaks a product page, so usage is counted before the button is offered."
        breadcrumbs={[{ label: "Catalog" }, { label: "Media" }]}
        actions={
          <button type="button" className={buttonClasses("primary", "sm")}>
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Assets" value={number(items.length)} hint={`${number(bySource("product"))} on products`} />
        <Stat
          label="Total references"
          value={number(items.reduce((n, i) => n + i.uses, 0))}
          hint="One asset can appear many times"
        />
        <Stat label="Shared assets" value={number(items.filter((i) => i.uses > 1).length)} hint="Used more than once" />
        <Stat label="Storage" value={`${number(estimatedMb)} MB`} hint="Of 500 GB on this plan" />
      </div>

      <Card className="mt-5" padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5 text-ink-muted" />
            <h2 className="text-[12.5px] font-semibold text-ink">All media</h2>
          </div>
          <p className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
            <HardDrive className="h-3.5 w-3.5" />
            Served from the CDN with format negotiation
          </p>
        </div>
        <div className="p-4">
          <MediaGrid items={items} />
        </div>
      </Card>
    </>
  );
}
