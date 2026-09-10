import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Rule, Section, cn } from "@obsidian/ui";
import { currentStore } from "@/lib/tenant";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated edits across every category — seasonal, thematic and price-led.",
};

export default async function CollectionsPage() {
  const db = await currentStore();
  const featured = db.collections.filter((c) => c.featured);
  const rest = db.collections.filter((c) => !c.featured);

  return (
    <>
      <div className="border-b border-line bg-ivory">
        <Container className="py-12 sm:py-16">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Collections</p>
          <h1 className="mt-3 font-display display-case text-[34px] leading-none text-ink sm:text-[48px]">
            Curated edits
          </h1>
          <Rule className="mt-5" />
          <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            {db.collections.length} collections, built by our merchandising team and refreshed weekly. Some are hand
            picked, others follow rules the merchant sets in the admin.
          </p>
        </Container>
      </div>

      <Section tone="surface" spacing="default">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((collection, index) => (
              <Link
                key={collection.id}
                href={`/collection/${collection.slug}`}
                className={cn(
                  "group relative overflow-hidden rounded-[var(--radius-card)]",
                  index === 0 && "md:col-span-2",
                )}
              >
                <div className={cn("relative", index === 0 ? "aspect-[21/9]" : "aspect-[16/10]")}>
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    sizes={index === 0 ? "100vw" : "(min-width:768px) 50vw, 100vw"}
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/30 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-accent">
                    {collection.productIds.length} pieces
                  </p>
                  <h2 className="mt-2 font-display display-case text-[26px] leading-tight text-inverse sm:text-[34px]">
                    {collection.name}
                  </h2>
                  <p className="mt-2 max-w-md text-[13px] text-inverse/70">{collection.headline}</p>
                  <span className="mt-5 inline-flex items-center gap-2 border-b border-accent pb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
                    Shop the edit
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((collection) => (
              <Link
                key={collection.id}
                href={`/collection/${collection.slug}`}
                className="group flex gap-4 rounded-[var(--radius-card)] border border-line p-4 transition-colors hover:border-ink/25"
              >
                <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted">
                  <Image src={collection.image} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-ink transition-colors group-hover:text-primary">
                    {collection.name}
                  </p>
                  <p className="mt-1 line-clamp-2x text-[12px] leading-snug text-ink-muted">
                    {collection.description}
                  </p>
                  <p className="mt-2 text-[11px] text-ink-muted">
                    {collection.productIds.length} products
                    {collection.endsAt ? ` · until ${formatDate(collection.endsAt)}` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
