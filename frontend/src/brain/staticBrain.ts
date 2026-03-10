import { sampleTracks } from '../data/sampleTracks';
import { searchAndPaginate } from './searchUtils';
import type { SearchResponse, MusicDataSource } from '@/types/music';

export class StaticBrain implements MusicDataSource {
  async searchTracks({ query, page = 1, pageSize = 20 }: {
    query: string;
    page?: number;
    pageSize?: number;
  }): Promise<SearchResponse> {
    return searchAndPaginate(sampleTracks, query, page, pageSize);
  }

  async getAllTracks() {
    return sampleTracks;
  }

  async refreshData(): Promise<void> {
    // Ingen operasjon for statiske data
  }
}
