import { fetchMusicTracks } from '../services/googleSheets';
import { sampleTracks } from '../data/sampleTracks';
import { SearchResponse, Track } from './data-contracts';

// Enhanced brain client that uses Google Sheets as primary data source
export class GoogleSheetsBrain {
  private tracks: Track[] = [];
  private lastFetch: number = 0;
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

  private async ensureFreshData(): Promise<Track[]> {
    const now = Date.now();
    
    // Use cached data if fresh
    if (this.tracks.length > 0 && (now - this.lastFetch) < this.cacheTimeout) {
      return this.tracks;
    }

    try {
      // Try to fetch from Google Sheets
      console.log('🔄 Fetching fresh data from Google Sheets...');
      this.tracks = await fetchMusicTracks();
      this.lastFetch = now;
      console.log(`✅ Loaded ${this.tracks.length} tracks from Google Sheets`);
      return this.tracks;
    } catch (error) {
      console.warn('⚠️ Google Sheets fetch failed, using fallback data:', error);
      
      // Fallback to sample data if Google Sheets fails
      if (this.tracks.length === 0) {
        this.tracks = sampleTracks;
        this.lastFetch = now;
      }
      
      return this.tracks;
    }
  }

  async search_tracks({ query, page = 1, page_size = 20 }: { 
    query: string; 
    page?: number | string; 
    page_size?: number 
  }) {
    // Ensure page is a number
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    
    // Simulate API delay for UX consistency
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get fresh data
    const allTracks = await this.ensureFreshData();
    
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

    // Enhanced search: track name, artist, album, genres
    console.log(`🔍 Searching for "${query}" in ${allTracks.length} tracks`);
    console.log('🎵 Sample tracks:', allTracks.slice(0, 3).map(t => ({
      track_name: t.track_name,
      artist_names: t.artist_names
    })));

    const filteredTracks = allTracks.filter(track => {
      const searchTerm = query.toLowerCase();
      
      const matches = (
        track.track_name?.toLowerCase().includes(searchTerm) ||
        track.artist_names?.toLowerCase().includes(searchTerm) ||
        track.album_name?.toLowerCase().includes(searchTerm) ||
        track.genres?.toLowerCase().includes(searchTerm) ||
        track.record_label?.toLowerCase().includes(searchTerm)
      );

      if (matches) {
        console.log('✅ Match found:', {
          track: track.track_name,
          artist: track.artist_names,
          searchTerm
        });
      }

      return matches;
    });

    console.log(`🎯 Found ${filteredTracks.length} matches for "${query}"`);

    // Calculate pagination
    const total = filteredTracks.length;
    const totalPages = Math.ceil(total / page_size);
    const offset = (pageNum - 1) * page_size;
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

  // Keep compatibility with existing Spotify methods
  async login() {
    return {
      ok: false,
      json: async () => ({
        detail: "Spotify integration not available with Google Sheets data source."
      })
    };
  }

  async create_playlist() {
    return {
      ok: false,
      json: async () => ({
        detail: "Spotify integration not available with Google Sheets data source."
      })
    };
  }

  async callback() {
    return {
      ok: false,
      json: async () => ({
        detail: "Spotify integration not available with Google Sheets data source."
      })
    };
  }

  async check_health() {
    try {
      await this.ensureFreshData();
      return {
        ok: true,
        json: async () => ({ 
          status: `OK - Google Sheets (${this.tracks.length} tracks loaded)` 
        })
      };
    } catch (error) {
      return {
        ok: true,
        json: async () => ({ 
          status: `OK - Fallback Mode (${this.tracks.length} tracks loaded)` 
        })
      };
    }
  }

  // Additional utility methods
  async getAllTracks(): Promise<Track[]> {
    return await this.ensureFreshData();
  }

  async refreshData(): Promise<void> {
    this.lastFetch = 0; // Force refresh
    await this.ensureFreshData();
  }
}