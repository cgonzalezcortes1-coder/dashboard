// ── Hasan Estudio Dashboard — Service Worker ──
const CACHE = 'hasan-v4';

const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Install: cache the app shell
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL))
  );
});

// Activate: delete old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for shell, network-first for everything else
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // Cache-first for same-origin shell files
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const network = fetch(e.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        });
        return cached || network;
      })
    );
  }
});
