import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown, Music2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TrackModal } from '@/components/TrackModal';
import { TrackListSkeleton } from '@/components/Loading';
import type { Track, SearchFilters } from '@/types/music';

const PAGE_SIZE = 50;

// --- Formateringshjelpere ---

const fmtDuration = (ms: number | null | undefined): string => {
  if (!ms) return '–';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const fmtKey = (key: number | null | undefined, mode: number | null | undefined): string => {
  if (key === null || key === undefined) return '–';
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const k = keys[key] ?? '?';
  if (mode === null || mode === undefined) return k;
  return `${k} ${mode === 1 ? 'dur' : 'moll'}`;
};

const fmtPct = (v: number | null | undefined): string => {
  if (v === null || v === undefined) return '–';
  return `${Math.round(v * 100)} %`;
};

const fmtNum = (v: number | null | undefined): string => {
  if (v === null || v === undefined) return '–';
  return String(Math.round(v));
};

const fmtFloat = (v: number | null | undefined, d = 1): string => {
  if (v === null || v === undefined) return '–';
  return v.toFixed(d);
};

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
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [page, setPage] = useState(1);

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  // Vis søkeresultater hvis query finnes, ellers allTracks (for filter-only browsing)
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

  // Tom tilstand — ingen søk og ingen aktive filtre
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
    <>
      <TrackModal track={selectedTrack} onClose={() => setSelectedTrack(null)} />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            <span className="font-medium text-white">{filtered.length}</span>
            {' '}{filtered.length === 1 ? 'låt' : 'låter'}
            {filtered.length !== baseSource.length && (
              <span className="text-gray-600"> (filtrert fra {baseSource.length})</span>
            )}
          </p>
          <p className="text-xs text-gray-600 hidden sm:block">Klikk en rad for detaljer og lydprofil</p>
        </div>

        {/* Tabell — desktop */}
        <div className="hidden md:block">
          <ScrollArea className="w-full rounded-xl border border-gray-800/50">
            <Table className="min-w-max">
              <TableHeader>
                <TableRow className="border-gray-800/50 hover:bg-transparent bg-gray-900/60">
                  <TableHead className="sticky left-0 z-10 bg-gray-900/95 w-10 text-center">#</TableHead>
                  <TableHead className="sticky left-10 z-10 bg-gray-900/95 min-w-[11rem]">
                    <SortBtn sortKey="artist_names">Artist</SortBtn>
                  </TableHead>
                  <TableHead className="sticky left-[11rem] z-10 bg-gray-900/95 min-w-[14rem]">
                    <SortBtn sortKey="track_name">Tittel</SortBtn>
                  </TableHead>
                  <TableHead className="min-w-[11rem]">
                    <SortBtn sortKey="album_name">Album</SortBtn>
                  </TableHead>
                  <TableHead className="w-16"><SortBtn sortKey="duration_ms">Tid</SortBtn></TableHead>
                  <TableHead className="w-20"><SortBtn sortKey="release_date">Utgitt</SortBtn></TableHead>
                  <TableHead className="w-16"><SortBtn sortKey="popularity">Pop.</SortBtn></TableHead>
                  <TableHead className="w-14"><SortBtn sortKey="explicit">Expl.</SortBtn></TableHead>
                  <TableHead className="min-w-[9rem]"><SortBtn sortKey="genres">Sjanger</SortBtn></TableHead>
                  <TableHead className="w-16"><SortBtn sortKey="tempo">BPM</SortBtn></TableHead>
                  <TableHead className="w-24"><SortBtn sortKey="key_mode">Toneart</SortBtn></TableHead>
                  <TableHead className="w-16"><SortBtn sortKey="time_signature">Takt</SortBtn></TableHead>
                  <TableHead className="w-18"><SortBtn sortKey="energy">Energi</SortBtn></TableHead>
                  <TableHead className="w-20"><SortBtn sortKey="danceability">Dansbar</SortBtn></TableHead>
                  <TableHead className="w-18"><SortBtn sortKey="valence">Valens</SortBtn></TableHead>
                  <TableHead className="w-24"><SortBtn sortKey="loudness">Lydstyrke</SortBtn></TableHead>
                  <TableHead className="w-18"><SortBtn sortKey="acousticness">Akust.</SortBtn></TableHead>
                  <TableHead className="w-16"><SortBtn sortKey="speechiness">Tale</SortBtn></TableHead>
                  <TableHead className="w-16"><SortBtn sortKey="instrumentalness">Instr.</SortBtn></TableHead>
                  <TableHead className="w-16"><SortBtn sortKey="liveness">Live</SortBtn></TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((track, i) => (
                  <TableRow
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className="border-gray-800/30 hover:bg-gray-800/40 cursor-pointer transition-colors group"
                  >
                    <TableCell className="sticky left-0 z-10 bg-gray-950/95 group-hover:bg-gray-800/50 text-center text-xs text-gray-600 font-mono">
                      {i + 1}
                    </TableCell>
                    <TableCell className="sticky left-10 z-10 bg-gray-950/95 group-hover:bg-gray-800/50 font-medium text-sm text-gray-200 truncate max-w-[11rem]">
                      {track.artist_names || '–'}
                    </TableCell>
                    <TableCell className="sticky left-[11rem] z-10 bg-gray-950/95 group-hover:bg-gray-800/50 text-sm text-white truncate max-w-[14rem]">
                      {track.track_name || '–'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400 truncate max-w-[11rem]">
                      {track.album_name || '–'}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-300">{fmtDuration(track.duration_ms)}</TableCell>
                    <TableCell className="text-xs text-gray-400">{track.release_date?.slice(0, 4) || '–'}</TableCell>
                    <TableCell className="text-xs font-medium text-yellow-400">{fmtNum(track.popularity)}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {track.explicit === null || track.explicit === undefined ? '–' : track.explicit ? 'Ja' : 'Nei'}
                    </TableCell>
                    <TableCell className="text-xs text-gray-400 truncate max-w-[9rem]">{track.genres || '–'}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-300">{track.tempo ? fmtNum(track.tempo) : '–'}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-300">{fmtKey(track.key_mode, track.mode)}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-400">{track.time_signature ? `${track.time_signature}/4` : '–'}</TableCell>
                    <TableCell className="font-mono text-xs text-red-400">{fmtPct(track.energy)}</TableCell>
                    <TableCell className="font-mono text-xs text-blue-400">{fmtPct(track.danceability)}</TableCell>
                    <TableCell className="font-mono text-xs text-green-400">{fmtPct(track.valence)}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-400">{track.loudness !== null && track.loudness !== undefined ? `${fmtFloat(track.loudness)} dB` : '–'}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-400">{fmtPct(track.acousticness)}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-400">{fmtPct(track.speechiness)}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-400">{fmtPct(track.instrumentalness)}</TableCell>
                    <TableCell className="font-mono text-xs text-gray-400">{fmtPct(track.liveness)}</TableCell>
                    <TableCell className="text-gray-600 group-hover:text-gray-400">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Kort-visning — mobil */}
        <div className="md:hidden space-y-2">
          {visible.map((track, i) => (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track)}
              className="w-full text-left bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/30 p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-xs text-gray-600 font-mono w-6 shrink-0 pt-0.5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">{track.track_name || '–'}</p>
                  <p className="text-gray-400 text-xs truncate mt-0.5">{track.artist_names || '–'}</p>
                  {track.album_name && (
                    <p className="text-gray-600 text-xs truncate">{track.album_name}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    {track.popularity !== null && track.popularity !== undefined && (
                      <span className="text-yellow-400 font-medium">Pop. {track.popularity}</span>
                    )}
                    {track.tempo && <span className="text-gray-400 font-mono">{Math.round(track.tempo)} BPM</span>}
                    {track.energy !== null && track.energy !== undefined && (
                      <span className="text-red-400">Energi {fmtPct(track.energy)}</span>
                    )}
                    {track.danceability !== null && track.danceability !== undefined && (
                      <span className="text-blue-400">Dans {fmtPct(track.danceability)}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 shrink-0 mt-1" />
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
    </>
  );
};

export default SearchResults;
