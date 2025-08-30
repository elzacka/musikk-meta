import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Track } from 'types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureProgressProps {
  value: number | null | undefined;
  colorClass: string;
  label?: string;
}

const FeatureProgress: React.FC<FeatureProgressProps> = ({ value, colorClass, label }) => {
  const percentage = (value || 0) * 100;
  return (
    <div className="flex items-center gap-2 w-full">
      {label && <span className="text-xs w-24 text-muted-foreground">{label}</span>}
      <div className="w-full bg-muted rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const formatDuration = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined) return '-';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const formatExplicit = (explicit: boolean | null | undefined): string => {
  if (explicit === null || explicit === undefined) return '-';
  return explicit ? "Ja" : "Nei";
}

const formatKey = (key: number | null | undefined, mode: number | null | undefined): string => {
  if (key === null || key === undefined || mode === null || mode === undefined) return '-';
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keyName = keys[key];
  const modeName = mode === 1 ? 'Major' : 'Minor';
  return `${keyName} ${modeName}`;
};

const formatValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return value.toFixed(3);
};

interface ResultsTableProps {
  tracks: Track[];
  setTracks: (tracks: Track[]) => void;
}

export const ResultsTable = ({ tracks, setTracks }: ResultsTableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Track, direction: 'asc' | 'desc' } | null>({ key: 'popularity', direction: 'desc' });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const sortedTracks = useMemo(() => {
    let sortableTracks = [...tracks];
    if (sortConfig !== null) {
      sortableTracks.sort((a, b) => {
        // Use a mapping to get the correct field name from the Track object
        const keyMap: { [key: string]: keyof Track } = {
          artist: 'artist_names',
          track: 'track_name',
          album: 'album_name',
          release_date: 'release_date',
          duration: 'duration_ms',
          popularity: 'popularity',
          explicit: 'explicit',
          genres: 'genres',
          label: 'record_label',
          tempo: 'tempo',
          key: 'key_mode',
          energy: 'energy',
          danceability: 'danceability',
          valence: 'valence',
          loudness: 'loudness',
          acousticness: 'acousticness',
          speechiness: 'speechiness',
          instrumentalness: 'instrumentalness',
          liveness: 'liveness',
        };
        const sortKey = keyMap[sortConfig.key as string] || sortConfig.key;

        const aValue = a[sortKey];
        const bValue = b[sortKey];

        // Type-safe comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        
        // Fallback for nulls or mixed types
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        
        return 0;
      });
    }
    return sortableTracks;
  }, [tracks, sortConfig]);

  const requestSort = (key: keyof Track) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Track) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  useEffect(() => {
    const checkScrollable = () => {
      const el = scrollContainerRef.current;
      if (el) {
        setIsScrollable(el.scrollWidth > el.clientWidth);
      }
    };
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [tracks]);

  if (tracks.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center text-muted-foreground">
        <p>No tracks found. Try a different search.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
             <TableHead className="sticky left-0 bg-black/90 z-10 w-48">
               <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('artist')}>
                Artist {getSortIndicator('artist')}
              </Button>
            </TableHead>
            <TableHead className="sticky left-[12rem] bg-black/90 z-10 w-64">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('track')}>
                Track {getSortIndicator('track')}
              </Button>
            </TableHead>
            <TableHead className="sticky left-[28rem] bg-black/90 z-10 w-48">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('album')}>
                Album {getSortIndicator('album')}
              </Button>
            </TableHead>
            <TableHead className="w-28">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('duration')}>
                Duration {getSortIndicator('duration')}
              </Button>
            </TableHead>
            <TableHead className="w-28">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('release_date')}>
                Released {getSortIndicator('release_date')}
              </Button>
            </TableHead>
             <TableHead className="w-28">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('popularity')}>
                Popularity {getSortIndicator('popularity')}
              </Button>
            </TableHead>
             <TableHead className="w-24">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('explicit')}>
                Explicit {getSortIndicator('explicit')}
              </Button>
            </TableHead>
            <TableHead className="w-48">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('genres')}>
                Genres {getSortIndicator('genres')}
              </Button>
            </TableHead>
            <TableHead className="w-48">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('label')}>
                Record Label {getSortIndicator('label')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('tempo')}>
                BPM {getSortIndicator('tempo')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('key')}>
                Key {getSortIndicator('key')}
               </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('energy')}>
                Energy {getSortIndicator('energy')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('danceability')}>
                Danceability {getSortIndicator('danceability')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('valence')}>
                Valence {getSortIndicator('valence')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
               <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('loudness')}>
                Loudness {getSortIndicator('loudness')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('acousticness')}>
                Acousticness {getSortIndicator('acousticness')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('speechiness')}>
                Speechiness {getSortIndicator('speechiness')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('instrumentalness')}>
                Instrumentalness {getSortIndicator('instrumentalness')}
              </Button>
            </TableHead>
            <TableHead className="w-32">
              <Button variant="ghost" className="justify-start p-0" onClick={() => requestSort('liveness')}>
                Liveness {getSortIndicator('liveness')}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTracks.map((track) => (
            <TableRow key={track.id}>
              <TableCell className="sticky left-0 bg-black/90 z-10 font-bold truncate max-w-[150px]">{track.artist_names || '-'}</TableCell>
              <TableCell className="sticky left-[12rem] bg-black/90 z-10 truncate max-w-[250px]">{track.track_name || '-'}</TableCell>
              <TableCell className="sticky left-[28rem] bg-black/90 z-10 truncate max-w-[150px]">{track.album_name || '-'}</TableCell>
              <TableCell className="font-mono">{formatDuration(track.duration_ms)}</TableCell>
              <TableCell>{track.release_date || '-'}</TableCell>
              <TableCell>{track.popularity ?? '-'}</TableCell>
              <TableCell>{formatExplicit(track.explicit)}</TableCell>
              <TableCell className="truncate max-w-[150px]">{track.genres || '-'}</TableCell>
              <TableCell className="truncate max-w-[150px]">{track.record_label || '-'}</TableCell>
              <TableCell className="font-mono">
                <div className="flex items-center">
                  <span 
                    className="w-4 h-4 rounded-full bg-brand-medium mr-2"
                    style={{ animation: `pulse ${60 / (track.tempo || 120)}s cubic-bezier(0.4, 0, 0.6, 1) infinite` }}
                  />
                  {track.tempo ? Math.round(track.tempo) : '-'}
                </div>
              </TableCell>
              <TableCell className="font-mono">{formatKey(track.key_mode, track.mode)}</TableCell>
              <TableCell className="font-mono">{formatValue(track.energy)}</TableCell>
              <TableCell className="font-mono">{formatValue(track.danceability)}</TableCell>
              <TableCell className="font-mono">{formatValue(track.valence)}</TableCell>
              <TableCell className="font-mono">{track.loudness ? track.loudness.toFixed(3) : '-'}</TableCell>
              <TableCell className="font-mono">{formatValue(track.acousticness)}</TableCell>
              <TableCell className="font-mono">{formatValue(track.speechiness)}</TableCell>
              <TableCell className="font-mono">{formatValue(track.instrumentalness)}</TableCell>
              <TableCell className="font-mono">{formatValue(track.liveness)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
