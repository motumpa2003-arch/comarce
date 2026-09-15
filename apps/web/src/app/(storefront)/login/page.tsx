import type { Metadata } from "next";
import Link from "next/link";
import { EDITORIAL, img } from "@obsidian/data";
import { AuthForm } from "@/components/storefront/auth-form";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to track orders, manage returns and spend your points.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Your bag, wishlist and addresses are waiting where you left them."
      image={img(EDITORIAL.heroFashion, 900, 1200)}
      points={[
        "Track every order and start a return in two taps",
        "Points accrue on delivery and come off your next order",
        "Addresses and preferences follow you to every device",
      ]}
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-2 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
