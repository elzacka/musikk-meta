// Kjernetype for et musikkspor
export interface Track {
  id: number;
  track_uri?: string | null;
  track_name?: string | null;
  album_name?: string | null;
  artist_names?: string | null;
  release_date?: string | null;
  duration_ms?: number | null;
  popularity?: number | null;
  explicit?: boolean | null;
  genres?: string | null;
  record_label?: string | null;

  // Lydegenskaper fra Spotify Audio Features
  danceability?: number | null;
  energy?: number | null;
  key_mode?: number | null;       // Numerisk toneart-indeks: 0=C, 1=C#, ..., 11=B
  loudness?: number | null;
  mode?: number | null;           // 0 = moll, 1 = dur
  speechiness?: number | null;
  acousticness?: number | null;
  instrumentalness?: number | null;
  liveness?: number | null;
  valence?: number | null;
  tempo?: number | null;
  time_signature?: number | null; // Taktart (vanligvis 3 eller 4)
}

// Søkesvar fra datakilde
export interface SearchResponse {
  tracks: Track[];
  pages: number;
  total: number;
}

// Søkefiltre
export interface SearchFilters {
  query?: string;
  genre?: string;
  minPopularity?: number;
  maxPopularity?: number;
  minYear?: number;
  maxYear?: number;
  minDuration?: number;
  maxDuration?: number;
  minBpm?: number;
  maxBpm?: number;
  minEnergy?: number;
  maxEnergy?: number;
  minDanceability?: number;
  maxDanceability?: number;
  minValence?: number;
  maxValence?: number;
  explicit?: boolean;
}

// Grensesnitt for datakilde (brain)
export interface MusicDataSource {
  searchTracks(params: {
    query: string;
    page?: number;
    pageSize?: number;
  }): Promise<SearchResponse>;
  getAllTracks(): Promise<Track[]>;
  refreshData(): Promise<void>;
}

// UI-tilstandstyper
export type SortField = keyof Track;
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Google Sheets API-svar
export interface SheetData {
  values: string[][];
}
