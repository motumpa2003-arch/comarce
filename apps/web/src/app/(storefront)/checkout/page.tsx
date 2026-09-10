import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Container } from "@obsidian/ui";
import { CheckoutFlow } from "@/components/storefront/checkout-flow";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Secure checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);

  return (
    <div className="min-h-screen bg-surface">
      {/* Checkout uses a stripped header: no nav, no distractions. */}
      <div className="border-b border-line">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-accent/50 bg-accent/10 text-[12px] font-semibold text-accent">
              {db.store.logoMark}
            </span>
            <span className="font-display display-case text-[16px] text-ink">{db.store.logoText}</span>
          </Link>
          <p className="flex items-center gap-1.5 text-[11.5px] text-ink-muted">
            <Lock className="h-3.5 w-3.5 text-primary" />
            Secure checkout
          </p>
        </Container>
      </div>

      <Container className="py-8 sm:py-12">
        <CheckoutFlow
          customer={{
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            storeCredit: customer.storeCredit,
            loyaltyPoints: customer.loyaltyPoints,
            addresses: customer.addresses,
          }}
        />
      </Container>
    </div>
  );
}
