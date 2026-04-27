importScripts("https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js");

const DB_NAME = "offline-inventory-sync";
const STORE_NAME = "operations";
const BACKGROUND_SYNC_TAG = "inventory-sync";

function getDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getQueuedOperations() {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function deleteQueuedOperations(ids) {
  if (!ids.length) {
    return;
  }

  const db = await getDb();
  await Promise.all(
    ids.map(
      (id) =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction(STORE_NAME, "readwrite");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
    )
  );
}

async function replayQueuedOperations() {
  const operations = await getQueuedOperations();

  if (!operations.length) {
    return { replayed: 0 };
  }

  const response = await fetch("/api/sync/queue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ operations }),
  });

  if (!response.ok) {
    throw new Error("Replay failed.");
  }

  const result = await response.json();
  await deleteQueuedOperations(result.processedIds || []);

  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clients.forEach((client) => client.postMessage({ type: "QUEUE_FLUSHED", replayed: result.replayed }));

  return result;
}

if (self.workbox) {
  self.skipWaiting();
  workbox.core.clientsClaim();

  workbox.precaching.precacheAndRoute([
    { url: "/", revision: null },
    { url: "/offline.html", revision: null },
    { url: "/apple-touch-icon.png", revision: null },
    { url: "/icons/pwa-192x192.png", revision: null },
    { url: "/icons/pwa-512x512.png", revision: null },
    { url: "/icons/maskable-icon-512x512.png", revision: null },
  ]);

  workbox.routing.registerRoute(
    ({ url }) => url.pathname === "/manifest.webmanifest",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "manifest",
    })
  );

  workbox.routing.registerRoute(
    ({ request }) => request.mode === "navigate",
    new workbox.strategies.NetworkFirst({
      cacheName: "pages",
      networkTimeoutSeconds: 3,
    })
  );

  workbox.routing.registerRoute(
    ({ request }) => request.destination === "style" || request.destination === "script",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "assets",
    })
  );

  workbox.routing.registerRoute(
    ({ request }) => request.destination === "image",
    new workbox.strategies.CacheFirst({
      cacheName: "images",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 40,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  workbox.routing.setCatchHandler(async ({ event }) => {
    if (event.request.destination === "document") {
      return caches.match("/offline.html");
    }

    return Response.error();
  });
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "REPLAY_QUEUE") {
    event.waitUntil?.(replayQueuedOperations());
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(replayQueuedOperations());
  }
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : { title: "Inventory update", body: "A background sync event occurred.", url: "/items" };

  event.waitUntil(
    self.registration.showNotification(payload.title || "Inventory update", {
      body: payload.body || "A background sync event occurred.",
      data: {
        url: payload.url || "/items",
      },
      icon: "/icons/pwa-192x192.png",
      badge: "/icons/pwa-192x192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/items";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => "focus" in client);
      if (existing) {
        existing.navigate?.(targetUrl);
        return existing.focus();
      }

      return self.clients.openWindow(targetUrl);
    })
  );
});
