export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryItemSummary {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  reorderPoint: number;
  location: string;
  updatedAt: string;
  status: InventoryStatus;
}

export interface StockMovement {
  id: string;
  itemId: string;
  delta: number;
  reason: "purchase" | "sale" | "adjustment" | "damage" | "transfer";
  createdAt: string;
  createdBy: string;
}
