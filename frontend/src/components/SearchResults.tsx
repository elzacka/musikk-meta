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
          <h3 className="text-xl font-medium text-gray-300 mb-2">Start Your Music Discovery</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Search for your favorite tracks, artists, or albums to explore detailed audio features and metadata.
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-6 max-w-md mx-auto">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Try searching for:</h4>
          <div className="space-y-2 text-sm text-gray-400">
            <div>• <span className="text-blue-300">"Blinding Lights"</span> - Popular tracks</div>
            <div>• <span className="text-purple-300">"Ed Sheeran"</span> - Artist names</div>
            <div>• <span className="text-green-300">"pop"</span> - Music genres</div>
            <div>• Or try the <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘K</kbd> command palette</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-white">
          Found {tracks.length} track{tracks.length !== 1 ? 's' : ''}
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
                      {track.track_name || 'Unknown Track'}
                    </h3>
                    <p className="text-gray-300 mb-1 truncate">
                      by {track.artist_names || 'Unknown Artist'}
                    </p>
                    <p className="text-gray-500 text-sm truncate">
                      {track.album_name || 'Unknown Album'}
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-800/30 rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs text-gray-400">Popularity</span>
                    </div>
                    <span className="text-white font-medium">
                      {track.popularity || '--'}
                    </span>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-800/30 rounded">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-xs text-gray-400">Duration</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatDuration(track.duration_ms)}
                    </span>
                  </div>

                  <div className="text-center p-2 bg-gray-800/30 rounded">
                    <span className="text-xs text-gray-400 block mb-1">Tempo</span>
                    <span className="text-white font-medium">
                      {formatTempo(track.tempo)}
                    </span>
                  </div>

                  <div className="text-center p-2 bg-gray-800/30 rounded">
                    <span className="text-xs text-gray-400 block mb-1">Explicit</span>
                    <span className="text-white font-medium">
                      {track.explicit ? '🔞' : '✓'}
                    </span>
                  </div>
                </div>

                {/* Audio Features */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Audio Features</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    <div className="text-center p-2 bg-blue-900/20 rounded">
                      <span className="text-xs text-blue-300 block mb-1">Dance</span>
                      <span className="text-white font-medium text-sm">
                        {formatAudioFeature(track.danceability)}
                      </span>
                    </div>

                    <div className="text-center p-2 bg-red-900/20 rounded">
                      <span className="text-xs text-red-300 block mb-1">Energy</span>
                      <span className="text-white font-medium text-sm">
                        {formatAudioFeature(track.energy)}
                      </span>
                    </div>

                    <div className="text-center p-2 bg-green-900/20 rounded">
                      <span className="text-xs text-green-300 block mb-1">Valence</span>
                      <span className="text-white font-medium text-sm">
                        {formatAudioFeature(track.valence)}
                      </span>
                    </div>

                    <div className="text-center p-2 bg-purple-900/20 rounded">
                      <span className="text-xs text-purple-300 block mb-1">Acoustic</span>
                      <span className="text-white font-medium text-sm">
                        {formatAudioFeature(track.acousticness)}
                      </span>
                    </div>

                    <div className="text-center p-2 bg-orange-900/20 rounded">
                      <span className="text-xs text-orange-300 block mb-1">Live</span>
                      <span className="text-white font-medium text-sm">
                        {formatAudioFeature(track.liveness)}
                      </span>
                    </div>

                    <div className="text-center p-2 bg-gray-700/30 rounded">
                      <span className="text-xs text-gray-300 block mb-1">Loudness</span>
                      <span className="text-white font-medium text-sm">
                        {formatLoudness(track.loudness)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Genres */}
                {track.genres && (
                  <div className="mt-3">
                    <span className="text-xs text-gray-400">Genres: </span>
                    <span className="text-gray-300 text-sm">{track.genres}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchResults