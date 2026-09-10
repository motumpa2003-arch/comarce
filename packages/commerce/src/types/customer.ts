import type { ID, ISODate, Money } from "./primitives";

export interface Address {
  id: ID;
  customerId?: ID;
  label: "home" | "work" | "other";
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export type CustomerSegmentKey =
  | "new"
  | "repeat"
  | "vip"
  | "high_value"
  | "inactive"
  | "at_risk"
  | "coupon_led";

export type LoyaltyTierKey = "member" | "silver" | "gold" | "black";

export interface Customer {
  id: ID;
  storeId: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  gender?: "male" | "female" | "other" | "undisclosed";
  dateOfBirth?: ISODate;
  addresses: Address[];
  tags: string[];
  segments: CustomerSegmentKey[];
  marketingOptIn: boolean;
  notes?: string;

  ordersCount: number;
  lifetimeValue: Money;
  averageOrderValue: Money;
  refundedAmount: Money;

  loyaltyTier: LoyaltyTierKey;
  loyaltyPoints: number;
  storeCredit: Money;

  firstOrderAt?: ISODate;
  lastOrderAt?: ISODate;
  lastSeenAt: ISODate;
  createdAt: ISODate;
  status: "active" | "blocked";
}

export interface LoyaltyTier {
  key: LoyaltyTierKey;
  name: string;
  minSpend: Money;
  pointsMultiplier: number;
  perks: string[];
  color: string;
}

export interface LoyaltyLedgerEntry {
  id: ID;
  storeId: ID;
  customerId: ID;
  points: number;
  balanceAfter: number;
  reason: "purchase" | "review" | "referral" | "birthday" | "redemption" | "adjustment";
  referenceId?: string;
  createdAt: ISODate;
}

export interface CustomerSegment {
  key: CustomerSegmentKey;
  name: string;
  description: string;
  color: string;
}
