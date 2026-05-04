// Service Worker - Clube das Gruas
// Strategy: cache-first pro shell estatico, network-only pra api.freepix.net.br
const CACHE = "clube-gruas-v8";
const SHELL = [
    "/",
    "/index.html",
    "/assets/style.css",
    "/assets/app.js",
    "/assets/icon.svg",
    "/manifest.json",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {}),
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((k) => k !== CACHE)
                        .map((k) => caches.delete(k)),
                ),
            ),
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);

    // Nunca cacheia chamadas pra API FreePix, fontes externas, etc
    if (url.hostname !== self.location.hostname) return;

    // Cache-first pro shell + assets locais
    event.respondWith(
        caches.match(req).then((cached) => {
            if (cached) return cached;
            return fetch(req)
                .then((res) => {
                    if (res.ok && url.pathname.startsWith("/assets/")) {
                        const copy = res.clone();
                        caches.open(CACHE).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => caches.match("/"));
        }),
    );
});
