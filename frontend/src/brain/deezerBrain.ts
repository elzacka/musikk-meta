import { searchDeezer } from '@/services/deezer';
import type { Track, SearchResponse, MusicDataSource } from '@/types/music';

export class DeezerBrain implements MusicDataSource {
  async searchTracks({ query, page = 1, pageSize = 50 }: {
    query: string;
    page?: number;
    pageSize?: number;
  }): Promise<SearchResponse> {
    if (!query.trim()) {
      return { tracks: [], pages: 0, total: 0 };
    }

    const limit = Math.min(pageSize * page, 100); // Deezer maks 100 per søk
    const tracks = await searchDeezer(query, limit);

    const total = tracks.length;
    const pages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;

    return {
      tracks: tracks.slice(offset, offset + pageSize),
      pages,
      total,
    };
  }

  async getAllTracks(): Promise<Track[]> {
    // Deezer har ikke «hent alt» — returnerer tom liste
    return [];
  }

  async refreshData(): Promise<void> {
    // Ingen cache å tømme
  }
}
