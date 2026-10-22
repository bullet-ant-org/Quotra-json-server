// Outsider service worker: serves the app shell and static files from cache, refreshing them in the background.
const CACHE = "outsider-v1";
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/index.html"]))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  const sameOrigin = url.origin === location.origin;
  const isImg = req.destination === "image" || /images\.unsplash\.com|res\.cloudinary\.com/.test(url.host);
  if (!sameOrigin && !isImg) return; // API calls always go to the network
  if (req.mode === "navigate") { e.respondWith(fetch(req).catch(() => caches.match("/index.html"))); return; }
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(req);
    const net = fetch(req).then((r) => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit ?? net;
  }));
});
