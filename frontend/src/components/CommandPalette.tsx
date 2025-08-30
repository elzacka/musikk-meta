import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Track } from '../brain/data-contracts';
import { X, Search, Music, User, Disc } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  onTrackSelect: (track: Track) => void;
  onSearch: (query: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tracks,
  onTrackSelect,
  onSearch
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter tracks based on query
  const filteredTracks = useMemo(() => {
    if (!query.trim()) return tracks.slice(0, 10); // Show first 10 if no query
    
    const searchTerm = query.toLowerCase();
    return tracks.filter(track => 
      track.track_name?.toLowerCase().includes(searchTerm) ||
      track.artist_names?.toLowerCase().includes(searchTerm) ||
      track.album_name?.toLowerCase().includes(searchTerm) ||
      track.genres?.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limit to 10 results for performance
  }, [query, tracks]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredTracks]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredTracks.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredTracks.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTracks[selectedIndex]) {
            handleTrackSelect(filteredTracks[selectedIndex]);
          } else if (query.trim()) {
            // Perform search if no specific track selected
            onSearch(query);
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredTracks, query, onSearch, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ 
          block: 'nearest', 
          behavior: 'smooth' 
        });
      }
    }
  }, [selectedIndex]);

  const handleTrackSelect = (track: Track) => {
    onTrackSelect(track);
    onClose();
    setQuery('');
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const formatDuration = (ms: number | null): string => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 bg-black/95 border border-gray-700 backdrop-blur-sm">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-gray-700">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Søk etter låt, artist, album eller sjanger..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
              value={query}
              onChange={handleQueryChange}
            />
            <button
              onClick={onClose}
              className="ml-3 p-1 hover:bg-gray-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div 
            ref={listRef}
            className="max-h-96 overflow-y-auto"
          >
            {filteredTracks.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400">
                {query.trim() ? (
                  <div>
                    <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Ingen resultater funnet for "{query}"</p>
                    <p className="text-sm mt-1">Trykk Enter for å søke i hele databasen</p>
                  </div>
                ) : (
                  <div>
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Start å skrive for å søke...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2">
                {filteredTracks.map((track, index) => (
                  <button
                    key={track.id}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-800/50 transition-colors ${
                      index === selectedIndex ? 'bg-blue-600/30 border-l-2 border-blue-500' : ''
                    }`}
                    onClick={() => handleTrackSelect(track)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Music className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <p className="font-medium text-white truncate">
                            {track.track_name || 'Ukjent låt'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span className="truncate">
                              {track.artist_names || 'Ukjent artist'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Disc className="w-3 h-3" />
                            <span className="truncate">
                              {track.album_name || 'Ukjent album'}
                            </span>
                          </div>
                        </div>
                        {track.genres && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {track.genres}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0 text-right">
                        {track.popularity && (
                          <div className="text-xs text-gray-400 mb-1">
                            ★ {track.popularity}
                          </div>
                        )}
                        {track.duration_ms && (
                          <div className="text-xs text-gray-500">
                            {formatDuration(track.duration_ms)}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-700 bg-gray-900/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                <span>↑↓ Naviger</span>
                <span>Enter Velg</span>
                <span>Esc Lukk</span>
              </div>
              <div>
                Cmd+K for å åpne
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};