import { Router, Request, Response } from 'express';
import axios from 'axios';
import { readData } from '../utils/fileStorage';

const router = Router();

// GET /api/player/metadata - Obtener metadata del track actual
router.get('/metadata', async (req: Request, res: Response) => {
  try {
    const config = await readData('config.json') as any;
    const currentSongUrl = 'https://radiosonline.one/listen/vesanico/currentsong?sid=1';
    
    const response = await axios.get(currentSongUrl);
    const data = response.data;

    let nowPlaying = data.title || data.currentSong || '';
    let albumCover = data.cover || null;

    let artist = '';
    let title = 'Stream en vivo';

    if (nowPlaying && nowPlaying.includes(' - ')) {
      const parts = nowPlaying.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    } else if (nowPlaying) {
      title = nowPlaying;
    }

    // Si no hay cover, intentar buscar en Last.fm
    if (!albumCover && artist && title) {
      try {
        const lastfmResponse = await axios.get(
          `https://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key=${process.env.LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json`
        );
        if (lastfmResponse.data.track?.album?.image?.[3]?.['#text']) {
          albumCover = lastfmResponse.data.track.album.image[3]['#text'];
        }
      } catch (e) {
        // Ignorar error de Last.fm
      }
    }

    res.json({
      title,
      artist,
      album: data.album || undefined,
      cover: albumCover || undefined,
    });
  } catch (error) {
    console.error('Get metadata error:', error);
    res.json({
      title: 'Radio Vesánico',
      artist: 'Transmisión en vivo',
      cover: undefined,
    });
  }
});

// GET /api/player/lyrics - Obtener letras de LRCLIB
router.get('/lyrics', async (req: Request, res: Response) => {
  try {
    const artist = Array.isArray(req.query.artist) ? req.query.artist[0] : req.query.artist;
    const title = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title;

    if (!artist || !title) {
      return res.status(400).json({ error: 'Artist and title required' });
    }

    const config = await readData('config.json') as any;
    const apiUrl = config.lyricsApiUrl || 'https://lrclib.net/api/search';

    const response = await axios.get(apiUrl, {
      params: { artist_name: artist, track_name: title },
    });

    const results = response.data;
    
    if (Array.isArray(results) && results.length > 0) {
      // Buscar la mejor coincidencia
      const bestMatch = results.find((r: any) => 
        r.artistName.toLowerCase() === (artist as string).toLowerCase() &&
        r.trackName.toLowerCase() === (title as string).toLowerCase()
      ) || results[0];

      res.json({
        lyrics: bestMatch.plainLyrics || bestMatch.syncedLyrics || 'Lyrics not available',
        source: 'LRCLIB',
      });
    } else {
      res.json({
        lyrics: 'Lyrics not found',
        source: 'LRCLIB',
      });
    }
  } catch (error) {
    console.error('Get lyrics error:', error);
    res.json({
      lyrics: 'Unable to fetch lyrics',
      source: 'LRCLIB',
    });
  }
});

export default router;
