const CACHE_NAME = 'musikkmeta-v2';
const STATIC_CACHE_URLS = [
  './',
  './manifest.json'
];

const SHEETS_API_CACHE = 'sheets-api-cache-v2';
const SHEETS_CACHE_TTL = 5 * 60 * 1000; // 5 minutter

// Installer - cache statiske ressurser
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE_URLS))
  );
  self.skipWaiting();
});

// Aktiver - rydd opp gamle cacher
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== SHEETS_API_CACHE)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch - Google Sheets: network-first med cache-fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin === 'https://sheets.googleapis.com') {
    event.respondWith(
      caches.open(SHEETS_API_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) {
            const cachedDate = cached.headers.get('sw-cached-date');
            if (cachedDate && Date.now() - parseInt(cachedDate) < SHEETS_CACHE_TTL) {
              return cached;
            }
          }

          return fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              const headers = new Headers(networkResponse.headers);
              headers.set('sw-cached-date', Date.now().toString());
              const toCache = new Response(networkResponse.clone().body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers,
              });
              cache.put(event.request, toCache);
            }
            return networkResponse;
          }).catch(() => cached ?? Promise.reject(new Error('Ingen nettverkstilgang og ingen cache')));
        })
      )
    );
    return;
  }

  // Statiske ressurser: cache-first
  if (['document', 'script', 'style', 'image'].includes(event.request.destination)) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Alt annet: network-first
  event.respondWith(fetch(event.request));
});
