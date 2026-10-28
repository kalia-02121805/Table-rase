// Change ce numéro à chaque mise à jour de l'appli pour forcer le rafraîchissement du cache.
const C = "table-rase-v3";
const A = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(A)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache d'abord (rapide, fonctionne hors ligne), puis mise à jour en arrière-plan.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      const net = fetch(req)
        .then(r => {
          if (r && r.ok) {
            const cp = r.clone();
            caches.open(C).then(c => c.put(req, cp));
          }
          return r;
        })
        .catch(() => hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error()));
      return hit || net;
    })
  );
});
