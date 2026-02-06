# Stok Pintar - Aplikasi Manajemen Stok

Aplikasi web untuk manajemen stok produk dengan 4 kategori:
- NARITA
- VR
- KUDUS
- LAIN

## Fitur Utama

### 1. Manajemen Produk
- Tambah produk baru dengan kategori
- Input nama, kode, harga beli, harga jual
- Otomatis generate kode produk jika kosong

### 2. Kelola Stok
- Tambah/kurangi stok dengan tombol +/-
- Stok tidak bisa negatif
- Notifikasi perubahan stok

### 3. Kategori Produk
- Navigasi mudah antar kategori
- Pemisahan data per kategori
- Tampilan khusus per kategori

### 4. Pencarian
- Cari produk berdasarkan nama atau kode
- Pencarian real-time
- Filter otomatis

### 5. Backup & Restore
- Export data ke file JSON
- Import data dari backup
- Data disimpan di localStorage browser

### 6. Progressive Web App (PWA)
- Dapat diinstall di perangkat mobile dan desktop
- Bekerja offline
- Notifikasi toast
- Tema gelap/terang

## Cara Menggunakan

### 1. Menambahkan Produk
1. Buka halaman Home
2. Isi nama produk (wajib)
3. Isi harga jual (wajib)
4. Pilih kategori
5. Klik "Simpan Produk"

### 2. Mengelola Stok
1. Pilih kategori dari navigasi
2. Temukan produk
3. Klik tombol + untuk menambah stok
4. Klik tombol - untuk mengurangi stok

### 3. Mencari Produk
1. Buka halaman kategori
2. Ketik di kolom pencarian
3. Hasil akan filter otomatis

### 4. Backup Data
1. Klik "Backup Data" di halaman Home
2. File JSON akan didownload

### 5. Restore Data
1. Klik "Restore Data" di halaman Home
2. Pilih file backup JSON
3. Konfirmasi untuk mengganti data

## Instalasi sebagai Aplikasi

### Desktop (Chrome/Edge):
1. Buka aplikasi di browser
2. Klik ikon Install di address bar
3. Klik "Install Stok Pintar"

### Mobile (Android/Chrome):
1. Buka aplikasi di Chrome
2. Tap menu (⋮) → "Add to Home screen"
3. Tap "Add"

## Teknologi yang Digunakan
- HTML5
- CSS3 (CSS Variables untuk tema)
- JavaScript (ES6+)
- Local Storage untuk penyimpanan data
- Service Workers untuk PWA
- Font Awesome untuk ikon

## Struktur Data

```javascript
{
  "id": 1234567890123, // Timestamp
  "nama": "Nama Produk",
  "kode": "PROD-123456",
  "beli": 10000,
  "jual": 15000,
  "kategori": "narita", // narita, vr, kudus, lain
  "stok": 5,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
