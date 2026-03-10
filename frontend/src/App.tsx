import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { Search, Info } from 'lucide-react'
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
const TrackDetailPanel = React.lazy(() => import('@/components/TrackDetailPanel'))

function App() {
  const {
    query,
    tracks,
    allTracks,
    loading,
    error,
    selectedTrack,
    filters,
    setQuery,
    setTracks,
    setAllTracks,
    setLoading,
    setError,
    setSelectedTrack,
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

  // Lukk detaljpanel med Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedTrack && !isOpen) {
        setSelectedTrack(null)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [selectedTrack, isOpen])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const allTracksData = await brain.getAllTracks()
      setAllTracks(allTracksData)
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
      const data = await brain.searchTracks({
        query: searchQuery,
        page: 1,
        pageSize: 200,
      })
      setTracks(data.tracks)
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

  const genres = useMemo(() => getUniqueGenres(allTracks), [allTracks])

  if (loading && !tracks.length && !allTracks.length) {
    return <PageLoading message="Laster MusikkMeta..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Kompakt header */}
        <header className="mb-6">
          {/* Logo + søk på samme rad */}
          <div className="flex items-center gap-4 mb-3">
            <div className="relative shrink-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-glow-text select-none">
                MusikkMeta
              </h1>
              <div className="absolute -inset-x-3 -inset-y-1 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-xl blur-xl animate-glow-pulse pointer-events-none" />
            </div>

            {/* Søkefelt */}
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Søk blant millioner av låter..."
                  className="pl-10 pr-20 h-10 bg-gray-900/40 backdrop-blur-sm border-gray-700/50 text-white placeholder-gray-500 focus:border-blue-500/50 focus:bg-gray-900/60 transition-all duration-200 rounded-lg text-sm"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={open}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-white transition-colors border border-gray-700/50 rounded bg-gray-800/50 hover:bg-gray-700/50"
                  title="Kommandopalett (Cmd+K / Ctrl+K)"
                >
                  Cmd+K
                </button>
              </div>

              <Button
                onClick={handleSearch}
                size="sm"
                className="h-10 px-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 rounded-lg font-medium transition-all duration-200 shrink-0"
              >
                {loading ? <LoadingSpinner size="sm" text="" /> : 'Søk'}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-gray-500 hover:text-white hover:bg-gray-800/50 rounded-lg shrink-0"
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
                          Søk blant millioner av låter via Deezer, eller bruk <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Cmd+K</kbd> for hurtigsøk. Spor fra den lokale databasen vises med full lydprofil (radar-diagram og Audio DNA). Deezer-spor viser metadata, BPM og 30-sekunders forhåndslytting. Bruk filter for å utforske etter BPM, energi, stemning og mer.
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

      {/* Detaljpanel — desktop slide-in */}
      <Suspense fallback={null}>
        <TrackDetailPanel
          track={selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      </Suspense>
    </div>
  )
}

export default App
