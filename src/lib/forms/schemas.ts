import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2).max(80),
});

export const itemSchema = z.object({
  sku: z.string().min(2).max(32),
  name: z.string().min(2).max(120),
  category: z.string().max(80).optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(0),
  reorderPoint: z.coerce.number().int().min(0),
  location: z.string().max(120).optional().or(z.literal("")),
});

export const itemUpdateSchema = itemSchema.extend({
  id: z.string().min(1),
});

export const inventoryAdjustmentSchema = z.object({
  itemId: z.string().min(1),
  delta: z.coerce.number().int().refine((value) => value !== 0, {
    message: "Adjustment delta cannot be zero.",
  }),
  reason: z.enum(["purchase", "sale", "adjustment", "damage", "transfer"]),
  notes: z.string().max(240).optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ItemInput = z.output<typeof itemSchema>;
export type ItemFormValues = z.input<typeof itemSchema>;
export type ItemUpdateInput = z.output<typeof itemUpdateSchema>;
export type InventoryAdjustmentInput = z.output<typeof inventoryAdjustmentSchema>;
export type InventoryAdjustmentFormValues = z.input<typeof inventoryAdjustmentSchema>;
