"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function InventoryRealtimeBridge({ itemId }: { itemId?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`inventory-realtime-${itemId ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "items",
          ...(itemId ? { filter: `id=eq.${itemId}` } : {}),
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stock_movements",
          ...(itemId ? { filter: `item_id=eq.${itemId}` } : {}),
        },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [itemId, router]);

  return null;
}
