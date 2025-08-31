import React, { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Music2 } from 'lucide-react'
import { TrackListSkeleton } from '@/components/Loading'
import type { Track } from '@/types/music'

interface SearchResultsProps {
  tracks: Track[]
  loading: boolean
}

type SortField = 'track_name' | 'artist_names' | 'album_name' | 'popularity' | 'duration_ms' | 'tempo' | 'danceability' | 'energy' | 'valence'
type SortDirection = 'asc' | 'desc'

const SearchResults: React.FC<SearchResultsProps> = ({ tracks, loading }) => {
  const [sortField, setSortField] = useState<SortField>('popularity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const formatDuration = (ms: number | null): string => {
    if (!ms) return '--'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatAudioFeature = (value: number | null): string => {
    if (value === null) return '--'
    return Math.round(value * 100) + '%'
  }

  const formatTempo = (tempo: number | null): string => {
    if (tempo === null) return '--'
    return Math.round(tempo) + ' BPM'
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedTracks = useMemo(() => {
    return [...tracks].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = sortDirection === 'asc' ? -Infinity : Infinity
      if (bValue === null || bValue === undefined) bValue = sortDirection === 'asc' ? -Infinity : Infinity

      // Convert to strings for text fields
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [tracks, sortField, sortDirection])

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ 
    field, 
    children, 
    className = "" 
  }) => (
    <button
      onClick={() => handleSort(field)}
      className={`group flex items-center gap-1 text-left transition-colors hover:text-blue-400 ${className}`}
    >
      <span className="font-medium text-xs uppercase tracking-wide">{children}</span>
      <div className="flex flex-col ml-1">
        <ChevronUp 
          className={`h-3 w-3 transition-colors ${
            sortField === field && sortDirection === 'asc' 
              ? 'text-blue-400' 
              : 'text-gray-600 group-hover:text-blue-400/60'
          }`} 
        />
        <ChevronDown 
          className={`h-3 w-3 -mt-1 transition-colors ${
            sortField === field && sortDirection === 'desc' 
              ? 'text-blue-400' 
              : 'text-gray-600 group-hover:text-blue-400/60'
          }`} 
        />
      </div>
    </button>
  )

  if (loading) {
    return <TrackListSkeleton count={5} />
  }

  if (!tracks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4">
          <Music2 className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 text-sm">Ingen resultater ennå</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with results count and view toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            {tracks.length} {tracks.length === 1 ? 'låt' : 'låter'}
          </h2>
          <p className="text-sm text-gray-400">
            Sortert etter {sortField === 'track_name' ? 'låtnavn' : sortField === 'artist_names' ? 'artist' : sortField === 'popularity' ? 'popularitet' : sortField} 
            ({sortDirection === 'desc' ? 'høy til lav' : 'lav til høy'})
          </p>
        </div>
      </div>

      {/* Modern Table View */}
      <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 border-b border-gray-700/50">
                <tr>
                  <th className="text-left py-4 px-6 w-12">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <Music2 className="w-4 h-4 text-blue-400" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 min-w-[200px]">
                    <SortButton field="track_name">Låt</SortButton>
                  </th>
                  <th className="text-left py-4 px-6 min-w-[150px]">
                    <SortButton field="artist_names">Artist</SortButton>
                  </th>
                  <th className="text-left py-4 px-6 min-w-[150px]">
                    <SortButton field="album_name">Album</SortButton>
                  </th>
                  <th className="text-center py-4 px-4 w-20">
                    <SortButton field="popularity">Pop.</SortButton>
                  </th>
                  <th className="text-center py-4 px-4 w-20">
                    <SortButton field="duration_ms">Tid</SortButton>
                  </th>
                  <th className="text-center py-4 px-4 w-20">
                    <SortButton field="tempo">BPM</SortButton>
                  </th>
                  <th className="text-center py-4 px-4 w-20">
                    <SortButton field="danceability">Dans</SortButton>
                  </th>
                  <th className="text-center py-4 px-4 w-20">
                    <SortButton field="energy">Energi</SortButton>
                  </th>
                  <th className="text-center py-4 px-4 w-20">
                    <SortButton field="valence">Valens</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTracks.map((track, index) => (
                  <tr 
                    key={track.id} 
                    className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-white text-sm truncate max-w-[200px]" title={track.track_name || 'Ukjent låt'}>
                        {track.track_name || 'Ukjent låt'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-300 text-sm truncate max-w-[150px]" title={track.artist_names || 'Ukjent artist'}>
                        {track.artist_names || 'Ukjent artist'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-400 text-sm truncate max-w-[150px]" title={track.album_name || 'Ukjent album'}>
                        {track.album_name || 'Ukjent album'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium text-yellow-400">
                        {track.popularity || '--'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm text-gray-300 font-mono">
                        {formatDuration(track.duration_ms)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm text-gray-300 font-mono">
                        {formatTempo(track.tempo)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium text-blue-400">
                        {formatAudioFeature(track.danceability)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium text-red-400">
                        {formatAudioFeature(track.energy)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium text-green-400">
                        {formatAudioFeature(track.valence)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-700/30">
          {sortedTracks.map((track, index) => (
            <div key={track.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-300">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base mb-1 truncate">
                    {track.track_name || 'Ukjent låt'}
                  </h3>
                  <p className="text-gray-300 text-sm mb-1 truncate">
                    {track.artist_names || 'Ukjent artist'}
                  </p>
                  <p className="text-gray-500 text-sm truncate mb-3">
                    {track.album_name || 'Ukjent album'}
                  </p>
                  
                  {/* Mobile stats grid */}
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-700/30">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Pop.</div>
                      <div className="text-sm font-medium text-yellow-400">{track.popularity || '--'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Tid</div>
                      <div className="text-sm text-gray-300 font-mono">{formatDuration(track.duration_ms)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">BPM</div>
                      <div className="text-sm text-gray-300 font-mono">{formatTempo(track.tempo)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Dans</div>
                      <div className="text-sm font-medium text-blue-400">{formatAudioFeature(track.danceability)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Energi</div>
                      <div className="text-sm font-medium text-red-400">{formatAudioFeature(track.energy)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">Valens</div>
                      <div className="text-sm font-medium text-green-400">{formatAudioFeature(track.valence)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchResults