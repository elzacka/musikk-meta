import type { Track, SheetData } from '../types/music';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

// Henter kolonnene A til Y (25 kolonner, inkl. time_signature i kolonne Y/24)
const RANGE = 'A:Y';

// Hjelpefunksjoner for sikker parsing – unngår || null-fellen der 0 blir null
function safeParseFloat(value: string | undefined): number | null {
  if (value === undefined || value === '') return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

function safeParseInt(value: string | undefined): number | null {
  if (value === undefined || value === '') return null;
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

function safeParseBool(value: string | undefined): boolean | null {
  if (value === undefined || value === '') return null;
  return value.toLowerCase() === 'true';
}

export async function fetchMusicTracks(): Promise<Track[]> {
  if (!SHEET_ID || !API_KEY) {
    throw new Error('Google Sheets-konfigurasjon mangler (VITE_GOOGLE_SHEET_ID eller VITE_GOOGLE_SHEETS_API_KEY)');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets API-feil ${response.status}: ${errorText}`);
  }

  const data: SheetData = await response.json();

  if (!data.values || data.values.length <= 1) {
    return [];
  }

  // Hopp over header-raden og map til Track-objekter
  // Kolonnestruktur (0-indeksert):
  // 0:  Track URI
  // 1:  Track Name
  // 2:  Album Name
  // 3:  Artist Name(s)
  // 4:  Release Date
  // 5:  Duration (ms)
  // 6:  Popularity
  // 7:  Explicit
  // 8:  Added By
  // 9:  Added At
  // 10: Genres
  // 11: Record Label
  // 12: Danceability
  // 13: Energy
  // 14: Key (numerisk indeks 0-11)
  // 15: Loudness
  // 16: Mode (0=moll, 1=dur)
  // 17: Speechiness
  // 18: Acousticness
  // 19: Instrumentalness
  // 20: Liveness
  // 21: Valence
  // 22: Tempo (BPM)
  // 23: (ubrukt/ukjent kolonne)
  // 24: Time Signature
  const tracks = data.values.slice(1).map((row, index): Track => ({
    id: index + 1,
    track_uri:        row[0]  || null,
    track_name:       row[1]  || null,
    album_name:       row[2]  || null,
    artist_names:     row[3]  || null,
    release_date:     row[4]  || null,
    duration_ms:      safeParseInt(row[5]),
    popularity:       safeParseInt(row[6]),
    explicit:         safeParseBool(row[7]),
    added_by:         row[8]  || null,
    added_at:         row[9]  || null,
    genres:           row[10] || null,
    record_label:     row[11] || null,
    danceability:     safeParseFloat(row[12]),
    energy:           safeParseFloat(row[13]),
    key_mode:         safeParseInt(row[14]),
    loudness:         safeParseFloat(row[15]),
    mode:             safeParseInt(row[16]),
    speechiness:      safeParseFloat(row[17]),
    acousticness:     safeParseFloat(row[18]),
    instrumentalness: safeParseFloat(row[19]),
    liveness:         safeParseFloat(row[20]),
    valence:          safeParseFloat(row[21]),
    tempo:            safeParseFloat(row[22]),
    time_signature:   safeParseInt(row[24]),
  }));

  return tracks.filter(track => track.track_name && track.track_name.trim() !== '');
}

export function getUniqueGenres(tracks: Track[]): string[] {
  const genres = tracks
    .map(track => track.genres)
    .filter(Boolean)
    .flatMap(genreString => genreString!.split(',').map(g => g.trim()))
    .filter(genre => genre !== '');
  return [...new Set(genres)].sort();
}

export function getUniqueArtists(tracks: Track[]): string[] {
  const artists = tracks
    .map(track => track.artist_names)
    .filter(Boolean)
    .flatMap(artistString => artistString!.split(',').map(a => a.trim()))
    .filter(artist => artist !== '');
  return [...new Set(artists)].sort();
}

export function getUniqueLabels(tracks: Track[]): string[] {
  const labels = tracks
    .map(track => track.record_label)
    .filter(Boolean)
    .map(label => label!.trim())
    .filter(label => label !== '');
  return [...new Set(labels)].sort();
}
