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
    console.log('📋 Raw Google Sheets data:', {
      hasValues: !!data.values,
      rowCount: data.values?.length || 0,
      firstRow: data.values?.[0],
      sampleRows: data.values?.slice(1, 3)
    });

    // Debug: Log column headers and first few data rows
    if (data.values && data.values.length > 0) {
      console.log('🔍 Column Headers:', data.values[0]);
      console.log('🔍 First Data Row:', data.values[1]);
      console.log('🔍 Second Data Row:', data.values[2]);
      
      // Extra detailed logging for troubleshooting
      console.log('🔍 Column Mapping:');
      data.values[0].forEach((header, index) => {
        console.log(`  Column ${index}: "${header}" = "${data.values[1]?.[index] || 'N/A'}"`);
      });
    }
    
    if (!data.values || data.values.length <= 1) {
      return [];
    }
    
    // Skip header row and map to Track objects
    const tracks = data.values.slice(1).map((row): Track => ({
      id: parseInt(row[0]) || 0,
      track_uri: row[1] || null,
      track_name: row[2] || null,
      album_name: row[3] || null,
      artist_names: row[4] || null,
      release_date: row[5] || null,
      duration_ms: parseInt(row[6]) || null,
      popularity: parseInt(row[7]) || null,
      explicit: row[8] ? row[8].toLowerCase() === 'true' : null,
      genres: row[9] || null,
      record_label: row[10] || null,
      danceability: parseFloat(row[11]) || null,
      energy: parseFloat(row[12]) || null,
      key_mode: parseInt(row[13]) || null,
      loudness: parseFloat(row[14]) || null,
      mode: parseInt(row[15]) || null,
      speechiness: parseFloat(row[16]) || null,
      acousticness: parseFloat(row[17]) || null,
      instrumentalness: parseFloat(row[18]) || null,
      liveness: parseFloat(row[19]) || null,
      valence: parseFloat(row[20]) || null,
      tempo: parseFloat(row[21]) || null,
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