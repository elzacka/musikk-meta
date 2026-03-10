import { sampleTracks } from '../data/sampleTracks';
import { SearchResponse, Track } from './data-contracts';

// Statisk brain-klient med eksempeldata for demo-modus
export class StaticBrain {
  async search_tracks({ query, page = 1, page_size = 20 }: {
    query: string;
    page?: number;
    page_size?: number;
  }) {
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!query.trim()) {
      return {
        ok: true,
        json: async () => ({ tracks: [], pages: 0, total: 0 })
      };
    }

    const searchTerm = query.toLowerCase();
    const filteredTracks = sampleTracks.filter(track =>
      track.track_name?.toLowerCase().includes(searchTerm) ||
      track.artist_names?.toLowerCase().includes(searchTerm) ||
      track.album_name?.toLowerCase().includes(searchTerm) ||
      track.genres?.toLowerCase().includes(searchTerm)
    );

    const total = filteredTracks.length;
    const totalPages = Math.ceil(total / page_size);
    const offset = (page - 1) * page_size;
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
    return sampleTracks;
  }

  async refreshData(): Promise<void> {
    // Ingen operasjon for statiske data
  }
}
