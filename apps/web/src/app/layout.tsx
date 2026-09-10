import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { ToastProvider } from "@obsidian/ui";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif-src",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Obsidian Commerce — commerce infrastructure for modern brands",
    template: "%s · Obsidian Commerce",
  },
  description:
    "A universal, multi-tenant commerce platform: premium storefronts, merchant operations, SaaS administration and mobile commerce on one engine.",
  applicationName: "Obsidian Commerce",
  authors: [{ name: "Obsidian Commerce" }],
  keywords: ["ecommerce", "saas", "multi-tenant", "storefront", "commerce platform"],
};

export const viewport: Viewport = {
  themeColor: "#080908",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
