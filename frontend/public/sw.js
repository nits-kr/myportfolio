const CACHE_NAME = "portfolio-v3";
const OFFLINE_URL = "/offline.html";

// Assets to precache on install
const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ─── Message: Handle SKIP_WAITING from update notification ───────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ─── Install: precache assets & activate immediately ─────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS)),
      self.skipWaiting(), // ✅ Fixed: placed inside waitUntil
    ]),
  );
});

// ─── Activate: clear old caches & claim clients ──────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Delete stale caches
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((name) => name !== CACHE_NAME)
              .map((name) => caches.delete(name)),
          ),
        ),
      self.clients.claim(),
    ]),
  );
});

// ─── Fetch: Stale-While-Revalidate + Offline Fallback ────────────────────────
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only handle http/https (skip chrome-extension://, etc.)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // ── API Requests: Network-only, no SW caching ──────────────────────────────
  // Let RTK Query / Redux handle data fetching and caching
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname !== self.location.hostname
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // For API failures, return a structured offline JSON response
        if (event.request.headers.get("accept")?.includes("application/json")) {
          return new Response(
            JSON.stringify({
              error: "offline",
              message: "You are currently offline.",
            }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          );
        }
        return Response.error();
      }),
    );
    return;
  }

  // ── Navigation Requests: Network-first with offline.html fallback ───────────
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Cache successful navigation responses
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Try cache first, then fall back to offline page
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  // ── Static Assets: Stale-While-Revalidate ──────────────────────────────────
  // Serve from cache immediately, update cache in the background
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);

      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // Fall back to cache if network fails

      // Return cached immediately (if available), otherwise wait for network
      return cachedResponse || networkFetch;
    }),
  );
});
