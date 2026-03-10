import React, { Suspense, useEffect, useState } from 'react'
import { Music, Search, Info } from 'lucide-react'
import { useMusicStore } from '@/stores/musicStore'
import { useCommandPalette } from '@/hooks/useCommandPalette'
import { useDebounce } from '@/utils/useDebounce'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner, PageLoading } from '@/components/Loading'
import { FilterPanel } from '@/components/FilterPanel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getUniqueGenres } from '@/services/googleSheets'
import brain from './brain/modernBrain'
import type { Track } from '@/types/music'

const SearchResults = React.lazy(() => import('@/components/SearchResults'))
const CommandPalette = React.lazy(() => import('@/components/CommandPalette'))

const hasGoogleSheets = !!(
  import.meta.env?.VITE_GOOGLE_SHEET_ID &&
  import.meta.env?.VITE_GOOGLE_SHEETS_API_KEY
)

function App() {
  const {
    query,
    tracks,
    allTracks,
    loading,
    error,
    filters,
    setQuery,
    setTracks,
    setAllTracks,
    setLoading,
    setError,
    setFilters,
    resetFilters,
  } = useMusicStore()

  const [localQuery, setLocalQuery] = useState(query)
  const debouncedQuery = useDebounce(localQuery, 300)
  const { isOpen, open, close } = useCommandPalette()

  useEffect(() => {
    document.title = 'MusikkMeta - Utforsk musikkens DNA'
    loadInitialData()
  }, [])

  useEffect(() => {
    if (debouncedQuery !== query) {
      setQuery(debouncedQuery)
      performSearch(debouncedQuery)
    }
  }, [debouncedQuery])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      if (brain.getAllTracks) {
        const allTracksData = await brain.getAllTracks()
        setAllTracks(allTracksData)
      } else {
        setAllTracks([])
      }
    } catch {
      setError('Kunne ikke laste musikdata. Sjekk konfigurasjon.')
      setAllTracks([])
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setTracks([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await brain.search_tracks({
        query: searchQuery,
        page: 1,
        page_size: 200,
      })

      if (response.ok) {
        const data = await response.json()
        setTracks(data.tracks)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Søk mislyktes')
      }
    } catch (err) {
      setError(`Søk mislyktes: ${err instanceof Error ? err.message : 'Ukjent feil'}`)
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
    if (e.key === 'Enter') handleSearch()
  }

  const genres = getUniqueGenres(allTracks)

  if (loading && !tracks.length && !allTracks.length) {
    return <PageLoading message="Laster MusikkMeta..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Statusbanner */}
      {hasGoogleSheets ? (
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm border-b border-emerald-500/20 px-6 py-3">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-sm font-medium text-emerald-200">
                Live-data fra Google Sheets
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border-b border-amber-500/20 px-6 py-3">
          <div className="container mx-auto max-w-7xl">
            <p className="text-sm text-center text-amber-200">
              <span className="font-medium">Demo-modus</span> — bruker eksempeldata
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-6 py-12">
        {/* Topptekst */}
        <header className="mb-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                <Music className="w-8 h-8 text-blue-400" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-60" />
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                MusikkMeta
              </h1>
              <p className="text-gray-400 text-lg font-medium">Utforsk musikkens DNA</p>
            </div>
          </div>

          {/* Søk */}
          <div className="flex flex-col gap-3 max-w-4xl">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Søk etter låt, artist, album, sjanger..."
                  className="pl-12 pr-28 h-14 bg-gray-900/40 backdrop-blur-sm border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500/50 focus:bg-gray-900/60 transition-all duration-200 rounded-xl text-base"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={open}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors border border-gray-600/50 rounded-lg bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50"
                  title="Kommandopalett (Cmd+K / Ctrl+K)"
                >
                  Cmd+K
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
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl bg-gray-950/95 backdrop-blur-sm border-gray-700/50">
                    <DialogHeader className="pb-6">
                      <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Hvordan bruke MusikkMeta
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Søk i musikkdatabasen og utforsk lydegenskapene til sporene.
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-96">
                      <div className="space-y-6 pr-4">
                        <div>
                          <h4 className="font-semibold text-white mb-3">Kom i gang</h4>
                          <p className="text-sm text-gray-400 mb-4">
                            Bruk søkefeltet eller <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Cmd+K</kbd> for å finne musikk. Bruk filter-knappen for å utforske etter lydegenskaper — BPM, energi, stemning og mer. Klikk en rad i tabellen for å se full lydprofil med radar-diagram.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-3">Hva betyr lydegenskapene?</h4>
                          <div className="space-y-4 text-sm text-gray-400">
                            {[
                              ['Popularitet', 'Skala 0–100. 100 = alle elsker den, 0 = ingen vet at den finnes.'],
                              ['Dansbar', 'Hvor dansbar låta er — basert på tempo, rytmestabilitet og beat-trykk.'],
                              ['Energi', 'Intensitet fra 0–100. Høy = death metal. Lav = klassisk og te.'],
                              ['Valens', 'Stemning: 100 = solskinn og lykkepiller, 0 = regn og tomt kjøleskap.'],
                              ['Akustisk', '100 = fjellhytte og gitar, 0 = laptop med ti plugins og et håp.'],
                              ['Instrumental', 'Høye verdier = lite eller ingen vokal.'],
                              ['Live', 'Over 80 kan du nesten kjenne svetten i rommet.'],
                              ['Lydstyrke', 'Gjennomsnittlig lydnivå i dB (typisk −60 til 0).'],
                              ['Tale', 'Høye verdier = mye prat eller rap.'],
                              ['Takt', 'Taktart — vanligvis 3 eller 4.'],
                            ].map(([title, desc]) => (
                              <div key={title}>
                                <span className="font-medium text-white">{title}: </span>
                                {desc}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Filter-panel */}
            <FilterPanel
              filters={filters}
              genres={genres}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </div>
        </header>

        {/* Innhold */}
        <main>
          <ErrorBoundary>
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}
            <Suspense fallback={<LoadingSpinner text="Laster resultater..." />}>
              <SearchResults
                tracks={tracks}
                allTracks={allTracks}
                query={query}
                filters={filters}
                loading={loading}
              />
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* Kommandopalett */}
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={isOpen}
            onClose={close}
            tracks={allTracks}
            onTrackSelect={(track: Track) => {
              const searchTerm = `${track.artist_names} ${track.track_name}`
              setLocalQuery(searchTerm)
              setQuery(searchTerm)
              setTracks([track])
              close()
            }}
            onSearch={(searchQuery: string) => {
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
