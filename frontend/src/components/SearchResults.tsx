import React from 'react'
import { Music, Clock, TrendingUp } from 'lucide-react'
import { TrackListSkeleton } from '@/components/Loading'
import type { Track } from '@/types/music'

interface SearchResultsProps {
  tracks: Track[]
  loading: boolean
}

const SearchResults: React.FC<SearchResultsProps> = ({ tracks, loading }) => {
  const formatDuration = (ms: number | null): string => {
    if (!ms) return '--'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatAudioFeature = (value: number | null): string => {
    if (value === null) return '--'
    return (value * 100).toFixed(0) + '%'
  }

  const formatTempo = (tempo: number | null): string => {
    if (tempo === null) return '--'
    return Math.round(tempo) + ' BPM'
  }

  const formatLoudness = (loudness: number | null): string => {
    if (loudness === null) return '--'
    return loudness.toFixed(1) + ' dB'
  }

  if (loading) {
    return <TrackListSkeleton count={5} />
  }

  if (!tracks.length) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <div className="h-20 w-20 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4">
            <Music className="h-10 w-10 text-blue-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-300 mb-2">Start din musikkoppdagelse</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Søk etter dine favorittlåter, artister eller album for å utforske detaljerte lydegenskaper og metadata.
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-6 max-w-md mx-auto">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Prøv å søke etter:</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <div>• <span className="text-blue-300">"Blinding Lights"</span> - populære låter</div>
            <div>• <span className="text-purple-300">"Ed Sheeran"</span> - artistnavn</div>
            <div>• <span className="text-green-300">"pop"</span> - musikksjangre</div>
            <div>• Eller prøv <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘K</kbd> / <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+K</kbd> kommandopaletten</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">
          Fant {tracks.length} låt{tracks.length !== 1 ? 'er' : ''}
        </h2>
      </div>

      <div className="grid gap-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="bg-gray-900/50 hover:bg-gray-800/50 transition-colors rounded-lg p-4 border border-gray-700/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Track Info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-lg mb-1 truncate">
                      {track.track_name || 'Ukjent låt'}
                    </h3>
                    <p className="text-gray-300 mb-1 truncate">
                      av {track.artist_names || 'Ukjent artist'}
                    </p>
                    <p className="text-gray-500 text-sm truncate">
                      {track.album_name || 'Ukjent album'}
                    </p>
                  </div>
                </div>

                {/* All Audio Features with Consistent Design */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                  {/* Basic Track Info */}
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-400">Popularitet</span>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {track.popularity || '--'}
                    </span>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-xs font-medium text-gray-400">Varighet</span>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {formatDuration(track.duration_ms)}
                    </span>
                  </div>

                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-xs font-medium text-gray-400 block mb-1">Tempo</span>
                    <span className="text-white font-semibold text-sm">
                      {formatTempo(track.tempo)}
                    </span>
                  </div>

                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-xs font-medium text-gray-400 block mb-1">Eksplisitt</span>
                    <span className="text-white font-semibold text-sm">
                      {track.explicit ? '🔞' : '✓'}
                    </span>
                  </div>

                  <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                    <span className="text-xs font-medium text-gray-400 block mb-1">Sjanger</span>
                    <span className="text-white font-semibold text-sm truncate" title={track.genres || '--'}>
                      {track.genres || '--'}
                    </span>
                  </div>
                </div>

                {/* Audio Features */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <div className="text-center p-3 bg-blue-900/20 rounded-lg">
                    <span className="text-xs font-medium text-blue-300 block mb-1">Dans</span>
                    <span className="text-white font-semibold text-sm">
                      {formatAudioFeature(track.danceability)}
                    </span>
                  </div>

                  <div className="text-center p-3 bg-red-900/20 rounded-lg">
                    <span className="text-xs font-medium text-red-300 block mb-1">Energi</span>
                    <span className="text-white font-semibold text-sm">
                      {formatAudioFeature(track.energy)}
                    </span>
                  </div>

                  <div className="text-center p-3 bg-green-900/20 rounded-lg">
                    <span className="text-xs font-medium text-green-300 block mb-1">Valens</span>
                    <span className="text-white font-semibold text-sm">
                      {formatAudioFeature(track.valence)}
                    </span>
                  </div>

                  <div className="text-center p-3 bg-purple-900/20 rounded-lg">
                    <span className="text-xs font-medium text-purple-300 block mb-1">Akustisk</span>
                    <span className="text-white font-semibold text-sm">
                      {formatAudioFeature(track.acousticness)}
                    </span>
                  </div>

                  <div className="text-center p-3 bg-orange-900/20 rounded-lg">
                    <span className="text-xs font-medium text-orange-300 block mb-1">Live</span>
                    <span className="text-white font-semibold text-sm">
                      {formatAudioFeature(track.liveness)}
                    </span>
                  </div>

                  <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-xs font-medium text-gray-300 block mb-1">Lydstyrke</span>
                    <span className="text-white font-semibold text-sm">
                      {formatLoudness(track.loudness)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchResults