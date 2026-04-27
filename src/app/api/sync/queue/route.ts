import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  inventoryAdjustmentSchema,
  itemSchema,
  itemUpdateSchema,
} from "@/lib/forms/schemas";
import { sendPushNotificationToUser } from "@/lib/pwa/server-push";
import type { Json } from "@/types/database";

const syncOperationSchema = z.object({
  id: z.uuid(),
  type: z.enum(["inventory.adjust", "inventory.create", "inventory.update"]),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export async function POST(request: Request) {
  const parsedBody = z
    .object({ operations: z.array(syncOperationSchema).max(100) })
    .safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid sync payload.", details: parsedBody.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const processedIds: string[] = [];
  const conflicts: string[] = [];
  const lowStockAlerts: Array<{ name: string; quantity: number; reorderPoint: number }> = [];

  for (const operation of parsedBody.data.operations) {
    const { data: existingReplayRecord, error: replayLookupError } = await supabase
      .from("offline_sync_queue")
      .select("id")
      .eq("owner_id", user.id)
      .eq("id", operation.id)
      .maybeSingle();

    if (replayLookupError) {
      conflicts.push(operation.id);
      continue;
    }

    if (existingReplayRecord) {
      processedIds.push(operation.id);
      continue;
    }

    let operationProcessed = false;

    if (operation.type === "inventory.create") {
      const parsedItem = itemSchema.safeParse(operation.payload);

      if (!parsedItem.success) {
        conflicts.push(operation.id);
        continue;
      }

      const { data, error } = await supabase
        .from("items")
        .insert({
          owner_id: user.id,
          sku: parsedItem.data.sku,
          name: parsedItem.data.name,
          category: parsedItem.data.category || null,
          quantity: parsedItem.data.quantity,
          reorder_point: parsedItem.data.reorderPoint,
          location: parsedItem.data.location || null,
        })
        .select("name, quantity, reorder_point")
        .single();

      if (error) {
        conflicts.push(operation.id);
        continue;
      }

      if (data.quantity <= data.reorder_point) {
        lowStockAlerts.push({
          name: data.name,
          quantity: data.quantity,
          reorderPoint: data.reorder_point,
        });
      }

      operationProcessed = true;
    }

    if (operation.type === "inventory.update" && !operationProcessed) {
      const parsedItem = itemUpdateSchema.safeParse(operation.payload);

      if (!parsedItem.success) {
        conflicts.push(operation.id);
        continue;
      }

      const { data, error } = await supabase
        .from("items")
        .update({
          sku: parsedItem.data.sku,
          name: parsedItem.data.name,
          category: parsedItem.data.category || null,
          quantity: parsedItem.data.quantity,
          reorder_point: parsedItem.data.reorderPoint,
          location: parsedItem.data.location || null,
          updated_at: new Date().toISOString(),
        })
        .eq("owner_id", user.id)
        .eq("id", parsedItem.data.id)
        .select("name, quantity, reorder_point")
        .single();

      if (error) {
        conflicts.push(operation.id);
        continue;
      }

      if (data.quantity <= data.reorder_point) {
        lowStockAlerts.push({
          name: data.name,
          quantity: data.quantity,
          reorderPoint: data.reorder_point,
        });
      }

      operationProcessed = true;
    }

    if (operation.type === "inventory.adjust" && !operationProcessed) {
      const parsedAdjustment = inventoryAdjustmentSchema.safeParse(operation.payload);

      if (!parsedAdjustment.success) {
        conflicts.push(operation.id);
        continue;
      }

      const { data: existingItem, error: fetchError } = await supabase
        .from("items")
        .select("id, name, quantity, reorder_point")
        .eq("owner_id", user.id)
        .eq("id", parsedAdjustment.data.itemId)
        .single();

      if (fetchError || !existingItem) {
        conflicts.push(operation.id);
        continue;
      }

      const nextQuantity = Math.max(0, existingItem.quantity + parsedAdjustment.data.delta);

      const [{ error: itemError }, { error: movementError }] = await Promise.all([
        supabase
          .from("items")
          .update({
            quantity: nextQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("owner_id", user.id)
          .eq("id", parsedAdjustment.data.itemId),
        supabase.from("stock_movements").insert({
          owner_id: user.id,
          item_id: parsedAdjustment.data.itemId,
          delta: parsedAdjustment.data.delta,
          reason: parsedAdjustment.data.reason,
          notes: parsedAdjustment.data.notes || null,
        }),
      ]);

      if (itemError || movementError) {
        conflicts.push(operation.id);
        continue;
      }

      if (nextQuantity <= existingItem.reorder_point) {
        lowStockAlerts.push({
          name: existingItem.name,
          quantity: nextQuantity,
          reorderPoint: existingItem.reorder_point,
        });
      }

      operationProcessed = true;
    }

    if (!operationProcessed) {
      conflicts.push(operation.id);
      continue;
    }

    const { error: replayInsertError } = await supabase.from("offline_sync_queue").insert({
      id: operation.id,
      owner_id: user.id,
      operation: toJson(operation),
      status: "processed",
    });

    if (replayInsertError) {
      conflicts.push(operation.id);
      continue;
    }

    processedIds.push(operation.id);
  }

  if (processedIds.length > 0 && lowStockAlerts.length > 0) {
    const firstAlert = lowStockAlerts[0];
    try {
      await sendPushNotificationToUser(user.id, {
        title: "Low stock alert",
        body: `${firstAlert.name} is at ${firstAlert.quantity} units. Reorder point is ${firstAlert.reorderPoint}.`,
        url: "/items",
      });
    } catch {
      // Keep sync success independent from notification delivery.
    }
  }

  return NextResponse.json({
    replayed: processedIds.length,
    conflicts,
    processedIds,
  });
}
