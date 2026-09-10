import Link from "next/link";
import { ArrowRight, Compass, Search } from "lucide-react";
import { getCategoryTree, getProductsByFlag } from "@obsidian/data";
import { Container, Section } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { ProductRail } from "@/components/commerce/product-rail";
import { toCardList } from "@/lib/product-view";
import { currentStore } from "@/lib/tenant";

export default async function NotFound() {
  const db = await currentStore();
  const categories = getCategoryTree(db.store.id).slice(0, 8);
  const bestsellers = getProductsByFlag(db.store.id, "bestseller", 8);

  return (
    <>
      <Section tone="obsidian" spacing="loose">
        <Container size="narrow" className="text-center">
          <p className="font-display text-[clamp(76px,16vw,150px)] leading-none text-accent/25">404</p>
          <h1 className="-mt-4 font-display display-case text-[30px] leading-tight text-inverse sm:text-[40px]">
            This page has moved on
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-inverse/65">
            The link may be old, the product may have sold out, or we may have reorganised something. Here is the way
            back.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" variant="accent" size="lg">
              Back to home
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/shop"
              variant="outline"
              size="lg"
              className="border-white/35 text-inverse hover:border-inverse hover:bg-white/[0.06]"
            >
              <Search className="h-4 w-4" />
              Browse everything
            </ButtonLink>
          </div>
        </Container>
      </Section>

      <Section tone="surface" spacing="default">
        <Container>
          <h2 className="flex items-center gap-2 font-display display-case text-[20px] text-ink">
            <Compass className="h-4 w-4 text-accent" />
            Popular destinations
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="rounded-[var(--radius-card)] border border-line px-4 py-3.5 text-[12.5px] text-ink transition-colors hover:border-ink/30 hover:bg-muted"
              >
                {category.name}
                <span className="mt-0.5 block text-[11px] text-ink-muted">{category.productCount} products</span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {bestsellers.length > 0 && (
        <Section tone="muted" spacing="default">
          <Container>
            <ProductRail
              eyebrow="While you are here"
              title="Our bestsellers"
              products={toCardList(bestsellers, db)}
              ctaHref="/shop?sort=popularity"
            />
          </Container>
        </Section>
      )}
    </>
  );
}
