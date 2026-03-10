# MusikkMeta — Prosjektkontekst

## Versjon

**2.2.0** (2026-03-10)

| Komponent | Versjon |
|---|---|
| React | 19.2.4 |
| TypeScript | 5.9 |
| Vite | 7.3 |
| Tailwind CSS | 4.2 |
| Zustand | 5.0 |
| Recharts | 3.8 |

## Arkitektur

Appen er en React 19 PWA som bruker Google Sheets som database.

### Dataflyt

```
Google Sheets API
  -> googleSheets.ts (fetch + safe parsing)
  -> GoogleSheetsBrain (in-memory cache, søk, paginering)
  -> modernBrain.ts (velger datakilde basert på env-variabler)
  -> App.tsx (søk + tilstand)
  -> ResultsTable.tsx (visning)
```

### Nøkkelfiler

| Fil | Ansvar |
|---|---|
| `src/types/music.ts` | Alle domene-typer |
| `src/services/googleSheets.ts` | Henter og parser data fra Sheets |
| `src/brain/googleSheetsBrain.ts` | Søk, cache, paginering |
| `src/brain/modernBrain.ts` | Velger datakilde |
| `src/stores/musicStore.ts` | Global tilstand (Zustand) |
| `src/components/ResultsTable.tsx` | Sorterbar resultattabell |
| `src/App.tsx` | Hoved-komponent |

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

- Spotify Audio Features API deprecated november 2024. Datasettet er et statisk snapshot — nye spor kan ikke berikes automatisk uten alternativ datakilde.
- Paginering i søk er client-side (alle spor lastes ved oppstart for kommandopaletten).

## Versjonering

MAJOR.MINOR.PATCH
- PATCH: Bugfixer, kosmetiske endringer
- MINOR: Ny funksjonalitet
- MAJOR: Bruddende endringer i datamodell eller arkitektur
