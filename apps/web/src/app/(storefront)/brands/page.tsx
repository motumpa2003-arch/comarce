import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Container, Rule, Section, SectionHeading } from "@obsidian/ui";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Brands",
  description: "Every brand on the platform, with where they are made and what they stand for.",
};

export default async function BrandsPage() {
  const db = await currentStore();
  const featured = db.brands.filter((b) => b.featured);

  const grouped = new Map<string, typeof db.brands>();
  for (const brand of db.brands) {
    const letter = brand.name.charAt(0).toUpperCase();
    grouped.set(letter, [...(grouped.get(letter) ?? []), brand]);
  }
  const letters = [...grouped.keys()].sort();

  return (
    <>
      <div className="border-b border-line bg-ivory">
        <Container className="py-12 sm:py-16">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Brands</p>
          <h1 className="mt-3 font-display display-case text-[34px] leading-none text-ink sm:text-[48px]">
            Trusted by millions
          </h1>
          <Rule className="mt-5" />
          <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            {db.brands.length} brands, each sourced directly or through an authorised distributor. Every product page
            names the maker and where it comes from.
          </p>
        </Container>
      </div>

      <Section tone="surface" spacing="default">
        <Container>
          <SectionHeading eyebrow="Featured" title="Houses we work with closely" size="sm" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="group overflow-hidden rounded-[var(--radius-card)] border border-line transition-colors hover:border-ink/25"
              >
                <div className="relative aspect-[16/9] bg-muted">
                  {brand.cover && (
                    <Image
                      src={brand.cover}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 25vw, 50vw"
                      className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-obsidian/55" />
                  <span className="absolute inset-0 grid place-items-center font-display display-case text-[19px] tracking-[0.16em] text-inverse">
                    {brand.name}
                  </span>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2x text-[12px] leading-snug text-ink-muted">{brand.description}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      {brand.origin}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-accent" />
                      {brand.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="muted" spacing="default">
        <Container>
          <SectionHeading eyebrow="All brands" title="A to Z" size="sm" />
          <div className="mt-8 space-y-8">
            {letters.map((letter) => (
              <div key={letter}>
                <h3 className="mb-3 font-display text-[22px] text-accent">{letter}</h3>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
                  {grouped.get(letter)!.map((brand) => (
                    <li key={brand.id}>
                      <Link
                        href={`/brand/${brand.slug}`}
                        className="flex items-baseline justify-between gap-3 border-b border-line py-2 text-[13px] text-ink transition-colors hover:text-primary"
                      >
                        {brand.name}
                        <span className="text-[11px] tabular-nums text-ink-muted">{brand.productCount}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
