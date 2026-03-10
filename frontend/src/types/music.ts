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
  added_by?: string | null;
  added_at?: string | null;
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

// Lydegenskaper som eget type for visualisering
export interface AudioFeatures {
  danceability: number;
  energy: number;
  loudness: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
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

// Paginering
export interface PaginationParams {
  page: number;
  page_size: number;
}

// Generisk API-svar
export interface ApiResponse<T> {
  ok: boolean;
  json: () => Promise<T>;
}

// Grensesnitt for datakilde (brain)
export interface MusicDataSource {
  search_tracks(params: {
    query: string;
    page?: number | string;
    page_size?: number;
  }): Promise<ApiResponse<SearchResponse>>;
  getAllTracks?(): Promise<Track[]>;
  refreshData?(): Promise<void>;
}

// UI-tilstandstyper
export type SortField = keyof Track;
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Diagramdata for visualiseringer
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Kommandopalett-type
export interface Command {
  id: string;
  label: string;
  value: string;
  keywords?: string[];
}

// Feiltype
export interface MusicError extends Error {
  code?: string;
  status?: number;
  context?: Record<string, unknown>;
}
