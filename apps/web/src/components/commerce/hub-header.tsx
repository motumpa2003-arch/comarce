import Image from "next/image";
import { Container, Rule } from "@obsidian/ui";

/**
 * The masthead every discovery hub shares — new arrivals, bestsellers,
 * trending, gift guide and so on. They differ only in copy, art and the
 * pre-applied query, so the chrome is defined once and the pages stay thin.
 */
export function HubHeader({
  eyebrow,
  title,
  accent,
  description,
  image,
  stats,
  tone = "ivory",
  children,
}: {
  eyebrow: string;
  title: string;
  /** Rendered in the accent colour after the title. */
  accent?: string;
  description: string;
  image?: string;
  stats?: { value: string; label: string }[];
  tone?: "ivory" | "obsidian";
  children?: React.ReactNode;
}) {
  const dark = tone === "obsidian";

  return (
    <div
      className={
        dark
          ? "relative isolate overflow-hidden bg-obsidian text-inverse"
          : "border-b border-line bg-ivory"
      }
    >
      {dark && image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/80 to-obsidian/30" />
        </>
      )}

      <Container className={dark ? "relative py-14 sm:py-20" : "py-10 sm:py-14"}>
        <p
          className={
            dark
              ? "text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent"
              : "text-[10.5px] font-medium uppercase tracking-[0.24em] text-accent"
          }
        >
          {eyebrow}
        </p>
        <h1
          className={
            dark
              ? "mt-4 font-display display-case text-[clamp(32px,5.5vw,58px)] leading-[1.02] text-inverse"
              : "mt-3 font-display display-case text-[clamp(30px,4.5vw,46px)] leading-[1.03] text-ink"
          }
        >
          {title}
          {accent && <span className="text-accent"> {accent}</span>}
        </h1>
        <Rule className={dark ? "mt-6" : "mt-5"} />
        <p
          className={
            dark
              ? "mt-5 max-w-xl text-[14px] leading-relaxed text-inverse/70"
              : "mt-5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted"
          }
        >
          {description}
        </p>

        {stats && stats.length > 0 && (
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt
                  className={
                    dark
                      ? "text-[10px] uppercase tracking-[0.14em] text-inverse/50"
                      : "text-[10px] uppercase tracking-[0.14em] text-ink-muted"
                  }
                >
                  {stat.label}
                </dt>
                <dd
                  className={
                    dark
                      ? "mt-1 font-display text-[22px] leading-none text-accent"
                      : "mt-1 font-display text-[22px] leading-none text-ink"
                  }
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {children}
      </Container>
    </div>
  );
}
