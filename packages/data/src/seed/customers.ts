import type { Address, Customer, CustomerSegmentKey, LoyaltyTier, LoyaltyTierKey } from "@obsidian/commerce";
import { major } from "@obsidian/commerce";
import { PORTRAITS, avatarImg } from "../images";
import { Rng, slugify } from "../rng";
import { APARTMENTS, CITIES, EMAIL_DOMAINS, FIRST_NAMES, LANDMARKS, LAST_NAMES, NOTE_SNIPPETS, STREETS } from "./people";

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    key: "member",
    name: "Member",
    minSpend: 0,
    pointsMultiplier: 1,
    perks: ["1 point per ₹100 spent", "Birthday voucher", "Early access to sales"],
    color: "#8A8D88",
  },
  {
    key: "silver",
    name: "Silver",
    minSpend: major(25000),
    pointsMultiplier: 1.25,
    perks: ["1.25× points", "Free standard shipping", "Priority support queue"],
    color: "#B8BCC0",
  },
  {
    key: "gold",
    name: "Gold",
    minSpend: major(75000),
    pointsMultiplier: 1.5,
    perks: ["1.5× points", "Free express shipping", "Extended 60-day returns", "Early drops"],
    color: "#C9A227",
  },
  {
    key: "black",
    name: "Black",
    minSpend: major(200000),
    pointsMultiplier: 2,
    perks: ["2× points", "Dedicated concierge", "Free same-day in metros", "Invite-only releases"],
    color: "#080908",
  },
];

export function tierForSpend(spend: number): LoyaltyTierKey {
  return [...LOYALTY_TIERS].reverse().find((t) => spend >= t.minSpend)?.key ?? "member";
}

export function buildAddress(rng: Rng, customerId: string | undefined, index: number, firstName: string, lastName: string): Address {
  const city = rng.pick(CITIES);
  const label = index === 0 ? "home" : index === 1 ? "work" : "other";
  return {
    id: `addr_${customerId ?? "guest"}_${index}`,
    customerId,
    label,
    firstName,
    lastName,
    phone: `+91 ${rng.int(70000, 99999)} ${rng.int(10000, 99999)}`,
    line1: `${rng.int(1, 240)}, ${rng.pick(APARTMENTS)}`,
    line2: `${rng.pick(STREETS)}`,
    landmark: rng.pick(LANDMARKS),
    city: city.city,
    state: city.state,
    postalCode: rng.pick(city.pincodes),
    country: "India",
    isDefaultShipping: index === 0,
    isDefaultBilling: index === 0,
  };
}

export interface BuildCustomersInput {
  storeId: string;
  count: number;
  referenceDate: Date;
}

export function buildCustomers({ storeId, count, referenceDate }: BuildCustomersInput): Customer[] {
  const rng = new Rng(`${storeId}:customers`);
  const customers: Customer[] = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < count; i++) {
    const firstName = rng.pick(FIRST_NAMES);
    const lastName = rng.pick(LAST_NAMES);
    const id = `cus_${storeId}_${String(i + 1).padStart(4, "0")}`;

    let email = `${slugify(firstName)}.${slugify(lastName)}@${rng.pick(EMAIL_DOMAINS)}`;
    if (usedEmails.has(email)) email = `${slugify(firstName)}.${slugify(lastName)}${i}@${rng.pick(EMAIL_DOMAINS)}`;
    usedEmails.add(email);

    // Behaviour mix from the seed spec: 20% new, 50% repeat, 20% VIP, 10% inactive.
    const behaviour = rng.weighted<"new" | "repeat" | "vip" | "inactive">([
      ["new", 20],
      ["repeat", 50],
      ["vip", 20],
      ["inactive", 10],
    ]);

    const ordersCount =
      behaviour === "new" ? rng.int(0, 1)
      : behaviour === "repeat" ? rng.int(2, 9)
      : behaviour === "vip" ? rng.int(10, 34)
      : rng.int(1, 3);

    const averageOrderValue = major(
      behaviour === "vip" ? rng.int(4200, 24000) : rng.int(700, 6500),
    );
    const lifetimeValue = ordersCount * averageOrderValue;

    const createdAt = rng.pastDate(referenceDate, behaviour === "new" ? 1 : 40, behaviour === "vip" ? 900 : 620);
    const lastOrderAt =
      ordersCount > 0
        ? rng.pastDate(referenceDate, behaviour === "inactive" ? 180 : 1, behaviour === "inactive" ? 420 : 60)
        : undefined;
    const firstOrderAt = ordersCount > 0 ? new Date(createdAt.getTime() + 86400000 * rng.int(0, 12)) : undefined;

    const segments: CustomerSegmentKey[] = [];
    if (behaviour === "new") segments.push("new");
    if (behaviour === "repeat") segments.push("repeat");
    if (behaviour === "vip") segments.push("vip", "high_value", "repeat");
    if (behaviour === "inactive") segments.push("inactive");
    if (lifetimeValue > major(60000) && !segments.includes("high_value")) segments.push("high_value");
    if (behaviour === "repeat" && rng.bool(0.25)) segments.push("at_risk");
    if (rng.bool(0.22)) segments.push("coupon_led");

    const addressCount = behaviour === "vip" ? rng.int(2, 3) : rng.int(1, 2);
    const addresses = Array.from({ length: addressCount }, (_, index) =>
      buildAddress(rng, id, index, firstName, lastName),
    );

    const loyaltyTier = tierForSpend(lifetimeValue);
    const tierMeta = LOYALTY_TIERS.find((t) => t.key === loyaltyTier)!;

    customers.push({
      id,
      storeId,
      firstName,
      lastName,
      email,
      phone: `+91 ${rng.int(70000, 99999)} ${rng.int(10000, 99999)}`,
      avatar: avatarImg(PORTRAITS[i % PORTRAITS.length]!, 160),
      gender: rng.weighted([["male", 45], ["female", 45], ["other", 4], ["undisclosed", 6]]),
      dateOfBirth: rng.pastDate(referenceDate, 6570, 19000).toISOString(),
      addresses,
      tags: rng.sample(["newsletter", "app-user", "gift-buyer", "corporate", "referral", "wholesale"], rng.int(0, 3)),
      segments,
      marketingOptIn: rng.bool(0.72),
      notes: rng.bool(0.25) ? rng.pick(NOTE_SNIPPETS) : undefined,
      ordersCount,
      lifetimeValue,
      averageOrderValue,
      refundedAmount: rng.bool(0.2) ? major(rng.int(300, 4000)) : 0,
      loyaltyTier,
      loyaltyPoints: Math.round((lifetimeValue / major(100)) * tierMeta.pointsMultiplier),
      storeCredit: rng.bool(0.18) ? major(rng.int(100, 2500)) : 0,
      firstOrderAt: firstOrderAt?.toISOString(),
      lastOrderAt: lastOrderAt?.toISOString(),
      lastSeenAt: rng.pastDate(referenceDate, 0, behaviour === "inactive" ? 200 : 21).toISOString(),
      createdAt: createdAt.toISOString(),
      status: rng.bool(0.985) ? "active" : "blocked",
    });
  }

  return customers;
}
