import { Award, Package, Wallet } from "lucide-react";
import type { Customer } from "@obsidian/commerce";
import { LOYALTY_TIERS } from "@obsidian/data";
import { Avatar, Container } from "@obsidian/ui";
import { formatDate, money, number } from "@/lib/format";

export function AccountHeader({ customer, ordersCount }: { customer: Customer; ordersCount: number }) {
  const tier = LOYALTY_TIERS.find((t) => t.key === customer.loyaltyTier)!;
  const nextTier = LOYALTY_TIERS[LOYALTY_TIERS.indexOf(tier) + 1];
  const toNext = nextTier ? Math.max(0, nextTier.minSpend - customer.lifetimeValue) : 0;

  return (
    <div className="border-b border-line bg-obsidian text-inverse">
      <Container className="py-9 sm:py-11">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar src={customer.avatar} name={`${customer.firstName} ${customer.lastName}`} size={60} />
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">My account</p>
              <h1 className="mt-1.5 font-display text-[28px] leading-none text-inverse sm:text-[34px]">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="mt-2 text-[12px] text-inverse/55">
                {customer.email} · member since {formatDate(customer.createdAt)}
              </p>
            </div>
          </div>

          <dl className="flex flex-wrap gap-x-8 gap-y-4">
            <Metric
              icon={<Package className="h-3.5 w-3.5" />}
              label="Orders"
              value={number(ordersCount)}
            />
            <Metric
              icon={<Award className="h-3.5 w-3.5" />}
              label={`${tier.name} member`}
              value={`${number(customer.loyaltyPoints)} pts`}
              hint={nextTier ? `${money(toNext)} to ${nextTier.name}` : "Top tier"}
            />
            <Metric
              icon={<Wallet className="h-3.5 w-3.5" />}
              label="Store credit"
              value={money(customer.storeCredit)}
            />
          </dl>
        </div>
      </Container>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.14em] text-inverse/50">
        <span className="text-accent">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 font-display text-[22px] leading-none text-inverse">{value}</dd>
      {hint && <p className="mt-1 text-[11px] text-inverse/45">{hint}</p>}
    </div>
  );
}
