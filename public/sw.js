// Outsider service worker: serves the app shell and static files from cache, refreshing them in the background.
const CACHE = "outsider-v3";
// Install: save the whole app (shell + every built JS/CSS file it references) so it opens instantly, even offline.
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const html = await (await fetch("/index.html", { cache: "no-store" })).text();
    const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
    await c.addAll(["/", "/index.html", "/manifest.webmanifest", "/icon-192.png", "/favicon.svg", ...assets]);
  })().catch(() => {}));
  self.skipWaiting();
});
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

// Push notifications: rich card with the poster's photo, tapping opens the post.
self.addEventListener("push", (e) => {
  let d = {}; try { d = e.data.json(); } catch { d = { title: "Outsider", body: e.data?.text() }; }
  e.waitUntil(self.registration.showNotification(d.title ?? "Outsider", {
    body: d.body, icon: d.icon || "/icon-192.png", badge: "/badge.png", image: d.image, tag: d.tag, renotify: !!d.tag,
    data: { url: d.url ?? "/home" }, actions: [{ action: "open", title: "View" }], vibrate: [60, 40, 60],
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url ?? "/home", location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    const c = cs.find((x) => x.url.startsWith(location.origin));
    return c ? c.focus().then(() => c.navigate(url)) : self.clients.openWindow(url);
  }));
});
