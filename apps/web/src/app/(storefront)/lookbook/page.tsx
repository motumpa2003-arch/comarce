import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EDITORIAL, getProductsByFlag, img } from "@obsidian/data";
import { Container, Rule, Section, SectionHeading } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { HubHeader } from "@/components/commerce/hub-header";
import { ProductRail } from "@/components/commerce/product-rail";
import { toCardList } from "@/lib/product-view";
import { money } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Shoppable stories — every piece in the frame is one tap from the bag.",
};

/**
 * Each chapter pairs an editorial image with the products actually in it. The
 * hotspot coordinates are percentages of the image box, so they stay attached
 * to the right part of the picture at every breakpoint.
 */
const CHAPTERS = [
  {
    id: "ch_city",
    eyebrow: "Chapter one",
    title: "Weekday, reconsidered",
    body: "Tailoring that survives a commute, a meeting and whatever the evening turns into. Nothing here needs a garment bag.",
    image: EDITORIAL.heroMan,
    flag: "featured" as const,
    hotspots: [
      { top: 28, left: 46, label: "Outerwear" },
      { top: 62, left: 38, label: "Trousers" },
      { top: 82, left: 52, label: "Footwear" },
    ],
  },
  {
    id: "ch_studio",
    eyebrow: "Chapter two",
    title: "The considered room",
    body: "Furniture and objects chosen for how a room feels at seven in the evening rather than how it photographs at noon.",
    image: EDITORIAL.interiorStyled,
    flag: "bestseller" as const,
    hotspots: [
      { top: 44, left: 24, label: "Seating" },
      { top: 34, left: 64, label: "Lighting" },
      { top: 70, left: 48, label: "Objects" },
    ],
  },
  {
    id: "ch_open",
    eyebrow: "Chapter three",
    title: "Two days away from a screen",
    body: "Packs, layers and tools tested somewhere colder and wetter than the photographs suggest.",
    image: EDITORIAL.outdoorHiker,
    flag: "isNew" as const,
    hotspots: [
      { top: 36, left: 58, label: "Shell" },
      { top: 58, left: 42, label: "Pack" },
    ],
  },
];

export default async function LookbookPage() {
  const db = await currentStore();

  const chapters = CHAPTERS.map((chapter) => ({
    ...chapter,
    products: toCardList(getProductsByFlag(db.store.id, chapter.flag, 10), db),
  }));

  return (
    <>
      <HubHeader
        eyebrow="Shoppable stories"
        title="The"
        accent="lookbook"
        tone="obsidian"
        image={img(EDITORIAL.heroFashion, 1900, 900)}
        description="Three chapters, shot on location. Every piece in every frame is listed underneath it — a lookbook you cannot buy from is just a magazine."
        stats={[
          { value: String(chapters.length), label: "Chapters" },
          {
            value: String(chapters.reduce((n, c) => n + c.products.length, 0)),
            label: "Pieces featured",
          },
          { value: "30 days", label: "To change your mind" },
        ]}
      />

      {chapters.map((chapter, index) => (
        <Section key={chapter.id} tone={index % 2 === 0 ? "surface" : "ivory"} spacing="default">
          <Container>
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-muted">
                  <Image
                    src={img(chapter.image, 1100, 1375)}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 46vw, 100vw"
                    className="object-cover"
                  />
                  {chapter.hotspots.map((spot) => (
                    <span
                      key={spot.label}
                      style={{ top: `${spot.top}%`, left: `${spot.left}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                    >
                      <span className="flex items-center gap-2 rounded-full bg-surface/92 px-3 py-1.5 text-[11px] font-medium text-ink shadow-[0_2px_10px_rgba(8,9,8,0.18)] backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {spot.label}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className={index % 2 === 1 ? "lg:order-1" : undefined}>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">
                  {chapter.eyebrow}
                </p>
                <h2 className="mt-3.5 font-display display-case text-[30px] leading-[1.06] text-ink sm:text-[40px]">
                  {chapter.title}
                </h2>
                <Rule className="my-6" />
                <p className="max-w-md text-[14px] leading-[1.75] text-ink-muted">{chapter.body}</p>

                {chapter.products[0] && (
                  <p className="mt-6 text-[12.5px] text-ink-muted">
                    Featured from{" "}
                    <span className="font-medium text-ink">{money(chapter.products[0].price)}</span>
                  </p>
                )}

                <ButtonLink href="/shop" variant="obsidian" className="mt-7">
                  Shop this chapter
                  <ArrowRight className="h-3.5 w-3.5" />
                </ButtonLink>
              </div>
            </div>

            {chapter.products.length > 0 && (
              <div className="mt-12">
                <SectionHeading
                  eyebrow="In this frame"
                  title="Shop the pieces"
                  size="sm"
                  action={
                    <Link
                      href="/shop"
                      className="group inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink"
                    >
                      View all
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  }
                />
                <div className="mt-7">
                  <ProductRail products={chapter.products} itemWidth="min(240px,68vw)" />
                </div>
              </div>
            )}
          </Container>
        </Section>
      ))}

      <Section tone="obsidian" spacing="default">
        <Container className="text-center">
          <h2 className="font-display display-case text-[28px] leading-tight text-inverse sm:text-[36px]">
            Seen something you cannot place?
          </h2>
          <p className="mx-auto mt-3.5 max-w-md text-[13.5px] leading-relaxed text-inverse/70">
            Tell us which frame and we will find it, or the closest thing we still carry.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact" variant="accent">
              Ask us
            </ButtonLink>
            <ButtonLink
              href="/journal"
              variant="outline"
              className="border-white/30 text-inverse hover:border-white/60 hover:bg-white/10"
            >
              Read the journal
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
