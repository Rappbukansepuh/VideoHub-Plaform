# 🚀 Quick Start Guide

## 1. Install Dependencies

Buka terminal di folder `video-downloader` dan jalankan:

```bash
npm install
```

## 2. Pastikan yt-dlp Terinstall

**Windows:**
```bash
winget install yt-dlp
```

**macOS:**
```bash
brew install yt-dlp
```

**Linux:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

Verifikasi dengan:
```bash
yt-dlp --version
```

## 3. Jalankan Server

```bash
npm start
```

Output akan terlihat seperti:
```
Server running on http://localhost:3000
```

## 4. Akses Aplikasi

Buka browser dan ketik:
```
http://localhost:3000
```

## 5. Mulai Download

1. Paste URL video (YouTube, Instagram, TikTok, dll)
2. Klik tombol "Get Video"
3. Tunggu hingga format video tampil
4. Pilih format yang diinginkan
5. Klik "Download" untuk download langsung

## Tips

- Untuk mode development dengan auto-reload: `npm run dev`
- Aplikasi mendukung 1000+ platform video
- Beberapa video mungkin tidak bisa didownload jika memiliki proteksi DRM
- Pastikan koneksi internet stabil

## Troubleshooting

**Masalah: "yt-dlp not found"**
- Pastikan yt-dlp sudah di-install
- Restart terminal setelah install

**Masalah: Server tidak bisa diakses**
- Pastikan port 3000 tidak digunakan aplikasi lain
- Coba restart server

**Masalah: Video error saat fetch**
- Coba URL video lain
- Beberapa video memiliki proteksi khusus
- Periksa console browser (F12) untuk error detail
