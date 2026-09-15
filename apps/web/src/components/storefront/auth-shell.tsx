import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container, Rule } from "@obsidian/ui";

/**
 * The split layout every auth page shares: form on the left at a comfortable
 * reading measure, editorial panel on the right that collapses away on mobile
 * rather than pushing the form below the fold.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  image,
  points,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  points: string[];
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-14">
        <div className="mx-auto w-full max-w-md lg:mx-0">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
          <h1 className="mt-3 font-display display-case text-[30px] leading-[1.05] text-ink sm:text-[38px]">
            {title}
          </h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">{subtitle}</p>
          <Rule className="my-7" />
          {children}
          <p className="mt-7 text-center text-[12.5px] text-ink-muted">{footer}</p>
        </div>

        <aside className="relative isolate hidden overflow-hidden rounded-[var(--radius-card)] bg-obsidian p-9 text-inverse lg:flex lg:flex-col lg:justify-end">
          <Image src={image} alt="" fill sizes="420px" className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
          <div className="relative">
            <p className="font-display display-case text-[24px] leading-tight">
              An account that earns its keep.
            </p>
            <ul className="mt-6 space-y-3">
              {points.map((point) => (
                <li key={point} className="flex gap-2.5 text-[12.5px] leading-relaxed text-inverse/75">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-white/15 pt-5 text-[11.5px] leading-relaxed text-inverse/55">
              Browsing without an account works too — your bag, wishlist and history live in this browser until you
              decide to save them. <Link href="/shop" className="text-accent underline-offset-2 hover:underline">Keep
              shopping</Link>.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
