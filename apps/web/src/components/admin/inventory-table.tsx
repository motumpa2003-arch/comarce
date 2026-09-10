"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { Badge, Button, Field, Input, Modal, Select, Textarea, useToast } from "@obsidian/ui";
import { DataTable, type Column } from "./data-table";
import { money, number, relativeTime } from "@/lib/format";

export interface InventoryRow {
  id: string;
  productId: string;
  variantId: string;
  warehouseId: string;
  product: string;
  image: string;
  variantTitle: string;
  sku: string;
  warehouse: string;
  warehouseCode: string;
  bin: string;
  onHand: number;
  reserved: number;
  available: number;
  incoming: number;
  reorderPoint: number;
  costValue: number;
  updatedAt: string;
  state: string;
}

export function InventoryTable({
  rows,
  warehouses,
}: {
  rows: InventoryRow[];
  warehouses: { id: string; name: string; code: string }[];
}) {
  const [adjusting, setAdjusting] = React.useState<InventoryRow | null>(null);

  const columns: Column<InventoryRow>[] = [
    {
      key: "product",
      header: "Product",
      sortable: true,
      value: (row) => `${row.product} ${row.sku}`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-[4px] bg-muted">
            {row.image && <Image src={row.image} alt="" fill sizes="32px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{row.product}</p>
            <p className="truncate text-[11px] text-ink-muted">
              {row.variantTitle} · {row.sku}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      sortable: true,
      value: (row) => row.warehouse,
      render: (row) => (
        <div>
          <p className="text-ink">{row.warehouseCode}</p>
          <p className="truncate text-[11px] text-ink-muted">bin {row.bin}</p>
        </div>
      ),
    },
    {
      key: "onHand",
      header: "On hand",
      align: "right",
      sortable: true,
      value: (row) => row.onHand,
      render: (row) => <span className="text-ink">{number(row.onHand)}</span>,
    },
    {
      key: "reserved",
      header: "Reserved",
      align: "right",
      sortable: true,
      value: (row) => row.reserved,
      render: (row) => <span className="text-ink-muted">{number(row.reserved)}</span>,
    },
    {
      key: "available",
      header: "Available",
      align: "right",
      sortable: true,
      value: (row) => row.available,
      render: (row) => (
        <span
          className={
            row.state === "out"
              ? "font-semibold text-danger"
              : row.state === "low"
                ? "font-semibold text-warning"
                : "font-medium text-ink"
          }
        >
          {number(row.available)}
        </span>
      ),
    },
    {
      key: "incoming",
      header: "Incoming",
      align: "right",
      sortable: true,
      value: (row) => row.incoming,
      render: (row) => <span className="text-ink-muted">{row.incoming || "—"}</span>,
    },
    {
      key: "reorder",
      header: "Reorder at",
      align: "right",
      sortable: true,
      value: (row) => row.reorderPoint,
      render: (row) => <span className="text-ink-muted">{row.reorderPoint}</span>,
    },
    {
      key: "value",
      header: "Value",
      align: "right",
      sortable: true,
      value: (row) => row.costValue,
      render: (row) => <span className="text-ink-muted">{money(row.costValue)}</span>,
    },
    {
      key: "state",
      header: "State",
      sortable: true,
      value: (row) => row.state,
      render: (row) => (
        <Badge
          tone={row.state === "out" ? "danger" : row.state === "low" ? "warning" : "success"}
          size="xs"
        >
          {row.state === "out" ? "Out of stock" : row.state === "low" ? "Low" : "Healthy"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <Button variant="outline" size="xs" onClick={() => setAdjusting(row)}>
          Adjust
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search by product, SKU or variant…"
        pageSize={14}
        dense
        filters={[
          {
            key: "state",
            label: "Stock state",
            options: [
              { value: "out", label: "Out of stock" },
              { value: "low", label: "At reorder point" },
              { value: "ok", label: "Healthy" },
            ],
            match: (row, value) => row.state === value,
          },
          {
            key: "warehouse",
            label: "Location",
            options: warehouses.map((w) => ({ value: w.id, label: `${w.code} — ${w.name}` })),
            match: (row, value) => row.warehouseId === value,
          },
        ]}
        emptyMessage="No inventory records match those filters."
      />

      <AdjustModal row={adjusting} onClose={() => setAdjusting(null)} />
    </>
  );
}

function AdjustModal({ row, onClose }: { row: InventoryRow | null; onClose: () => void }) {
  const [delta, setDelta] = React.useState(0);
  const [reason, setReason] = React.useState("cycle_count");
  const [note, setNote] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    if (row) {
      setDelta(0);
      setNote("");
      setReason("cycle_count");
    }
  }, [row]);

  if (!row) return null;

  const submit = async () => {
    if (delta === 0) {
      toast({ title: "Enter a non-zero adjustment", tone: "danger" });
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          variantId: row.variantId,
          warehouseId: row.warehouseId,
          delta,
          note: note || reason,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Could not adjust stock.");
      toast({
        title: "Stock adjusted",
        description: `${row.sku} at ${row.warehouseCode} is now ${data.onHand} on hand.`,
        tone: "success",
      });
      onClose();
      router.refresh();
    } catch (caught) {
      toast({
        title: "Adjustment failed",
        description: caught instanceof Error ? caught.message : "Try again.",
        tone: "danger",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title="Adjust stock"
      description={`${row.product} · ${row.variantTitle} at ${row.warehouseCode}`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11.5px] text-ink-muted">
            New on hand: <span className="font-medium text-ink">{Math.max(0, row.onHand + delta)}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={pending} onClick={submit}>
              Apply adjustment
            </Button>
          </div>
        </div>
      }
    >
      <dl className="mb-5 grid grid-cols-3 gap-3 rounded-[var(--radius-sm)] bg-muted p-3.5 text-[12px]">
        <div>
          <dt className="text-ink-muted">On hand</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-ink">{row.onHand}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Reserved</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-ink">{row.reserved}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Available</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-ink">{row.available}</dd>
        </div>
      </dl>

      <Field label="Adjustment" hint="Positive adds stock, negative removes it.">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={() => setDelta((d) => d - 1)} aria-label="Decrease">
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Input
            type="number"
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value) || 0)}
            className="text-center"
          />
          <Button variant="outline" size="icon-sm" onClick={() => setDelta((d) => d + 1)} aria-label="Increase">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Field>

      <Field label="Reason" className="mt-4">
        <Select value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="cycle_count">Cycle count correction</option>
          <option value="damage">Damaged or written off</option>
          <option value="purchase">Goods received</option>
          <option value="return">Customer return restocked</option>
          <option value="adjustment">Manual adjustment</option>
        </Select>
      </Field>

      <Field label="Note" hint="Recorded on the ledger entry." className="mt-4">
        <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      <p className="mt-4 text-[11px] text-ink-muted">
        Last updated {relativeTime(row.updatedAt)}
      </p>
    </Modal>
  );
}
