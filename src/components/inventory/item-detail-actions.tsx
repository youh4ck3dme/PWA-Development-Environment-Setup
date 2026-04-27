"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InventoryItemSummary } from "@/types/inventory";
import {
  inventoryAdjustmentSchema,
  type InventoryAdjustmentInput,
  type InventoryAdjustmentFormValues,
} from "@/lib/forms/schemas";
import {
  submitInventoryAdjustment,
  submitInventoryUpdate,
} from "@/lib/pwa/offline-sync";
import { ItemForm } from "@/components/inventory/item-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ItemDetailActions({ item }: { item: InventoryItemSummary }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InventoryAdjustmentFormValues, unknown, InventoryAdjustmentInput>({
    resolver: zodResolver(inventoryAdjustmentSchema),
    defaultValues: {
      itemId: item.id,
      delta: 0,
      reason: "adjustment",
      notes: "",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">Edit item</p>
        <ItemForm
          initialValues={{
            sku: item.sku,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            reorderPoint: item.reorderPoint,
            location: item.location,
          }}
          submitLabel="Update item"
          resetOnSubmit={false}
          onSubmitItem={async (values) => {
            const result = await submitInventoryUpdate({ ...values, id: item.id });
            if (!result.queued) {
              router.refresh();
            }
          }}
        />
      </div>

      <form
        className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
        onSubmit={handleSubmit(async (values) => {
          const result = await submitInventoryAdjustment(values);
          if (!result.queued) {
            router.refresh();
          }
          reset({ itemId: item.id, delta: 0, reason: values.reason, notes: "" });
        })}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Adjust quantity</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input type="number" placeholder="Delta" {...register("delta")} />
          <select
            {...register("reason")}
            className="flex h-11 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 text-sm text-white outline-none transition focus:border-emerald-400"
          >
            <option value="adjustment">Adjustment</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
            <option value="damage">Damage</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
        {errors.delta ? <p className="text-sm text-rose-300">{errors.delta.message}</p> : null}
        <Input type="hidden" {...register("itemId")} />
        <Input placeholder="Notes" {...register("notes")} />
        <Button disabled={isSubmitting} type="submit" className="w-fit">
          Apply adjustment
        </Button>
      </form>
    </div>
  );
}
