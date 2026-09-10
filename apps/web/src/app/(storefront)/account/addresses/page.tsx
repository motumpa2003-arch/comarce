import type { Metadata } from "next";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { getDemoCustomer } from "@obsidian/data";
import { Badge, Button, Card } from "@obsidian/ui";
import { currentStore } from "@/lib/tenant";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const db = await currentStore();
  const customer = getDemoCustomer(db.store.id);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display display-case text-[26px] leading-none text-ink">Addresses</h1>
          <p className="mt-2 text-[13px] text-ink-muted">
            Saved delivery locations. The default is pre-selected at checkout.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Add address
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {customer.addresses.map((address) => (
          <Card key={address.id} className="flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-[13px] font-medium capitalize text-ink">{address.label}</span>
              </div>
              <div className="flex gap-1.5">
                {address.isDefaultShipping && (
                  <Badge tone="info" size="xs">
                    Default shipping
                  </Badge>
                )}
                {address.isDefaultBilling && (
                  <Badge tone="neutral" size="xs">
                    Billing
                  </Badge>
                )}
              </div>
            </div>

            <p className="mt-4 text-[13.5px] font-medium text-ink">
              {address.firstName} {address.lastName}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              {address.landmark ? <><br />{address.landmark}</> : null}
              <br />
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.country}
            </p>
            <p className="mt-2 text-[12.5px] text-ink-muted">{address.phone}</p>

            <div className="mt-auto flex gap-2 pt-5">
              <Button variant="outline" size="sm">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              {!address.isDefaultShipping && (
                <>
                  <Button variant="ghost" size="sm">
                    Set as default
                  </Button>
                  <Button variant="ghost" size="sm" className="text-danger">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}

        <button
          type="button"
          className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line text-ink-muted transition-colors hover:border-ink/35 hover:text-ink"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full border border-line">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-[13px]">Add a new address</span>
        </button>
      </div>
    </div>
  );
}
