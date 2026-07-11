# IE Interior & Eksterior

Website bisnis untuk **IE Interior & Eksterior**, kontraktor di Surabaya sejak 2010.
Layanan: bangun & renovasi, design interior & furnitur, inspeksi rumah, serta produk
(canopy, pagar, pintu aluminium, kasa, gorden).

## Tech Stack

- HTML / CSS / JavaScript murni (tanpa framework)
- Google Fonts: Playfair Display + Inter
- AJAX: `fetch()` memuat `data/gallery.json` untuk galeri
- Formulir kontak mengirim pesan lewat WhatsApp (`wa.me`)

## Struktur Proyek

```
ieinterior/
├── index.html          # Single-page site (semua section)
├── css/style.css       # Semua styling (CSS variables, responsive)
├── js/main.js          # Navbar, galeri AJAX, lightbox, form → WhatsApp
├── data/gallery.json   # Data galeri dimuat via fetch()
├── images/             # Aset gambar
└── docker-compose.yml  # Server lokal (PHP + Apache)
```

## Cara Menjalankan

Situs ini statis, tetapi galeri memakai `fetch()` sehingga **harus disajikan lewat HTTP**
(membuka `index.html` langsung dari file tidak akan memuat galeri). Pilih salah satu:

### Opsi 1 — Docker (sudah dikonfigurasi)

```bash
docker compose up
```

Buka **http://localhost:8001** (port host `8001` → Apache `80`).

### Opsi 2 — Python (tanpa Docker)

```bash
python3 -m http.server 8000
```

Buka **http://localhost:8000**.

## Catatan

- Gambar galeri saat ini memakai placeholder Unsplash. Ganti URL di
  `data/gallery.json` dengan foto proyek asli.
- Kategori galeri: `renovasi`, `interior`, `inspeksi`, `produk`.

## Kontak

- WhatsApp: 0896-9963-9763 · 0851-0065-1297
- Instagram: [@ieinterior](https://www.instagram.com/ieinterior) · TikTok: `ie.interior`
- Lokasi: Darmo Park 1, Surabaya
