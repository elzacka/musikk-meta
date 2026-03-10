import { DeezerBrain } from './deezerBrain';
import { GoogleSheetsBrain } from './googleSheetsBrain';
import { searchAndPaginate } from './searchUtils';
import type { Track, SearchResponse, MusicDataSource } from '@/types/music';

/**
 * HybridBrain: Kombinerer Deezer (universelt søk, 70M+ spor)
 * med Google Sheets (lokale spor med audio features).
 *
 * Søkestrategi:
 * 1. Søk parallelt i Deezer og lokale data
 * 2. Lokale treff (med audio features) prioriteres
 * 3. Deezer-treff legges til etter, deduplisert
 * 4. Resultatet er én samlet liste
 */
export class HybridBrain implements MusicDataSource {
  private deezer = new DeezerBrain();
  private local: GoogleSheetsBrain | null;
  private localTracks: Track[] = [];

  constructor(local: GoogleSheetsBrain | null) {
    this.local = local;
  }

  async searchTracks({ query, page = 1, pageSize = 50 }: {
    query: string;
    page?: number;
    pageSize?: number;
  }): Promise<SearchResponse> {
    if (!query.trim()) {
      return { tracks: [], pages: 0, total: 0 };
    }

    // Søk parallelt i begge kilder
    const [deezerResult, localResult] = await Promise.allSettled([
      this.deezer.searchTracks({ query, page: 1, pageSize: 100 }),
      this.local
        ? this.searchLocal(query)
        : Promise.resolve({ tracks: [] as Track[], pages: 0, total: 0 }),
    ]);

    const deezerTracks = deezerResult.status === 'fulfilled' ? deezerResult.value.tracks : [];
    const localTracks = localResult.status === 'fulfilled' ? localResult.value.tracks : [];

    // Merk lokale spor
    const enrichedLocal = localTracks.map((t) => ({ ...t, source: 'local' as const }));

    // Dedupliser: fjern Deezer-treff som matcher lokale spor (basert på artist+tittel)
    const localKeys = new Set(
      enrichedLocal.map((t) => normalizeKey(t.artist_names, t.track_name))
    );

    const uniqueDeezer = deezerTracks.filter(
      (t) => !localKeys.has(normalizeKey(t.artist_names, t.track_name))
    );

    // Lokale først (har audio features), deretter Deezer
    const merged = [...enrichedLocal, ...uniqueDeezer];

    // Paginering
    const total = merged.length;
    const pages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;

    return {
      tracks: merged.slice(offset, offset + pageSize),
      pages,
      total,
    };
  }

  async getAllTracks(): Promise<Track[]> {
    if (!this.local) return [];

    const tracks = await this.local.getAllTracks();
    this.localTracks = tracks.map((t) => ({ ...t, source: 'local' as const }));
    return this.localTracks;
  }

  async refreshData(): Promise<void> {
    if (this.local) {
      await this.local.refreshData();
      this.localTracks = (await this.local.getAllTracks()).map((t) => ({
        ...t,
        source: 'local' as const,
      }));
    }
  }

  private async searchLocal(query: string): Promise<SearchResponse> {
    // Bruk cached lokale spor hvis tilgjengelige, ellers hent
    if (this.localTracks.length === 0 && this.local) {
      this.localTracks = await this.local.getAllTracks();
    }
    return searchAndPaginate(this.localTracks, query, 1, 200);
  }
}

function normalizeKey(artist?: string | null, title?: string | null): string {
  return `${(artist ?? '').toLowerCase().trim()}|||${(title ?? '').toLowerCase().trim()}`;
}
