import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Headphones,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { PageSection, StorePage } from "@obsidian/commerce";
import {
  getCollectionProducts,
  getProductsByFlag,
  getRecommendations,
  getTopReviews,
  type StoreDatabase,
} from "@obsidian/data";
import { Badge, Container, Rating, Section, SectionHeading, cn } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductGrid } from "@/components/commerce/product-card";
import { ProductRail } from "@/components/commerce/product-rail";
import { toCardList } from "@/lib/product-view";
import { money, relativeTime } from "@/lib/format";
import { NewsletterForm } from "../newsletter-form";
import { CountdownTimer } from "./countdown";
import { Hero } from "./hero";
import { ProductTabs } from "./product-tabs";

export function PageSections({ page, db }: { page: StorePage; db: StoreDatabase }) {
  return (
    <>
      {page.sections
        .filter((section) => section.visible)
        .sort((a, b) => a.position - b.position)
        .map((section) => (
          <SectionSwitch key={section.id} section={section} db={db} />
        ))}
    </>
  );
}

function SectionSwitch({ section, db }: { section: PageSection; db: StoreDatabase }) {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} db={db} />;
    case "category_grid":
      return <CategoryGridSection section={section} db={db} />;
    case "trust_bar":
      return <TrustBar />;
    case "editorial_split":
      return <EditorialSplit section={section} />;
    case "product_grid":
      return <ProductGridSection section={section} db={db} />;
    case "lookbook":
      return <LookbookSection section={section} />;
    case "carousel":
      return <CarouselSection section={section} db={db} />;
    case "logo_cloud":
      return <LogoCloud section={section} db={db} />;
    case "countdown":
      return <CountdownSection section={section} />;
    case "testimonial":
      return <TestimonialSection section={section} db={db} />;
    case "newsletter":
      return <NewsletterSection section={section} />;
    case "rich_text":
      return <RichTextSection section={section} />;
    default:
      return null;
  }
}

/* -------------------------------- Hero ------------------------------ */

function HeroSection({ section, db }: { section: PageSection; db: StoreDatabase }) {
  return (
    <Hero
      eyebrow={section.eyebrow}
      title={section.title ?? db.store.tagline}
      subtitle={section.subtitle}
      images={section.images?.length ? section.images : section.image ? [section.image] : []}
      ctaLabel={section.ctaLabel}
      ctaHref={section.ctaHref}
      secondaryCtaLabel={section.secondaryCtaLabel}
      secondaryCtaHref={section.secondaryCtaHref}
      overlayWord={String(section.settings?.overlayWord ?? "")}
      autoplayMs={Number(section.settings?.autoplayMs ?? 6500)}
      stats={[
        { value: `${db.brands.length}+`, label: "Top brands" },
        { value: "1M+", label: "Happy customers" },
        { value: `${db.products.length}+`, label: "Products" },
        { value: "4.8★", label: "Average rating" },
      ]}
    />
  );
}

/* ---------------------------- Category grid ------------------------- */

function CategoryGridSection({ section, db }: { section: PageSection; db: StoreDatabase }) {
  const categories = db.categories.filter((c) => c.level === 0).slice(0, section.source?.limit ?? 10);

  return (
    <Section tone="ivory" spacing="default">
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title ?? "Shop by category"}
          action={
            section.ctaHref && (
              <Link
                href={section.ctaHref}
                className="group inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink"
              >
                {section.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )
          }
        />
        <div className="mt-9 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 xl:gap-x-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group text-center">
              <div className="relative mx-auto aspect-square w-full max-w-[104px] overflow-hidden rounded-full border border-line bg-surface">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="104px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <p className="mt-3 text-[11.5px] font-medium leading-snug text-ink transition-colors group-hover:text-primary">
                {category.name}
              </p>
              <p className="mt-0.5 text-[10.5px] text-ink-muted">{category.productCount} items</p>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------ Trust bar --------------------------- */

const TRUST_ITEMS = [
  { icon: Truck, title: "Free shipping", copy: "Above ₹999" },
  { icon: RotateCcw, title: "Easy returns", copy: "Within 30 days" },
  { icon: ShieldCheck, title: "Secure payments", copy: "100% safe & encrypted" },
  { icon: BadgeCheck, title: "100% authentic", copy: "Original products" },
  { icon: Headphones, title: "24/7 support", copy: "We're here for you" },
];

export function TrustBar({ tone = "obsidian" }: { tone?: "obsidian" | "muted" }) {
  return (
    <div className={cn(tone === "obsidian" ? "bg-obsidian text-inverse" : "border-y border-line bg-muted text-ink")}>
      <Container className="grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-3 lg:grid-cols-5">
        {TRUST_ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full border",
                tone === "obsidian" ? "border-accent/35 text-accent" : "border-line text-primary",
              )}
            >
              <item.icon className="h-[17px] w-[17px]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium">{item.title}</p>
              <p className={cn("truncate text-[11px]", tone === "obsidian" ? "text-inverse/55" : "text-ink-muted")}>
                {item.copy}
              </p>
            </div>
          </div>
        ))}
      </Container>
    </div>
  );
}

/* --------------------------- Editorial split ------------------------ */

function EditorialSplit({ section }: { section: PageSection }) {
  const [main, ...rest] = section.images ?? [];

  return (
    <Section tone="surface" spacing="default">
      <Container>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:gap-5">
          <Link
            href={section.ctaHref ?? "#"}
            className="group relative flex min-h-[420px] overflow-hidden rounded-[var(--radius-card)] bg-obsidian"
          >
            {main && (
              <Image
                src={main}
                alt={section.title ?? ""}
                fill
                sizes="(min-width:1024px) 55vw, 100vw"
                className="object-cover object-top transition-transform duration-[1200ms] group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian/85 via-obsidian/35 to-transparent" />
            <div className="relative flex flex-col justify-end p-8 sm:p-10">
              {section.eyebrow && (
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-accent">{section.eyebrow}</p>
              )}
              <h3 className="mt-3 max-w-sm font-display text-[34px] leading-[1.05] text-inverse sm:text-[42px]">
                {section.title}
              </h3>
              {section.body && (
                <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-inverse/70">{section.body}</p>
              )}
              <span className="mt-7 inline-flex w-fit items-center gap-2 border-b border-accent pb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
                {section.ctaLabel ?? "Explore"}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
            {rest.slice(0, 2).map((image, index) => (
              <Link
                key={image}
                href={index === 0 ? "/category/home-living" : "/category/electronics-gadgets"}
                className="group relative min-h-[200px] overflow-hidden rounded-[var(--radius-card)]"
              >
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 40vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                <div
                  className={cn(
                    "absolute inset-0",
                    index === 0
                      ? "bg-gradient-to-r from-ivory/92 via-ivory/60 to-transparent"
                      : "bg-gradient-to-r from-primary/92 via-primary/60 to-transparent",
                  )}
                />
                <div className="relative flex h-full flex-col justify-center p-7">
                  <p
                    className={cn(
                      "text-[9.5px] font-medium uppercase tracking-[0.22em]",
                      index === 0 ? "text-ink-muted" : "text-accent",
                    )}
                  >
                    {index === 0 ? "Upgrade" : "Latest"}
                  </p>
                  <h4
                    className={cn(
                      "mt-2 max-w-[220px] font-display text-[26px] leading-tight",
                      index === 0 ? "text-ink" : "text-inverse",
                    )}
                  >
                    {index === 0 ? "Your space" : "Tech & gadgets"}
                  </h4>
                  <p
                    className={cn(
                      "mt-1.5 max-w-[220px] text-[12.5px]",
                      index === 0 ? "text-ink-muted" : "text-inverse/70",
                    )}
                  >
                    {index === 0 ? "Modern living for modern life." : "Innovation for a smarter tomorrow."}
                  </p>
                  <span
                    className={cn(
                      "mt-5 inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-button)] px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.12em]",
                      index === 0 ? "bg-accent text-obsidian" : "bg-accent text-obsidian",
                    )}
                  >
                    {index === 0 ? "Shop home" : "Explore tech"}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------- Product grid -------------------------- */

function ProductGridSection({ section, db }: { section: PageSection; db: StoreDatabase }) {
  const limit = section.source?.limit ?? 12;
  const base = resolveProducts(section, db, limit);
  if (!base.length) return null;

  const showTabs = Boolean(section.settings?.showTabs);
  const columns = (Number(section.settings?.columns) || 6) as 4 | 5 | 6;

  const groups = showTabs
    ? [
        { value: "all", label: "All", products: toCardList(base, db) },
        ...db.categories
          .filter((c) => c.level === 0)
          .slice(0, 5)
          .map((category) => ({
            value: category.slug,
            label: category.name.split(" ")[0]!,
            products: toCardList(
              db.products
                .filter((p) => p.status === "active" && p.categoryPath.includes(category.id))
                .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
                .slice(0, limit),
              db,
            ),
          }))
          .filter((group) => group.products.length >= 4),
      ]
    : [];

  return (
    <Section tone="surface" spacing="default">
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title ?? "Products"}
          description={section.subtitle}
          action={
            section.ctaHref && (
              <Link
                href={section.ctaHref}
                className="group inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink"
              >
                {section.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )
          }
        />
        <div className="mt-9">
          {showTabs && groups.length > 1 ? (
            <ProductTabs groups={groups} columns={columns} />
          ) : (
            <ProductGrid products={toCardList(base, db)} columns={columns} />
          )}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------ Carousel ---------------------------- */

function CarouselSection({ section, db }: { section: PageSection; db: StoreDatabase }) {
  const products = resolveProducts(section, db, section.source?.limit ?? 12);
  if (!products.length) return null;

  return (
    <Section tone="muted" spacing="default">
      <Container>
        <ProductRail
          eyebrow={section.eyebrow}
          title={section.title ?? "Trending"}
          ctaLabel={section.ctaLabel}
          ctaHref={section.ctaHref}
          products={toCardList(products, db)}
        />
      </Container>
    </Section>
  );
}

/* ------------------------------ Lookbook ---------------------------- */

function LookbookSection({ section }: { section: PageSection }) {
  return (
    <section className="relative isolate min-h-[520px] overflow-hidden bg-obsidian text-inverse">
      {section.image && (
        <Image
          src={section.image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/45 to-obsidian/75" />

      <Container className="relative flex min-h-[520px] flex-col justify-center py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-lg">
            {section.eyebrow && (
              <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-accent">{section.eyebrow}</p>
            )}
            <h2 className="mt-4 font-display display-case text-[clamp(32px,5vw,56px)] leading-[1.02] text-inverse">
              {section.title}
            </h2>
            {section.body && (
              <p className="mt-5 max-w-sm text-[13.5px] leading-relaxed text-inverse/70">{section.body}</p>
            )}
            {section.ctaHref && (
              <ButtonLink href={section.ctaHref} variant="accent" size="lg" className="mt-8">
                {section.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            )}
          </div>

          <div className="hidden max-w-sm lg:block">
            {section.settings?.quote && (
              <p className="mb-5 text-right font-display text-[19px] leading-snug text-inverse/85">
                “{String(section.settings.quote)}”
              </p>
            )}
            <div className="flex gap-3">
              {(section.images ?? []).map((image) => (
                <div
                  key={image}
                  className="relative h-[92px] w-[124px] shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-white/15"
                >
                  <Image src={image} alt="" fill sizes="124px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ----------------------------- Logo cloud --------------------------- */

function LogoCloud({ section, db }: { section: PageSection; db: StoreDatabase }) {
  const brands = db.brands.filter((b) => b.featured).slice(0, 10);
  if (!brands.length) return null;

  return (
    <Section tone="surface" spacing="tight">
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title ?? "Top brands"}
          size="sm"
          action={
            section.ctaHref && (
              <Link
                href={section.ctaHref}
                className="group inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink"
              >
                {section.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )
          }
        />
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="group flex h-[74px] items-center justify-center rounded-[var(--radius-card)] border border-line bg-muted px-4 transition-colors hover:border-ink/25 hover:bg-surface"
            >
              <span className="font-display display-case text-[17px] tracking-[0.14em] text-ink transition-colors group-hover:text-primary">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------ Countdown --------------------------- */

function CountdownSection({ section }: { section: PageSection }) {
  return (
    <Section tone="surface" spacing="tight">
      <Container>
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] bg-obsidian p-8 text-inverse sm:p-10">
            {section.image && (
              <Image
                src={section.image}
                alt=""
                fill
                sizes="(min-width:1024px) 60vw, 100vw"
                className="object-cover opacity-45"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 to-obsidian/25" />
            <div className="relative">
              <p className="font-display display-case text-[26px] leading-tight text-inverse sm:text-[32px]">
                {section.eyebrow ?? "Limited time deals"}
              </p>
              {section.body && (
                <p className="mt-2.5 max-w-sm text-[13px] leading-relaxed text-inverse/65">{section.body}</p>
              )}
              <div className="mt-7">
                <CountdownTimer hours={Number(section.settings?.endsInHours ?? 62)} />
              </div>
              {section.ctaHref && (
                <ButtonLink href={section.ctaHref} variant="accent" className="mt-7">
                  {section.ctaLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </ButtonLink>
              )}
            </div>
          </div>

          <div className="relative isolate flex flex-col justify-center overflow-hidden rounded-[var(--radius-card)] bg-primary p-8 text-inverse sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-accent/15 blur-3xl"
            />
            <p className="relative font-display display-case text-[26px] leading-tight sm:text-[30px]">
              Gift happiness
            </p>
            <p className="relative mt-2.5 text-[13px] text-inverse/70">
              Gift cards from ₹500 to ₹10,000. Delivered instantly, valid for two years.
            </p>
            <div className="relative mt-6 flex items-center gap-3">
              <div className="grid h-[86px] w-[136px] place-items-center rounded-[var(--radius-md)] border border-accent/40 bg-obsidian/40 text-center">
                <span className="font-display text-[15px] tracking-[0.16em] text-accent">GIFT CARD</span>
              </div>
              <div className="grid h-[86px] w-[136px] -ml-16 rotate-6 place-items-center rounded-[var(--radius-md)] border border-accent/25 bg-obsidian/30 text-center">
                <span className="font-display text-[15px] tracking-[0.16em] text-accent/70">OBSIDIAN</span>
              </div>
            </div>
            {section.secondaryCtaHref && (
              <ButtonLink href={section.secondaryCtaHref} variant="accent" className="relative mt-7 w-fit">
                {section.secondaryCtaLabel}
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------- Testimonial -------------------------- */

function TestimonialSection({ section, db }: { section: PageSection; db: StoreDatabase }) {
  const reviews = getTopReviews(db.store.id, 3);
  if (!reviews.length) return null;

  return (
    <Section tone="surface" spacing="default">
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title ?? "Loved by our customers"}
          description="Real stories. Real happiness."
          action={
            section.ctaHref && (
              <Link
                href={section.ctaHref}
                className="group inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink"
              >
                {section.ctaLabel}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )
          }
        />
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.id}
              className="flex flex-col rounded-[var(--radius-card)] border border-line bg-muted p-6"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={review.customerAvatar}
                  alt=""
                  className="h-10 w-10 rounded-full border border-line object-cover"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <figcaption className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                    {review.customerName}
                    {review.verifiedPurchase && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                  </figcaption>
                  <Rating value={review.rating} size={11} showValue={false} />
                </div>
              </div>
              <blockquote className="mt-4 flex-1 text-[13px] leading-relaxed text-ink-muted">
                “{review.body}”
              </blockquote>
              <p className="mt-4 truncate text-[11px] text-ink-muted">
                {review.productName} · {relativeTime(review.createdAt)}
              </p>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------- Newsletter --------------------------- */

function NewsletterSection({ section }: { section: PageSection }) {
  return (
    <Section tone="muted" spacing="tight">
      <Container>
        <div className="flex flex-col items-center gap-6 text-center">
          {section.eyebrow && (
            <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">{section.eyebrow}</p>
          )}
          <h2 className="max-w-xl font-display display-case text-[28px] leading-tight text-ink sm:text-[34px]">
            {section.title}
          </h2>
          {section.body && <p className="max-w-md text-[13.5px] text-ink-muted">{section.body}</p>}
          <NewsletterForm className="w-full max-w-md" />
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------ Rich text --------------------------- */

function RichTextSection({ section }: { section: PageSection }) {
  return (
    <Section tone="surface" spacing="default">
      <Container size="narrow">
        {section.eyebrow && (
          <p className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{section.eyebrow}</p>
        )}
        {section.title && (
          <h1 className="font-display display-case text-[32px] leading-tight text-ink sm:text-[42px]">
            {section.title}
          </h1>
        )}
        {section.body && (
          <div className="mt-7 space-y-5 text-[14.5px] leading-[1.75] text-ink-muted">
            {section.body.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

/* ------------------------------ Resolver ---------------------------- */

function resolveProducts(section: PageSection, db: StoreDatabase, limit: number) {
  const source = section.source;
  if (!source) return db.products.filter((p) => p.status === "active").slice(0, limit);

  switch (source.kind) {
    case "flag":
      return getProductsByFlag(
        db.store.id,
        (source.value ?? "featured") as "featured" | "isNew" | "bestseller" | "onSale",
        limit,
      );
    case "collection":
      return source.value ? getCollectionProducts(db.store.id, source.value, limit) : [];
    case "category":
      return db.products
        .filter((p) => p.status === "active" && (!source.value || p.categoryPath.includes(source.value)))
        .slice(0, limit);
    case "recommendation":
      return getRecommendations(db.store.id, (source.value ?? "trending") as "trending", { limit });
    default:
      return db.products.filter((p) => p.status === "active").slice(0, limit);
  }
}

export { money };
