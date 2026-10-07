import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import puppeteer from 'puppeteer';

const execPromise = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

let browser = null;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

async function scrapeGenericVideo(url) {
  let page = null;
  try {
    console.log('Generic video scraper:', url);
    const br = await initBrowser();
    page = await br.newPage();
    
    const videoUrls = [];
    
    // Intercept network requests to catch video URLs
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const reqUrl = request.url();
      const resourceType = request.resourceType();
      
      // Only intercept actual video/media requests, not analytics
      if (resourceType === 'media' || 
          (reqUrl.match(/\.(mp4|webm|m3u8|ts)(\?|$)/i) && !reqUrl.includes('analytics') && !reqUrl.includes('google'))) {
        console.log('Intercepted video:', reqUrl);
        videoUrls.push(reqUrl);
      }
      request.continue();
    });
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1280, height: 720 });
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait longer for dynamic content
    console.log('Waiting for dynamic content...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Check if video is loaded
    const hasVideo = await page.$('video');
    if (hasVideo) {
      console.log('Video tag found!');
    } else {
      console.log('No video tag, checking for embedded players...');
      
      // Check for JW Player
      const jwScript = await page.evaluate(() => {
        return typeof jwplayer !== 'undefined' || 
               document.querySelector('[data-jwplayer]') !== null ||
               document.querySelector('.jwplayer') !== null ||
               document.querySelector('script[src*="jwplayer"]') !== null;
      });
      
      if (jwScript) {
        console.log('JW Player detected, extracting video info...');
      }
    }
    
    const videoData = await page.evaluate(() => {
      const videos = [];
      const seenUrls = new Set();
      
      // 1. Check standard video tags
      document.querySelectorAll('video').forEach(video => {
        if (video.src && video.src.includes('http')) {
          if (!seenUrls.has(video.src)) {
            seenUrls.add(video.src);
            videos.push({ url: video.src, poster: video.poster });
          }
        }
        
        video.querySelectorAll('source').forEach(source => {
          if (source.src && source.src.includes('http')) {
            if (!seenUrls.has(source.src)) {
              seenUrls.add(source.src);
              videos.push({ url: source.src });
            }
          }
        });
      });
      
      // 2. Extract from JW Player
      if (typeof jwplayer !== 'undefined' && jwplayer().getPlaylist) {
        try {
          const playlist = jwplayer().getPlaylist();
          if (playlist && playlist.length > 0) {
            playlist.forEach(item => {
              if (item.sources && item.sources.length > 0) {
                item.sources.forEach(source => {
                  if (source.file && !seenUrls.has(source.file)) {
                    seenUrls.add(source.file);
                    videos.push({ url: source.file });
                  }
                });
              }
            });
          }
        } catch (e) {
          console.log('JW Player extraction failed');
        }
      }
      
      // 3. Search all script tags for video URLs and configs
      document.querySelectorAll('script').forEach(script => {
        const text = script.textContent;
        
        // Direct video file URLs
        const urlPattern = /https?:\/\/[^\s"'<>]+\.(?:mp4|webm|m3u8|ts)[^\s"'<>]*/gi;
        let match;
        while ((match = urlPattern.exec(text)) !== null) {
          const videoUrl = match[0];
          if (!seenUrls.has(videoUrl) && !videoUrl.includes('analytics') && !videoUrl.includes('google')) {
            seenUrls.add(videoUrl);
            videos.push({ url: videoUrl });
          }
        }
        
        // JW Player config patterns
        const jwPatterns = [
          /file\s*:\s*["']([^"']+\.(?:mp4|m3u8|webm))["']/gi,
          /sources\s*:\s*\[\s*\{\s*file\s*:\s*["']([^"']+)["']/gi,
          /url\s*:\s*["']([^"']+\.(?:mp4|m3u8|webm))["']/gi
        ];
        
        jwPatterns.forEach(pattern => {
          while ((match = pattern.exec(text)) !== null) {
            const videoUrl = match[1];
            if (videoUrl && !seenUrls.has(videoUrl) && !videoUrl.includes('analytics')) {
              seenUrls.add(videoUrl);
              videos.push({ url: videoUrl });
            }
          }
        });
      });
      
      const title = document.querySelector('title')?.textContent || 
                   document.querySelector('meta[property="og:title"]')?.content ||
                   'Video';
      
      return { videos, title };
    });
    
    // Combine page videos with intercepted URLs
    const allVideos = [...videoData.videos];
    videoUrls.forEach(url => {
      if (!allVideos.some(v => v.url === url)) {
        allVideos.push({ url });
      }
    });
    
    if (allVideos.length === 0) {
      console.log('No videos found');
      return null;
    }
    
    console.log(`Found ${allVideos.length} video(s)`);
    
    const formats = allVideos.map((video, index) => ({
      formatId: `direct_${index}`,
      ext: video.url.includes('.m3u8') ? 'm3u8' : 'mp4',
      quality: video.url.includes('.m3u8') ? 'HLS Stream' : `Quality ${index + 1}`,
      filesize: 0,
      url: video.url,
      isDirectDownload: false,
      type: 'video'
    }));
    
    return {
      isMulti: false,
      title: videoData.title,
      thumbnail: allVideos[0]?.poster || 'https://via.placeholder.com/640x360?text=Video',
      duration: 0,
      uploader: 'Direct Video Host',
      formats: formats
    };
    
  } catch (error) {
    console.error('Generic scraper error:', error.message);
    return null;
  } finally {
    if (page) await page.close();
  }
}

app.post('/api/video-info', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const isInstagram = url.includes('instagram.com');

  try {
    const { stdout } = await execPromise(`yt-dlp -J --flat-playlist --no-warnings "${url}"`);
    const data = JSON.parse(stdout);

    if (data._type === 'playlist' && data.entries) {
      const mediaItems = [];
      
      for (const entry of data.entries.slice(0, 20)) {
        try {
          const { stdout: entryData } = await execPromise(`yt-dlp -J --no-warnings "${entry.url || entry.id}"`);
          const entryInfo = JSON.parse(entryData);
          
          mediaItems.push({
            id: entry.id,
            title: entryInfo.title || entry.title || 'Untitled',
            thumbnail: entryInfo.thumbnail || entry.thumbnail,
            duration: entryInfo.duration,
            url: entry.url || entry.id,
            type: entryInfo.ext === 'jpg' || entryInfo.ext === 'png' ? 'image' : 'video',
            ext: entryInfo.ext,
            formats: entryInfo.formats ? getFormats(entryInfo) : []
          });
        } catch (err) {
          console.error('Error processing entry:', err.message);
        }
      }

      return res.json({
        isMulti: true,
        title: data.title || 'Multi-media Post',
        totalItems: data.entries.length,
        items: mediaItems
      });
    }

    const videoInfo = {
      isMulti: false,
      title: data.title,
      thumbnail: data.thumbnail,
      duration: data.duration,
      uploader: data.uploader || data.channel || 'Unknown',
      formats: getFormats(data)
    };

    res.json(videoInfo);

  } catch (error) {
    console.error('yt-dlp Error:', error.message);
    
    if (isInstagram && error.message.includes('No video formats found')) {
      console.log('Trying Instagram scraper...');
      const scraped = await scrapeInstagramCarousel(url);
      if (scraped) return res.json(scraped);
    }
    
    console.log('Trying generic video scraper...');
    const scrapedVideo = await scrapeGenericVideo(url);
    if (scrapedVideo) return res.json(scrapedVideo);
    
    res.status(500).json({ 
      error: 'Failed to fetch video information',
      details: error.message 
    });
  }
});

function getFormats(data) {
  const formats = [];
  
  if (!data.formats) return formats;

  const videoFormats = data.formats.filter(f => 
    f.vcodec !== 'none' && f.acodec !== 'none' && f.url
  );

  const audioFormats = data.formats.filter(f => 
    f.vcodec === 'none' && f.acodec !== 'none' && f.url
  );

  const seenQualities = new Set();

  videoFormats.forEach(format => {
    const quality = format.format_note || format.height + 'p' || 'Unknown';
    if (!seenQualities.has(quality)) {
      seenQualities.add(quality);
      formats.push({
        formatId: format.format_id,
        ext: format.ext,
        quality: quality,
        filesize: format.filesize,
        isDirectDownload: true,
        type: 'video'
      });
    }
  });

  if (audioFormats.length > 0) {
    const bestAudio = audioFormats[0];
    formats.push({
      formatId: bestAudio.format_id,
      ext: bestAudio.ext,
      quality: 'Audio Only',
      filesize: bestAudio.filesize,
      isDirectDownload: true,
      type: 'audio'
    });
  }

  return formats;
}

app.post('/api/direct-download', async (req, res) => {
  const { url, formatId } = req.body;

  if (!url || !formatId) {
    return res.status(400).json({ error: 'URL and formatId are required' });
  }

  try {
    const proc = spawn('yt-dlp', ['-f', formatId, '-o', '-', url]);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="video.mp4"`);

    proc.stdout.pipe(res);

    proc.on('error', (error) => {
      console.error('Process error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed' });
      }
    });

    proc.stderr.on('data', (data) => {
      console.error(`yt-dlp: ${data}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to download video' });
  }
});

process.on('exit', async () => {
  if (browser) await browser.close();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Using yt-dlp + Instagram + Generic video scraper');
});
