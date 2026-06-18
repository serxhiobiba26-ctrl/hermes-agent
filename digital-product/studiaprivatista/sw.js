/* Service worker — rende il sito installabile e utilizzabile offline */
const CACHE = "sp-v1";
const ASSETS = [
  "./", "index.html", "style.css", "app.js", "data.js", "materiali.html",
  "nerdamer.core.js", "Algebra.js", "Calculus.js", "Solve.js",
  "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;                 // POST (AI) → sempre rete
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;       // CDN esterni → rete
  if (url.pathname.includes("/api/")) return;       // funzione AI → sempre rete
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return resp;
      }).catch(() => caches.match("index.html"))
    )
  );
});
