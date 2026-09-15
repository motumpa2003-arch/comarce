import type { Metadata } from "next";
import { Ruler, ShieldCheck, Undo2 } from "lucide-react";
import { Badge, Card, Container, Section, SectionHeading, TBody, TD, TH, THead, TR, Table } from "@obsidian/ui";
import { ButtonLink } from "@/components/ui/button-link";
import { HubHeader } from "@/components/commerce/hub-header";
import { titleCase } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: "Size & attribute guide",
  description: "How to read every measurement, option and specification in this catalogue.",
};

/** Body measurements are the one thing no attribute definition can supply. */
const BODY_CHART = [
  { size: "XS", chest: "86 – 89", waist: "71 – 74", hip: "89 – 91", inseam: "76" },
  { size: "S", chest: "91 – 96", waist: "76 – 81", hip: "94 – 99", inseam: "78" },
  { size: "M", chest: "99 – 104", waist: "84 – 89", hip: "102 – 107", inseam: "80" },
  { size: "L", chest: "107 – 112", waist: "91 – 97", hip: "109 – 114", inseam: "81" },
  { size: "XL", chest: "114 – 119", waist: "99 – 104", hip: "117 – 122", inseam: "83" },
  { size: "XXL", chest: "122 – 127", waist: "107 – 112", hip: "124 – 130", inseam: "84" },
];

const HOW_TO_MEASURE = [
  {
    title: "Chest",
    body: "Measure around the fullest part, keeping the tape level under the arms and relaxed rather than pulled tight.",
  },
  {
    title: "Waist",
    body: "Measure at the natural waist — the narrowest point, roughly level with the navel — with one finger under the tape.",
  },
  {
    title: "Hip",
    body: "Stand with feet together and measure around the fullest part, usually about twenty centimetres below the waist.",
  },
  {
    title: "Inseam",
    body: "Measure a pair of trousers that already fit, from the crotch seam to the hem, rather than measuring your leg.",
  },
];

export default async function SizeGuidePage() {
  const db = await currentStore();

  // The option tables below are generated from this store's own attribute
  // definitions, so a jewellery tenant gets carat and metal where a fashion
  // tenant gets size and fit — with no per-industry code on this page.
  const optionAttributes = db.attributes
    .filter((a) => a.options?.length && (a.variantDefining || a.filterable))
    .sort((a, b) => a.position - b.position);

  const measured = db.attributes.filter((a) => a.inputType === "number" && a.unit);

  return (
    <>
      <HubHeader
        eyebrow="Measurements & options"
        title="Size"
        accent="guide"
        description="Every option in this catalogue is defined by the merchant, not hard-coded — so this page is generated from the same definitions the product pages use. If an option exists on a product, it is explained here."
        stats={[
          { value: String(optionAttributes.length), label: "Option sets" },
          { value: String(measured.length), label: "Measured fields" },
          { value: "30 days", label: "If it does not fit" },
        ]}
      />

      <Section tone="surface" spacing="default">
        <Container>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <Ruler className="h-4 w-4 text-accent" />
              <h2 className="mt-3 text-[13px] font-medium text-ink">Measured, not estimated</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                Garment measurements on each product page are taken flat from the actual sample in that size, not
                scaled from a base size.
              </p>
            </Card>
            <Card>
              <Undo2 className="h-4 w-4 text-accent" />
              <h2 className="mt-3 text-[13px] font-medium text-ink">Order two sizes</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                Between sizes? Buy both and return the one that does not fit. Return pickup is free and the refund
                starts when it is collected.
              </p>
            </Card>
            <Card>
              <ShieldCheck className="h-4 w-4 text-accent" />
              <h2 className="mt-3 text-[13px] font-medium text-ink">Ask before you buy</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                Every product page has a questions section. Sizing questions are answered by someone who has handled
                the item, usually the same day.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      <Section tone="ivory" spacing="default">
        <Container>
          <SectionHeading
            eyebrow="Apparel"
            title="Body measurements"
            description="All measurements in centimetres. Compare these to your own body, then check the garment measurements on the product page for the fit you want."
          />
          <div className="mt-7 overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>Size</TH>
                  <TH align="right">Chest (cm)</TH>
                  <TH align="right">Waist (cm)</TH>
                  <TH align="right">Hip (cm)</TH>
                  <TH align="right">Inseam (cm)</TH>
                </TR>
              </THead>
              <TBody>
                {BODY_CHART.map((row) => (
                  <TR key={row.size}>
                    <TD className="font-medium text-ink">{row.size}</TD>
                    <TD align="right">{row.chest}</TD>
                    <TD align="right">{row.waist}</TD>
                    <TD align="right">{row.hip}</TD>
                    <TD align="right">{row.inseam}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_TO_MEASURE.map((item) => (
              <div key={item.title}>
                <h3 className="text-[12.5px] font-medium text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface" spacing="default">
        <Container>
          <SectionHeading
            eyebrow="Everything else"
            title="Options in this catalogue"
            description="Generated from the merchant's attribute definitions. These are the exact values you will see in a variant selector or a filter."
          />

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {optionAttributes.map((attribute) => (
              <Card key={attribute.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[13.5px] font-medium text-ink">{attribute.label}</h3>
                  {attribute.variantDefining && (
                    <Badge tone="info" size="xs">
                      Variant
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                  {attribute.industry === "all" ? "Every category" : titleCase(attribute.industry)}
                  {attribute.unit && ` · measured in ${attribute.unit}`}
                </p>
                <ul className="mt-3.5 flex flex-1 flex-wrap gap-1.5">
                  {attribute.options?.slice(0, 14).map((option) => (
                    <li
                      key={option.value}
                      className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[11.5px] text-ink-muted"
                    >
                      {option.swatch && (
                        <span
                          aria-hidden
                          className="h-2.5 w-2.5 rounded-full border border-line"
                          style={{ backgroundColor: option.swatch }}
                        />
                      )}
                      {option.label}
                    </li>
                  ))}
                  {(attribute.options?.length ?? 0) > 14 && (
                    <li className="px-1 py-1 text-[11.5px] text-ink-muted">
                      +{(attribute.options?.length ?? 0) - 14} more
                    </li>
                  )}
                </ul>
              </Card>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/shop">Browse the catalogue</ButtonLink>
            <ButtonLink href="/pages/returns" variant="outline">
              Read the returns policy
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
