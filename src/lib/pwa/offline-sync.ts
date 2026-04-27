import { openDB } from "idb";
import type {
  InventoryAdjustmentInput,
  ItemInput,
  ItemUpdateInput,
} from "@/lib/forms/schemas";

export interface QueuedOperation {
  id: string;
  type: "inventory.adjust" | "inventory.create" | "inventory.update";
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface ReplayResult {
  replayed: number;
  conflicts: string[];
  processedIds: string[];
}

const BACKGROUND_SYNC_TAG = "inventory-sync";

interface BackgroundSyncCapableRegistration extends ServiceWorkerRegistration {
  sync: {
    register: (tag: string) => Promise<void>;
  };
}

const DB_NAME = "offline-inventory-sync";
const STORE_NAME = "operations";

export async function getSyncDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function enqueueOperation(operation: QueuedOperation) {
  const db = await getSyncDb();
  await db.put(STORE_NAME, operation);
}

export async function getQueuedOperations() {
  const db = await getSyncDb();
  return db.getAll(STORE_NAME) as Promise<QueuedOperation[]>;
}

export async function removeQueuedOperation(id: string) {
  const db = await getSyncDb();
  await db.delete(STORE_NAME, id);
}

export async function getQueueSize() {
  const db = await getSyncDb();
  return db.count(STORE_NAME);
}

async function scheduleBackgroundSync() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  if ("sync" in registration) {
    await (registration as BackgroundSyncCapableRegistration).sync.register(BACKGROUND_SYNC_TAG);
    return;
  }

  registration.active?.postMessage({ type: "REPLAY_QUEUE" });
}

export function createInventoryOperation(
  type: QueuedOperation["type"],
  payload: ItemInput | ItemUpdateInput | InventoryAdjustmentInput
) {
  return {
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: new Date().toISOString(),
  } satisfies QueuedOperation;
}

async function postOperations(operations: QueuedOperation[]) {
  const response = await fetch("/api/sync/queue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ operations }),
  });

  if (!response.ok) {
    throw new Error("Unable to replay queued operations.");
  }

  return (await response.json()) as ReplayResult;
}

export async function flushQueuedOperations() {
  const operations = await getQueuedOperations();

  if (operations.length === 0) {
    return {
      replayed: 0,
      conflicts: [],
      processedIds: [],
    } satisfies ReplayResult;
  }

  const result = await postOperations(operations);
  await Promise.all(result.processedIds.map((id) => removeQueuedOperation(id)));
  return result;
}

export async function submitInventoryOperation(payload: ItemInput) {
  const operation = createInventoryOperation("inventory.create", payload);

  return submitQueuedInventoryOperation(operation);
}

export async function submitInventoryUpdate(payload: ItemUpdateInput) {
  const operation = createInventoryOperation("inventory.update", payload);

  return submitQueuedInventoryOperation(operation);
}

export async function submitInventoryAdjustment(payload: InventoryAdjustmentInput) {
  const operation = createInventoryOperation("inventory.adjust", payload);

  return submitQueuedInventoryOperation(operation);
}

async function submitQueuedInventoryOperation(operation: QueuedOperation) {

  if (!navigator.onLine) {
    await enqueueOperation(operation);
    await scheduleBackgroundSync();
    return {
      queued: true,
      replayed: false,
      queueSize: await getQueueSize(),
    };
  }

  try {
    const result = await postOperations([operation]);
    return {
      queued: false,
      replayed: result.replayed > 0,
      queueSize: await getQueueSize(),
    };
  } catch {
    await enqueueOperation(operation);
    await scheduleBackgroundSync();
    return {
      queued: true,
      replayed: false,
      queueSize: await getQueueSize(),
    };
  }
}
