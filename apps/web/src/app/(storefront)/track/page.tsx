import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { Container, Rule, Section } from "@obsidian/ui";
import { TrackOrderForm } from "@/components/storefront/track-order-form";
import { getOrderByNumber } from "@obsidian/data";
import { OrderTrackingResult } from "@/components/storefront/order-tracking-result";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Enter an order number to see live delivery progress.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const db = await currentStore();
  const order = orderNumber ? getOrderByNumber(db.store.id, orderNumber) : undefined;

  // Give the demo a real order number to try.
  const sample = db.orders.find((o) => ["shipped", "out_for_delivery", "packed"].includes(o.status));

  return (
    <>
      <div className="border-b border-line bg-ivory">
        <Container className="py-12 sm:py-16">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Order tracking</p>
          <h1 className="mt-3 font-display display-case text-[34px] leading-none text-ink sm:text-[46px]">
            Where is my order?
          </h1>
          <Rule className="mt-5" />
          <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            Enter the order number from your confirmation email. It starts with OD.
          </p>
        </Container>
      </div>

      <Section tone="surface" spacing="default">
        <Container size="narrow">
          <TrackOrderForm
            initialValue={orderNumber ?? ""}
            sampleOrderNumber={sample?.orderNumber}
            notFound={Boolean(orderNumber) && !order}
          />

          {order ? (
            <div className="mt-10">
              <OrderTrackingResult order={order} />
            </div>
          ) : (
            !orderNumber && (
              <div className="mt-10 rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center">
                <PackageSearch className="mx-auto h-7 w-7 text-ink-muted" />
                <p className="mt-4 text-[14px] text-ink">Tracking appears here</p>
                <p className="mt-1.5 text-[12.5px] text-ink-muted">
                  Signed in? Your orders are already listed under Account → Orders.
                </p>
              </div>
            )
          )}
        </Container>
      </Section>
    </>
  );
}
