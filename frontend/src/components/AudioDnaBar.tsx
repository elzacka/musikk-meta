import type { Track } from '@/types/music';

const features = [
  { key: 'energy', label: 'Energi', color: 'bg-rose-500' },
  { key: 'danceability', label: 'Dansbar', color: 'bg-blue-400' },
  { key: 'valence', label: 'Valens', color: 'bg-amber-400' },
  { key: 'acousticness', label: 'Akustisk', color: 'bg-teal-400' },
  { key: 'speechiness', label: 'Tale', color: 'bg-violet-400' },
  { key: 'instrumentalness', label: 'Instrumental', color: 'bg-emerald-400' },
  { key: 'liveness', label: 'Live', color: 'bg-orange-400' },
] as const;

type FeatureKey = (typeof features)[number]['key'];

interface AudioDnaBarProps {
  track: Track;
  className?: string;
}

export function hasAudioFeatures(track: Track): boolean {
  return features.some(({ key }) => (track[key as FeatureKey] as number | null | undefined) != null);
}

export function AudioDnaBar({ track, className = '' }: AudioDnaBarProps) {
  if (!hasAudioFeatures(track)) {
    return (
      <div className={`w-36 flex items-center ${className}`}>
        <span className="text-[10px] text-gray-600 italic">Ingen lyddata</span>
      </div>
    );
  }

  return (
    <div className={`group/dna relative w-36 ${className}`}>
      <div className="flex flex-col gap-[2px]">
        {features.map(({ key, color }) => {
          const value = (track[key as FeatureKey] as number | null | undefined) ?? 0;
          return (
            <div key={key} className="h-[3px] w-full rounded-full bg-gray-800/60">
              <div
                className={`h-full rounded-full ${color} transition-all duration-300 group-hover/dna:brightness-125`}
                style={{ width: `${Math.round(value * 100)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Tooltip ved hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 shadow-xl opacity-0 group-hover/dna:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
        <div className="flex flex-col gap-1 text-[11px]">
          {features.map(({ key, label, color }) => {
            const value = (track[key as FeatureKey] as number | null | undefined) ?? 0;
            return (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-gray-400 w-20">{label}</span>
                <span className="text-white font-mono">{Math.round(value * 100)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
