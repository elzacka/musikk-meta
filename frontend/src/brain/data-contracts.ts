// Søkesvar
export interface SearchResponse {
  tracks: Track[];
  pages: number;
  total: number;
}

// Sportype - samsvarer med Track i types/music.ts
export interface Track {
  id: number;
  track_uri: string | null;
  track_name: string | null;
  album_name: string | null;
  artist_names: string | null;
  release_date: string | null;
  duration_ms: number | null;
  popularity: number | null;
  explicit: boolean | null;
  added_by: string | null;
  added_at: string | null;
  genres: string | null;
  record_label: string | null;
  danceability: number | null;
  energy: number | null;
  key_mode: number | null;
  loudness: number | null;
  mode: number | null;
  speechiness: number | null;
  acousticness: number | null;
  instrumentalness: number | null;
  liveness: number | null;
  valence: number | null;
  tempo: number | null;
  time_signature: number | null;
}

// Google Sheets API-svar
export interface SheetData {
  values: string[][];
}
