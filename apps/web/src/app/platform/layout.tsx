import type { Metadata } from "next";
import Link from "next/link";
import { getPlatformUsers } from "@obsidian/data";
import { Avatar } from "@obsidian/ui";
import { PlatformNav } from "@/components/platform/platform-nav";

export const metadata: Metadata = {
  title: { default: "Platform console", template: "%s · Obsidian Platform" },
  robots: { index: false, follow: false },
};

/**
 * The platform console runs its own palette — darker, denser, unmistakably
 * "operator" rather than "merchant", so nobody confuses the two contexts.
 */
const PLATFORM_THEME: React.CSSProperties = {
  "--c-obsidian": "#07090C",
  "--c-primary": "#1F5F8B",
  "--c-primary-hover": "#2A76A8",
  "--c-accent": "#C9A227",
  "--c-ivory": "#F5F7F9",
  "--c-surface": "#FFFFFF",
  "--c-surface-muted": "#F4F6F8",
  "--c-border": "#DEE3E8",
  "--c-text": "#0F1519",
  "--c-text-muted": "#657381",
  "--c-text-inverse": "#EEF2F5",
  "--radius-sm": "5px",
  "--radius-md": "7px",
  "--radius-lg": "12px",
  "--radius-button": "6px",
  "--radius-card": "9px",
  "--font-display-transform": "none",
  "--font-display-tracking": "-0.01em",
  "--font-display-weight": "600",
  "--font-display-family": "var(--stack-body)",
  "--font-base-size": "14px",
} as React.CSSProperties;

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const operator = getPlatformUsers().find((user) => user.type === "platform")!;

  return (
    <div style={PLATFORM_THEME} className="min-h-screen bg-muted">
      <header className="border-b border-white/[0.08] bg-obsidian text-inverse">
        <div className="mx-auto flex h-14 max-w-[1680px] items-center gap-4 px-4 lg:px-8">
          <Link href="/platform" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-accent/40 bg-accent/10 text-[11px] font-bold text-accent">
              OB
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[13px] font-semibold">Obsidian Platform</span>
              <span className="mt-0.5 text-[9.5px] uppercase tracking-[0.18em] text-inverse/45">
                Operator console
              </span>
            </span>
          </Link>

          <PlatformNav />

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <Link
              href="/admin"
              className="hidden text-[11.5px] text-inverse/60 transition-colors hover:text-inverse sm:block"
            >
              Merchant admin
            </Link>
            <Link href="/" className="hidden text-[11.5px] text-inverse/60 transition-colors hover:text-inverse sm:block">
              Storefront
            </Link>
            <span className="flex items-center gap-2.5 border-l border-white/[0.1] pl-3">
              <Avatar src={operator.avatar} name={operator.name} size={28} />
              <span className="hidden flex-col leading-none lg:flex">
                <span className="text-[12px]">{operator.name}</span>
                <span className="mt-0.5 text-[10px] text-inverse/45">{operator.email}</span>
              </span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1680px] px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
