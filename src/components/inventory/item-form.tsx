"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  itemSchema,
  type ItemFormValues,
  type ItemInput,
} from "@/lib/forms/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ItemFormProps {
  onSubmitItem?: (values: ItemInput) => Promise<void>;
  initialValues?: Partial<ItemFormValues>;
  submitLabel?: string;
  resetOnSubmit?: boolean;
}

export function ItemForm({
  onSubmitItem,
  initialValues,
  submitLabel = "Save item",
  resetOnSubmit = true,
}: ItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues, unknown, ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      sku: "",
      name: "",
      category: "",
      quantity: 0,
      reorderPoint: 0,
      location: "",
      ...initialValues,
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmitItem?.(values);
        if (resetOnSubmit) {
          reset();
        }
      })}
    >
      <Input placeholder="SKU" {...register("sku")} />
      {errors.sku ? <p className="text-sm text-rose-300">{errors.sku.message}</p> : null}
      <Input placeholder="Name" {...register("name")} />
      {errors.name ? <p className="text-sm text-rose-300">{errors.name.message}</p> : null}
      <Input placeholder="Category" {...register("category")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input placeholder="Quantity" type="number" {...register("quantity")} />
        <Input placeholder="Reorder point" type="number" {...register("reorderPoint")} />
      </div>
      <Input placeholder="Location" {...register("location")} />
      <Button disabled={isSubmitting} type="submit" className="w-fit">
        {submitLabel}
      </Button>
    </form>
  );
}
