"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button, Card, Input } from "@obsidian/ui";

export function TrackOrderForm({
  initialValue,
  sampleOrderNumber,
  notFound,
}: {
  initialValue: string;
  sampleOrderNumber?: string;
  notFound: boolean;
}) {
  const [value, setValue] = React.useState(initialValue);
  const router = useRouter();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? `/track?order=${encodeURIComponent(trimmed)}` : "/track");
  };

  return (
    <Card>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="OD123456789"
          aria-label="Order number"
          leading={<Search className="h-4 w-4" />}
          invalid={notFound}
          sizeVariant="lg"
          className="uppercase tracking-wider"
        />
        <Button type="submit" size="lg" className="shrink-0">
          Track order
        </Button>
      </form>

      {notFound && (
        <p className="mt-3 text-[12.5px] text-danger">
          We could not find that order number. Check the confirmation email, or contact support.
        </p>
      )}

      {sampleOrderNumber && (
        <p className="mt-3 text-[11.5px] text-ink-muted">
          Demo tip: try{" "}
          <button
            type="button"
            onClick={() => {
              setValue(sampleOrderNumber);
              router.push(`/track?order=${sampleOrderNumber}`);
            }}
            className="font-medium text-ink underline underline-offset-4"
          >
            {sampleOrderNumber}
          </button>{" "}
          — an order that is currently in transit.
        </p>
      )}
    </Card>
  );
}
