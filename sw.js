const cacheName = 'stok-pintar-v1';
const assets = [
  './',
  './index.html',
  './manifest.json'
];

// Tahap Instalasi: Menyimpan file ke dalam memori HP
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Menyimpan cache aplikasi...');
      return cache.addAll(assets);
    })
  );
});

// Tahap Aktivasi: Menghapus cache lama jika ada update
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Tahap Fetching: Mengambil data dari cache jika offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});