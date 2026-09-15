import Link from "next/link";
import { Globe, Leaf, Sparkles, Users } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiApple, SiFacebook, SiGoogleplay, SiInstagram, SiX, SiYoutube } from "react-icons/si";
import { getMenu, type StoreDatabase } from "@obsidian/data";
import { Container } from "@obsidian/ui";
import { NewsletterForm } from "./newsletter-form";

const SOCIALS = [
  { icon: SiInstagram, label: "Instagram", href: "#" },
  { icon: SiFacebook, label: "Facebook", href: "#" },
  { icon: SiYoutube, label: "YouTube", href: "#" },
  { icon: SiX, label: "X", href: "#" },
  { icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
];

const VALUES = [
  { icon: Leaf, title: "Sustainable choices", copy: "For a greener planet" },
  { icon: Globe, title: "Global brands", copy: "From around the world" },
  { icon: Sparkles, title: "Exclusive offers", copy: "For our community" },
  { icon: Users, title: "A growing community", copy: "1M+ happy customers" },
];

export function StorefrontFooter({ db }: { db: StoreDatabase }) {
  const shop = getMenu(db.store.id, "footer_shop");
  const support = getMenu(db.store.id, "footer_support");
  const company = getMenu(db.store.id, "footer_company");

  const columns = [
    { title: "Shop", menu: shop },
    { title: "Customer care", menu: support },
    { title: "Company", menu: company },
  ];

  return (
    <footer className="mt-auto">
      {/* ---------------------------- Newsletter --------------------------- */}
      <div className="border-t border-line bg-ivory">
        <Container className="grid gap-12 py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:py-16">
          <div>
            <h2 className="font-display display-case text-[26px] leading-tight text-ink sm:text-[30px]">
              Stay in the loop
            </h2>
            <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-ink-muted">
              Exclusive offers, new arrivals and the occasional guide worth reading. No more than twice a
              week, and one click to leave.
            </p>
            <NewsletterForm className="mt-6" />
          </div>

          <div>
            <h2 className="font-display display-case text-[26px] leading-tight text-ink sm:text-[30px]">
              Shop on the go
            </h2>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-muted">
              Download the mobile app for order tracking, price-drop alerts and app-only pricing.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <StoreBadge platform="App Store" caption="Download on the" />
              <StoreBadge platform="Google Play" caption="Get it on" />
            </div>
            <p className="mt-4 text-[11.5px] text-ink-muted">
              Use code <span className="font-semibold text-ink">APPONLY18</span> for 18% off your first app
              order.
            </p>
          </div>
        </Container>
      </div>

      {/* ------------------------------ Values ----------------------------- */}
      <div className="border-t border-white/[0.08] bg-primary text-inverse">
        <Container className="grid grid-cols-2 gap-6 py-7 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/40 text-accent">
                <value.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium">{value.title}</p>
                <p className="truncate text-[11px] text-inverse/60">{value.copy}</p>
              </div>
            </div>
          ))}
        </Container>
      </div>

      {/* ------------------------------ Links ------------------------------ */}
      <div className="bg-obsidian text-inverse">
        <Container className="grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.1fr] lg:gap-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border border-accent/40 bg-accent/10 text-[13px] font-semibold text-accent">
                {db.store.logoMark}
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display display-case text-[17px] text-inverse">{db.store.logoText}</span>
                <span className="mt-[3px] text-[8.5px] font-medium uppercase tracking-[0.32em] text-inverse/45">
                  Commerce
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-inverse/60">{db.store.tagline}</p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-inverse/65 transition-colors hover:border-accent/50 hover:text-accent"
                >
                  <social.icon className="h-[15px] w-[15px]" />
                </a>
              ))}
            </div>
            <dl className="mt-7 space-y-1.5 text-[11.5px] text-inverse/55">
              <div className="flex gap-2">
                <dt className="text-inverse/40">Support</dt>
                <dd>{db.store.supportEmail}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-inverse/40">Phone</dt>
                <dd>{db.store.supportPhone}</dd>
              </div>
            </dl>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-accent">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.menu?.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="text-[12.5px] text-inverse/65 transition-colors hover:text-inverse"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl"
            />
            <p className="relative font-display text-[24px] leading-[1.15] text-inverse">
              A more
              <br />
              <span className="italic text-accent">meaningful</span>
              <br />
              tomorrow.
            </p>
            <p className="relative mt-4 text-[11.5px] leading-relaxed text-inverse/55">
              Built on Obsidian Commerce — the universal storefront, operations and SaaS platform.
            </p>
            <Link
              href="/platform"
              className="relative mt-5 inline-block text-[10.5px] font-semibold uppercase tracking-[0.14em] text-accent underline underline-offset-4"
            >
              Explore the platform
            </Link>
          </div>
        </Container>

        <div className="border-t border-white/[0.08]">
          <Container className="flex flex-col items-center justify-between gap-4 py-5 text-[11.5px] text-inverse/50 sm:flex-row">
            <p>© 2026 {db.store.name}. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/pages/privacy" className="transition-colors hover:text-inverse">
                Privacy policy
              </Link>
              <Link href="/pages/terms" className="transition-colors hover:text-inverse">
                Terms of service
              </Link>
              <Link href="/pages/shipping" className="transition-colors hover:text-inverse">
                Shipping
              </Link>
              <span className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-white/10 px-2.5 py-1">
                🇮🇳 India (INR ₹)
              </span>
            </div>
          </Container>
        </div>
      </div>
    </footer>
  );
}

function StoreBadge({ platform, caption }: { platform: "App Store" | "Google Play"; caption: string }) {
  const Icon = platform === "App Store" ? SiApple : SiGoogleplay;
  return (
    <span className="flex h-12 items-center gap-3 rounded-[var(--radius-md)] bg-obsidian px-4 text-inverse">
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex flex-col leading-tight">
        <span className="text-[8.5px] uppercase tracking-[0.14em] text-inverse/55">{caption}</span>
        <span className="text-[13px] font-medium">{platform}</span>
      </span>
    </span>
  );
}
