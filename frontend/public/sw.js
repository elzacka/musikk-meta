const CACHE_NAME = 'musikkmeta-v1';
const STATIC_CACHE_URLS = [
  './',
  './manifest.json'
];

const SHEETS_API_CACHE = 'sheets-api-cache';
const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME && cacheName !== SHEETS_API_CACHE)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle Google Sheets API requests with caching
  if (url.origin === 'https://sheets.googleapis.com') {
    event.respondWith(
      caches.open(SHEETS_API_CACHE).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          // Return cached response if available and not too old
          if (cachedResponse) {
            const cachedDate = cachedResponse.headers.get('sw-cached-date');
            if (cachedDate) {
              const cacheAge = Date.now() - parseInt(cachedDate);
              // Use cached data for 5 minutes
              if (cacheAge < 5 * 60 * 1000) {
                console.log('🔄 Using cached Google Sheets data');
                return cachedResponse;
              }
            }
          }
          
          // Fetch fresh data from network
          return fetch(event.request).then(networkResponse => {
            // Cache successful responses
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              // Add timestamp header for cache age tracking
              const headers = new Headers(responseToCache.headers);
              headers.set('sw-cached-date', Date.now().toString());
              
              const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
              });
              
              cache.put(event.request, cachedResponse);
              console.log('✅ Cached fresh Google Sheets data');
            }
            return networkResponse;
          }).catch(error => {
            // If network fails, return cached data even if old
            if (cachedResponse) {
              console.log('📱 Network failed, using stale cached data');
              return cachedResponse;
            }
            throw error;
          });
        });
      })
    );
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (event.request.destination === 'document' || 
      event.request.destination === 'script' ||
      event.request.destination === 'style' ||
      event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request);
      })
    );
    return;
  }
  
  // Default: network first for other requests
  event.respondWith(fetch(event.request));
});

// Background sync for offline data updates (future feature)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    // Could refresh Google Sheets data here
  }
});

// Push notifications (future feature)
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: './icon-192.png',
      badge: './icon-192.png'
    };
    event.waitUntil(
      self.registration.showNotification('MusikkMeta', options)
    );
  }
});