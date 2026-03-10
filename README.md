# MusikkMeta

Nettapp for utforsking av musikkmetadata og lydegenskaper fra Spotify.

[Live demo](https://elzacka.github.io/musikk-meta)

## Funksjoner

- Søk etter artist, låt, album eller sjanger
- Sortering og filtrering på lydegenskaper (BPM, energi, dansbarhet, valens m.m.)
- Detaljvisning med radar-diagram over lydprofil
- Kommandopalett (Cmd+K / Ctrl+K)
- Responsivt design (desktop-tabell + mobil-kort)
- PWA med offline-støtte

## Tech stack

| Komponent | Versjon |
|---|---|
| React | 19.2 |
| TypeScript | 5.9 |
| Vite | 7.3 |
| Tailwind CSS | 4.2 |
| Zustand | 5.0 |
| Recharts | 3.8 |
| Radix UI | 1.x |

## Kom i gang

```bash
cd frontend
yarn install
yarn dev
```

Appen kjører på `http://localhost:3000`.

### Google Sheets (valgfritt)

For å bruke Google Sheets som datakilde, opprett `.env` med:

```env
VITE_GOOGLE_SHEETS_API_KEY=din_api_nøkkel
VITE_GOOGLE_SHEET_ID=din_sheet_id
```

Uten disse variablene kjører appen i demo-modus med eksempeldata.

### Bygg

```bash
yarn build        # Standard
yarn build:gh     # GitHub Pages
```

## Prosjektstruktur

```
frontend/src/
  brain/          Datalaget (Google Sheets / statisk demo)
  components/     UI-komponenter
  services/       Google Sheets API-klient
  stores/         Zustand tilstandshåndtering
  types/          TypeScript-typer
  utils/          Hjelpefunksjoner
```

## Datakilde

Appen henter musikkdata fra Google Sheets (25 kolonner, A:Y) med grunnleggende sporinfo og Spotify Audio Features. Spotify Audio Features API ble avviklet november 2024 — datasettet er et statisk snapshot.

## Lisens

MIT
