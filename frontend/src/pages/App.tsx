import React, { useState, useEffect, useMemo } from "react";
import { Track } from "types";
import { ResultsTable } from "components/ResultsTable";
import brain from "brain";
import { useDebounce } from "utils/useDebounce";
import { useLocation } from "react-router-dom";
import { useCommandPalette } from "../hooks/useCommandPalette";
import { CommandPalette } from "../components/CommandPalette";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

function App() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const location = useLocation();
  const debouncedQuery = useDebounce(query, 300);
  const isGitHubPages = window.location.hostname.includes('github.io');
  const hasGoogleSheetsConfig = !!(import.meta.env.VITE_GOOGLE_SHEET_ID && import.meta.env.VITE_GOOGLE_SHEETS_API_KEY);
  const commandPalette = useCommandPalette();

  useEffect(() => {
    document.title = "MusikkMeta";
    
    // Force favicon update with cache buster
    let favicon = document.querySelector("link[rel='icon']");
    const faviconUrl = "https://static.databutton.com/public/9461eb0d-a47e-4c1b-a921-c05260ed1bc2/Musikk%20Meta_favicon.png";
    const cacheBustedUrl = `${faviconUrl}?v=${new Date().getTime()}`;

    if (favicon) {
      favicon.href = cacheBustedUrl;
    } else {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = cacheBustedUrl;
      document.head.appendChild(favicon);
    }

    // Load all tracks for command palette
    loadAllTracks();
  }, []);

  const loadAllTracks = async () => {
    try {
      // For Google Sheets brain, we can get all tracks
      if (brain.getAllTracks && typeof brain.getAllTracks === 'function') {
        const allTracksData = await brain.getAllTracks();
        setAllTracks(allTracksData);
      }
    } catch (error) {
      console.warn('Could not load all tracks for command palette:', error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("spotify_auth") === "success") {
      toast.success("Successfully logged in with Spotify!", {
        description: "You can now create playlists.",
      });
    } else if (params.get("spotify_auth") === "error") {
      toast.error("Spotify login failed.", {
        description: params.get("error") || "Please try again.",
      });
    }
  }, [location]);

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim() === "") {
      setTracks(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await brain.search_tracks({ query: searchQuery, page: "1" });
      const data = await response.json();
      if (response.ok) {
        setTracks(data.tracks);
      } else {
        throw new Error(data.detail || "Failed to fetch tracks");
      }
    } catch (e: any) {
      setError(e.message);
      setTracks(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  const handleTrackSelect = (trackId: string) => {
    setSelectedTracks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trackId)) {
        newSet.delete(trackId);
      } else {
        newSet.add(trackId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      const allTrackIds = new Set(tracks?.map(t => t.id) || []);
      setSelectedTracks(allTrackIds);
    } else {
      setSelectedTracks(new Set());
    }
  };

  const handleCreatePlaylist = async () => {
    if (selectedTracks.size === 0) {
      toast.error("Please select at least one track to create a playlist.");
      return;
    }
    try {
      const response = await brain.login();
      const data = await response.json();
      if(response.ok) {
        window.location.href = data.authorization_url;
      } else {
        toast.error("Could not connect to Spotify", { description: data.detail });
      }
    } catch (error) {
      toast.error("An unexpected error occurred while connecting to Spotify.");
    }
  };

  const handleSearch = () => {
    performSearch(query);
  };

  const handleCommandPaletteTrackSelect = (track: Track) => {
    // Set the search query to the track name to show it in results
    const searchTerm = `${track.artist_names} ${track.track_name}`;
    setQuery(searchTerm);
    performSearch(searchTerm);
  };

  const handleCommandPaletteSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch(searchQuery);
  };

  return (
    <div className="dark h-screen w-screen bg-black text-white p-8 flex flex-col">
      {hasGoogleSheetsConfig ? (
        <div className="w-full max-w-[1600px] mx-auto mb-4">
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-3 text-center">
            <p className="text-sm text-green-200">
              ✨ <strong>Live Data</strong> - Koblet til Google Sheets med oppdatert musikkdata.
            </p>
          </div>
        </div>
      ) : isGitHubPages ? (
        <div className="w-full max-w-[1600px] mx-auto mb-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-200">
              🎵 <strong>Demo Mode</strong> - Dette er en statisk demo med eksempeldata. Den fulle versjonen har tilgang til en stor database med musikkspor.
            </p>
          </div>
        </div>
      ) : null}
      <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col gap-6 glassmorphic-container p-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col items-start gap-6">
            <div>
              <div className="flex items-center gap-4">
                <div 
                  className="h-14 w-14 shrink-0 animate-gradient-x-logo"
                  style={{
                    WebkitMaskImage: 'url(https://static.databutton.com/public/9461eb0d-a47e-4c1b-a921-c05260ed1bc2/Musikk%20Meta_symbol_transparent.png)',
                    maskImage: 'url(https://static.databutton.com/public/9461eb0d-a47e-4c1b-a921-c05260ed1bc2/Musikk%20Meta_symbol_transparent.png)',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                  }}
                />
                <h1 className="text-5xl font-heading font-bold tracking-tighter animate-gradient-x bg-clip-text text-transparent bg-gradient-to-r from-brand-main via-brand-medium to-brand-light">
                  MusikkMeta
                </h1>
              </div>
              <div className="pl-1">
                <p className="mt-2 text-muted-foreground font-sans text-base">
                  Bak hver låt finnes et regneark
                </p>
                <p className="mt-2 text-muted-foreground/60 font-sans text-xs">
                  v4/22.07.25 — laget av Lene
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-[400px]">
                <Input
                  type="text"
                  placeholder="Skriv inn sang eller artist her..."
                  className="text-base p-6 rounded-full glassmorphic pr-20"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />
                <button
                  onClick={commandPalette.open}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors border border-gray-600 rounded-md bg-gray-800/50"
                >
                  ⌘K
                </button>
              </div>
              <Button
                size="lg"
                className="p-6 rounded-full glassmorphic text-white border border-white/20"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  "Søk"
                )}
              </Button>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="p-6 rounded-full glassmorphic text-white border border-white/20 hover:bg-white/10">
                <Info className="mr-2 h-4 w-4" /> Forklaringer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] glassmorphic">
              <DialogHeader>
                <DialogTitle>Forklaringer</DialogTitle>
                <DialogDescription>
                  Slik tolker du disse dataene:
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4">
              <div className="grid gap-4 py-4">
                  <div>
                    <h4 className="font-bold text-white">Popularity</h4>
                    <p className="text-sm text-muted-foreground">
                      Hvor populær låta er – på en skala fra 0 til 100. 100 betyr "alle elsker den", 0 betyr "ingen vet at den finnes".
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Explicit</h4>
                    <p className="text-sm text-muted-foreground">
                      Forteller deg om teksten inneholder banning eller annet språk som kan fornærme bestemødre. true = ja, false = nei – eller at ingen gadd å sjekke.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Key</h4>
                    <p className="text-sm text-muted-foreground">
                      Tonen låta går i – f.eks. C, G#, D. # betyr "kryss", altså et halvt trinn opp. “Major” = dur (lyst), “minor” = moll (mørkt).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Energy</h4>
                    <p className="text-sm text-muted-foreground">
                      Måler intensitet og tempo, fra 0.0 til 1.0. Høy energi føles som death metal i et lynnedslag. Lav energi minner mer om klassisk musikk og te.
                    </p>
                  </div>
                   <div>
                    <h4 className="font-bold text-white">Danceability</h4>
                    <p className="text-sm text-muted-foreground">
                      Hvor dansbar låta er. Basert på tempo, rytmestabilitet, beat-trykk og hvor jevnt den flyter. 0 er “sitt helt rolig”, 1 er “klar for dansegulvet”.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Valence</h4>
                    <p className="text-sm text-muted-foreground">
                       Måler hvor glad eller trist låta føles. 1.0 = solskinn, lykkepiller og sjokolade. 0.0 = regn, ekskjærester og tomt kjøleskap.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Loudness</h4>
                    <p className="text-sm text-muted-foreground">
                      Gjennomsnittlig lydnivå gjennom hele låta, målt i desibel (dB). Vanligvis mellom -60 og 0 dB. Det sier noe om hvor høyt du må skru opp før naboen banker i veggen.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Acousticness</h4>
                    <p className="text-sm text-muted-foreground">
                       Forteller hvor akustisk låta er. 1.0 betyr “hentet fra en fjellhytte med gitar og opptaker”, 0.0 betyr “laget på en laptop med ti plugins og et håp”.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Speechiness</h4>
                    <p className="text-sm text-muted-foreground">
                      Måler hvor mye prating det er. 1.0 er snakk, podcast eller dikt. 0.0 er ren musikk. Midt i mellom? Tenk rap, eller spoken word.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Instrumentalness</h4>
                    <p className="text-sm text-muted-foreground">
                      Måler hvor lite vokal det er. Høye verdier (nær 1.0) betyr instrumental – kanskje med litt “ooh” og “aah”. Men hvis det er snakking eller rap? Nope.
                    </p>
                  </div>
                   <div>
                    <h4 className="font-bold text-white">Liveness</h4>
                    <p className="text-sm text-muted-foreground">
                      Hvor “live” det høres ut. Høye tall betyr publikum i bakgrunnen, klapping, roping – du vet, konsertfølelse. Over 0.8 og du kan nesten kjenne svetten i rommet.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </header>
        <main className="flex-grow overflow-hidden">
          {error && <p className="text-red-500">{error}</p>}
          {loading && (
            <div className="flex-grow flex items-center justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
                Laster...
              </div>
            </div>
          )}
          {!loading && !error && tracks && (
            <ResultsTable 
              tracks={tracks}
              setTracks={setTracks}
            />
          )}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        tracks={allTracks}
        onTrackSelect={handleCommandPaletteTrackSelect}
        onSearch={handleCommandPaletteSearch}
      />

      <Toaster richColors />
    </div>
  );
}

export default App;
