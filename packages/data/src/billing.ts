import type { Money, Subscription } from "@obsidian/commerce";

/** Statuses that are actually producing recurring revenue right now. */
const BILLING_STATUSES = new Set(["active", "trialing"]);

/**
 * Monthly recurring revenue for one subscription, in minor units.
 *
 * Dividing an annual amount by twelve lands on fractions of a paisa, which then
 * surface on KPI cards as `₹1,249.17`. Nobody prices a plan that way, so snap
 * the monthly equivalent to a whole rupee. Doing it here — rather than at each
 * call site — is what keeps the plan table, the KPI cards and the platform
 * overview agreeing on a single number.
 */
export function monthlyMrr(subscription: Pick<Subscription, "amount" | "interval">): Money {
  if (subscription.interval !== "annual") return subscription.amount;
  return Math.round(subscription.amount / 12 / 100) * 100;
}

/** Whether a subscription contributes to MRR. */
export function isBilling(subscription: Pick<Subscription, "status">): boolean {
  return BILLING_STATUSES.has(subscription.status);
}

/** Summed MRR across every billing subscription in the set. */
export function aggregateMrr(subscriptions: Pick<Subscription, "amount" | "interval" | "status">[]): Money {
  return subscriptions.filter(isBilling).reduce((total, subscription) => total + monthlyMrr(subscription), 0);
}
