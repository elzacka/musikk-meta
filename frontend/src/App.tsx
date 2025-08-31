import React, { Suspense, useEffect, useState } from 'react'
import { Music, Search, Info } from 'lucide-react'
import { useMusicStore } from '@/stores/musicStore'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { useDebounce } from '@/utils/useDebounce'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner, PageLoading } from '@/components/Loading'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import brain from './brain/modernBrain'
import type { Track } from '@/types/music'

// Lazy-loaded components for better performance
const SearchResults = React.lazy(() => import('@/components/SearchResults'))
const CommandPalette = React.lazy(() => import('@/components/CommandPalette'))

function App() {
  // Global state management with Zustand
  const {
    query,
    tracks,
    allTracks,
    loading,
    error,
    setQuery,
    setTracks,
    setAllTracks,
    setLoading,
    setError
  } = useMusicStore()
  
  const [localQuery, setLocalQuery] = useState(query)
  const debouncedQuery = useDebounce(localQuery, 300)
  const { isOpen, open, close } = useCommandPalette()

  // Environment detection for data source
  const isGitHubPages = window.location.hostname.includes('github.io')
  const hasGoogleSheets = !!(import.meta.env?.VITE_GOOGLE_SHEET_ID && import.meta.env?.VITE_GOOGLE_SHEETS_API_KEY)
  
  // Debug environment detection
  console.log('🌍 Environment Detection:', {
    hostname: window.location.hostname,
    isGitHubPages,
    hasGoogleSheets,
    env: {
      SHEET_ID: import.meta.env?.VITE_GOOGLE_SHEET_ID ? 'SET' : 'MISSING',
      API_KEY: import.meta.env?.VITE_GOOGLE_SHEETS_API_KEY ? 'SET' : 'MISSING'
    }
  })

  // Initialize app
  useEffect(() => {
    document.title = "MusikkMeta - Lydens DNA"
    loadInitialData()
  }, [])

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== query) {
      setQuery(debouncedQuery)
      performSearch(debouncedQuery)
    }
  }, [debouncedQuery])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Load all tracks for command palette using the brain client
      if (brain.getAllTracks && typeof brain.getAllTracks === 'function') {
        const allTracksData = await brain.getAllTracks()
        setAllTracks(allTracksData)
        console.log(`🎵 Loaded ${allTracksData.length} tracks from data source`)
      } else {
        console.warn('getAllTracks method not available on current brain client')
        setAllTracks([])
      }
      
      // Don't show any tracks by default - user must search
    } catch (err) {
      console.error('Failed to load tracks:', err)
      setError('Failed to load music data. Please check your configuration.')
      setAllTracks([])
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setTracks([]) // Show no tracks when search is empty
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Use the brain client to search for tracks
      const response = await brain.search_tracks({ 
        query: searchQuery, 
        page: 1, 
        page_size: 50 
      })
      
      if (response.ok) {
        const data = await response.json()
        setTracks(data.tracks)
        console.log(`🔍 Found ${data.tracks.length} tracks for "${searchQuery}"`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Search failed')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setTracks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setQuery(localQuery)
    performSearch(localQuery)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (loading && !tracks.length) {
    return <PageLoading message="Loading MusikkMeta..." />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Status Banner */}
      {hasGoogleSheets ? (
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border-b border-green-500/30 p-3 text-center">
          <p className="text-sm text-green-200">
            ✨ <strong>Live data</strong> - via Google Sheets API.
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-yellow-500/30 p-3 text-center">
          <p className="text-sm text-yellow-200">
            🔧 <strong>Debug-modus</strong> - API-nøkkel: {import.meta.env?.VITE_GOOGLE_SHEETS_API_KEY ? `✅ SATT (${import.meta.env.VITE_GOOGLE_SHEETS_API_KEY.substring(0, 6)}...)` : '❌ MANGLER'}, ark-ID: {import.meta.env?.VITE_GOOGLE_SHEET_ID ? `✅ SATT (${import.meta.env.VITE_GOOGLE_SHEET_ID.substring(0, 6)}...)` : '❌ MANGLER'}, bruker: {hasGoogleSheets ? 'Google Sheets' : 'eksempeldata'}
          </p>
        </div>
      )}

      <div className="container mx-auto max-w-7xl p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                MusikkMeta
              </h1>
              <p className="text-gray-400 mt-1">Oppdag lydens DNA</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Søk etter låter, artister, album... (⌘K / Ctrl+K for kommandopalett)"
                className="pl-10 pr-20 h-12 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={open}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors border border-gray-600 rounded bg-gray-800/50"
                title="Åpne kommandopalett (⌘K / Ctrl+K)"
              >
                ⌘K
              </button>
            </div>
            <Button onClick={handleSearch} size="lg" className="h-12">
              {loading ? <LoadingSpinner size="sm" text="" /> : 'Søk'}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="h-12">
                  <Info className="h-4 w-4 mr-2" />
                  Forklaringer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Hva betyr disse dataene?</DialogTitle>
                  <DialogDescription>
                    Lær hva disse lydegenskapene betyr:
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white">Popularitet</h4>
                      <p className="text-sm text-gray-400">
                        Hvor populær låten er (0-100). Høyere tall betyr at flere lytter til den.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Dansebarhet</h4>
                      <p className="text-sm text-gray-400">
                        Hvor egnet låten er for dans (0,0-1,0). Høyere verdier betyr mer dansbar.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Energi</h4>
                      <p className="text-sm text-gray-400">
                        Intensitet og kraft i låten (0,0-1,0). Høyere verdier føles mer energiske.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Valens</h4>
                      <p className="text-sm text-gray-400">
                        Musikalsk positivitet (0,0-1,0). Høyere verdier låter mer positive/glade.
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <ErrorBoundary>
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}
            
            <Suspense fallback={<LoadingSpinner text="Loading results..." />}>
              <SearchResults tracks={tracks} loading={loading} />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Command Palette */}
      <Suspense fallback={null}>
        <CommandPalette
          isOpen={isOpen}
          onClose={close}
          tracks={allTracks}
          onTrackSelect={(track) => {
            const searchTerm = `${track.artist_names} ${track.track_name}`
            setLocalQuery(searchTerm)
            setQuery(searchTerm)
            performSearch(searchTerm)
            close()
          }}
          onSearch={(searchQuery) => {
            setLocalQuery(searchQuery)
            setQuery(searchQuery)
            performSearch(searchQuery)
            close()
          }}
        />
      </Suspense>
    </div>
  )
}

export default App
