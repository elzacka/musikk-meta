import { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Music2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { AudioDnaBar } from '@/components/AudioDnaBar';
import { TrackListSkeleton } from '@/components/Loading';
import { useMusicStore } from '@/stores/musicStore';
import { fmtDuration, fmtNum } from '@/utils/formatters';
import type { Track, SearchFilters } from '@/types/music';

const PAGE_SIZE = 50;

// --- Sortering ---

type SortKey = keyof Track;
type SortDir = 'asc' | 'desc';
interface SortConfig { key: SortKey; dir: SortDir }

function SortIcon({ k, config }: { k: SortKey; config: SortConfig | null }) {
  if (!config || config.key !== k) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-25" />;
  return config.dir === 'asc'
    ? <ArrowUp className="ml-1 h-3 w-3 text-blue-400" />
    : <ArrowDown className="ml-1 h-3 w-3 text-blue-400" />;
}

// --- Sorteringsmeny-alternativer ---

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'popularity', label: 'Popularitet' },
  { key: 'artist_names', label: 'Artist' },
  { key: 'track_name', label: 'Tittel' },
  { key: 'album_name', label: 'Album' },
  { key: 'release_date', label: 'Utgivelsesår' },
  { key: 'duration_ms', label: 'Varighet' },
  { key: 'tempo', label: 'BPM' },
  { key: 'energy', label: 'Energi' },
  { key: 'danceability', label: 'Dansbarhet' },
  { key: 'valence', label: 'Valens' },
  { key: 'acousticness', label: 'Akustisk' },
  { key: 'speechiness', label: 'Tale' },
  { key: 'instrumentalness', label: 'Instrumental' },
  { key: 'liveness', label: 'Live' },
  { key: 'loudness', label: 'Lydstyrke' },
  { key: 'key_mode', label: 'Toneart' },
];

// --- Rad-aksentfarge ---

function getRowAccent(track: Track): string {
  if ((track.energy ?? 0) > 0.7) return 'border-l-rose-500/40';
  if ((track.valence ?? 0) > 0.7) return 'border-l-amber-400/40';
  if ((track.acousticness ?? 0) > 0.6) return 'border-l-teal-400/40';
  return 'border-l-gray-700/20';
}

// --- Klient-side filtrering ---

function applyFilters(tracks: Track[], filters: SearchFilters): Track[] {
  return tracks.filter((t) => {
    if (filters.genre) {
      const genres = (t.genres ?? '').toLowerCase();
      if (!genres.includes(filters.genre.toLowerCase())) return false;
    }
    if (filters.minPopularity !== undefined && (t.popularity ?? 0) < filters.minPopularity) return false;
    if (filters.maxPopularity !== undefined && (t.popularity ?? 100) > filters.maxPopularity) return false;
    if (filters.minYear !== undefined || filters.maxYear !== undefined) {
      const year = t.release_date ? parseInt(t.release_date.slice(0, 4)) : null;
      if (year === null) return false;
      if (filters.minYear !== undefined && year < filters.minYear) return false;
      if (filters.maxYear !== undefined && year > filters.maxYear) return false;
    }
    if (filters.minBpm !== undefined && (t.tempo ?? 0) < filters.minBpm) return false;
    if (filters.maxBpm !== undefined && (t.tempo ?? 999) > filters.maxBpm) return false;
    if (filters.minEnergy !== undefined && Math.round((t.energy ?? 0) * 100) < filters.minEnergy) return false;
    if (filters.maxEnergy !== undefined && Math.round((t.energy ?? 0) * 100) > filters.maxEnergy) return false;
    if (filters.minDanceability !== undefined && Math.round((t.danceability ?? 0) * 100) < filters.minDanceability) return false;
    if (filters.maxDanceability !== undefined && Math.round((t.danceability ?? 0) * 100) > filters.maxDanceability) return false;
    if (filters.minValence !== undefined && Math.round((t.valence ?? 0) * 100) < filters.minValence) return false;
    if (filters.maxValence !== undefined && Math.round((t.valence ?? 0) * 100) > filters.maxValence) return false;
    if (filters.explicit !== undefined && t.explicit !== filters.explicit) return false;
    return true;
  });
}

// --- Sorteringsmeny-komponent ---

function SortMenu({ config, onSort }: { config: SortConfig | null; onSort: (key: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeLabel = config ? sortOptions.find(o => o.key === config.key)?.label ?? 'Sorter' : 'Sorter';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-400 hover:text-white border border-gray-700/50 rounded-lg bg-gray-900/40 hover:bg-gray-800/50 transition-colors"
      >
        {activeLabel}
        {config && (
          <span className="text-blue-400">{config.dir === 'asc' ? '\u2191' : '\u2193'}</span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-xl z-30">
          {sortOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { onSort(key); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                config?.key === key
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {label}
              {config?.key === key && (
                <span className="ml-1.5 text-blue-400">{config.dir === 'asc' ? '\u2191' : '\u2193'}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Komponent ---

interface SearchResultsProps {
  tracks: Track[];
  allTracks: Track[];
  query: string;
  filters: SearchFilters;
  loading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ tracks, allTracks, query, filters, loading }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'popularity', dir: 'desc' });
  const [page, setPage] = useState(1);
  const setSelectedTrack = useMusicStore((s) => s.setSelectedTrack);

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  const baseSource = query.trim() ? tracks : (hasActiveFilters ? allTracks : []);

  const filtered = useMemo(() => applyFilters(baseSource, filters), [baseSource, filters]);

  const sorted = useMemo(() => {
    if (!sortConfig) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
      else if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv, 'nb');
      else if (typeof av === 'boolean' && typeof bv === 'boolean') cmp = Number(av) - Number(bv);
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortConfig]);

  const visible = useMemo(() => sorted.slice(0, page * PAGE_SIZE), [sorted, page]);

  const toggleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { key, dir: key === 'track_name' || key === 'artist_names' ? 'asc' : 'desc' };
    });
    setPage(1);
  };

  const SortBtn = ({ sortKey, children }: { sortKey: SortKey; children: React.ReactNode }) => (
    <button
      onClick={() => toggleSort(sortKey)}
      className="flex items-center whitespace-nowrap font-medium text-xs text-gray-400 hover:text-white transition-colors"
    >
      {children}
      <SortIcon k={sortKey} config={sortConfig} />
    </button>
  );

  if (loading) return <TrackListSkeleton count={8} />;

  if (!query.trim() && !hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4">
          <Music2 className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm">Søk etter musikk, eller bruk filter for å utforske</p>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4">
          <Music2 className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm">Ingen treff. Prøv et annet søk eller juster filtrene.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header med resultattelling + sorteringsmeny */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          <span className="font-medium text-white">{filtered.length}</span>
          {' '}{filtered.length === 1 ? 'låt' : 'låter'}
          {filtered.length !== baseSource.length && (
            <span className="text-gray-600"> (filtrert fra {baseSource.length})</span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-600 hidden sm:block">Klikk en rad for detaljer</p>
          <SortMenu config={sortConfig} onSort={toggleSort} />
        </div>
      </div>

      {/* Tabell — desktop */}
      <div className="hidden md:block rounded-xl border border-gray-800/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800/50 hover:bg-transparent bg-gray-900/60">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead className="min-w-[10rem]">
                <SortBtn sortKey="artist_names">Artist</SortBtn>
              </TableHead>
              <TableHead className="min-w-[12rem]">
                <SortBtn sortKey="track_name">Tittel</SortBtn>
              </TableHead>
              <TableHead className="min-w-[10rem] hidden lg:table-cell">
                <SortBtn sortKey="album_name">Album</SortBtn>
              </TableHead>
              <TableHead className="w-16"><SortBtn sortKey="duration_ms">Tid</SortBtn></TableHead>
              <TableHead className="w-16"><SortBtn sortKey="release_date">År</SortBtn></TableHead>
              <TableHead className="w-14"><SortBtn sortKey="popularity">Pop.</SortBtn></TableHead>
              <TableHead className="w-40">
                <span className="text-xs font-medium text-gray-400">Audio DNA</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((track, i) => (
              <TableRow
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                className={`border-gray-800/30 hover:bg-gray-800/40 cursor-pointer transition-colors group border-l-4 ${getRowAccent(track)}`}
              >
                <TableCell className="text-center text-xs text-gray-600 font-mono">
                  {i + 1}
                </TableCell>
                <TableCell className="font-medium text-sm text-gray-200 truncate max-w-[10rem]">
                  {track.artist_names || '–'}
                </TableCell>
                <TableCell className="text-sm text-white truncate max-w-[12rem]">
                  {track.track_name || '–'}
                </TableCell>
                <TableCell className="text-sm text-gray-400 truncate max-w-[10rem] hidden lg:table-cell">
                  {track.album_name || '–'}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-300">{fmtDuration(track.duration_ms)}</TableCell>
                <TableCell className="text-xs text-gray-400">{track.release_date?.slice(0, 4) || '–'}</TableCell>
                <TableCell className="text-xs font-medium text-yellow-400">{fmtNum(track.popularity)}</TableCell>
                <TableCell>
                  <AudioDnaBar track={track} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Kort-visning — mobil */}
      <div className="md:hidden space-y-2">
        {visible.map((track, i) => (
          <button
            key={track.id}
            onClick={() => setSelectedTrack(track)}
            className={`w-full text-left bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 hover:bg-gray-800/50 transition-colors border-l-4 ${getRowAccent(track)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xs text-gray-600 font-mono w-6 shrink-0 pt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{track.track_name || '–'}</p>
                <p className="text-gray-400 text-xs truncate mt-0.5">{track.artist_names || '–'}</p>
                {track.album_name && (
                  <p className="text-gray-600 text-xs truncate">{track.album_name}</p>
                )}
                {track.genres && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {track.genres.split(',').slice(0, 3).map((g) => (
                      <span key={g} className="px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-800/60 rounded">
                        {g.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2">
                  <AudioDnaBar track={track} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Last flere */}
      {visible.length < sorted.length && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            className="border-gray-700/50 bg-gray-900/40 hover:bg-gray-800/60 text-gray-300 rounded-xl text-sm"
          >
            Last {Math.min(PAGE_SIZE, sorted.length - visible.length)} til
            <span className="ml-1.5 text-gray-500">({visible.length} av {sorted.length})</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
