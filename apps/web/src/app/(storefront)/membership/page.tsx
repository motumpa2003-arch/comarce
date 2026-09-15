import type { Metadata } from "next";
import { ArrowRight, Check, Crown, Gift, Sparkles, Truck } from "lucide-react";
import { EDITORIAL, LOYALTY_TIERS, img } from "@obsidian/data";
import { Badge, Card, Container, Rule, Section, SectionHeading, cn } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { HubHeader } from "@/components/commerce/hub-header";
import { money } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Membership",
  description: "Four tiers, earned on what you spend — no annual fee, no subscription.",
};

const FAQS = [
  {
    q: "Does membership cost anything?",
    a: "No. Tiers are earned on what you spend in a rolling twelve-month window. There is no fee, no subscription and nothing to cancel.",
  },
  {
    q: "When does my tier update?",
    a: "Immediately after an order is delivered. If a rolling twelve-month total drops below a threshold you keep the tier until the end of that calendar quarter.",
  },
  {
    q: "What are points worth?",
    a: "One hundred points is ₹100 off, applied at checkout in multiples of one hundred. Points never expire while your account is active.",
  },
  {
    q: "Do returns take points back?",
    a: "Yes — points earned on a returned item are reversed when the refund is issued. Points already spent are never clawed back.",
  },
];

export default async function MembershipPage() {
  const db = await currentStore();
  const tiers = LOYALTY_TIERS;

  return (
    <>
      <HubHeader
        eyebrow="No fee, no subscription"
        title="Membership"
        tone="obsidian"
        image={img(EDITORIAL.heroWoman, 1900, 900)}
        description="Four tiers, earned on what you actually spend rather than paid for up front. Points accrue on every delivered order and come off your next one."
        stats={[
          { value: String(tiers.length), label: "Tiers" },
          { value: "2×", label: "Top multiplier" },
          { value: "₹0", label: "Cost to join" },
        ]}
      />

      <Section tone="surface" spacing="default">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Spend, earn, redeem"
            description="No hidden mechanics: the multiplier on your tier is applied to the order value, and the resulting points come off a future order at a fixed rate."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Sparkles className="h-4 w-4 text-accent" />,
                title: "Earn on delivery",
                body: "Points land when an order is delivered, not when it is placed — so a cancelled order never inflates a balance.",
              },
              {
                icon: <Gift className="h-4 w-4 text-accent" />,
                title: "Redeem in hundreds",
                body: "100 points is ₹100 off. Apply them at checkout alongside a coupon; the two stack.",
              },
              {
                icon: <Truck className="h-4 w-4 text-accent" />,
                title: "Perks apply instantly",
                body: "Free shipping and an extended returns window take effect the moment you reach a tier.",
              },
            ].map((step) => (
              <Card key={step.title}>
                {step.icon}
                <h3 className="mt-3 text-[13px] font-medium text-ink">{step.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{step.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="ivory" spacing="default">
        <Container>
          <SectionHeading eyebrow="The tiers" title="Where you land" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tiers.map((tier, index) => {
              const top = index === tiers.length - 1;
              return (
                <Card
                  key={tier.key}
                  className={cn("flex flex-col", top && "border-accent ring-1 ring-accent")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full"
                      style={{ backgroundColor: `${tier.color}22`, color: tier.color }}
                    >
                      <Crown className="h-4 w-4" />
                    </span>
                    {top && (
                      <Badge tone="accent" size="xs">
                        Invitation only
                      </Badge>
                    )}
                  </div>

                  <h3 className="mt-4 font-display display-case text-[22px] leading-none text-ink">{tier.name}</h3>
                  <p className="mt-2 text-[12px] text-ink-muted">
                    {tier.minSpend === 0
                      ? "From your first order"
                      : `From ${money(tier.minSpend)} in 12 months`}
                  </p>

                  <p className="mt-4 text-[13px] font-medium text-ink">
                    {tier.pointsMultiplier}× points
                  </p>

                  <Rule className="my-4" />

                  <ul className="flex-1 space-y-2">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex gap-2 text-[12px] leading-relaxed text-ink-muted">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>

          <p className="mt-6 text-[12px] text-ink-muted">
            Thresholds are measured on delivered order value over a rolling twelve months, excluding shipping and any
            amount paid with store credit.
          </p>
        </Container>
      </Section>

      <Section tone="surface" spacing="default">
        <Container size="narrow">
          <SectionHeading eyebrow="Questions" title="Before you join" size="sm" />
          <dl className="mt-7 divide-y divide-line border-y border-line">
            {FAQS.map((faq) => (
              <div key={faq.q} className="py-5">
                <dt className="text-[13.5px] font-medium text-ink">{faq.q}</dt>
                <dd className="mt-2 text-[13px] leading-relaxed text-ink-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/account/rewards">
              View my rewards
              <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
            <ButtonLink href="/shop" variant="outline">
              Start earning
            </ButtonLink>
          </div>

          <p className="mt-6 text-[11.5px] text-ink-muted">
            Questions we have not covered? {db.store.supportEmail} reaches a person within four working hours.
          </p>
        </Container>
      </Section>
    </>
  );
}
