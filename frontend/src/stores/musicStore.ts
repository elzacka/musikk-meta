import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Track, SearchFilters } from '@/types/music';

interface SearchState {
  query: string;
  tracks: Track[];
  allTracks: Track[];
  loading: boolean;
  error: string | null;
  selectedTracks: Set<number>;
  filters: SearchFilters;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setTracks: (tracks: Track[]) => void;
  setAllTracks: (tracks: Track[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: SearchFilters) => void;
  resetFilters: () => void;
  toggleTrackSelection: (trackId: number) => void;
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
  selectedTracks: new Set<number>(),
  filters: {},
};

export const useMusicStore = create<MusicStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setQuery: (query) => set({ query }, false, 'setQuery'),
        setTracks: (tracks) => set({ tracks }, false, 'setTracks'),
        setAllTracks: (allTracks) => set({ allTracks }, false, 'setAllTracks'),
        setLoading: (loading) => set({ loading }, false, 'setLoading'),
        setError: (error) => set({ error }, false, 'setError'),
        setFilters: (filters) => set({ filters }, false, 'setFilters'),
        resetFilters: () => set({ filters: {} }, false, 'resetFilters'),

        toggleTrackSelection: (trackId) =>
          set((state) => {
            const next = new Set(state.selectedTracks);
            if (next.has(trackId)) {
              next.delete(trackId);
            } else {
              next.add(trackId);
            }
            return { selectedTracks: next };
          }, false, 'toggleTrackSelection'),

        selectAllTracks: (select) =>
          set((state) => ({
            selectedTracks: select
              ? new Set(state.tracks.map(t => t.id))
              : new Set<number>(),
          }), false, 'selectAllTracks'),

        clearSelection: () =>
          set({ selectedTracks: new Set<number>() }, false, 'clearSelection'),

        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'music-store',
        partialize: (state) => ({
          query: state.query,
          selectedTracks: Array.from(state.selectedTracks),
        }),
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.selectedTracks)) {
            state.selectedTracks = new Set(state.selectedTracks);
          }
        },
      }
    ),
    { name: 'music-store' }
  )
);

export const useSelectedTrackCount = () =>
  useMusicStore((state) => state.selectedTracks.size);

export const useSelectedTracks = () =>
  useMusicStore((state) => {
    const selectedIds = state.selectedTracks;
    return state.tracks.filter(track => selectedIds.has(track.id));
  });

export const useIsTrackSelected = (trackId: number) =>
  useMusicStore((state) => state.selectedTracks.has(trackId));
