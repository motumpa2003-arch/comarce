"use client";

import * as React from "react";
import Image from "next/image";
import { BadgeCheck, MessageSquare, ThumbsUp } from "lucide-react";
import type { ProductQuestion, Review } from "@obsidian/commerce";
import Link from "next/link";
import { Accordion, Badge, Button, Progress, Rating, Tabs, buttonClasses, cn } from "@obsidian/ui";
import type { ProductDetail } from "@/lib/product-detail";
import { formatDate, number, relativeTime } from "@/lib/format";

export function ProductTabsPanel({
  detail,
  reviews,
  questions,
}: {
  detail: ProductDetail;
  reviews: Review[];
  questions: ProductQuestion[];
}) {
  const [tab, setTab] = React.useState("overview");

  const items = [
    { value: "overview", label: "Overview" },
    { value: "specs", label: "Specifications", count: detail.specs.length },
    { value: "reviews", label: "Reviews", count: detail.rating.count },
    { value: "qa", label: "Q&A", count: questions.length },
    { value: "shipping", label: "Shipping & returns" },
  ];

  return (
    <div id="reviews">
      <Tabs items={items} value={tab} onChange={setTab} />

      <div className="pt-9">
        {tab === "overview" && <Overview detail={detail} />}
        {tab === "specs" && <Specs detail={detail} />}
        {tab === "reviews" && <Reviews detail={detail} reviews={reviews} />}
        {tab === "qa" && <QuestionsAnswers questions={questions} />}
        {tab === "shipping" && <Shipping />}
      </div>
    </div>
  );
}

/* ------------------------------ Overview ---------------------------- */

function Overview({ detail }: { detail: ProductDetail }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h3 className="font-display display-case text-[22px] text-ink">About this product</h3>
        <div className="mt-4 space-y-4 text-[14px] leading-[1.75] text-ink-muted">
          {detail.description.split("\n\n").map((paragraph, index) =>
            paragraph.startsWith("•") ? (
              <ul key={index} className="space-y-2">
                {paragraph.split("\n").map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {line.replace(/^•\s*/, "")}
                  </li>
                ))}
              </ul>
            ) : (
              <p key={index}>{paragraph}</p>
            ),
          )}
        </div>

        {detail.tags.length > 0 && (
          <div className="mt-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Tags</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {detail.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {detail.brand && (
        <aside className="rounded-[var(--radius-card)] border border-line bg-muted p-6">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-accent">About the brand</p>
          <h4 className="mt-2 font-display text-[24px] text-ink">{detail.brand.name}</h4>
          <p className="mt-1 text-[11.5px] text-ink-muted">{detail.brand.origin}</p>
          <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">{detail.brand.description}</p>
          <Link
            href={`/brand/${detail.brand.slug}`}
            className={buttonClasses("outline", "sm", false, "mt-5")}
          >
            View all products
          </Link>
        </aside>
      )}
    </div>
  );
}

/* -------------------------------- Specs ----------------------------- */

function Specs({ detail }: { detail: ProductDetail }) {
  const half = Math.ceil(detail.specs.length / 2);
  const columns = [detail.specs.slice(0, half), detail.specs.slice(half)];

  return (
    <div className="grid gap-x-12 gap-y-0 md:grid-cols-2">
      {columns.map((column, index) => (
        <dl key={index} className="divide-y divide-line">
          {column.map((spec) => (
            <div key={spec.label} className="grid grid-cols-[140px_1fr] gap-4 py-3">
              <dt className="text-[12.5px] text-ink-muted">{spec.label}</dt>
              <dd className="text-[13px] text-ink">{spec.value}</dd>
            </div>
          ))}
        </dl>
      ))}
    </div>
  );
}

/* ------------------------------- Reviews ---------------------------- */

function Reviews({ detail, reviews }: { detail: ProductDetail; reviews: Review[] }) {
  const [filter, setFilter] = React.useState<number | null>(null);
  const [sort, setSort] = React.useState<"helpful" | "recent">("helpful");
  const [visible, setVisible] = React.useState(4);

  const filtered = React.useMemo(() => {
    const list = filter ? reviews.filter((r) => r.rating === filter) : reviews;
    return [...list].sort((a, b) =>
      sort === "helpful" ? b.helpfulCount - a.helpfulCount : Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  }, [reviews, filter, sort]);

  const total = detail.rating.count;

  return (
    <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-14">
      <aside>
        <div className="flex items-end gap-3">
          <span className="font-display text-[54px] leading-none text-ink">{detail.rating.average.toFixed(1)}</span>
          <div className="pb-2">
            <Rating value={detail.rating.average} size={15} showValue={false} />
            <p className="mt-1 text-[11.5px] text-ink-muted">Based on {number(total)} reviews</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = detail.rating.distribution[String(star)] ?? 0;
            const percent = total ? (count / total) * 100 : 0;
            const active = filter === star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setFilter(active ? null : star)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-1.5 py-1 transition-colors",
                  active ? "bg-muted" : "hover:bg-muted/70",
                )}
              >
                <span className="w-8 shrink-0 text-left text-[12px] tabular-nums text-ink">{star} ★</span>
                <Progress value={percent} tone="accent" height={6} className="flex-1" />
                <span className="w-10 shrink-0 text-right text-[11.5px] tabular-nums text-ink-muted">
                  {Math.round(percent)}%
                </span>
              </button>
            );
          })}
        </div>

        <Button variant="outline" fullWidth className="mt-6">
          Write a review
        </Button>
        <p className="mt-3 text-[11.5px] leading-relaxed text-ink-muted">
          Only customers who bought this product can post a verified review.
        </p>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-[13px] text-ink-muted">
            {filtered.length} review{filtered.length === 1 ? "" : "s"}
            {filter ? ` with ${filter} stars` : ""}
          </p>
          <Tabs
            variant="segment"
            size="sm"
            items={[
              { value: "helpful", label: "Most helpful" },
              { value: "recent", label: "Most recent" },
            ]}
            value={sort}
            onChange={(v) => setSort(v as "helpful" | "recent")}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-ink-muted">No reviews with that rating yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.slice(0, visible).map((review) => (
              <li key={review.id} className="py-6">
                <div className="flex items-start gap-3.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={review.customerAvatar}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full border border-line object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-medium text-ink">{review.customerName}</span>
                      {review.verifiedPurchase && (
                        <Badge tone="success" size="xs">
                          <BadgeCheck className="h-3 w-3" />
                          Verified purchase
                        </Badge>
                      )}
                      <span className="text-[11.5px] text-ink-muted">{relativeTime(review.createdAt)}</span>
                    </div>
                    <div className="mt-1.5">
                      <Rating value={review.rating} size={12} showValue={false} />
                    </div>
                    <h4 className="mt-2.5 text-[14px] font-medium text-ink">{review.title}</h4>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{review.body}</p>

                    {review.images.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {review.images.map((src) => (
                          <div
                            key={src}
                            className="relative h-16 w-14 overflow-hidden rounded-[var(--radius-sm)] border border-line"
                          >
                            <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3.5 flex items-center gap-4 text-[11.5px] text-ink-muted">
                      <button type="button" className="inline-flex items-center gap-1.5 hover:text-ink">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Helpful ({review.helpfulCount})
                      </button>
                      <button type="button" className="hover:text-ink">
                        Report
                      </button>
                    </div>

                    {review.merchantReply && (
                      <div className="mt-4 rounded-[var(--radius-sm)] border-l-2 border-primary bg-muted p-4">
                        <p className="text-[11.5px] font-medium text-ink">
                          {review.merchantReply.author} replied · {formatDate(review.merchantReply.createdAt)}
                        </p>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                          {review.merchantReply.body}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {visible < filtered.length && (
          <Button variant="outline" className="mt-6" onClick={() => setVisible((v) => v + 6)}>
            Load more reviews
          </Button>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- Q&A ------------------------------ */

function QuestionsAnswers({ questions }: { questions: ProductQuestion[] }) {
  if (!questions.length) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center">
        <MessageSquare className="mx-auto h-6 w-6 text-ink-muted" />
        <p className="mt-3 text-[14px] text-ink">No questions yet</p>
        <p className="mt-1 text-[12.5px] text-ink-muted">Be the first to ask — we usually reply within a day.</p>
        <Button variant="outline" className="mt-5">
          Ask a question
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Accordion
        items={questions.map((question) => ({
          id: question.id,
          title: question.question,
          meta: (
            <span className="text-[11px] text-ink-muted">
              {question.answers.length} answer{question.answers.length === 1 ? "" : "s"}
            </span>
          ),
          content: (
            <ul className="space-y-4">
              {question.answers.map((answer) => (
                <li key={answer.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium text-ink">{answer.author}</span>
                    {answer.authorType === "merchant" && (
                      <Badge tone="info" size="xs">
                        Seller
                      </Badge>
                    )}
                    <span className="text-[11px] text-ink-muted">{relativeTime(answer.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{answer.body}</p>
                </li>
              ))}
              {question.answers.length === 0 && (
                <li className="text-[12.5px] text-ink-muted">Awaiting an answer from the seller.</li>
              )}
            </ul>
          ),
        }))}
      />
      <Button variant="outline" className="mt-6">
        Ask a question
      </Button>
    </div>
  );
}

/* ------------------------------ Shipping ---------------------------- */

function Shipping() {
  return (
    <div className="grid max-w-4xl gap-8 md:grid-cols-2">
      <div>
        <h3 className="font-display display-case text-[20px] text-ink">Delivery</h3>
        <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-ink-muted">
          <li>
            <span className="font-medium text-ink">Standard</span> — free above ₹999, otherwise ₹99. Arrives in four to
            six working days.
          </li>
          <li>
            <span className="font-medium text-ink">Express</span> — ₹199, two to three working days with priority
            handling.
          </li>
          <li>
            <span className="font-medium text-ink">Same day</span> — ₹349 in metro pincodes for orders placed before
            noon.
          </li>
          <li>
            <span className="font-medium text-ink">Store pickup</span> — free, ready within 24 hours at participating
            stores.
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-display display-case text-[20px] text-ink">Returns</h3>
        <ul className="mt-4 space-y-3 text-[13px] leading-relaxed text-ink-muted">
          <li>Thirty days from delivery, extended to sixty for Gold and Black members.</li>
          <li>Free pickup arranged within two working days in serviceable pincodes.</li>
          <li>Refunds land on the original payment method in five to seven working days.</li>
          <li>Store credit is instant if you would rather not wait.</li>
        </ul>
      </div>
    </div>
  );
}
