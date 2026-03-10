import { fetchMusicTracks } from '../services/googleSheets';
import { searchAndPaginate } from './searchUtils';
import type { Track, SearchResponse, MusicDataSource } from '@/types/music';

export class GoogleSheetsBrain implements MusicDataSource {
  private tracks: Track[] = [];
  private lastFetch: number = 0;
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutter

  private async ensureFreshData(): Promise<Track[]> {
    const now = Date.now();

    if (this.tracks.length > 0 && (now - this.lastFetch) < this.cacheTimeout) {
      return this.tracks;
    }

    this.tracks = await fetchMusicTracks();
    this.lastFetch = now;
    return this.tracks;
  }

  async searchTracks({ query, page = 1, pageSize = 20 }: {
    query: string;
    page?: number;
    pageSize?: number;
  }): Promise<SearchResponse> {
    const allTracks = await this.ensureFreshData();
    return searchAndPaginate(allTracks, query, page, pageSize);
  }

  async getAllTracks(): Promise<Track[]> {
    return await this.ensureFreshData();
  }

  async refreshData(): Promise<void> {
    this.lastFetch = 0;
    await this.ensureFreshData();
  }
}
