import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Flag, ThumbsUp } from "lucide-react";
import { Badge, Card, Progress, Rating, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatDate, number, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const db = await currentStore();

  const all = db.reviews;
  const filtered = status === "all" ? all : all.filter((r) => r.status === status);

  const average = all.length ? all.reduce((n, r) => n + r.rating, 0) / all.length : 0;
  const pending = all.filter((r) => r.status === "pending");
  const flagged = all.filter((r) => r.status === "flagged" || r.reportCount > 0);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: all.filter((r) => r.rating === star).length,
  }));

  const tabs = [
    { value: "all", label: "All", count: all.length },
    { value: "pending", label: "Pending", count: pending.length },
    { value: "approved", label: "Approved", count: all.filter((r) => r.status === "approved").length },
    { value: "flagged", label: "Flagged", count: flagged.length },
    { value: "rejected", label: "Rejected", count: all.filter((r) => r.status === "rejected").length },
  ];

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Moderate customer reviews and reply publicly. Negative reviews are answered, never deleted — the reply appears under the review on the storefront."
        breadcrumbs={[{ label: "Customers" }, { label: "Reviews" }]}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Average rating" value={average.toFixed(2)} hint={`${number(all.length)} reviews`} />
        <Stat label="Awaiting moderation" value={number(pending.length)} hint="Not yet visible" />
        <Stat label="Flagged" value={number(flagged.length)} hint="Reported by shoppers" />
        <Stat
          label="Verified purchases"
          value={`${Math.round((all.filter((r) => r.verifiedPurchase).length / Math.max(1, all.length)) * 100)}%`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={tab.value === "all" ? "/admin/reviews" : `/admin/reviews?status=${tab.value}`}
                className={
                  status === tab.value
                    ? "rounded-full border border-ink bg-ink px-3.5 py-1.5 text-[11.5px] font-medium text-inverse"
                    : "rounded-full border border-line px-3.5 py-1.5 text-[11.5px] text-ink-muted transition-colors hover:border-ink/30 hover:text-ink"
                }
              >
                {tab.label}
                <span className="ml-1.5 tabular-nums opacity-70">{tab.count}</span>
              </Link>
            ))}
          </div>

          <Card padded={false}>
            <ul className="divide-y divide-line">
              {filtered.slice(0, 30).map((review) => (
                <li key={review.id} className="p-5">
                  <div className="flex gap-4">
                    <Link
                      href={`/admin/products/${review.productId}`}
                      className="relative h-14 w-11 shrink-0 overflow-hidden rounded-[4px] bg-muted"
                    >
                      {review.productImage && (
                        <Image src={review.productImage} alt="" fill sizes="44px" className="object-cover" />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Rating value={review.rating} size={12} showValue={false} />
                        <span className="text-[12.5px] font-medium text-ink">{review.customerName}</span>
                        {review.verifiedPurchase && (
                          <Badge tone="success" size="xs">
                            <BadgeCheck className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        <Badge
                          tone={
                            review.status === "approved"
                              ? "success"
                              : review.status === "pending"
                                ? "warning"
                                : review.status === "flagged"
                                  ? "danger"
                                  : "neutral"
                          }
                          size="xs"
                        >
                          {review.status}
                        </Badge>
                        <span className="text-[11px] text-ink-muted">{relativeTime(review.createdAt)}</span>
                      </div>

                      <p className="mt-2 text-[13px] font-medium text-ink">{review.title}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{review.body}</p>
                      <p className="mt-2 truncate text-[11.5px] text-ink-muted">On {review.productName}</p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-ink-muted">
                        <span className="flex items-center gap-1.5">
                          <ThumbsUp className="h-3 w-3" />
                          {review.helpfulCount} helpful
                        </span>
                        {review.reportCount > 0 && (
                          <span className="flex items-center gap-1.5 text-danger">
                            <Flag className="h-3 w-3" />
                            {review.reportCount} reports
                          </span>
                        )}
                      </div>

                      {review.merchantReply ? (
                        <div className="mt-3 rounded-[var(--radius-sm)] border-l-2 border-primary bg-muted p-3.5">
                          <p className="text-[11.5px] font-medium text-ink">
                            {review.merchantReply.author} replied · {formatDate(review.merchantReply.createdAt)}
                          </p>
                          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                            {review.merchantReply.body}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {review.status === "pending" && (
                            <>
                              <button type="button" className={buttonClasses("primary", "xs")}>
                                Approve
                              </button>
                              <button type="button" className={buttonClasses("ghost", "xs", false, "text-danger")}>
                                Reject
                              </button>
                            </>
                          )}
                          <button type="button" className={buttonClasses("outline", "xs")}>
                            Reply publicly
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-5 py-14 text-center text-[12.5px] text-ink-muted">
                  No reviews with that status.
                </li>
              )}
            </ul>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="text-[12.5px] font-semibold text-ink">Rating distribution</h2>
            <div className="mt-4 space-y-2">
              {distribution.map((row) => (
                <div key={row.star} className="flex items-center gap-3">
                  <span className="w-8 text-[11.5px] tabular-nums text-ink">{row.star} ★</span>
                  <Progress
                    value={all.length ? (row.count / all.length) * 100 : 0}
                    tone="accent"
                    height={6}
                    className="flex-1"
                  />
                  <span className="w-8 text-right text-[11px] tabular-nums text-ink-muted">{row.count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card tone="muted">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.11em] text-ink">Moderation rules</h2>
            <ul className="mt-2.5 space-y-1.5 text-[12px] text-ink-muted">
              <li>· Only verified purchases can post</li>
              <li>· Auto-approve 4★ and above</li>
              <li>· Hold 1–3★ for a human read</li>
              <li>· Auto-flag after two reports</li>
              <li>· Reviews are never deleted for being negative</li>
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
