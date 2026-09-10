import type { Metadata } from "next";
import { getCustomerOrders, getDemoCustomer } from "@obsidian/data";
import { Container, Section } from "@obsidian/ui";
import { AccountNav } from "@/components/account/account-nav";
import { AccountHeader } from "@/components/account/account-header";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s · My account" },
  robots: { index: false },
};

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);
  const orders = getCustomerOrders(db.store.id, customer.id);

  const openReturns = db.returns.filter(
    (r) => r.customerId === customer.id && r.status !== "completed",
  ).length;

  return (
    <>
      <AccountHeader customer={customer} ordersCount={orders.length} />

      <Section tone="surface" spacing="none" className="py-8 sm:py-10">
        <Container>
          <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-12">
            <AccountNav
              counts={{
                orders: orders.length,
                returns: openReturns,
                addresses: customer.addresses.length,
                points: customer.loyaltyPoints,
              }}
            />
            <div className="min-w-0 pt-8 lg:pt-0">{children}</div>
          </div>
        </Container>
      </Section>
    </>
  );
}
