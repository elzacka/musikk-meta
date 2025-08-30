/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** PlaylistRequest */
export interface PlaylistRequest {
  /** Track Uris */
  track_uris: string[];
  /**
   * Playlist Name
   * @default "VibeCraft Playlist"
   */
  playlist_name?: string;
}

/** SearchResponse */
export interface SearchResponse {
  /** Tracks */
  tracks: Track[];
  /** Pages */
  pages: number;
  /** Total */
  total: number;
}

/** Track */
export interface Track {
  /** Id */
  id: number;
  /** Track Uri */
  track_uri: string | null;
  /** Track Name */
  track_name: string | null;
  /** Album Name */
  album_name: string | null;
  /** Artist Names */
  artist_names: string | null;
  /** Release Date */
  release_date: string | null;
  /** Duration Ms */
  duration_ms: number | null;
  /** Popularity */
  popularity: number | null;
  /** Explicit */
  explicit: boolean | null;
  /** Genres */
  genres: string | null;
  /** Record Label */
  record_label: string | null;
  /** Danceability */
  danceability: number | null;
  /** Energy */
  energy: number | null;
  /** Key Mode */
  key_mode: number | null;
  /** Loudness */
  loudness: number | null;
  /** Mode */
  mode: number | null;
  /** Speechiness */
  speechiness: number | null;
  /** Acousticness */
  acousticness: number | null;
  /** Instrumentalness */
  instrumentalness: number | null;
  /** Liveness */
  liveness: number | null;
  /** Valence */
  valence: number | null;
  /** Tempo */
  tempo: number | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type LoginData = any;

export interface CallbackParams {
  /** Code */
  code: string;
  /** State */
  state: string;
}

export type CallbackData = any;

export type CallbackError = HTTPValidationError;

export type CreatePlaylistData = any;

export type CreatePlaylistError = HTTPValidationError;

export interface SearchTracksParams {
  /** Query */
  query: string;
  /**
   * Page
   * @default 1
   */
  page?: number;
  /**
   * Page Size
   * @default 20
   */
  page_size?: number;
}

export type SearchTracksData = SearchResponse;

export type SearchTracksError = HTTPValidationError;

/** Google Sheets API Response */
export interface SheetData {
  values: string[][];
}
