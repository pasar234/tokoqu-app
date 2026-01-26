const CACHE_NAME = 'stok-pintar-v2'; // Nama cache, naikkan versi jika ada update besar
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// Tahap Install: Menyimpan semua file penting ke memori HP
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Menyimpan file ke memori...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Memaksa update langsung aktif
});

// Tahap Aktifasi: Menghapus cache lama agar HP tidak penuh
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus memori lama...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Tahap Pengambilan: Mengambil data dari memori saat offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jika ada di memori, pakai itu. Jika tidak, ambil dari internet.
      return response || fetch(event.request);
    }).catch(() => {
      // Jika internet mati dan file tidak ada di memori, tampilkan index.html saja
      return caches.match('./index.html');
    })
  );
});
