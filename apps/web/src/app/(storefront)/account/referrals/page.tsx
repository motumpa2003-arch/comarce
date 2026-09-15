import type { Metadata } from "next";
import { Gift, Share2, UserPlus, Users } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Badge, Card, Rule, Stat, Table, TBody, TD, TH, THead, TR } from "@obsidian/ui";
import { ReferralShare } from "@/components/account/referral-share";
import { NOW, formatDate, money, number } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Referrals" };

const REWARD_PER_REFERRAL = 50_000; // ₹500 in paise
const FRIEND_DISCOUNT = 30_000; // ₹300 in paise

export default async function ReferralsPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);

  const code = `${customer.firstName.toUpperCase().slice(0, 5)}${customer.id.slice(-4).toUpperCase()}`;
  const at = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();

  const referrals = [
    { name: "Ananya I.", status: "rewarded", joinedAt: at(64), orderedAt: at(58) },
    { name: "Vikram R.", status: "rewarded", joinedAt: at(41), orderedAt: at(37) },
    { name: "Kabir S.", status: "rewarded", joinedAt: at(22), orderedAt: at(19) },
    { name: "Divya R.", status: "pending", joinedAt: at(6), orderedAt: null },
    { name: "Arjun K.", status: "expired", joinedAt: at(120), orderedAt: null },
  ] as const;

  const rewarded = referrals.filter((r) => r.status === "rewarded").length;
  const pending = referrals.filter((r) => r.status === "pending").length;
  const earned = rewarded * REWARD_PER_REFERRAL;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display display-case text-[26px] leading-none text-ink">Referrals</h1>
        <p className="mt-2 text-[13px] text-ink-muted">
          Give {money(FRIEND_DISCOUNT)} off a first order, get {money(REWARD_PER_REFERRAL)} in store credit when it
          is delivered.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Credit earned" value={money(earned)} hint={`${number(rewarded)} completed`} />
        <Stat label="Pending" value={number(pending)} hint="Signed up, not yet delivered" />
        <Stat label="Invites sent" value={number(referrals.length)} />
      </div>

      <ReferralShare code={code} friendDiscount={money(FRIEND_DISCOUNT)} />

      <Card>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">How it works</h2>
        <ol className="mt-5 grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: <Share2 className="h-4 w-4 text-accent" />,
              title: "Share your code",
              body: `Anyone who has not ordered before gets ${money(FRIEND_DISCOUNT)} off their first order over ₹1,500.`,
            },
            {
              icon: <UserPlus className="h-4 w-4 text-accent" />,
              title: "They order",
              body: "The discount applies automatically at checkout — there is nothing for them to remember.",
            },
            {
              icon: <Gift className="h-4 w-4 text-accent" />,
              title: "You get credit",
              body: `${money(REWARD_PER_REFERRAL)} lands in your store credit once their order is delivered and the returns window closes.`,
            },
          ].map((step, index) => (
            <li key={step.title}>
              <span className="flex items-center gap-2.5">
                {step.icon}
                <span className="text-[11px] uppercase tracking-[0.12em] text-ink-muted">Step {index + 1}</span>
              </span>
              <p className="mt-2.5 text-[13px] font-medium text-ink">{step.title}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">{step.body}</p>
            </li>
          ))}
        </ol>
        <Rule className="my-6" />
        <p className="text-[11.5px] leading-relaxed text-ink-muted">
          Credit is issued after delivery plus the thirty-day returns window, because a referral that gets returned
          is not a referral. Self-referrals and duplicate addresses do not qualify. There is no cap on how many
          people you can refer.
        </p>
      </Card>

      <Card padded={false}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <Users className="h-3.5 w-3.5 text-ink-muted" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">Your referrals</h2>
        </div>
        <Table>
          <THead>
            <TR>
              <TH>Friend</TH>
              <TH>Status</TH>
              <TH align="right">Joined</TH>
              <TH align="right">First order</TH>
              <TH align="right">Your credit</TH>
            </TR>
          </THead>
          <TBody>
            {referrals.map((referral) => (
              <TR key={referral.name}>
                <TD className="font-medium text-ink">{referral.name}</TD>
                <TD>
                  <Badge
                    tone={
                      referral.status === "rewarded"
                        ? "success"
                        : referral.status === "pending"
                          ? "warning"
                          : "neutral"
                    }
                    size="xs"
                  >
                    {referral.status === "rewarded"
                      ? "Credited"
                      : referral.status === "pending"
                        ? "Awaiting delivery"
                        : "Expired"}
                  </Badge>
                </TD>
                <TD align="right" className="text-ink-muted">
                  {formatDate(referral.joinedAt)}
                </TD>
                <TD align="right" className="text-ink-muted">
                  {referral.orderedAt ? formatDate(referral.orderedAt) : "—"}
                </TD>
                <TD align="right" className="tabular-nums">
                  {referral.status === "rewarded" ? money(REWARD_PER_REFERRAL) : "—"}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
