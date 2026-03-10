import { fetchMusicTracks } from '../services/googleSheets';
import { SearchResponse, Track } from './data-contracts';

// Brain-klient som bruker Google Sheets som primær datakilde
export class GoogleSheetsBrain {
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

  async search_tracks({ query, page = 1, page_size = 20 }: {
    query: string;
    page?: number | string;
    page_size?: number;
  }) {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;

    // Simulert nettverksforsinkelse for konsistent UX
    await new Promise(resolve => setTimeout(resolve, 150));

    const allTracks = await this.ensureFreshData();

    if (!query.trim()) {
      return {
        ok: true,
        json: async () => ({ tracks: [], pages: 0, total: 0 })
      };
    }

    const searchTerm = query.toLowerCase();
    const filteredTracks = allTracks.filter(track =>
      track.track_name?.toLowerCase().includes(searchTerm) ||
      track.artist_names?.toLowerCase().includes(searchTerm) ||
      track.album_name?.toLowerCase().includes(searchTerm) ||
      track.genres?.toLowerCase().includes(searchTerm) ||
      track.record_label?.toLowerCase().includes(searchTerm)
    );

    const total = filteredTracks.length;
    const totalPages = Math.ceil(total / page_size);
    const offset = (pageNum - 1) * page_size;
    const paginatedTracks = filteredTracks.slice(offset, offset + page_size);

    const response: SearchResponse = {
      tracks: paginatedTracks,
      pages: totalPages,
      total,
    };

    return {
      ok: true,
      json: async () => response,
    };
  }

  async getAllTracks(): Promise<Track[]> {
    return await this.ensureFreshData();
  }

  async refreshData(): Promise<void> {
    this.lastFetch = 0;
    await this.ensureFreshData();
  }
}
