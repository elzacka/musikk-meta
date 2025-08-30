// Core track interface matching the existing data structure
export interface Track {
  id: string;
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
  
  // Audio features
  danceability?: number | null;
  energy?: number | null;
  key_mode?: string | null;
  loudness?: number | null;
  mode?: number | null;
  speechiness?: number | null;
  acousticness?: number | null;
  instrumentalness?: number | null;
  liveness?: number | null;
  valence?: number | null;
  tempo?: number | null;
}

// Audio features as a separate type for visualization
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

// Search response from API
export interface SearchResponse {
  tracks: Track[];
  pages: number;
  total: number;
}

// Search filters
export interface SearchFilters {
  query?: string;
  genre?: string;
  minPopularity?: number;
  maxPopularity?: number;
  minYear?: number;
  maxYear?: number;
  minDuration?: number;
  maxDuration?: number;
  explicit?: boolean;
}

// Pagination
export interface PaginationParams {
  page: number;
  page_size: number;
}

// API response wrapper
export interface ApiResponse<T> {
  ok: boolean;
  json: () => Promise<T>;
}

// Brain/data source interface
export interface MusicDataSource {
  search_tracks(params: { 
    query: string; 
    page?: number | string; 
    page_size?: number; 
  }): Promise<ApiResponse<SearchResponse>>;
  
  login?(): Promise<ApiResponse<{ authorization_url?: string; detail?: string }>>;
  create_playlist?(): Promise<ApiResponse<{ detail?: string }>>;
  callback?(): Promise<ApiResponse<{ detail?: string }>>;
  check_health?(): Promise<ApiResponse<{ status: string }>>;
  getAllTracks?(): Promise<Track[]>;
  refreshData?(): Promise<void>;
}

// UI state types
export type SortField = keyof Track;
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Chart data for visualizations
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Command palette types
export interface Command {
  id: string;
  label: string;
  value: string;
  keywords?: string[];
}

// Playlist types (for future Spotify integration)
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  track_ids: string[];
  created_at: string;
  updated_at: string;
}

// Error types
export interface MusicError extends Error {
  code?: string;
  status?: number;
  context?: Record<string, unknown>;
}