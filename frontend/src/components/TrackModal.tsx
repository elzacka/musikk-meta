import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { fmtDuration, fmtKey, fmtPct, fmtFloat } from '@/utils/formatters';
import type { Track } from '@/types/music';

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
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-800/50 last:border-0">
      <span className="text-xs text-gray-500 shrink-0 w-28">{label}</span>
      <span className="text-xs text-right text-gray-200 font-mono">{value}</span>
    </div>
  );
}

// --- Komponent ---

interface TrackModalProps {
  track: Track | null;
  onClose: () => void;
}

export function TrackModal({ track, onClose }: TrackModalProps) {
  if (!track) return null;

  const radarData = buildRadarData(track);
  const hasAudioFeatures = track.danceability !== null || track.energy !== null;

  return (
    <Dialog open={!!track} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl bg-gray-950/98 backdrop-blur-sm border-gray-700/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-semibold text-white leading-tight">
            {track.track_name || 'Ukjent låt'}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            {track.artist_names || 'Ukjent artist'}
            {track.album_name ? ` · ${track.album_name}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Radar chart */}
          {hasAudioFeatures && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Lydprofil
              </h3>
              <div className="bg-gray-900/40 rounded-xl p-4">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                    <PolarGrid stroke="#374151" strokeOpacity={0.6} />
                    <PolarAngleAxis
                      dataKey="egenskap"
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                    />
                    <Radar
                      name={track.track_name || 'Spor'}
                      dataKey="verdi"
                      stroke="#60a5fa"
                      fill="#3b82f6"
                      fillOpacity={0.25}
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
                        fontSize: '12px',
                        color: '#f9fafb',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Sporinfo
              </h3>
              <MetaRow label="Varighet"    value={fmtDuration(track.duration_ms)} />
              <MetaRow label="Utgitt"      value={track.release_date || '–'} />
              <MetaRow label="Popularitet" value={track.popularity != null ? `${track.popularity} / 100` : '–'} />
              <MetaRow label="Eksplisitt"  value={track.explicit == null ? '–' : track.explicit ? 'Ja' : 'Nei'} />
              <MetaRow label="Sjanger"     value={track.genres || '–'} />
              <MetaRow label="Plateselskap" value={track.record_label || '–'} />
            </div>
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Lydegenskaper
              </h3>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
