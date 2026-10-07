# Video Downloader

Aplikasi web modern untuk mengunduh video dari YouTube, Instagram, Facebook, TikTok, dan 1000+ situs lainnya.

## Fitur

- 🎥 Download video dari berbagai platform
- 🎵 Extract audio (MP3)
- 📱 Responsive design
- ⚡ Fast & lightweight
- 🆓 Gratis dan open source

## Prasyarat

1. **Node.js** (versi 16 atau lebih baru)
2. **yt-dlp** harus terinstall di sistem Anda

### Install yt-dlp

**Windows:**
```bash
winget install yt-dlp
```
atau download dari: https://github.com/yt-dlp/yt-dlp/releases

**macOS:**
```bash
brew install yt-dlp
```

**Linux:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

## Instalasi

1. Clone atau download project ini
2. Buka terminal di folder project
3. Install dependencies:

```bash
npm install
```

## Cara Menjalankan

1. Start server:

```bash
npm start
```

2. Buka browser dan akses:
```
http://localhost:3000
```

3. Paste URL video dan klik "Get Video"

## Mode Development

Untuk auto-reload saat development:

```bash
npm run dev
```

## Struktur Project

```
video-downloader/
├── server.js           # Backend Express server
├── package.json        # Dependencies
├── public/
│   └── index.html     # Frontend UI
└── README.md          # Dokumentasi
```

## Supported Platforms

- YouTube
- Instagram
- Facebook
- TikTok
- Twitter/X
- Vimeo
- Dailymotion
- Dan 1000+ situs lainnya

## Troubleshooting

**Error: yt-dlp not found**
- Pastikan yt-dlp sudah terinstall dan ada di PATH sistem

**CORS Error**
- Pastikan backend berjalan di port 3000
- Periksa console browser untuk error details

**Video tidak bisa didownload**
- Beberapa video mungkin memiliki proteksi DRM
- Coba dengan URL video lain

## License

MIT License - bebas digunakan dan dimodifikasi

## Credits

Powered by yt-dlp - https://github.com/yt-dlp/yt-dlp
