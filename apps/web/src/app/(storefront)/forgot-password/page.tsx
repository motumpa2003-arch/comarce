import type { Metadata } from "next";
import Link from "next/link";
import { EDITORIAL, img } from "@obsidian/data";
import { AuthForm } from "@/components/storefront/auth-form";
import { AuthShell } from "@/components/storefront/auth-shell";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Send yourself a password reset link.",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      title="Forgot your password?"
      subtitle="Enter the email on your account and we will send a link that expires in thirty minutes."
      image={img(EDITORIAL.heroStreet, 900, 1200)}
      points={[
        "Reset links are single-use and expire in thirty minutes",
        "We never confirm whether an address is registered",
        "Changing your password signs out every other device",
      ]}
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <AuthForm mode="forgot" />
    </AuthShell>
  );
}
