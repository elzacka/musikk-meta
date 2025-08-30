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

  if (loading) {
    return <TrackListSkeleton count={5} />
  }

  if (!tracks.length) {
    return (
      <div className="text-center py-12">
        <Music className="h-16 w-16 mx-auto text-gray-600 mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">No tracks found</h3>
        <p className="text-gray-500">Try adjusting your search terms</p>
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

                {/* Audio Features */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">Popularity</span>
                    </div>
                    <span className="text-white font-medium">
                      {track.popularity || '--'}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Duration</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatDuration(track.duration_ms)}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-sm text-gray-400 block mb-1">Danceability</span>
                    <span className="text-white font-medium">
                      {formatAudioFeature(track.danceability)}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-sm text-gray-400 block mb-1">Energy</span>
                    <span className="text-white font-medium">
                      {formatAudioFeature(track.energy)}
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