const CACHE_NAME = 'mediflux-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Mock Push Notification handling
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'MediFlux Notification', body: 'New update available.' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/assets/logo.png', // Fallback icon
      badge: '/assets/logo.png',
      data: data
    })
  );
});
