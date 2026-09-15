import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import type { PageSection } from "@obsidian/commerce";
import { getTopReviews, type StoreDatabase } from "@obsidian/data";
import { Accordion, Badge, Container, Rating, Section, SectionHeading, cn } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductGrid } from "@/components/commerce/product-card";
import { ProductRail } from "@/components/commerce/product-rail";
import { RecentlyViewedRail } from "@/components/commerce/recently-viewed-rail";
import type { ProductCardData } from "@/lib/product-view";
import { relativeTime } from "@/lib/format";

/* ----------------------------- Promo strip -------------------------- */

/**
 * The thin announcement band that sits between heavier sections. Duplicated
 * once so the marquee can loop without a visible seam; the copy is read by a
 * screen reader only once.
 */
export function PromoStrip({ section }: { section: PageSection }) {
  const messages = (section.settings?.messages ? String(section.settings.messages).split("|") : [])
    .map((m) => m.trim())
    .filter(Boolean);
  const items = messages.length
    ? messages
    : [section.title, section.subtitle, section.body].filter(Boolean).map(String);
  if (!items.length) return null;

  const tone = String(section.settings?.tone ?? "obsidian");

  return (
    <div
      className={cn(
        "overflow-hidden border-y py-2.5",
        tone === "accent"
          ? "border-accent/30 bg-accent text-obsidian"
          : tone === "ivory"
            ? "border-line bg-muted text-ink"
            : "border-white/10 bg-obsidian text-inverse",
      )}
    >
      <div className="flex w-max animate-[marquee_34s_linear_infinite] gap-10 whitespace-nowrap pr-10 hover:[animation-play-state:paused]">
        {[0, 1].map((pass) => (
          <div key={pass} className="flex gap-10" aria-hidden={pass === 1}>
            {items.map((message, index) => (
              <span
                key={`${pass}-${index}`}
                className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.16em]"
              >
                <Sparkles className="h-3 w-3 opacity-60" />
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Video hero -------------------------- */

/**
 * A cinematic full-bleed opener. Plays `settings.videoUrl` when the theme
 * supplies one and falls back to the poster image otherwise, so the section
 * renders the same shape either way rather than collapsing when no asset
 * has been uploaded yet.
 */
export function VideoHero({ section }: { section: PageSection }) {
  const videoUrl = section.settings?.videoUrl ? String(section.settings.videoUrl) : undefined;
  const poster = section.image ?? section.images?.[0];

  return (
    <section className="relative isolate min-h-[68vh] overflow-hidden bg-obsidian text-inverse lg:min-h-[78vh]">
      {videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          src={videoUrl}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : poster ? (
        <Image src={poster} alt="" fill priority sizes="100vw" className="object-cover opacity-55" />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-obsidian/20" />

      <Container className="relative flex min-h-[68vh] flex-col justify-end pb-14 lg:min-h-[78vh] lg:pb-20">
        <div className="max-w-2xl">
          {section.eyebrow && (
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">{section.eyebrow}</p>
          )}
          <h2 className="mt-3.5 font-display display-case text-[34px] leading-[1.04] sm:text-[48px] lg:text-[60px]">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-inverse/70">{section.subtitle}</p>
          )}
          {(section.ctaHref || section.secondaryCtaHref) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {section.ctaHref && (
                <ButtonLink href={section.ctaHref} variant="accent" size="lg">
                  {section.ctaLabel ?? "Shop the film"}
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              )}
              {section.secondaryCtaHref && (
                <ButtonLink
                  href={section.secondaryCtaHref}
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-inverse hover:border-white/60 hover:bg-white/10"
                >
                  {section.secondaryCtaLabel ?? "Read the story"}
                </ButtonLink>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------- Collection feature ---------------------- */

/** One collection given the full-width treatment: art on one side, rail on the other. */
export function CollectionFeature({
  section,
  db,
  products,
}: {
  section: PageSection;
  db: StoreDatabase;
  products: ProductCardData[];
}) {
  const collection = section.source?.value
    ? db.collections.find((c) => c.id === section.source?.value || c.slug === section.source?.value)
    : db.collections.find((c) => c.featured);
  if (!products.length) return null;

  const image = section.image ?? collection?.image;
  const href = collection ? `/collection/${collection.slug}` : (section.ctaHref ?? "/collections");

  return (
    <Section tone="surface" spacing="default">
      <Container>
        <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="relative isolate min-h-[300px] overflow-hidden rounded-[var(--radius-card)] bg-obsidian p-8 text-inverse sm:p-10">
            {image && (
              <Image src={image} alt="" fill sizes="(min-width:1024px) 420px, 100vw" className="object-cover opacity-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
            <div className="relative flex h-full flex-col justify-end">
              {section.eyebrow && (
                <p className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-accent">{section.eyebrow}</p>
              )}
              <h2 className="mt-3 font-display display-case text-[28px] leading-tight sm:text-[34px]">
                {section.title ?? collection?.name}
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-inverse/70">
                {section.body ?? collection?.description}
              </p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-inverse/50">
                {products.length} piece{products.length === 1 ? "" : "s"} in this edit
              </p>
              <ButtonLink href={href} variant="accent" className="mt-6 self-start">
                {section.ctaLabel ?? "Shop the collection"}
                <ArrowRight className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          </div>

          <div className="min-w-0">
            <ProductRail products={products} itemWidth="min(240px,68vw)" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------ Review wall ------------------------- */

/** A masonry-ish wall of real seeded reviews, not invented pull quotes. */
export function ReviewWall({ section, db }: { section: PageSection; db: StoreDatabase }) {
  // The testimonial section takes the top few, so skip past them rather than
  // printing the same three quotes twice on one page.
  const skip = Number(section.settings?.skip ?? 3);
  const limit = section.source?.limit ?? 9;
  const reviews = getTopReviews(db.store.id, skip + limit).slice(skip, skip + limit);
  if (!reviews.length) return null;

  const productName = new Map(db.products.map((p) => [p.id, { name: p.name, slug: p.slug }]));
  const average = reviews.reduce((n, r) => n + r.rating, 0) / reviews.length;

  return (
    <Section tone="ivory" spacing="default">
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow ?? "Verified reviews"}
          title={section.title ?? "What people actually say"}
          description={section.subtitle}
          action={
            <span className="flex items-center gap-2 text-[12px] text-ink-muted">
              <Rating value={average} size={12} />
              {average.toFixed(1)} average
            </span>
          }
        />

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => {
            const product = productName.get(review.productId);
            return (
              <figure
                key={review.id}
                className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <Rating value={review.rating} size={12} />
                  {review.verifiedPurchase && (
                    <Badge tone="success" size="xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <blockquote className="mt-3 flex-1">
                  <p className="text-[13.5px] font-medium text-ink">{review.title}</p>
                  <p className="mt-1.5 line-clamp-2x text-[12.5px] leading-relaxed text-ink-muted">{review.body}</p>
                </blockquote>
                <figcaption className="mt-4 border-t border-line pt-3 text-[11.5px] text-ink-muted">
                  <span className="text-ink">{review.customerName}</span> · {relativeTime(review.createdAt)}
                  {product && (
                    <>
                      {" · "}
                      <Link href={`/product/${product.slug}`} className="underline-offset-2 hover:underline">
                        {product.name}
                      </Link>
                    </>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------- FAQ ------------------------------ */

export function FaqSection({ section, db }: { section: PageSection; db: StoreDatabase }) {
  const category = section.settings?.category ? String(section.settings.category) : undefined;
  const faqs = db.faqs
    .filter((f) => !category || f.category === category)
    .sort((a, b) => a.position - b.position)
    .slice(0, section.source?.limit ?? 8);
  if (!faqs.length) return null;

  return (
    <Section tone="surface" spacing="default">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div>
            <SectionHeading
              eyebrow={section.eyebrow ?? "Answers"}
              title={section.title ?? "Questions, answered"}
              description={section.subtitle}
              size="sm"
            />
            <ButtonLink href={section.ctaHref ?? "/faq"} variant="outline" size="sm" className="mt-5">
              {section.ctaLabel ?? "All questions"}
              <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>

          <Accordion
            allowMultiple={false}
            defaultOpen={faqs[0] ? [faqs[0].id] : []}
            items={faqs.map((faq) => ({
              id: faq.id,
              title: faq.question,
              content: <p className="text-[13px] leading-relaxed text-ink-muted">{faq.answer}</p>,
            }))}
          />
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------ Brand story ------------------------- */

export function BrandStory({ section, db }: { section: PageSection; db: StoreDatabase }) {
  const brand = section.source?.value
    ? db.brands.find((b) => b.id === section.source?.value || b.slug === section.source?.value)
    : db.brands.find((b) => b.featured);

  const pillars = String(section.settings?.pillars ?? "")
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Section tone="surface" spacing="default">
      <Container>
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-muted">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[280px] lg:min-h-[420px]">
              {(section.image ?? brand?.cover ?? brand?.logo) && (
                <Image
                  src={section.image ?? brand?.cover ?? brand?.logo ?? ""}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-11">
              {section.eyebrow && (
                <p className="text-[10.5px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                  {section.eyebrow}
                </p>
              )}
              <h2 className="mt-3 font-display display-case text-[28px] leading-tight text-ink sm:text-[36px]">
                {section.title ?? brand?.name ?? db.store.name}
              </h2>
              <p className="mt-4 text-[14px] leading-[1.75] text-ink-muted">
                {section.body ?? brand?.description ?? db.store.description}
              </p>

              {pillars.length > 0 && (
                <ul className="mt-7 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {pillars.map((pillar) => (
                    <li key={pillar} className="flex items-start gap-2.5 text-[12.5px] text-ink">
                      <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      {pillar}
                    </li>
                  ))}
                </ul>
              )}

              {brand && (
                <p className="mt-7 text-[11.5px] uppercase tracking-[0.14em] text-ink-muted">
                  {brand.origin} · {brand.productCount} products
                </p>
              )}

              {section.ctaHref && (
                <ButtonLink href={section.ctaHref} variant="obsidian" className="mt-7 self-start">
                  {section.ctaLabel ?? "Read the story"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ----------------------------- Image mosaic ------------------------- */

/**
 * An asymmetric editorial grid. The first tile is deliberately twice the size
 * of the rest, which is what stops a mosaic reading as a plain gallery.
 */
export function ImageMosaic({ section, db }: { section: PageSection; db: StoreDatabase }) {
  const categories = db.categories.filter((c) => c.level === 0 && c.image).slice(0, 5);
  const tiles = (section.images ?? []).length
    ? (section.images ?? []).slice(0, 5).map((image, index) => ({
        image,
        label: categories[index]?.name ?? "",
        href: categories[index] ? `/category/${categories[index]!.slug}` : "/shop",
      }))
    : categories.map((category) => ({
        image: category.image!,
        label: category.name,
        href: `/category/${category.slug}`,
      }));
  if (tiles.length < 3) return null;

  return (
    <Section tone="surface" spacing="default">
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title ?? "The edit"}
          description={section.subtitle}
        />
        <div className="mt-7 grid auto-rows-[152px] grid-cols-2 gap-3 sm:auto-rows-[184px] lg:grid-cols-4">
          {tiles.map((tile, index) => (
            <Link
              key={`${tile.href}-${index}`}
              href={tile.href}
              className={cn(
                "group relative isolate overflow-hidden rounded-[var(--radius-card)] bg-muted",
                index === 0 && "col-span-2 row-span-2",
              )}
            >
              <Image
                src={tile.image}
                alt=""
                fill
                sizes={index === 0 ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"}
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/75 via-obsidian/10 to-transparent" />
              {tile.label && (
                <span
                  className={cn(
                    "absolute inset-x-4 bottom-3.5 font-display display-case text-inverse",
                    index === 0 ? "text-[22px] sm:text-[27px]" : "text-[15px]",
                  )}
                >
                  {tile.label}
                </span>
              )}
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------- Recommendations ------------------------ */

export function RecommendationsSection({
  section,
  products,
}: {
  section: PageSection;
  products: ProductCardData[];
}) {
  if (!products.length) return null;
  const layout = String(section.settings?.layout ?? "rail");

  return (
    <Section tone="surface" spacing="default">
      <Container>
        {layout === "grid" ? (
          <>
            <SectionHeading
              eyebrow={section.eyebrow ?? "Picked for you"}
              title={section.title ?? "You may also like"}
              description={section.subtitle}
            />
            <ProductGrid products={products} className="mt-7" />
          </>
        ) : (
          <ProductRail
            products={products}
            eyebrow={section.eyebrow ?? "Picked for you"}
            title={section.title ?? "You may also like"}
            ctaLabel={section.ctaLabel}
            ctaHref={section.ctaHref}
          />
        )}
      </Container>
    </Section>
  );
}

/* --------------------------- Recently viewed ------------------------ */

/**
 * The rail brings its own Section and Container, and renders nothing at all
 * when the shopper has no history — so it must not be wrapped again here, or
 * a first-time visitor gets an empty padded band.
 */
export function RecentlyViewedSection({ section }: { section: PageSection }) {
  return (
    <RecentlyViewedRail
      eyebrow={section.eyebrow ?? "Pick up where you left off"}
      title={section.title ?? "Recently viewed"}
    />
  );
}

/* ------------------------------ Custom HTML ------------------------- */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "em", "b", "i", "u", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "small", "span",
]);

/**
 * Merchant-authored markup. Anything outside a small formatting allowlist is
 * stripped rather than rendered — a storefront section is not a place to let
 * arbitrary script through, even when the author is the store owner.
 *
 * Attributes go too: keeping the tag but dropping its attributes is what stops
 * a `style` or `href` sneaking a payload past the tag check.
 */
function sanitise(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/>/gi, "")
    .replace(/<(\/?)([a-z][\w-]*)(?:\s[^>]*)?(\/?)>/gi, (_match, close: string, tag: string, selfClose: string) =>
      ALLOWED_TAGS.has(tag.toLowerCase()) ? `<${close}${tag.toLowerCase()}${selfClose}>` : "",
    );
}

export function CustomHtml({ section }: { section: PageSection }) {
  const raw = section.body ?? "";
  if (!raw.trim()) return null;

  const safe = sanitise(raw);
  if (!safe.trim()) return null;

  return (
    <Section tone="surface" spacing="tight">
      <Container size="narrow">
        {section.title && (
          <h2 className="mb-5 font-display display-case text-[26px] leading-tight text-ink">{section.title}</h2>
        )}
        <div
          className="space-y-4 text-[14.5px] leading-[1.75] text-ink-muted [&_h2]:font-display [&_h2]:text-[20px] [&_h2]:text-ink [&_h3]:font-medium [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink [&_ul]:space-y-1.5"
          dangerouslySetInnerHTML={{ __html: safe }}
        />
      </Container>
    </Section>
  );
}

