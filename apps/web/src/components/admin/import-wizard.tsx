"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight, Check, FileUp, Play, RotateCcw } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  cn,
  useToast,
} from "@obsidian/ui";
import { number } from "@/lib/format";

const CORE_TARGETS = [
  { key: "", label: "— Ignore this column —" },
  { key: "sku", label: "SKU (match key)" },
  { key: "name", label: "Product name" },
  { key: "description", label: "Description" },
  { key: "price", label: "Price" },
  { key: "compareAtPrice", label: "Compare-at price" },
  { key: "costPrice", label: "Cost price" },
  { key: "category", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "stock", label: "Stock on hand" },
  { key: "barcode", label: "Barcode" },
  { key: "weightG", label: "Weight (g)" },
  { key: "status", label: "Status" },
  { key: "tags", label: "Tags" },
];

/** A small sample file, deliberately including rows that will fail. */
const SAMPLE_HEADERS = ["sku", "title", "mrp", "sale_price", "cat", "maker", "qty", "colour", "material"];
const SAMPLE_ROWS = [
  ["FSH-TSH-001", "Essential Heavyweight Tee", "1499", "1099", "T-Shirts & Tops", "Northbound", "48", "Black", "Cotton"],
  ["FSH-TSH-002", "Oversized Cotton Tee", "1799", "1399", "T-Shirts & Tops", "Northbound", "32", "Ivory", "Cotton"],
  ["ELC-HDP-018", "Studio Over-Ear Headphones", "24999", "19999", "Headphones", "Volt & Wire", "12", "Charcoal", "Aluminium"],
  ["", "Missing SKU Example", "999", "799", "Accessories", "Northbound", "5", "Tan", "Leather"],
  ["JWL-RNG-204", "Solitaire Band", "abc", "", "Rings", "Aurum", "3", "Rose gold", "18k gold"],
  ["FSH-TSH-001", "Essential Heavyweight Tee", "1499", "1149", "T-Shirts & Tops", "Northbound", "60", "Black", "Cotton"],
];

const AUTO_MAP: Record<string, string> = {
  sku: "sku",
  title: "name",
  mrp: "compareAtPrice",
  sale_price: "price",
  cat: "category",
  maker: "brand",
  qty: "stock",
};

type Step = "upload" | "map" | "review";

interface RowResult {
  index: number;
  sku: string;
  name: string;
  outcome: "create" | "update" | "error";
  message?: string;
}

export function ImportWizard({ attributeTargets }: { attributeTargets: { key: string; label: string }[] }) {
  const [step, setStep] = React.useState<Step>("upload");
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [running, setRunning] = React.useState(false);
  const [results, setResults] = React.useState<RowResult[] | null>(null);
  const { toast } = useToast();

  const targets = [...CORE_TARGETS, ...attributeTargets];

  const load = () => {
    setMapping(Object.fromEntries(SAMPLE_HEADERS.map((h) => [h, AUTO_MAP[h] ?? ""])));
    setStep("map");
    toast({
      title: "Sample file loaded",
      description: `${SAMPLE_ROWS.length} rows, ${SAMPLE_HEADERS.length} columns. Columns we recognised are mapped already.`,
    });
  };

  const skuColumn = Object.entries(mapping).find(([, target]) => target === "sku")?.[0];
  const mapped = Object.values(mapping).filter(Boolean).length;

  const dryRun = async () => {
    setRunning(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Validate against the mapping the user actually chose, so the preview
    // reflects this run rather than a canned result.
    const priceColumn = Object.entries(mapping).find(([, t]) => t === "price")?.[0];
    const nameColumn = Object.entries(mapping).find(([, t]) => t === "name")?.[0];
    const seen = new Set<string>();

    const out: RowResult[] = SAMPLE_ROWS.map((row, index) => {
      const cell = (header?: string) => (header ? (row[SAMPLE_HEADERS.indexOf(header)] ?? "") : "");
      const sku = cell(skuColumn).trim();
      const name = cell(nameColumn).trim() || "—";
      const price = cell(priceColumn).trim();

      if (!sku) {
        return { index, sku: "—", name, outcome: "error", message: "SKU is empty — every row needs one to match on." };
      }
      if (seen.has(sku)) {
        return { index, sku, name, outcome: "error", message: "Duplicate SKU in this file. Keep one row per SKU." };
      }
      seen.add(sku);

      if (price && !/^\d+(\.\d{1,2})?$/.test(price)) {
        return { index, sku, name, outcome: "error", message: `Price "${price}" is not a number.` };
      }
      if (!price) {
        return { index, sku, name, outcome: "error", message: "Price is required." };
      }

      // Anything already in the catalogue updates; the rest are new.
      const exists = sku.startsWith("FSH-TSH");
      return { index, sku, name, outcome: exists ? "update" : "create" };
    });

    setResults(out);
    setRunning(false);
    setStep("review");
  };

  const creates = results?.filter((r) => r.outcome === "create").length ?? 0;
  const updates = results?.filter((r) => r.outcome === "update").length ?? 0;
  const errors = results?.filter((r) => r.outcome === "error") ?? [];

  const reset = () => {
    setStep("upload");
    setMapping({});
    setResults(null);
  };

  return (
    <div className="space-y-4">
      <ol className="flex items-center gap-2 text-[11.5px]">
        {(["upload", "map", "review"] as Step[]).map((s, index) => {
          const done = (["upload", "map", "review"] as Step[]).indexOf(step) > index;
          const active = step === s;
          return (
            <li key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold",
                  active
                    ? "bg-primary text-inverse"
                    : done
                      ? "bg-success/15 text-success"
                      : "border border-line text-ink-muted",
                )}
              >
                {done ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className={active ? "font-medium text-ink" : "text-ink-muted"}>
                {s === "upload" ? "Upload" : s === "map" ? "Map columns" : "Review"}
              </span>
              {index < 2 && <span className="mx-1 h-px w-6 bg-line" />}
            </li>
          );
        })}
      </ol>

      {step === "upload" && (
        <Card className="py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-ink-muted">
            <FileUp className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-[15px] font-semibold text-ink">Drop a CSV here</h2>
          <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-ink-muted">
            Up to 50 MB. The first row is treated as the header. This demo has no upload endpoint, so use the sample
            file to walk the flow end to end.
          </p>
          <Button className="mt-6" onClick={load}>
            Load the sample file
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      )}

      {step === "map" && (
        <>
          <Card padded={false}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div>
                <h2 className="text-[12.5px] font-semibold text-ink">Map columns</h2>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  {number(mapped)} of {SAMPLE_HEADERS.length} columns mapped. Unmapped columns are ignored.
                </p>
              </div>
              {!skuColumn && (
                <Badge tone="danger" size="xs">
                  SKU not mapped
                </Badge>
              )}
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Column in your file</TH>
                  <TH>First value</TH>
                  <TH width="260px">Maps to</TH>
                </TR>
              </THead>
              <TBody>
                {SAMPLE_HEADERS.map((header, columnIndex) => (
                  <TR key={header}>
                    <TD>
                      <code className="text-[12px] font-medium text-ink">{header}</code>
                    </TD>
                    <TD className="text-ink-muted">{SAMPLE_ROWS[0]?.[columnIndex] || "—"}</TD>
                    <TD>
                      <Select
                        aria-label={`Map column ${header}`}
                        value={mapping[header] ?? ""}
                        onChange={(e) => setMapping((m) => ({ ...m, [header]: e.target.value }))}
                      >
                        {targets.map((target) => (
                          <option key={target.key} value={target.key}>
                            {target.label}
                          </option>
                        ))}
                      </Select>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button onClick={dryRun} disabled={!skuColumn} loading={running}>
              <Play className="h-3.5 w-3.5" />
              Run dry run
            </Button>
            <Button variant="ghost" onClick={reset}>
              Start over
            </Button>
            {!skuColumn && (
              <p className="flex items-center gap-1.5 text-[11.5px] text-danger">
                <AlertTriangle className="h-3.5 w-3.5" />
                Map one column to SKU before continuing.
              </p>
            )}
          </div>
        </>
      )}

      {step === "review" && results && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Will create</p>
              <p className="mt-1.5 font-display text-[26px] leading-none text-ink">{number(creates)}</p>
            </Card>
            <Card>
              <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Will update</p>
              <p className="mt-1.5 font-display text-[26px] leading-none text-ink">{number(updates)}</p>
            </Card>
            <Card className={errors.length ? "border-danger/35" : undefined}>
              <p className="text-[10.5px] uppercase tracking-[0.1em] text-ink-muted">Will skip</p>
              <p
                className={cn(
                  "mt-1.5 font-display text-[26px] leading-none",
                  errors.length ? "text-danger" : "text-ink",
                )}
              >
                {number(errors.length)}
              </p>
            </Card>
          </div>

          <Card padded={false}>
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[12.5px] font-semibold text-ink">Row by row</h2>
              <p className="mt-0.5 text-[11.5px] text-ink-muted">
                Nothing has been written. Fix the skipped rows in your file and upload again, or import the valid
                rows and handle the rest separately.
              </p>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH width="60px">Row</TH>
                  <TH>SKU</TH>
                  <TH>Name</TH>
                  <TH>Outcome</TH>
                  <TH>Detail</TH>
                </TR>
              </THead>
              <TBody>
                {results.map((result) => (
                  <TR key={result.index}>
                    <TD className="tabular-nums text-ink-muted">{result.index + 2}</TD>
                    <TD>
                      <code className="text-[12px] text-ink">{result.sku}</code>
                    </TD>
                    <TD className="text-ink-muted">{result.name}</TD>
                    <TD>
                      <Badge
                        tone={
                          result.outcome === "create"
                            ? "success"
                            : result.outcome === "update"
                              ? "info"
                              : "danger"
                        }
                        size="xs"
                      >
                        {result.outcome === "error" ? "skip" : result.outcome}
                      </Badge>
                    </TD>
                    <TD className={result.message ? "text-ink" : "text-ink-muted/40"}>
                      {result.message ?? "—"}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={creates + updates === 0}
              onClick={() =>
                toast({
                  title: "Import not committed",
                  description:
                    "This demo stops at the dry run — the write path would apply exactly the rows shown above.",
                  tone: "accent",
                })
              }
            >
              Import {number(creates + updates)} row{creates + updates === 1 ? "" : "s"}
            </Button>
            <Button variant="outline" onClick={() => setStep("map")}>
              Back to mapping
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
