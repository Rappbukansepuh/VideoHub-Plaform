#!/bin/bash

echo "🎬 Video Downloader Setup"
echo "=========================="

if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp tidak ditemukan!"
    echo ""
    echo "📖 Install yt-dlp terlebih dahulu:"
    echo ""
    echo "macOS:"
    echo "  brew install yt-dlp"
    echo ""
    echo "Windows (dengan winget):"
    echo "  winget install yt-dlp"
    echo ""
    echo "Linux:"
    echo "  sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp"
    echo "  sudo chmod a+rx /usr/local/bin/yt-dlp"
    echo ""
    exit 1
fi

echo "✅ yt-dlp terdeteksi"
echo "✅ Node modules sudah terinstall"
echo ""
echo "🚀 Menjalankan server..."
echo "📍 Akses: http://localhost:3000"
echo ""

npm start
