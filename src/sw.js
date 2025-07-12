// Simple service worker for PWA functionality
const CACHE_NAME = 'requisador-v2.0.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/logo.svg',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/web-app-manifest-192x192.png',
  './assets/icons/web-app-manifest-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached resource if available, otherwise fetch from network
        return response || fetch(event.request);
      }
    )
  );
});
