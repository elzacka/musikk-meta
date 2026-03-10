import React from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SearchFilters } from '@/types/music';

interface FilterPanelProps {
  filters: SearchFilters;
  genres: string[];
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
}

function activeFilterCount(filters: SearchFilters): number {
  let n = 0;
  if (filters.genre) n++;
  if (filters.minPopularity !== undefined || filters.maxPopularity !== undefined) n++;
  if (filters.minYear !== undefined || filters.maxYear !== undefined) n++;
  if (filters.minBpm !== undefined || filters.maxBpm !== undefined) n++;
  if (filters.minEnergy !== undefined || filters.maxEnergy !== undefined) n++;
  if (filters.minDanceability !== undefined || filters.maxDanceability !== undefined) n++;
  if (filters.minValence !== undefined || filters.maxValence !== undefined) n++;
  if (filters.explicit !== undefined) n++;
  return n;
}

// Enkel range-slider med to tall-input
function RangeInput({
  label,
  minKey,
  maxKey,
  min,
  max,
  step = 1,
  filters,
  onChange,
}: {
  label: string;
  minKey: keyof SearchFilters;
  maxKey: keyof SearchFilters;
  min: number;
  max: number;
  step?: number;
  filters: SearchFilters;
  onChange: (f: SearchFilters) => void;
}) {
  const currentMin = (filters[minKey] as number | undefined) ?? min;
  const currentMax = (filters[maxKey] as number | undefined) ?? max;

  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={currentMax}
          step={step}
          value={currentMin === min ? '' : currentMin}
          placeholder={String(min)}
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : Number(e.target.value);
            onChange({ ...filters, [minKey]: v });
          }}
          className="w-20 bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
        />
        <span className="text-gray-600 text-xs">–</span>
        <input
          type="number"
          min={currentMin}
          max={max}
          step={step}
          value={currentMax === max ? '' : currentMax}
          placeholder={String(max)}
          onChange={(e) => {
            const v = e.target.value === '' ? undefined : Number(e.target.value);
            onChange({ ...filters, [maxKey]: v });
          }}
          className="w-20 bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
        />
      </div>
    </div>
  );
}

export function FilterPanel({ filters, genres, onChange, onReset }: FilterPanelProps) {
  const [open, setOpen] = React.useState(false);
  const count = activeFilterCount(filters);

  return (
    <div>
      {/* Knapp */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className={`h-10 gap-2 border-gray-700/50 bg-gray-900/40 backdrop-blur-sm hover:bg-gray-800/60 rounded-xl text-sm transition-all ${
          count > 0 ? 'border-blue-500/40 text-blue-300' : 'text-gray-300'
        }`}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter
        {count > 0 && (
          <span className="ml-0.5 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {count}
          </span>
        )}
      </Button>

      {/* Panel */}
      {open && (
        <div className="mt-3 p-5 bg-gray-900/60 backdrop-blur-sm border border-gray-700/40 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-200">Filtrer resultater</span>
            <div className="flex gap-2">
              {count > 0 && (
                <button
                  onClick={onReset}
                  className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Nullstill
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">

            {/* Sjanger */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Sjanger</label>
              {genres.length > 0 ? (
                <select
                  value={filters.genre ?? ''}
                  onChange={(e) => onChange({ ...filters, genre: e.target.value || undefined })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                >
                  <option value="">Alle</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={filters.genre ?? ''}
                  placeholder="f.eks. rock"
                  onChange={(e) => onChange({ ...filters, genre: e.target.value || undefined })}
                  className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
                />
              )}
            </div>

            {/* Popularitet */}
            <RangeInput
              label="Popularitet (0–100)"
              minKey="minPopularity" maxKey="maxPopularity"
              min={0} max={100}
              filters={filters} onChange={onChange}
            />

            {/* Utgivelsesår */}
            <RangeInput
              label="Utgivelsesår"
              minKey="minYear" maxKey="maxYear"
              min={1950} max={new Date().getFullYear()}
              filters={filters} onChange={onChange}
            />

            {/* BPM */}
            <RangeInput
              label="BPM"
              minKey="minBpm" maxKey="maxBpm"
              min={40} max={250}
              filters={filters} onChange={onChange}
            />

            {/* Energi */}
            <RangeInput
              label="Energi (0–100)"
              minKey="minEnergy" maxKey="maxEnergy"
              min={0} max={100}
              filters={filters} onChange={onChange}
            />

            {/* Dansbarhet */}
            <RangeInput
              label="Dansbarhet (0–100)"
              minKey="minDanceability" maxKey="maxDanceability"
              min={0} max={100}
              filters={filters} onChange={onChange}
            />

            {/* Valens */}
            <RangeInput
              label="Valens/stemning (0–100)"
              minKey="minValence" maxKey="maxValence"
              min={0} max={100}
              filters={filters} onChange={onChange}
            />

            {/* Eksplisitt */}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Eksplisitt innhold</label>
              <select
                value={filters.explicit === undefined ? '' : String(filters.explicit)}
                onChange={(e) => {
                  const v = e.target.value;
                  onChange({
                    ...filters,
                    explicit: v === '' ? undefined : v === 'true',
                  });
                }}
                className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
              >
                <option value="">Alle</option>
                <option value="false">Ikke eksplisitt</option>
                <option value="true">Eksplisitt</option>
              </select>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
