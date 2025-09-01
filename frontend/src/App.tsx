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
    document.title = "MusikkMeta - Utforsk musikkens DNA"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Status Banner */}
      {hasGoogleSheets ? (
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm border-b border-emerald-500/20 px-6 py-3">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <p className="text-sm font-medium text-emerald-200">
                Live data fra Google Sheets API | Under utvikling
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border-b border-amber-500/20 px-6 py-3">
          <div className="container mx-auto max-w-7xl">
            <p className="text-sm text-center text-amber-200">
              <span className="font-medium">Debug-modus</span> - Bruker testsystemet
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                <Music className="w-8 h-8 text-blue-400" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-60"></div>
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                MusikkMeta
              </h1>
              <p className="text-gray-400 text-lg font-medium">Utforsk musikkens DNA</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row items-stretch gap-4 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Søk etter låt, artist, album og mer..."
                className="pl-12 pr-28 h-14 bg-gray-900/40 backdrop-blur-sm border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:bg-gray-900/60 transition-all duration-200 rounded-xl text-base"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={open}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors border border-gray-600/50 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50"
                title="Åpne kommandopalett (⌘K / Ctrl+K)"
              >
                ⌘K / Ctrl+K
              </button>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleSearch} 
                size="lg" 
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-xl font-medium transition-all duration-200"
              >
                {loading ? <LoadingSpinner size="sm" text="" /> : 'Søk'}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-14 px-6 border-gray-700/50 bg-gray-900/40 backdrop-blur-sm hover:bg-gray-800/60 rounded-xl font-medium transition-all duration-200"
                  >
                    Veiledning
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-3xl bg-gray-950/95 backdrop-blur-sm border-gray-700/50">
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Hvordan bruke MusikkMeta
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {/* Getting Started Section */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Kom i gang</h4>
                      <p className="text-sm text-gray-400 mb-4">
                        Bruk søkefeltet eller <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">⌘K</kbd> / <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Ctrl+K</kbd> for å finne musikk og grave i detaljerte lydegenskaper.
                      </p>
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <h5 className="font-medium text-white">Prøv å søke etter noe spesifikt som:</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">•</span>
                            <span className="text-blue-300 font-medium">Krølla 50-lapp Y'all</span>
                            <span className="text-gray-500">- En låt fra Oslos fineste borgere</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">•</span>
                            <span className="text-purple-300 font-medium">Shatoo</span>
                            <span className="text-gray-500">- Norsk boyband fra 80-tallet med smør i stemmen</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">•</span>
                            <span className="text-green-300 font-medium">Madchester</span>
                            <span className="text-gray-500">- En mer presis musikksjanger en den store sekkeposten "pop"</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audio Features Explanations */}
                    <div>
                      <h4 className="font-semibold text-white mb-3">Hva betyr lydegenskapene?</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-white">Popularitet</h5>
                          <p className="text-sm text-gray-400">
                            Hvor populær låta er – på en skala fra 0 til 100. 100 betyr "alle elsker den", 0 betyr "ingen vet at den finnes".
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">Dansbar</h5>
                          <p className="text-sm text-gray-400">
                            Hvor dansbar låta er. Basert på tempo, rytmestabilitet, beat-trykk og hvor jevnt den flyter. 0 er "sitt helt rolig", 1 er "klar for dansegulvet".
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">Energi</h5>
                          <p className="text-sm text-gray-400">
                            Måler intensitet og tempo, fra 0.0 til 1.0. Høy energi føles som death metal i et lynnedslag. Lav energi minner mer om klassisk musikk og te.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">Valens</h5>
                          <p className="text-sm text-gray-400">
                            Måler hvor glad eller trist låta føles. 1.0 = solskinn, lykkepiller og sjokolade. 0.0 = regn, ekskjærester og tomt kjøleskap.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">Akustisk</h5>
                          <p className="text-sm text-gray-400">
                            Forteller hvor akustisk låta er. 1.0 betyr "hentet fra en fjellhytte med gitar og opptaker", 0.0 betyr "laget på en laptop med ti plugins og et håp".
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">Instrumental</h5>
                          <p className="text-sm text-gray-400">
                            Måler hvor lite vokal det er. Høye verdier (nær 1.0) betyr instrumental – kanskje med litt "ooh" og "aah". Men hvis det er snakking eller rap? Nope.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">Live</h5>
                          <p className="text-sm text-gray-400">
                            Hvor "live" det høres ut. Høye tall betyr publikum i bakgrunnen, klapping, roping – du vet, konsertfølelse. Over 0.8 og du kan nesten kjenne svetten i rommet.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">Lydstyrke</h5>
                          <p className="text-sm text-gray-400">
                            Gjennomsnittlig lydnivå gjennom hele låta, målt i desibel (dB). Vanligvis mellom -60 og 0 dB. Det sier noe om hvor høyt du må skru opp før naboen banker i veggen.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium text-white">Eksplisitt</h5>
                          <p className="text-sm text-gray-400">
                            Forteller deg om teksten inneholder banning eller annet språk som kan fornærme bestemødre. Ja = snill som et lam, nei = Huffameg (eller at ingen gadd å sjekke).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            </div>
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
    </div>
  )
}

export default App
