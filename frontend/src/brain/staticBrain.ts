import { sampleTracks } from '../data/sampleTracks';
import { SearchResponse, Track } from './data-contracts';

// Static implementation for GitHub Pages deployment
export class StaticBrain {
  async search_tracks({ query, page = 1, page_size = 20 }: { query: string; page?: number; page_size?: number }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!query.trim()) {
      return {
        ok: true,
        json: async () => ({
          tracks: [],
          pages: 0,
          total: 0
        })
      };
    }

    // Filter tracks based on query (case-insensitive search in track name and artist)
    const filteredTracks = sampleTracks.filter(track => 
      track.track_name?.toLowerCase().includes(query.toLowerCase()) ||
      track.artist_names?.toLowerCase().includes(query.toLowerCase()) ||
      track.album_name?.toLowerCase().includes(query.toLowerCase())
    );

    // Calculate pagination
    const total = filteredTracks.length;
    const totalPages = Math.ceil(total / page_size);
    const offset = (page - 1) * page_size;
    const paginatedTracks = filteredTracks.slice(offset, offset + page_size);

    const response: SearchResponse = {
      tracks: paginatedTracks,
      pages: totalPages,
      total: total
    };

    return {
      ok: true,
      json: async () => response
    };
  }

  async login() {
    return {
      ok: false,
      json: async () => ({
        detail: "Spotify integration not available in static version. This is a demo with sample data."
      })
    };
  }

  async create_playlist() {
    return {
      ok: false,
      json: async () => ({
        detail: "Spotify integration not available in static version. This is a demo with sample data."
      })
    };
  }

  async callback() {
    return {
      ok: false,
      json: async () => ({
        detail: "Spotify integration not available in static version."
      })
    };
  }

  async check_health() {
    return {
      ok: true,
      json: async () => ({ status: "OK - Static Demo Mode" })
    };
  }
}