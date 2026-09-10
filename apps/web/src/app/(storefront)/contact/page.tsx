import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Card, Container, Rule, Section } from "@obsidian/ui";
import { ContactForm } from "@/components/storefront/contact-form";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Reach the support team by chat, email or phone.",
};

export default async function ContactPage() {
  const db = await currentStore();

  return (
    <>
      <div className="border-b border-line bg-ivory">
        <Container className="py-12 sm:py-16">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent">Contact</p>
          <h1 className="mt-3 font-display display-case text-[34px] leading-none text-ink sm:text-[46px]">
            Talk to a person
          </h1>
          <Rule className="mt-5" />
          <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
            No ticket-number maze. Tell us what happened and we will pick it up — usually within four working hours.
          </p>
        </Container>
      </div>

      <Section tone="surface" spacing="default">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
            <ContactForm />

            <aside className="space-y-4">
              <Card>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Reach us directly</h3>
                <ul className="mt-4 space-y-4">
                  <ContactRow
                    icon={<MessageCircle className="h-4 w-4" />}
                    label="Live chat"
                    value="9 AM – 9 PM IST, every day"
                  />
                  <ContactRow icon={<Mail className="h-4 w-4" />} label="Email" value={db.store.supportEmail} />
                  <ContactRow icon={<Phone className="h-4 w-4" />} label="Phone" value={db.store.supportPhone} />
                  <ContactRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Response time"
                    value="Under 4 working hours"
                  />
                </ul>
              </Card>

              <Card>
                <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                  <MapPin className="h-3.5 w-3.5" />
                  Registered office
                </h3>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">
                  {db.store.name}
                  <br />
                  Plot 42, Industrial Area Phase II
                  <br />
                  Bengaluru, Karnataka 560058
                  <br />
                  India
                </p>
                <p className="mt-3 text-[11.5px] text-ink-muted">GSTIN 29ABCDE1234F1Z5</p>
              </Card>

              <Card tone="muted">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                  Faster than writing in
                </h3>
                <ul className="mt-3 space-y-2 text-[12.5px] text-ink-muted">
                  <li>· Track an order from Account → Orders</li>
                  <li>· Start a return in two taps from the order page</li>
                  <li>· Download a GST invoice from any order</li>
                  <li>· Change a delivery address before dispatch</li>
                </ul>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] uppercase tracking-[0.1em] text-ink-muted">{label}</span>
        <span className="mt-0.5 block truncate text-[13px] text-ink">{value}</span>
      </span>
    </li>
  );
}
