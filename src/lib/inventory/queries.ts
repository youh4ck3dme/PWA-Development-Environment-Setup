import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMissingSupabaseEnv } from "@/lib/env";
import type { InventoryItemSummary, StockMovement } from "@/types/inventory";

function getInventoryStatus(quantity: number, reorderPoint: number): InventoryItemSummary["status"] {
  if (quantity <= 0) {
    return "out_of_stock";
  }

  if (quantity <= reorderPoint) {
    return "low_stock";
  }

  return "in_stock";
}

export const getInventoryItems = cache(async (): Promise<InventoryItemSummary[]> => {
  if (getMissingSupabaseEnv().length > 0) {
    return [];
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("items")
    .select("id, sku, name, category, quantity, reorder_point, location, updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    category: item.category ?? "Uncategorized",
    quantity: item.quantity,
    reorderPoint: item.reorder_point,
    location: item.location ?? "Unassigned",
    updatedAt: item.updated_at,
    status: getInventoryStatus(item.quantity, item.reorder_point),
  }));
});

export const getInventoryItemDetail = cache(async (itemId: string) => {
  if (getMissingSupabaseEnv().length > 0) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: item, error: itemError }, { data: movementData, error: movementsError }] =
    await Promise.all([
      supabase
        .from("items")
        .select("id, sku, name, category, quantity, reorder_point, location, updated_at")
        .eq("owner_id", user.id)
        .eq("id", itemId)
        .maybeSingle(),
      supabase
        .from("stock_movements")
        .select("id, item_id, delta, reason, created_at, owner_id")
        .eq("owner_id", user.id)
        .eq("item_id", itemId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  if (itemError || movementsError || !item) {
    return null;
  }

  const movements: StockMovement[] = (movementData ?? []).map((movement) => ({
    id: movement.id,
    itemId: movement.item_id,
    delta: movement.delta,
    reason: movement.reason as StockMovement["reason"],
    createdAt: movement.created_at,
    createdBy: movement.owner_id,
  }));

  return {
    item: {
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: item.category ?? "Uncategorized",
      quantity: item.quantity,
      reorderPoint: item.reorder_point,
      location: item.location ?? "Unassigned",
      updatedAt: item.updated_at,
      status: getInventoryStatus(item.quantity, item.reorder_point),
    } satisfies InventoryItemSummary,
    movements,
  };
});
