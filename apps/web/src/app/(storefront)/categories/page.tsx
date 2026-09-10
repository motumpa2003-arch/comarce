import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoryTree } from "@obsidian/data";
import { Container, Rule, Section, SectionHeading } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { EDITORIAL, img } from "@obsidian/data";
import { number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "All categories",
  description: "Every aisle in one place — fashion, electronics, home, beauty, sports, grocery and more.",
};

const LIFESTYLES = [
  { title: "Everyday essentials", copy: "Simplify your day", href: "/collection/everyday-essentials", image: EDITORIAL.heroShopping },
  { title: "Work & productivity", copy: "Gear for what's next", href: "/collection/work-productivity", image: EDITORIAL.deskTech },
  { title: "Weekend & adventure", copy: "Explore more", href: "/collection/weekend-adventure", image: EDITORIAL.outdoorHiker },
  { title: "Home upgrade", copy: "Spaces that inspire", href: "/collection/home-upgrade", image: EDITORIAL.interiorRoom },
  { title: "Wellness & beauty", copy: "Look good. Feel better.", href: "/collection/wellness-beauty", image: EDITORIAL.heroWoman },
  { title: "Tech lifestyle", copy: "Smarter living", href: "/collection/tech-lifestyle", image: EDITORIAL.deskTech },
];

export default async function CategoriesPage() {
  const db = await currentStore();
  const tree = getCategoryTree(db.store.id);
  const totalProducts = db.products.filter((p) => p.status === "active").length;

  const trending = [...db.categories]
    .filter((c) => c.level === 1)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 8);

  return (
    <>
      {/* Hero */}
      <div className="relative isolate overflow-hidden bg-obsidian text-inverse">
        <Image
          src={img(EDITORIAL.heroFashion, 1900, 900)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/20" />
        <Container className="relative py-16 sm:py-20">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Categories</p>
          <h1 className="mt-4 max-w-2xl font-display display-case text-[clamp(34px,5.5vw,58px)] leading-[1.02] text-inverse">
            Shop everything. <span className="text-accent">Live better.</span>
          </h1>
          <Rule className="mt-6" />
          <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-inverse/70">
            From fashion and electronics to home, beauty, sports and everyday essentials — every aisle runs on the
            same commerce engine.
          </p>
          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-5">
            {[
              { value: `${db.categories.length}+`, label: "Categories" },
              { value: `${number(totalProducts)}+`, label: "Products" },
              { value: `${db.brands.length}`, label: "Brands" },
              { value: "1M+", label: "Happy customers" },
            ].map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-[24px] leading-none text-accent">{stat.value}</dd>
                <dt className="mt-1.5 text-[10.5px] uppercase tracking-[0.16em] text-inverse/55">{stat.label}</dt>
              </div>
            ))}
          </dl>
          <ButtonLink href="/shop" variant="accent" size="lg" className="mt-10">
            Explore new arrivals
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Container>
      </div>

      {/* Category cards */}
      <Section tone="surface" spacing="default">
        <Container>
          <SectionHeading eyebrow="Shop by category" title="Every aisle, one engine" />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tree.map((parent) => (
              <Link
                key={parent.id}
                href={`/category/${parent.slug}`}
                className="group overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-colors hover:border-ink/25"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <Image
                    src={parent.image}
                    alt={parent.name}
                    fill
                    sizes="(min-width:1024px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                    <div>
                      <p className="font-display display-case text-[19px] leading-tight text-inverse">
                        {parent.name}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-inverse/70">{parent.productCount} products</p>
                    </div>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/40 text-inverse transition-colors group-hover:border-accent group-hover:text-accent">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 p-4">
                  {parent.children.slice(0, 6).map((child) => (
                    <li key={child.id} className="truncate text-[12px] text-ink-muted">
                      {child.name}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Lifestyles */}
      <Section tone="obsidian" spacing="default">
        <Container>
          <SectionHeading eyebrow="Explore by lifestyle" title="Shop the way you live" inverse />
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LIFESTYLES.map((lifestyle) => (
              <Link
                key={lifestyle.title}
                href={lifestyle.href}
                className="group relative aspect-[16/10] overflow-hidden rounded-[var(--radius-card)]"
              >
                <Image
                  src={img(lifestyle.image, 800, 500)}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <div>
                    <p className="font-display text-[19px] leading-tight text-inverse">{lifestyle.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-inverse/65">{lifestyle.copy}</p>
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-accent/60 text-accent">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Trending sub-categories */}
      <Section tone="surface" spacing="default">
        <Container>
          <SectionHeading eyebrow="Trending categories" title="What everyone is shopping" size="sm" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {trending.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="group text-center">
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-muted">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <p className="mt-2.5 text-[12px] font-medium leading-snug text-ink transition-colors group-hover:text-primary">
                  {category.name}
                </p>
                <p className="mt-0.5 text-[10.5px] text-ink-muted">{category.productCount} products</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
