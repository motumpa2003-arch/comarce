import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Accordion, Card, Container, Rule, Section } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers on delivery, returns, payments, products and rewards.",
};

export default async function FaqPage() {
  const db = await currentStore();

  const grouped = new Map<string, typeof db.faqs>();
  for (const faq of db.faqs) {
    grouped.set(faq.category, [...(grouped.get(faq.category) ?? []), faq]);
  }

  return (
    <>
      <div className="border-b border-line bg-ivory">
        <Container className="py-12 sm:py-16">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Help centre</p>
          <h1 className="mt-3 font-display display-case text-[34px] leading-none text-ink sm:text-[46px]">
            Frequently asked
          </h1>
          <Rule className="mt-5" />
          <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            The questions our support team gets most, answered properly. If yours is not here, we reply within four
            working hours.
          </p>
        </Container>
      </div>

      <Section tone="surface" spacing="default">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
            <div className="space-y-10">
              {[...grouped.entries()].map(([category, faqs]) => (
                <section key={category} id={category.toLowerCase()}>
                  <h2 className="mb-4 font-display display-case text-[22px] text-ink">{category}</h2>
                  <Accordion
                    items={faqs.map((faq) => ({
                      id: faq.id,
                      title: faq.question,
                      content: faq.answer,
                    }))}
                    defaultOpen={[faqs[0]!.id]}
                  />
                </section>
              ))}
            </div>

            <aside className="lg:sticky lg:top-[180px] lg:self-start">
              <Card>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <h3 className="mt-4 font-display text-[19px] text-ink">Still stuck?</h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
                  Our support team is on live chat 9 AM to 9 PM IST, and answers email within four working hours.
                </p>
                <ButtonLink href="/contact" fullWidth className="mt-5">
                  Contact support
                </ButtonLink>
                <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[12px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Email</dt>
                    <dd className="truncate text-ink">{db.store.supportEmail}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Phone</dt>
                    <dd className="text-ink">{db.store.supportPhone}</dd>
                  </div>
                </dl>
              </Card>

              <Card className="mt-4">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Jump to</h3>
                <ul className="mt-3 space-y-1.5">
                  {[...grouped.keys()].map((category) => (
                    <li key={category}>
                      <Link
                        href={`#${category.toLowerCase()}`}
                        className="text-[12.5px] text-ink-muted transition-colors hover:text-ink"
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
