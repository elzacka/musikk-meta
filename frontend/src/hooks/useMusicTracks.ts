import { useState, useEffect } from 'react';
import type { Track } from '../types';
import { fetchMusicTracks } from '../services/googleSheets';

export function useMusicTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMusicTracks();
      setTracks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  return { tracks, loading, error, refetch: loadTracks };
}