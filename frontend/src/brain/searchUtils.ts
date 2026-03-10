import type { Track, SearchResponse } from '@/types/music';

export function searchAndPaginate(
  tracks: Track[],
  query: string,
  page: number,
  pageSize: number,
): SearchResponse {
  if (!query.trim()) {
    return { tracks: [], pages: 0, total: 0 };
  }

  const term = query.toLowerCase();
  const filtered = tracks.filter(t =>
    t.track_name?.toLowerCase().includes(term) ||
    t.artist_names?.toLowerCase().includes(term) ||
    t.album_name?.toLowerCase().includes(term) ||
    t.genres?.toLowerCase().includes(term) ||
    t.record_label?.toLowerCase().includes(term)
  );

  const total = filtered.length;
  const pages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;

  return {
    tracks: filtered.slice(offset, offset + pageSize),
    pages,
    total,
  };
}
