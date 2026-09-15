import type { Metadata } from "next";
import { Clock, MapPin, Package, Phone, Store, Truck } from "lucide-react";
import { Badge, Card, Container, Rule, Section, SectionHeading } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { HubHeader } from "@/components/commerce/hub-header";
import { number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Store locator",
  description: "Find a location near you for pickup, returns and same-day dispatch.",
};

const TYPE_LABEL: Record<string, string> = {
  retail_store: "Retail store",
  warehouse: "Fulfilment centre",
  dropship: "Partner dropship",
  "3pl": "Third-party logistics",
};

const HOURS: Record<string, string> = {
  retail_store: "10:00 – 21:00, seven days",
  warehouse: "Dispatch 06:00 – 22:00",
  dropship: "Partner hours",
  "3pl": "24 hours",
};

export default async function StoreLocatorPage() {
  const db = await currentStore();
  const locations = db.warehouses.filter((w) => w.status === "active");

  const pickup = locations.filter((w) => w.supportsPickup);
  const cities = [...new Set(locations.map((w) => w.address.city))].sort();

  // Group by state so the list reads as a map would, not as a flat dump.
  const byState = new Map<string, typeof locations>();
  for (const location of locations) {
    const list = byState.get(location.address.state) ?? [];
    list.push(location);
    byState.set(location.address.state, list);
  }
  const states = [...byState.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <HubHeader
        eyebrow="Find us"
        title="Store locator"
        description={`${number(locations.length)} active locations across ${number(cities.length)} cities. Pickup points let you collect an order the same day and hand back a return without printing anything.`}
        stats={[
          { value: number(locations.length), label: "Locations" },
          { value: number(pickup.length), label: "Pickup points" },
          { value: number(cities.length), label: "Cities" },
        ]}
      />

      <Section tone="surface" spacing="default">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <Package className="h-4 w-4 text-accent" />
              <h2 className="mt-3 text-[13px] font-medium text-ink">Collect in store</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                Choose a pickup point at checkout. Orders placed before 4 PM are ready the same evening, and we hold
                them for seven days.
              </p>
            </Card>
            <Card>
              <Truck className="h-4 w-4 text-accent" />
              <h2 className="mt-3 text-[13px] font-medium text-ink">Same-day dispatch</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                We ship from whichever fulfilment centre is nearest your pincode, which is what keeps metro delivery
                inside a day.
              </p>
            </Card>
            <Card>
              <Store className="h-4 w-4 text-accent" />
              <h2 className="mt-3 text-[13px] font-medium text-ink">Returns without a printer</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                Bring the item and your order number to any pickup point. No packaging, no label, refund starts the
                moment it is scanned.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {states.map(([state, list], index) => (
        <Section key={state} tone={index % 2 === 0 ? "ivory" : "surface"} spacing="default">
          <Container>
            <SectionHeading
              eyebrow={`${list.length} location${list.length === 1 ? "" : "s"}`}
              title={state}
              size="sm"
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((location) => (
                <Card key={location.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[13.5px] font-medium text-ink">{location.name}</h3>
                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                        {TYPE_LABEL[location.type] ?? location.type}
                      </p>
                    </div>
                    {location.supportsPickup && (
                      <Badge tone="success" size="xs">
                        Pickup
                      </Badge>
                    )}
                  </div>

                  <Rule className="my-3.5" />

                  <address className="flex-1 space-y-2 not-italic text-[12.5px] leading-relaxed text-ink-muted">
                    <span className="flex gap-2">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {location.address.line1}
                        <br />
                        {location.address.city}, {location.address.state} {location.address.postalCode}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {HOURS[location.type] ?? "By appointment"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {db.store.supportPhone}
                    </span>
                  </address>

                  <p className="mt-3.5 border-t border-line pt-3 text-[11.5px] text-ink-muted">
                    Code <span className="font-medium text-ink">{location.code}</span>
                    {location.fulfilsOnline && " · fulfils online orders"}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      ))}

      <Section tone="obsidian" spacing="default">
        <Container className="text-center">
          <h2 className="font-display display-case text-[26px] leading-tight text-inverse sm:text-[32px]">
            Not near any of these?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-inverse/70">
            We deliver to more than 19,000 pincodes. Enter yours on any product page to see the exact delivery window
            before you buy.
          </p>
          <ButtonLink href="/shop" variant="accent" className="mt-7">
            Start shopping
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
