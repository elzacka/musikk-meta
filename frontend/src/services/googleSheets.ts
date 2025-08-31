import type { Track, SheetData } from '../types';

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const RANGE = 'A:V'; // Columns A-V for all track data (22 columns)

export async function fetchMusicTracks(): Promise<Track[]> {
  try {
    console.log('🔍 Google Sheets API call:', {
      SHEET_ID: SHEET_ID ? '✅ Configured' : '❌ Missing',
      API_KEY: API_KEY ? '✅ Configured' : '❌ Missing',
      url: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY?.substring(0, 10)}...`
    });

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );
    
    console.log('📊 Google Sheets response:', {
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Sheets API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data: SheetData = await response.json();
    console.log(`📋 Loaded ${data.values?.length - 1 || 0} tracks from Google Sheets`);
    
    // Debug: Check data mapping for first track to find tempo column
    if (data.values && data.values.length > 1) {
      console.log('🎵 Tempo Debug - First track columns 0-22:', {
        'Track Name (Col 1)': data.values[1][1],
        'Col 0': data.values[1][0],
        'Col 8': data.values[1][8],
        'Col 9': data.values[1][9], 
        'Col 10 (Genres)': data.values[1][10],
        'Col 11': data.values[1][11],
        'Col 12': data.values[1][12],
        'Col 13': data.values[1][13],
        'Col 14': data.values[1][14],
        'Col 15': data.values[1][15],
        'Col 16': data.values[1][16],
        'Col 17': data.values[1][17],
        'Col 18': data.values[1][18],
        'Col 19': data.values[1][19],
        'Col 20': data.values[1][20],
        'Col 21': data.values[1][21],
        'Col 22': data.values[1][22] || 'undefined'
      });
    }
    
    if (!data.values || data.values.length <= 1) {
      return [];
    }
    
    // Skip header row and map to Track objects - Updated mapping based on actual spreadsheet structure
    const tracks = data.values.slice(1).map((row, index): Track => ({
      id: index + 1, // Generate sequential ID since spreadsheet doesn't have ID column
      track_uri: row[0] || null,           // Column 0: "Track URI"
      track_name: row[1] || null,          // Column 1: "Track Name"
      album_name: row[2] || null,          // Column 2: "Album Name"
      artist_names: row[3] || null,        // Column 3: "Artist Name(s)"
      release_date: row[4] || null,        // Column 4: "Release Date"
      duration_ms: parseInt(row[5]) || null, // Column 5: "Duration (ms)"
      popularity: parseInt(row[6]) || null,  // Column 6: "Popularity"
      explicit: row[7] ? row[7].toLowerCase() === 'true' : null, // Column 7: "Explicit"
      genres: row[10] || null,             // Column 10: "Genres"
      record_label: row[11] || null,       // Column 11: "Record Label"
      danceability: parseFloat(row[12]) || null,    // Column 12: "Danceability"
      energy: parseFloat(row[13]) || null,          // Column 13: "Energy"
      key_mode: parseInt(row[14]) || null,          // Column 14: "Key"
      loudness: parseFloat(row[15]) || null,        // Column 15: "Loudness"
      mode: parseInt(row[16]) || null,              // Column 16: "Mode"
      speechiness: parseFloat(row[17]) || null,     // Column 17: "Speechiness"
      acousticness: parseFloat(row[18]) || null,    // Column 18: "Acousticness"
      instrumentalness: parseFloat(row[19]) || null, // Column 19: "Instrumentalness"
      liveness: parseFloat(row[20]) || null,        // Column 20: "Liveness"
      valence: parseFloat(row[21]) || null,         // Column 21: "Valence"
      tempo: parseFloat(row[22]) || null,           // Column 22: "Tempo" (BPM)
    }));
    
    // Filter out empty rows (tracks without a name)
    return tracks.filter(track => track.track_name && track.track_name.trim() !== '');
  } catch (error) {
    console.error('Error fetching music tracks:', error);
    throw error;
  }
}

export function getUniqueGenres(tracks: Track[]): string[] {
  const genres = tracks
    .map(track => track.genres)
    .filter(Boolean)
    .flatMap(genreString => genreString!.split(',').map(g => g.trim()))
    .filter(genre => genre !== '');
  
  return [...new Set(genres)].sort();
}

export function getUniqueArtists(tracks: Track[]): string[] {
  const artists = tracks
    .map(track => track.artist_names)
    .filter(Boolean)
    .flatMap(artistString => artistString!.split(',').map(a => a.trim()))
    .filter(artist => artist !== '');
  
  return [...new Set(artists)].sort();
}

export function getUniqueLabels(tracks: Track[]): string[] {
  const labels = tracks
    .map(track => track.record_label)
    .filter(Boolean)
    .map(label => label!.trim())
    .filter(label => label !== '');
  
  return [...new Set(labels)].sort();
}