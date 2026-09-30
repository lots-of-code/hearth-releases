// Keeps the shopping-list page on the phone so it opens in the store with no signal.
// Serves the saved copy straight away and refreshes it in the background when online.
const CACHE = "hearth-list-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./"])));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.mode !== "navigate") return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const saved = await cache.match("./");
      const fresh = fetch(e.request)
        .then((res) => {
          if (res.ok) cache.put("./", res.clone());
          return res;
        })
        .catch(() => saved);
      return saved || fresh;
    })
  );
});
