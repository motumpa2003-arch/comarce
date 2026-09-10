import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Card, Container, Progress, Rating, Rule, Section } from "@obsidian/ui";
import { number, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Customer reviews",
  description: "Verified reviews from customers across every category.",
};

export default async function ReviewsPage() {
  const db = await currentStore();
  const approved = db.reviews.filter((r) => r.status === "approved");
  const total = approved.length;
  const average = total ? approved.reduce((n, r) => n + r.rating, 0) / total : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: approved.filter((r) => r.rating === star).length,
  }));

  const withPhotos = approved.filter((r) => r.images.length > 0).slice(0, 6);
  const featured = [...approved].sort((a, b) => b.helpfulCount - a.helpfulCount).slice(0, 12);

  return (
    <>
      <div className="border-b border-line bg-ivory">
        <Container className="py-12 sm:py-16">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Reviews</p>
          <h1 className="mt-3 font-display display-case text-[34px] leading-none text-ink sm:text-[46px]">
            Loved by our customers
          </h1>
          <Rule className="mt-5" />
          <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            Every review below comes from a verified purchase. We never delete a negative review — we answer it.
          </p>
        </Container>
      </div>

      <Section tone="surface" spacing="default">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-[180px] lg:self-start">
              <div className="flex items-end gap-3">
                <span className="font-display text-[56px] leading-none text-ink">{average.toFixed(1)}</span>
                <div className="pb-2">
                  <Rating value={average} size={16} showValue={false} />
                  <p className="mt-1 text-[11.5px] text-ink-muted">{number(total)} reviews</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {distribution.map((row) => (
                  <div key={row.star} className="flex items-center gap-3">
                    <span className="w-8 text-[12px] tabular-nums text-ink">{row.star} ★</span>
                    <Progress value={total ? (row.count / total) * 100 : 0} tone="accent" height={6} className="flex-1" />
                    <span className="w-10 text-right text-[11.5px] tabular-nums text-ink-muted">{row.count}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[12px] leading-relaxed text-ink-muted">
                {Math.round((approved.filter((r) => r.verifiedPurchase).length / Math.max(total, 1)) * 100)}% of
                reviews come from a verified purchase.
              </p>
            </aside>

            <div>
              {withPhotos.length > 0 && (
                <section className="mb-10">
                  <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                    Photos from customers
                  </h2>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {withPhotos.map((review) => (
                      <Link
                        key={review.id}
                        href={`/product/${review.productId}`}
                        className="relative aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-muted"
                      >
                        <Image
                          src={review.images[0]!}
                          alt=""
                          fill
                          sizes="140px"
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {featured.map((review) => (
                  <Card key={review.id} className="flex flex-col">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={review.customerAvatar}
                        alt=""
                        className="h-9 w-9 rounded-full border border-line object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink">
                          {review.customerName}
                          {review.verifiedPurchase && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                        </p>
                        <Rating value={review.rating} size={11} showValue={false} />
                      </div>
                      <span className="ml-auto shrink-0 text-[11px] text-ink-muted">
                        {relativeTime(review.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3.5 text-[13.5px] font-medium text-ink">{review.title}</p>
                    <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-muted">{review.body}</p>

                    <div className="mt-4 flex items-center gap-3 border-t border-line pt-3.5">
                      <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-[2px] bg-muted">
                        {review.productImage && (
                          <Image src={review.productImage} alt="" fill sizes="36px" className="object-cover" />
                        )}
                      </div>
                      <Link
                        href={`/product/${review.productId}`}
                        className="min-w-0 flex-1 truncate text-[12px] text-ink-muted hover:text-ink"
                      >
                        {review.productName}
                      </Link>
                      <span className="shrink-0 text-[11px] text-ink-muted">
                        {review.helpfulCount} found helpful
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
