import type { Metadata } from "next";
import { Clock, Gift, Mail, ShieldCheck } from "lucide-react";
import { Accordion, Card, Container, Rule, Section, SectionHeading } from "@obsidian/ui";
import { GiftCardPicker } from "@/components/storefront/gift-card-picker";

export const metadata: Metadata = {
  title: "Gift cards",
  description: "Digital gift cards from ₹500 to ₹10,000, delivered instantly and valid for two years.",
};

const FAQS = [
  {
    id: "gc-1",
    title: "How is the gift card delivered?",
    content:
      "By email, within a few minutes of the order being confirmed. You can also schedule it for a future date at checkout.",
  },
  {
    id: "gc-2",
    title: "How long is it valid?",
    content: "Two years from the date of issue. The balance never reduces on its own and there are no fees.",
  },
  {
    id: "gc-3",
    title: "Can it be used across categories?",
    content:
      "Yes — a gift card works on everything in the catalogue, and can be combined with coupon codes and loyalty points.",
  },
  {
    id: "gc-4",
    title: "What if the balance is more than my order?",
    content: "The remaining balance stays on the card and applies automatically to your next order.",
  },
  {
    id: "gc-5",
    title: "Can I get a refund on a gift card?",
    content:
      "Unused gift cards can be refunded within 14 days of purchase. Once part of the balance is spent it becomes non-refundable.",
  },
];

export default function GiftCardsPage() {
  return (
    <>
      <div className="relative isolate overflow-hidden bg-primary text-inverse">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
        />
        <Container className="relative py-14 sm:py-20">
          <p className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">
            <Gift className="h-3.5 w-3.5" />
            Gift cards
          </p>
          <h1 className="mt-4 max-w-xl font-display display-case text-[clamp(32px,5.5vw,54px)] leading-[1.04] text-inverse">
            Give something they will actually choose
          </h1>
          <Rule className="mt-6" />
          <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-inverse/75">
            Delivered by email in minutes, valid for two years across every category, and usable alongside coupons and
            loyalty points.
          </p>
          <ul className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
            {[
              { icon: Mail, label: "Instant email delivery" },
              { icon: Clock, label: "Valid for 24 months" },
              { icon: ShieldCheck, label: "No fees, ever" },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-[12.5px] text-inverse/70">
                <item.icon className="h-4 w-4 text-accent" />
                {item.label}
              </li>
            ))}
          </ul>
        </Container>
      </div>

      <Section tone="surface" spacing="default">
        <Container>
          <GiftCardPicker />
        </Container>
      </Section>

      <Section tone="muted" spacing="default">
        <Container size="narrow">
          <SectionHeading eyebrow="Good to know" title="Gift card questions" size="sm" />
          <Accordion className="mt-7" items={FAQS} defaultOpen={["gc-1"]} />
          <Card className="mt-8" tone="obsidian">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">Corporate gifting</p>
            <p className="mt-2 text-[13px] leading-relaxed text-inverse/70">
              Buying more than fifty cards? We handle bulk issue, custom branding and consolidated GST invoicing.
              Write to us and we will set it up within two working days.
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
