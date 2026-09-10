"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button, useToast } from "@obsidian/ui";
import { STORE_COOKIE } from "@/lib/tenant-shared";

/**
 * Switches the active tenant and drops the operator into that store's admin.
 * In production this would mint a scoped, audited impersonation session.
 */
export function StoreImpersonateButton({ storeId, storeName }: { storeId: string; storeName: string }) {
  const [pending, setPending] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const open = () => {
    setPending(true);
    document.cookie = `${STORE_COOKIE}=${storeId}; path=/; max-age=31536000; samesite=lax`;
    toast({
      title: `Opened ${storeName}`,
      description: "Switched the active tenant. This action is audited.",
      tone: "accent",
    });
    router.push("/admin");
  };

  return (
    <Button size="sm" loading={pending} onClick={open}>
      <LogIn className="h-3.5 w-3.5" />
      Open merchant admin
    </Button>
  );
}
