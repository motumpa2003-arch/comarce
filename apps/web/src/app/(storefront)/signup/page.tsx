import type { Metadata } from "next";
import Link from "next/link";
import { EDITORIAL, img } from "@obsidian/data";
import { AuthForm } from "@/components/storefront/auth-form";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create an account to track orders, save a wishlist and earn points.",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Join us"
      title="Create account"
      subtitle="Takes about thirty seconds. No card, no subscription, nothing to cancel."
      image={img(EDITORIAL.heroCouple, 900, 1200)}
      points={[
        "Membership tiers are earned on spend, never paid for",
        "Thirty days to change your mind on almost everything",
        "One address book across web and mobile",
      ]}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
