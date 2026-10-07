// config.js - Konfigurasi aplikasi
export const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // yt-dlp options
  YT_DLP: {
    TIMEOUT: 30000, // 30 detik timeout
    MAX_RETRIES: 2,
    // Tambahkan opsi yt-dlp lainnya sesuai kebutuhan
  },

  // CORS configuration
  CORS: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  // Format preferences
  FORMATS: {
    VIDEO: ['mp4', 'webm', 'mkv'],
    AUDIO: ['mp3', 'm4a', 'wav', 'opus'],
    MAX_FILESIZE: 5 * 1024 * 1024 * 1024, // 5GB limit
  },

  // Platform support
  SUPPORTED_PLATFORMS: [
    'youtube.com',
    'instagram.com',
    'facebook.com',
    'tiktok.com',
    'twitter.com',
    'vimeo.com',
    'dailymotion.com',
    'bilibili.com',
    'twitch.tv'
  ]
};

export default config;
