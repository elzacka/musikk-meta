import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { X, ExternalLink } from 'lucide-react';
import { fmtDuration, fmtKey, fmtPct, fmtFloat } from '@/utils/formatters';
import type { Track } from '@/types/music';
import { hasAudioFeatures } from '@/components/AudioDnaBar';

// --- Radar chart ---

interface RadarPoint {
  egenskap: string;
  verdi: number;
  fullLabel: string;
}

function buildRadarData(track: Track): RadarPoint[] {
  return [
    { egenskap: 'Dansbar',    verdi: Math.round((track.danceability ?? 0) * 100),    fullLabel: 'Dansbarhet' },
    { egenskap: 'Energi',     verdi: Math.round((track.energy ?? 0) * 100),           fullLabel: 'Energi' },
    { egenskap: 'Valens',     verdi: Math.round((track.valence ?? 0) * 100),          fullLabel: 'Valens (stemning)' },
    { egenskap: 'Akustisk',   verdi: Math.round((track.acousticness ?? 0) * 100),     fullLabel: 'Akustisk' },
    { egenskap: 'Live',       verdi: Math.round((track.liveness ?? 0) * 100),         fullLabel: 'Live-preg' },
    { egenskap: 'Tale',       verdi: Math.round((track.speechiness ?? 0) * 100),      fullLabel: 'Tale/rap' },
    { egenskap: 'Instrumental', verdi: Math.round((track.instrumentalness ?? 0) * 100), fullLabel: 'Instrumentalitet' },
  ];
}

// --- Metadata-rad ---

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5 border-b border-gray-800/30 last:border-0">
      <span className="text-[11px] text-gray-500 shrink-0">{label}</span>
      <span className="text-[11px] text-right text-gray-200 font-mono">{value}</span>
    </div>
  );
}

// --- Panel ---

interface TrackDetailPanelProps {
  track: Track | null;
  onClose: () => void;
}

function TrackDetailPanel({ track, onClose }: TrackDetailPanelProps) {
  const isOpen = !!track;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] z-50 bg-gray-950/[.98] backdrop-blur-xl border-l border-gray-700/50 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {track && (
          <div className="p-6">
            {/* Header med cover art */}
            <div className="flex items-start gap-4 mb-6">
              {track.cover_url && (
                <img
                  src={track.cover_url}
                  alt={track.album_name || ''}
                  className="w-20 h-20 rounded-lg object-cover shrink-0 shadow-lg"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white leading-tight truncate">
                      {track.track_name || 'Ukjent låt'}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      {track.artist_names || 'Ukjent artist'}
                    </p>
                    {track.album_name && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{track.album_name}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800/50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Kilde-badge */}
                {track.source === 'deezer' && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-800/60 border border-gray-700/40 rounded-full">
                    <ExternalLink className="h-2.5 w-2.5" />
                    Deezer
                  </span>
                )}
              </div>
            </div>

            {/* 30-sek preview */}
            {track.preview_url && (
              <div className="mb-6">
                <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Forhåndslytting
                </h3>
                <audio
                  controls
                  preload="none"
                  className="w-full h-8 [&::-webkit-media-controls-panel]:bg-gray-900/60"
                >
                  <source src={track.preview_url} type="audio/mpeg" />
                </audio>
              </div>
            )}

            {/* Radar chart — bare for spor med audio features */}
            {hasAudioFeatures(track) && (
              <div className="mb-6">
                <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Lydprofil
                </h3>
                <div className="bg-gray-900/40 rounded-xl p-3">
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={buildRadarData(track)} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                      <PolarGrid stroke="#374151" strokeOpacity={0.5} />
                      <PolarAngleAxis
                        dataKey="egenskap"
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                      />
                      <Radar
                        name={track.track_name || 'Spor'}
                        dataKey="verdi"
                        stroke="#818cf8"
                        fill="#6366f1"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(value: number, _name: string, props: { payload?: RadarPoint }) => [
                          `${value} / 100`,
                          props.payload?.fullLabel ?? '',
                        ]}
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#f9fafb',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-5">
              <div>
                <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Sporinfo
                </h3>
                <MetaRow label="Varighet"     value={fmtDuration(track.duration_ms)} />
                <MetaRow label="Utgitt"       value={track.release_date || '–'} />
                <MetaRow label="Popularitet"  value={track.popularity != null ? `${track.popularity} / 100` : '–'} />
                <MetaRow label="Eksplisitt"   value={track.explicit == null ? '–' : track.explicit ? 'Ja' : 'Nei'} />
                <MetaRow label="Sjanger"      value={track.genres || '–'} />
                <MetaRow label="Plateselskap" value={track.record_label || '–'} />
              </div>
              {(hasAudioFeatures(track) || track.tempo != null) && (
                <div>
                  <h3 className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Lydegenskaper
                  </h3>
                  <div className="grid grid-cols-2 gap-x-4">
                    <MetaRow label="BPM"          value={track.tempo ? `${Math.round(track.tempo)}` : '–'} />
                    <MetaRow label="Toneart"      value={fmtKey(track.key_mode, track.mode)} />
                    <MetaRow label="Takt"         value={track.time_signature ? `${track.time_signature}/4` : '–'} />
                    <MetaRow label="Lydstyrke"    value={track.loudness != null ? `${fmtFloat(track.loudness)} dB` : '–'} />
                    <MetaRow label="Dansbar"      value={fmtPct(track.danceability)} />
                    <MetaRow label="Energi"       value={fmtPct(track.energy)} />
                    <MetaRow label="Valens"       value={fmtPct(track.valence)} />
                    <MetaRow label="Akustisk"     value={fmtPct(track.acousticness)} />
                    <MetaRow label="Tale"         value={fmtPct(track.speechiness)} />
                    <MetaRow label="Instrumental" value={fmtPct(track.instrumentalness)} />
                    <MetaRow label="Live"         value={fmtPct(track.liveness)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default TrackDetailPanel;
