"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { ItemForm } from "@/components/inventory/item-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PushSubscriptionCard } from "@/components/pwa/push-subscription-card";
import {
  flushQueuedOperations,
  getQueueSize,
  submitInventoryOperation,
} from "@/lib/pwa/offline-sync";

export function InventoryWorkspace() {
  const router = useRouter();
  const [queueSize, setQueueSize] = useState(0);
  const [syncMessage, setSyncMessage] = useState("Ready for online or offline mutations.");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    const refreshQueueState = async () => {
      const size = await getQueueSize();
      if (mounted) {
        setQueueSize(size);
      }
    };

    const replayQueue = async () => {
      if (!navigator.onLine) {
        return;
      }

      setIsSyncing(true);
      try {
        const result = await flushQueuedOperations();
        if (mounted) {
          setSyncMessage(
            result.replayed > 0
              ? `Replayed ${result.replayed} queued operation${result.replayed === 1 ? "" : "s"}.`
              : "Queue is already clean."
          );
          if (result.replayed > 0) {
            router.refresh();
          }
        }
      } catch {
        if (mounted) {
          setSyncMessage("Replay failed. Operations remain queued for the next retry.");
        }
      } finally {
        if (mounted) {
          setIsSyncing(false);
        }
        await refreshQueueState();
      }
    };

    void refreshQueueState();
    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncMessage("Connection restored. Replaying queued operations...");
      await replayQueue();
    };

    const handleOffline = async () => {
      setIsOnline(false);
      setSyncMessage("Offline mode active. New inventory changes will be queued locally.");
      await refreshQueueState();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      mounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="bg-slate-950/55">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-300">
          Create inventory item
        </p>
        <h2 className="mt-3 text-xl font-semibold text-white">Offline-safe item capture</h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          The form posts immediately when online. If the network is down or replay fails,
          the operation is stored in IndexedDB and retried automatically on reconnect.
        </p>
        <div className="mt-6">
          <ItemForm
            onSubmitItem={async (values) => {
              const result = await submitInventoryOperation(values);
              setQueueSize(result.queueSize);
              setSyncMessage(
                result.queued
                  ? "Saved to offline queue. It will replay automatically when the connection returns."
                  : "Item submitted to the sync endpoint."
              );
              if (!result.queued) {
                router.refresh();
              }
            }}
          />
        </div>
      </Card>

      <Card className="bg-slate-950/55">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-sky-300">
              Sync status
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">Replay queue</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {isOnline ? (
              <span className="inline-flex items-center gap-2">
                <Wifi className="size-3.5" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <WifiOff className="size-3.5" /> Offline
              </span>
            )}
          </span>
        </div>

        <div className="mt-6 space-y-4 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Queued operations</p>
            <p className="mt-2 text-3xl font-semibold text-white">{queueSize}</p>
          </div>
          <p className="leading-7 text-slate-400">{syncMessage}</p>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            disabled={isSyncing || !isOnline}
            onClick={async () => {
              setIsSyncing(true);
              try {
                const result = await flushQueuedOperations();
                setQueueSize(await getQueueSize());
                setSyncMessage(
                  result.replayed > 0
                    ? `Manually replayed ${result.replayed} queued operation${result.replayed === 1 ? "" : "s"}.`
                    : "Queue is already empty."
                );
                if (result.replayed > 0) {
                  router.refresh();
                }
              } catch {
                setSyncMessage("Manual replay failed. Leaving queued operations intact.");
              } finally {
                setIsSyncing(false);
              }
            }}
          >
            <RefreshCw className="mr-2 size-4" />
            {isSyncing ? "Replaying..." : "Replay queued operations"}
          </Button>
          <PushSubscriptionCard />
        </div>
      </Card>
    </div>
  );
}
