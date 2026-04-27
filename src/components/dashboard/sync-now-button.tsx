"use client";

export function SyncNowButton() {
  const handleSync = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if ("sync" in registration) {
          (registration as any).sync.register("inventory-sync");
        } else {
          registration.active?.postMessage({ type: "REPLAY_QUEUE" });
        }
      });
    }
  };

  return (
    <button
      type="button"
      className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
      onClick={handleSync}
    >
      Sync now
    </button>
  );
}
