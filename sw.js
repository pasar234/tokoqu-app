const CACHE_NAME = 'stok-pintar-v2';
const assets = [
  '/Steaknew-app/',
  '/Steaknew-app/index.html',
  '/Steaknew-app/manifest.json'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(res => res || fetch(evt.request))
  );
});
