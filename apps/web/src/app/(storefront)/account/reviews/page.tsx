import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getCustomerOrders, getDemoCustomer } from "@obsidian/data";
import { Badge, Button, Card, EmptyState, Rating } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { formatDate, relativeTime } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "My reviews" };

export default async function AccountReviewsPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);
  const reviews = db.reviews.filter((r) => r.customerId === customer.id);

  const delivered = getCustomerOrders(db.store.id, customer.id).filter((o) => o.status === "delivered");
  const reviewedProductIds = new Set(reviews.map((r) => r.productId));
  const awaiting = delivered
    .flatMap((order) => order.items)
    .filter((item) => !reviewedProductIds.has(item.productId))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display display-case text-[26px] leading-none text-ink">My reviews</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Reviews you have written, and the products still waiting for one. Each review earns 50 points.
        </p>
      </div>

      {awaiting.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 font-display display-case text-[20px] text-ink">
            <Star className="h-4 w-4 text-accent" />
            Waiting for your review
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {awaiting.map((item) => (
              <Card key={item.id} className="flex items-center gap-4">
                <Link
                  href={`/product/${item.slug}`}
                  className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted"
                >
                  {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2x text-[13px] text-ink">{item.name}</p>
                  <p className="mt-1 text-[11.5px] text-ink-muted">Delivered · earn 50 points</p>
                </div>
                <ButtonLink href={`/product/${item.slug}#reviews`} variant="outline" size="sm" className="shrink-0">
                  Write
                </ButtonLink>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display display-case text-[20px] text-ink">
          Published reviews {reviews.length > 0 && <span className="text-ink-muted">({reviews.length})</span>}
        </h2>

        {reviews.length === 0 ? (
          <EmptyState
            icon={<Star className="h-6 w-6" />}
            eyebrow="Your voice matters"
            title="No reviews yet"
            description="Once you review a delivered product it will appear here, along with the merchant's reply."
            action={<ButtonLink href="/account/orders">See delivered orders</ButtonLink>}
            className="rounded-[var(--radius-card)] border border-dashed border-line"
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} padded={false}>
                <div className="flex gap-4 p-5">
                  <Link
                    href={`/product/${review.productId}`}
                    className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-muted"
                  >
                    {review.productImage && (
                      <Image src={review.productImage} alt="" fill sizes="64px" className="object-cover" />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Rating value={review.rating} size={12} showValue={false} />
                      <Badge
                        tone={review.status === "approved" ? "success" : review.status === "pending" ? "warning" : "danger"}
                        size="xs"
                      >
                        {review.status}
                      </Badge>
                      <span className="text-[11.5px] text-ink-muted">{relativeTime(review.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-[13px] font-medium text-ink">{review.title}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{review.body}</p>
                    <p className="mt-2 truncate text-[11.5px] text-ink-muted">On {review.productName}</p>

                    {review.merchantReply && (
                      <div className="mt-3 rounded-[var(--radius-sm)] border-l-2 border-primary bg-muted p-3.5">
                        <p className="text-[11.5px] font-medium text-ink">
                          {review.merchantReply.author} · {formatDate(review.merchantReply.createdAt)}
                        </p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                          {review.merchantReply.body}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="xs">
                        Edit
                      </Button>
                      <Button variant="ghost" size="xs" className="text-danger">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
