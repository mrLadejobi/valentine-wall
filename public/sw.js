// public/sw.js
self.addEventListener('install', () => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // This is required for the "Install" prompt to appear
  event.respondWith(fetch(event.request));
});