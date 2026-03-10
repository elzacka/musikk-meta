import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, Music, X, User, Disc } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { fmtDuration } from '@/utils/formatters'
import type { Track } from '@/types/music'

interface SearchOption {
  type: 'search'
  id: string
  label: string
  hint: string
}

interface TrackOption {
  type: 'track'
  track: Track
}

type PaletteItem = SearchOption | TrackOption

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  tracks: Track[]
  onTrackSelect: (track: Track) => void
  onSearch: (query: string) => void
}

const CommandPalette = ({
  isOpen,
  onClose,
  tracks,
  onTrackSelect,
  onSearch
}: CommandPaletteProps) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filteredTracks = useMemo(() => {
    if (!query.trim()) return tracks.slice(0, 10)

    const term = query.toLowerCase()
    return tracks.filter(t =>
      t.track_name?.toLowerCase().includes(term) ||
      t.artist_names?.toLowerCase().includes(term) ||
      t.album_name?.toLowerCase().includes(term)
    ).slice(0, 9)
  }, [query, tracks])

  const displayResults: PaletteItem[] = useMemo(() => {
    const trackItems: PaletteItem[] = filteredTracks.map(track => ({ type: 'track', track }))

    if (!query.trim()) return trackItems

    const searchItem: SearchOption = {
      type: 'search',
      id: 'search-database',
      label: `Søk etter "${query}" i databasen`,
      hint: filteredTracks.length === 0
        ? 'Trykk Enter for å søke i hele databasen'
        : 'Trykk Enter eller klikk for å søke',
    }

    return [searchItem, ...trackItems]
  }, [query, filteredTracks])

  useEffect(() => {
    setSelectedIndex(0)
  }, [displayResults])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev < displayResults.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : displayResults.length - 1
          )
          break
        case 'Enter': {
          e.preventDefault()
          const selected = displayResults[selectedIndex]
          if (selected?.type === 'search') {
            onSearch(query)
            onClose()
          } else if (selected?.type === 'track') {
            onTrackSelect(selected.track)
            setQuery('')
          } else if (query.trim()) {
            onSearch(query)
            onClose()
          }
          break
        }
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, displayResults, query, onSearch, onClose, onTrackSelect])

  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      const el = listRef.current.children[selectedIndex] as HTMLElement
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  if (!isOpen) return null

  const itemKey = (item: PaletteItem) =>
    item.type === 'search' ? item.id : item.track.id

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-black/95 border border-gray-700 backdrop-blur-sm">
        <div className="flex flex-col">
          {/* Søkefelt */}
          <div className="flex items-center px-4 py-3 border-b border-gray-700">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Søk etter låter, artister, album..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={onClose}
              className="ml-3 p-1 hover:bg-gray-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Resultater */}
          <div ref={listRef} className="max-h-96 overflow-y-auto">
            {displayResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Begynn å skrive for å søke...</p>
              </div>
            ) : (
              <div className="py-2">
                {displayResults.map((item, index) => (
                  <button
                    key={itemKey(item)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors ${
                      index === selectedIndex ? 'bg-blue-600/30 border-l-2 border-blue-500' : ''
                    } ${item.type === 'search' ? 'bg-gray-800/30' : ''}`}
                    onClick={() => {
                      if (item.type === 'search') {
                        onSearch(query)
                        onClose()
                      } else {
                        onTrackSelect(item.track)
                        setQuery('')
                      }
                    }}
                  >
                    {item.type === 'search' ? (
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Search className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <p className="font-medium text-white truncate">{item.label}</p>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{item.hint}</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Music className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <p className="font-medium text-white truncate">
                              {item.track.track_name || 'Ukjent låt'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">{item.track.artist_names || 'Ukjent artist'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Disc className="w-3 h-3" />
                              <span className="truncate">{item.track.album_name || 'Ukjent album'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 text-right">
                          {item.track.popularity != null && (
                            <div className="text-xs text-gray-400 mb-1">
                              ★ {item.track.popularity}
                            </div>
                          )}
                          {item.track.duration_ms != null && (
                            <div className="text-xs text-gray-500">
                              {fmtDuration(item.track.duration_ms)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bunntekst */}
          <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                <span>↑↓ Naviger</span>
                <span>Enter Velg</span>
                <span>Esc Lukk</span>
              </div>
              <div>⌘K / Ctrl+K</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommandPalette
