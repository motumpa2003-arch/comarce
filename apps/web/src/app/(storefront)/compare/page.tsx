import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Scale, X } from "lucide-react";
import { getProductsByIds } from "@obsidian/data";
import { Badge, Container, EmptyState, Rating, Section, cn } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { CompareSync } from "@/components/storefront/compare-sync";
import { HubHeader } from "@/components/commerce/hub-header";
import { toProductDetail } from "@/lib/product-detail";
import { money } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Compare",
  description: "Put up to four products side by side, with the specs lined up automatically.",
};

const MAX = 4;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.ids) ? params.ids.join(",") : (params.ids ?? "");
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, MAX);

  const db = await currentStore();
  const details = getProductsByIds(db.store.id, ids).map((product) => toProductDetail(product, db));

  // The row set is the union of each product's own attributes, in first-seen
  // order. Comparing two cameras surfaces sensor and mount; comparing two rings
  // surfaces carat and metal — with no per-category code on this page.
  const rows: string[] = [];
  for (const product of details) {
    for (const spec of product.specs) {
      if (!rows.includes(spec.label)) rows.push(spec.label);
    }
  }

  const cheapest = details.length ? Math.min(...details.map((d) => d.price)) : 0;
  const bestRated = details.length ? Math.max(...details.map((d) => d.rating.average)) : 0;
  const hrefWithout = (id: string) => {
    const rest = ids.filter((x) => x !== id);
    return rest.length ? `/compare?ids=${rest.join(",")}` : "/compare";
  };

  return (
    <>
      <HubHeader
        eyebrow="Side by side"
        title="Compare"
        description={
          details.length
            ? `${details.length} of ${MAX} products. The specification rows below are built from each product's own attributes, so the table adapts to whatever you are comparing.`
            : "Add up to four products from any listing and their specifications will line up here automatically — whatever the category."
        }
      />

      {details.length === 0 ? (
        <Section tone="surface" spacing="default">
          <Container>
            <EmptyState
              icon={<Scale className="h-6 w-6" />}
              title="Nothing to compare yet"
              description="Pick products from any listing or product page. Up to four fit side by side, and the comparison stays in this browser until you clear it."
              action={<ButtonLink href="/shop">Browse the catalogue</ButtonLink>}
            />
          </Container>
        </Section>
      ) : (
        <Section tone="surface" spacing="default">
          <Container>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[12.5px] text-ink-muted">
                Comparing {details.length} of {MAX} possible products.
              </p>
              <CompareSync ids={ids} />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <caption className="sr-only">Product comparison</caption>
                <thead>
                  <tr>
                    <th className="w-[150px] align-bottom" />
                    {details.map((product) => (
                      <th key={product.id} className="p-2 align-bottom font-normal">
                        <div className="relative">
                          <Link
                            href={hrefWithout(product.id)}
                            aria-label={`Remove ${product.name} from the comparison`}
                            replace
                            className="absolute right-1 top-1 z-10 grid h-7 w-7 place-items-center rounded-full border border-line bg-surface/90 text-ink-muted transition-colors hover:text-ink"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Link>
                          <Link href={`/product/${product.slug}`} className="group block">
                            <span className="relative block aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-muted">
                              {product.media[0]?.url && (
                                <Image
                                  src={product.media[0].url}
                                  alt=""
                                  fill
                                  sizes="(min-width:768px) 22vw, 60vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                              )}
                            </span>
                            {product.brand?.name && (
                              <span className="mt-3 block text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                                {product.brand.name}
                              </span>
                            )}
                            <span className="mt-1 block line-clamp-2x text-[13px] leading-snug text-ink group-hover:text-primary">
                              {product.name}
                            </span>
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="text-[12.5px]">
                  <Row label="Price">
                    {details.map((product) => (
                      <Cell key={product.id}>
                        <span className="text-[15px] font-semibold tabular-nums text-ink">
                          {money(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="ml-2 text-[11.5px] tabular-nums text-ink-muted line-through">
                            {money(product.compareAtPrice)}
                          </span>
                        )}
                        {details.length > 1 && product.price === cheapest && (
                          <Badge tone="success" size="xs" className="ml-2 align-middle">
                            Lowest
                          </Badge>
                        )}
                      </Cell>
                    ))}
                  </Row>

                  <Row label="Rating">
                    {details.map((product) => (
                      <Cell key={product.id}>
                        <span className="flex flex-wrap items-center gap-2">
                          <Rating value={product.rating.average} count={product.rating.count} size={12} />
                          {details.length > 1 && product.rating.average === bestRated && (
                            <Badge tone="accent" size="xs">
                              Best rated
                            </Badge>
                          )}
                        </span>
                      </Cell>
                    ))}
                  </Row>

                  <Row label="Availability">
                    {details.map((product) => (
                      <Cell key={product.id}>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5",
                            product.totalStock > 0 ? "text-success" : "text-danger",
                          )}
                        >
                          {product.totalStock > 0 ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Minus className="h-3.5 w-3.5" />
                          )}
                          {product.totalStock > 0 ? "In stock" : "Out of stock"}
                        </span>
                      </Cell>
                    ))}
                  </Row>

                  <Row label="Category">
                    {details.map((product) => (
                      <Cell key={product.id} muted>
                        {product.category?.name ?? "—"}
                      </Cell>
                    ))}
                  </Row>

                  {rows.map((label) => (
                    <Row key={label} label={label}>
                      {details.map((product) => {
                        const spec = product.specs.find((s) => s.label === label);
                        return (
                          <Cell key={product.id} muted={!spec}>
                            {spec ? spec.value : "—"}
                          </Cell>
                        );
                      })}
                    </Row>
                  ))}

                  <tr>
                    <td className="border-t border-line px-2 py-4" />
                    {details.map((product) => (
                      <td key={product.id} className="border-t border-line px-2 py-4 align-top">
                        <ButtonLink href={`/product/${product.slug}`} size="sm" fullWidth>
                          View product
                        </ButtonLink>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="align-top">
      <th
        scope="row"
        className="border-t border-line px-2 py-3 text-[10.5px] font-medium uppercase tracking-[0.12em] text-ink-muted"
      >
        {label}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <td className={cn("border-t border-line px-2 py-3 align-top", muted ? "text-ink-muted" : "text-ink")}>
      {children}
    </td>
  );
}
