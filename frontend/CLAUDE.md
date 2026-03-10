# MusikkMeta — Prosjektkontekst

## Versjon

**2.2.0** (2026-03-10)

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

React 19 PWA med Google Sheets som datakilde. Uten env-variabler kjører appen i demo-modus med statiske eksempeldata.

### Dataflyt

```
Google Sheets API
  → googleSheets.ts (fetch + safe parsing)
  → GoogleSheetsBrain (in-memory cache, 5 min)
  → modernBrain.ts (velger datakilde basert på env-variabler)
  → App.tsx (søk + tilstand via Zustand)
  → SearchResults.tsx (tabell/kort-visning)
```

### Nøkkelfiler

| Fil | Ansvar |
|---|---|
| `src/types/music.ts` | Alle domenetyper + `MusicDataSource`-grensesnitt |
| `src/services/googleSheets.ts` | Henter og parser data fra Sheets |
| `src/brain/searchUtils.ts` | Delt søke- og pagineringslogikk |
| `src/brain/googleSheetsBrain.ts` | Google Sheets-datakilde med cache |
| `src/brain/staticBrain.ts` | Demo-datakilde med eksempeldata |
| `src/brain/modernBrain.ts` | Velger datakilde basert på env |
| `src/stores/musicStore.ts` | Global tilstand (Zustand) |
| `src/utils/formatters.ts` | Delte formateringsfunksjoner |
| `src/components/SearchResults.tsx` | Sorterbar resultattabell + mobilkort |
| `src/components/TrackModal.tsx` | Detaljvisning med radar-diagram |
| `src/components/CommandPalette.tsx` | Cmd+K hurtigsøk |
| `src/components/FilterPanel.tsx` | Filtrering på lydegenskaper |
| `src/App.tsx` | Hovedkomponent |

## Brain API

Alle datakilder implementerer `MusicDataSource`:

```typescript
interface MusicDataSource {
  searchTracks(params: { query: string; page?: number; pageSize?: number }): Promise<SearchResponse>;
  getAllTracks(): Promise<Track[]>;
  refreshData(): Promise<void>;
}
```

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

- Spotify Audio Features API avviklet november 2024. Datasettet er et statisk snapshot.
- Paginering er client-side (alle spor lastes ved oppstart).
- ESLint 10 blokkert av `eslint-plugin-react-hooks` (ingen stabil versjon med ESLint 10-støtte per mars 2026).

## Versjonering

MAJOR.MINOR.PATCH
- PATCH: Bugfixer, kosmetiske endringer
- MINOR: Ny funksjonalitet
- MAJOR: Bruddende endringer i datamodell eller arkitektur
