"use client";

import { useEffect } from "react";
import { flushQueuedOperations, getQueueSize } from "@/lib/pwa/offline-sync";

export function PwaRuntime() {
  useEffect(() => {
    const handleServiceWorkerMessage = async (event: MessageEvent<{ type?: string; replayed?: number }>) => {
      if (event.data?.type === "QUEUE_FLUSHED") {
        await getQueueSize();
      }
    };

    const handleOnline = async () => {
      try {
        await flushQueuedOperations();
      } catch {
        // Leave retry behavior to the next background sync or manual replay.
      }
    };

    navigator.serviceWorker?.addEventListener("message", handleServiceWorkerMessage);
    window.addEventListener("online", handleOnline);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleServiceWorkerMessage);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
