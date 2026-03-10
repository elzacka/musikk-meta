import type { Track } from '@/types/music';

// Deezer API-typer (kun feltene vi bruker)

interface DeezerArtist {
  id: number;
  name: string;
}

interface DeezerAlbum {
  id: number;
  title: string;
  cover_medium?: string;
  release_date?: string;
}

interface DeezerGenre {
  id: number;
  name: string;
}

interface DeezerTrack {
  id: number;
  title: string;
  duration: number;           // sekunder
  rank: number;               // 0–1 000 000
  explicit_lyrics: boolean;
  preview: string;            // 30-sek MP3-URL
  bpm: number;                // BPM (0 hvis ukjent)
  gain: number;               // dB
  artist: DeezerArtist;
  album: DeezerAlbum;
}

interface DeezerSearchResponse {
  data: DeezerTrack[];
  total: number;
  next?: string;
}

interface DeezerAlbumDetail {
  id: number;
  label?: string;
  genres?: { data: DeezerGenre[] };
  release_date?: string;
}

// Deezer API-basURL
// Dev: Vite proxy (/api/deezer → api.deezer.com)
// Prod: Cloudflare Worker (VITE_DEEZER_PROXY_URL)
const BASE_URL = import.meta.env.VITE_DEEZER_PROXY_URL || '/api/deezer';

function mapDeezerTrack(dt: DeezerTrack, albumDetail?: DeezerAlbumDetail): Track {
  const genres = albumDetail?.genres?.data
    ?.map((g) => g.name)
    .filter((n) => n.toLowerCase() !== 'all')
    .join(', ') || null;

  return {
    id: dt.id,
    track_name: dt.title,
    artist_names: dt.artist.name,
    album_name: dt.album.title,
    duration_ms: dt.duration * 1000,
    popularity: Math.round(dt.rank / 10000),  // 0–1M → 0–100
    explicit: dt.explicit_lyrics,
    preview_url: dt.preview || null,
    cover_url: dt.album.cover_medium || null,
    release_date: albumDetail?.release_date || dt.album.release_date || null,
    record_label: albumDetail?.label || null,
    genres,
    tempo: dt.bpm > 0 ? dt.bpm : null,
    loudness: dt.gain !== 0 ? dt.gain : null,
    source: 'deezer',
  };
}

export async function searchDeezer(query: string, limit = 50): Promise<Track[]> {
  if (!query.trim()) return [];

  const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Deezer API-feil ${response.status}`);
  }

  const data: DeezerSearchResponse = await response.json();

  if (!data.data?.length) return [];

  // Map grunndata uten albumdetaljer (raskere)
  const tracks = data.data.map((dt) => mapDeezerTrack(dt));

  // Hent albumdetaljer for de første 10 sporene (sjanger, label, utgivelsesdato)
  // Batcher dette for å unngå for mange samtidige kall
  const uniqueAlbumIds = [...new Set(data.data.slice(0, 10).map((dt) => dt.album.id))];
  const albumDetails = await fetchAlbumDetails(uniqueAlbumIds);

  // Berik sporene med albumdetaljer
  for (const track of tracks) {
    const dt = data.data.find((d) => d.id === track.id);
    if (dt && albumDetails.has(dt.album.id)) {
      const detail = albumDetails.get(dt.album.id)!;
      const enriched = mapDeezerTrack(dt, detail);
      if (enriched.genres) track.genres = enriched.genres;
      if (enriched.record_label) track.record_label = enriched.record_label;
      if (enriched.release_date) track.release_date = enriched.release_date;
    }
  }

  return tracks;
}

async function fetchAlbumDetails(albumIds: number[]): Promise<Map<number, DeezerAlbumDetail>> {
  const results = new Map<number, DeezerAlbumDetail>();

  // Hent parallelt, maks 5 samtidige
  const chunks = [];
  for (let i = 0; i < albumIds.length; i += 5) {
    chunks.push(albumIds.slice(i, i + 5));
  }

  for (const chunk of chunks) {
    const fetches = chunk.map(async (id) => {
      try {
        const res = await fetch(`${BASE_URL}/album/${id}`);
        if (res.ok) {
          const detail: DeezerAlbumDetail = await res.json();
          results.set(id, detail);
        }
      } catch {
        // Ignorer feil for enkeltalbum — ikke kritisk
      }
    });
    await Promise.all(fetches);
  }

  return results;
}

export async function getDeezerTrack(id: number): Promise<Track | null> {
  try {
    const res = await fetch(`${BASE_URL}/track/${id}`);
    if (!res.ok) return null;
    const dt: DeezerTrack = await res.json();
    return mapDeezerTrack(dt);
  } catch {
    return null;
  }
}
