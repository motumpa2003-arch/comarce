import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Calculator,
  CreditCard,
  Mail,
  MessageSquare,
  Plug,
  Search,
  Star,
  Truck,
  Warehouse,
} from "lucide-react";
import { Badge, Card, Stat, buttonClasses } from "@obsidian/ui";
import { AdminPageHeader } from "@/components/admin/page-header";
import { number, relativeTime } from "@/lib/format";
import { NOW } from "@/lib/format";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Integrations" };

const at = (hours: number) => new Date(NOW.getTime() - hours * 3_600_000).toISOString();

type App = {
  id: string;
  name: string;
  category: string;
  blurb: string;
  icon: React.ReactNode;
  status: "connected" | "error" | "available";
  connectedHoursAgo?: number;
  scopes?: string[];
};

const APPS: App[] = [
  {
    id: "pay",
    name: "Razorpay",
    category: "Payments",
    blurb: "UPI, cards, net banking and EMI, with settlement reports pulled nightly.",
    icon: <CreditCard className="h-4 w-4" />,
    status: "connected",
    connectedHoursAgo: 0.3,
    scopes: ["payments.read", "payments.write", "refunds.write"],
  },
  {
    id: "ship",
    name: "Shiprocket",
    category: "Shipping",
    blurb: "Rate shopping across carriers, label generation and tracking webhooks.",
    icon: <Truck className="h-4 w-4" />,
    status: "connected",
    connectedHoursAgo: 1.1,
    scopes: ["orders.read", "shipments.write"],
  },
  {
    id: "mail",
    name: "Postmark",
    category: "Email",
    blurb: "Transactional email for confirmations, dispatch notices and receipts.",
    icon: <Mail className="h-4 w-4" />,
    status: "connected",
    connectedHoursAgo: 0.2,
    scopes: ["customers.read"],
  },
  {
    id: "gst",
    name: "ClearTax",
    category: "Tax & accounting",
    blurb: "GST filing, e-invoicing and HSN validation against the live registry.",
    icon: <Calculator className="h-4 w-4" />,
    status: "error",
    connectedHoursAgo: 71,
    scopes: ["finance.read", "orders.read"],
  },
  {
    id: "analytics",
    name: "Plausible",
    category: "Analytics",
    blurb: "Privacy-first storefront analytics with no cookie banner required.",
    icon: <BarChart3 className="h-4 w-4" />,
    status: "connected",
    connectedHoursAgo: 4,
    scopes: ["analytics.read"],
  },
  {
    id: "search",
    name: "Typesense",
    category: "Search",
    blurb: "Hosted search index with typo tolerance and faceting at scale.",
    icon: <Search className="h-4 w-4" />,
    status: "available",
  },
  {
    id: "reviews",
    name: "Judge.me",
    category: "Reviews",
    blurb: "Post-purchase review collection with photo and video capture.",
    icon: <Star className="h-4 w-4" />,
    status: "available",
  },
  {
    id: "wms",
    name: "Unicommerce",
    category: "Warehouse",
    blurb: "Warehouse management with pick lists, bin mapping and cycle counts.",
    icon: <Warehouse className="h-4 w-4" />,
    status: "available",
  },
  {
    id: "wa",
    name: "WhatsApp Business",
    category: "Messaging",
    blurb: "Order updates and abandoned-cart nudges on WhatsApp.",
    icon: <MessageSquare className="h-4 w-4" />,
    status: "available",
  },
];

export default async function IntegrationsPage() {
  const db = await currentStore();
  const connected = APPS.filter((a) => a.status === "connected");
  const failing = APPS.filter((a) => a.status === "error");
  const categories = [...new Set(APPS.map((a) => a.category))];

  return (
    <>
      <AdminPageHeader
        title="Integrations"
        description="Connected services and what each one is allowed to see. Every integration holds a scoped key — revoking one stops that service without touching the others."
        breadcrumbs={[{ label: "Integrations" }]}
        actions={
          <>
            <Link href="/admin/integrations/webhooks" className={buttonClasses("outline", "sm")}>
              Webhooks
            </Link>
            <Link href="/admin/integrations/logs" className={buttonClasses("ghost", "sm")}>
              Logs
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Connected" value={number(connected.length)} hint={`${APPS.length} in the catalogue`} />
        <Stat label="Failing" value={number(failing.length)} hint="Need attention" />
        <Stat label="Webhook endpoints" value={number(db.webhooks.length)} />
        <Stat label="API keys" value={number(db.apiKeys.filter((k) => !k.revokedAt).length)} hint="Active" />
      </div>

      {categories.map((category) => {
        const apps = APPS.filter((a) => a.category === category);
        return (
          <section key={category} className="mt-6">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.11em] text-ink-muted">
              {category}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {apps.map((app) => (
                <Card key={app.id} className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={
                        app.status === "available"
                          ? "grid h-10 w-10 place-items-center rounded-full bg-muted text-ink-muted"
                          : "grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"
                      }
                    >
                      {app.icon}
                    </span>
                    <Badge
                      tone={
                        app.status === "connected" ? "success" : app.status === "error" ? "danger" : "neutral"
                      }
                      size="xs"
                    >
                      {app.status === "available" ? "Available" : app.status}
                    </Badge>
                  </div>

                  <h3 className="mt-3.5 text-[13.5px] font-semibold text-ink">{app.name}</h3>
                  <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-muted">{app.blurb}</p>

                  {app.scopes && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {app.scopes.map((scope) => (
                        <code
                          key={scope}
                          className="rounded-[3px] bg-muted px-1.5 py-0.5 text-[10.5px] text-ink-muted"
                        >
                          {scope}
                        </code>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3.5">
                    <span className="text-[11px] text-ink-muted">
                      {app.status === "available"
                        ? "Not connected"
                        : `Synced ${relativeTime(at(app.connectedHoursAgo ?? 0))}`}
                    </span>
                    <button
                      type="button"
                      className={buttonClasses(app.status === "available" ? "outline" : "ghost", "xs")}
                    >
                      {app.status === "available" ? (
                        <>
                          <Plug className="h-3.5 w-3.5" />
                          Connect
                        </>
                      ) : (
                        "Manage"
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
