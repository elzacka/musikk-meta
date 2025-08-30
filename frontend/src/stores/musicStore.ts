import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Track } from '@/types/music';

interface SearchState {
  query: string;
  tracks: Track[];
  allTracks: Track[];
  loading: boolean;
  error: string | null;
  selectedTracks: Set<string>;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setTracks: (tracks: Track[]) => void;
  setAllTracks: (tracks: Track[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleTrackSelection: (trackId: string) => void;
  selectAllTracks: (select: boolean) => void;
  clearSelection: () => void;
  reset: () => void;
}

type MusicStore = SearchState & SearchActions;

const initialState: SearchState = {
  query: '',
  tracks: [],
  allTracks: [],
  loading: false,
  error: null,
  selectedTracks: new Set<string>(),
};

export const useMusicStore = create<MusicStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setQuery: (query: string) =>
          set({ query }, false, 'setQuery'),

        setTracks: (tracks: Track[]) =>
          set({ tracks }, false, 'setTracks'),

        setAllTracks: (allTracks: Track[]) =>
          set({ allTracks }, false, 'setAllTracks'),

        setLoading: (loading: boolean) =>
          set({ loading }, false, 'setLoading'),

        setError: (error: string | null) =>
          set({ error }, false, 'setError'),

        toggleTrackSelection: (trackId: string) =>
          set((state) => {
            const newSelected = new Set(state.selectedTracks);
            if (newSelected.has(trackId)) {
              newSelected.delete(trackId);
            } else {
              newSelected.add(trackId);
            }
            return { selectedTracks: newSelected };
          }, false, 'toggleTrackSelection'),

        selectAllTracks: (select: boolean) =>
          set((state) => {
            if (select) {
              const allIds = new Set(state.tracks.map(t => t.id));
              return { selectedTracks: allIds };
            } else {
              return { selectedTracks: new Set<string>() };
            }
          }, false, 'selectAllTracks'),

        clearSelection: () =>
          set({ selectedTracks: new Set<string>() }, false, 'clearSelection'),

        reset: () =>
          set(initialState, false, 'reset'),
      }),
      {
        name: 'music-store',
        // Only persist certain fields
        partialize: (state) => ({
          query: state.query,
          selectedTracks: Array.from(state.selectedTracks), // Convert Set to Array for persistence
        }),
        // Deserialize the persisted selectedTracks back to Set
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.selectedTracks)) {
            state.selectedTracks = new Set(state.selectedTracks);
          }
        },
      }
    ),
    {
      name: 'music-store',
    }
  )
);

// Selectors for computed values
export const useSelectedTrackCount = () => 
  useMusicStore((state) => state.selectedTracks.size);

export const useSelectedTracks = () =>
  useMusicStore((state) => {
    const selectedIds = state.selectedTracks;
    return state.tracks.filter(track => selectedIds.has(track.id));
  });

export const useIsTrackSelected = (trackId: string) =>
  useMusicStore((state) => state.selectedTracks.has(trackId));