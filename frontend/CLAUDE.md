# MusikkMeta — Prosjektkontekst

## Versjon

**3.0.0** (2026-03-11)

| Komponent | Versjon |
|---|---|
| React | 19.2.4 |
| TypeScript | 5.9.3 |
| Vite | 7.3.1 |
| Tailwind CSS | 4.2.1 |
| Zustand | 5.0.11 |
| Recharts | 3.8.0 |
| Yarn | 4.12.0 |

## Arkitektur

React 19 PWA med hybridarkitektur: Deezer API for universelt musikksøk (70M+ spor) kombinert med Google Sheets for lokale spor med audio features.

### Dataflyt

```
Bruker søker
  → HybridBrain (parallelt søk)
    ├─ DeezerBrain → deezer.ts → Deezer API (via proxy)
    │   → metadata, BPM, cover art, 30-sek preview
    └─ GoogleSheetsBrain → googleSheets.ts → Google Sheets API
        → metadata + audio features (dansbarhet, energi, valens, …)
  → Merge: lokale spor (med audio features) prioriteres, Deezer fyller resten
  → App.tsx (Zustand store)
  → SearchResults.tsx (tabell/kort) + TrackDetailPanel.tsx (slide-in)
```

### Nøkkelfiler

| Fil | Ansvar |
|---|---|
| `src/types/music.ts` | Alle domenetyper + `MusicDataSource`-grensesnitt |
| `src/services/deezer.ts` | Deezer API-klient (søk, albumdetaljer) |
| `src/services/googleSheets.ts` | Henter og parser data fra Sheets |
| `src/brain/hybridBrain.ts` | Merger Deezer + lokale data med deduplisering |
| `src/brain/deezerBrain.ts` | Deezer-datakilde |
| `src/brain/googleSheetsBrain.ts` | Google Sheets-datakilde med cache |
| `src/brain/staticBrain.ts` | Demo-datakilde med eksempeldata |
| `src/brain/modernBrain.ts` | Oppretter HybridBrain basert på env |
| `src/brain/searchUtils.ts` | Delt søke- og pagineringslogikk |
| `src/stores/musicStore.ts` | Global tilstand (Zustand) |
| `src/utils/formatters.ts` | Delte formateringsfunksjoner |
| `src/components/SearchResults.tsx` | Sorterbar resultattabell + mobilkort + sorteringsmeny |
| `src/components/AudioDnaBar.tsx` | Visuell DNA-bar (7 lydegenskaper) |
| `src/components/TrackDetailPanel.tsx` | Slide-in detaljpanel med radar-diagram + preview |
| `src/components/CommandPalette.tsx` | Cmd+K hurtigsøk |
| `src/components/FilterPanel.tsx` | Filtrering på lydegenskaper |
| `src/App.tsx` | Hovedkomponent |

### CORS-proxy (produksjon)

Deezer API støtter ikke CORS. Løsning:
- **Dev:** Vite proxy (`/api/deezer` → `api.deezer.com`)
- **Prod:** Cloudflare Worker (`proxy/worker.ts`)
- **Env:** `VITE_DEEZER_PROXY_URL` — URL til Cloudflare Worker i produksjon

## Brain API

Alle datakilder implementerer `MusicDataSource`:

```typescript
interface MusicDataSource {
  searchTracks(params: { query: string; page?: number; pageSize?: number }): Promise<SearchResponse>;
  getAllTracks(): Promise<Track[]>;
  refreshData(): Promise<void>;
}
```

## Miljøvariabler

| Variabel | Formål | Påkrevd |
|---|---|---|
| `VITE_GOOGLE_SHEET_ID` | Google Sheets dokument-ID | Nei (lokal database) |
| `VITE_GOOGLE_SHEETS_API_KEY` | Google Sheets API-nøkkel | Nei (lokal database) |
| `VITE_DEEZER_PROXY_URL` | URL til Deezer CORS-proxy | Nei (dev bruker Vite proxy) |

## Kolonnestruktur i Google Sheets

| Kolonne (0-indeksert) | Felt | Type |
|---|---|---|
| 0 | track_uri | string |
| 1 | track_name | string |
| 2 | album_name | string |
| 3 | artist_names | string (kommaseparert) |
| 4 | release_date | string |
| 5 | duration_ms | int |
| 6 | popularity | int (0-100) |
| 7 | explicit | bool |
| 8 | added_by | string |
| 9 | added_at | string |
| 10 | genres | string (kommaseparert) |
| 11 | record_label | string |
| 12 | danceability | float (0-1) |
| 13 | energy | float (0-1) |
| 14 | key_mode | int (0=C … 11=B) |
| 15 | loudness | float (dB, typisk -60 til 0) |
| 16 | mode | int (0=moll, 1=dur) |
| 17 | speechiness | float (0-1) |
| 18 | acousticness | float (0-1) |
| 19 | instrumentalness | float (0-1) |
| 20 | liveness | float (0-1) |
| 21 | valence | float (0-1) |
| 22 | tempo | float (BPM) |
| 23 | (ukjent) | - |
| 24 | time_signature | int |

## Kjente begrensninger

- Spotify Audio Features API avviklet november 2024. Lokale spor har statisk snapshot av audio features.
- Deezer-spor mangler audio features (dansbarhet, energi, valens osv.) — kun BPM er tilgjengelig.
- Paginering er client-side (lokale spor lastes ved oppstart).
- ESLint 10 blokkert av `eslint-plugin-react-hooks` (ingen stabil versjon med ESLint 10-støtte per mars 2026).

## Versjonering

MAJOR.MINOR.PATCH
- PATCH: Bugfixer, kosmetiske endringer
- MINOR: Ny funksjonalitet
- MAJOR: Bruddende endringer i datamodell eller arkitektur
