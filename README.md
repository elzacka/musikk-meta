# MusikkMeta 🎵

En moderne web-applikasjon for å utforske og analysere musikkens metadata med detaljerte lydegenskaper fra Spotify. Perfekt for musikkelskere som vil forstå hva som gjør musikk til musikk.

## 🚀 Live Demo

🔗 **[Se live demo](https://elzacka.github.io/musikk-meta)**

## ✨ Funksjoner

- 🔍 **Avansert søk** - Finn låter etter artist, sang, album eller sjanger
- 📊 **Spotify Audio Features** - Detaljerte analyser av musikkelementene:
  - Danceability (dansbarhet), Energy (energi), Valence (lykkefølelse)
  - Acousticness, Instrumentalness, Liveness
  - Loudness, Speechiness, Tempo og toneart
- ⌨️ **Kommandopalett** - Hurtignavigering med `⌘K` / `Ctrl+K`
- 📱 **Responsiv design** - Fungerer perfekt på alle enheter
- 🎨 **Glassmorphic UI** - Moderne, elegant design med bakgrunnsuskarphet
- ⚡ **Real-time søk** - Øyeblikkelige resultater mens du skriver
- 🎯 **Sortering og filtrering** - Arranger resultater etter alle audio features

## 🛠️ Teknisk stack

### Frontend
- **React 18** med TypeScript for type-sikkerhet
- **Vite** som lynrask build tool og dev server
- **Tailwind CSS** for utility-first styling
- **Radix UI** for tilgjengelige UI-komponenter
- **Zustand** for enkel state management
- **React Query** for server state og caching
- **Lucide React** for konsistente ikoner

### Data Sources
- **Google Sheets API** - Primær datakilde (konfigurerbar)
- **Statiske data** - Fallback for demo og GitHub Pages
- **Smart caching** - 5 minutters cache for optimal ytelse

### Backend (valgfritt)
- **FastAPI** Python server
- **PostgreSQL** database
- **Firebase Authentication**

## 🚀 Kom i gang

### Kjør lokalt

1. **Klon repositoryet**
   ```bash
   git clone https://github.com/elzacka/musikk-meta.git
   cd musikk-meta
   ```

2. **Installer avhengigheter**
   ```bash
   cd frontend
   yarn install
   ```

3. **Start utviklingsserver**
   ```bash
   yarn dev
   ```

   Applikasjonen kjører nå på `http://localhost:3000`

### Konfigurer Google Sheets (valgfritt)

For å bruke Google Sheets som datakilde, legg til miljøvariabler:

```env
VITE_GOOGLE_SHEETS_API_KEY=din_api_nøkkel
VITE_GOOGLE_SHEET_ID=din_sheet_id
```

### Build for produksjon

```bash
# Standard build
yarn build

# GitHub Pages build
yarn build:gh
```

## 📊 Datastruktur

Applikasjonen arbeider med omfattende musikkmeta-data:

```typescript
interface Track {
  // Grunnleggende informasjon
  track_name: string;
  artist_names: string;
  album_name: string;
  release_date: string;
  duration_ms: number;
  popularity: number;        // 0-100
  explicit: boolean;
  genres: string;

  // Spotify Audio Features (0.0-1.0)
  danceability: number;      // Dansbarhet
  energy: number;           // Energi/intensitet
  valence: number;          // Lykkefølelse
  acousticness: number;     // Akustisk grad
  instrumentalness: number; // Instrumental grad
  liveness: number;         // Live-opptak følelse
  speechiness: number;      // Tale/rap innhold
  loudness: number;         // Lydstyrke (dB)
  tempo: number;            // BPM
  key_mode: string;         // Toneart
  mode: number;             // 0=moll, 1=dur
}
```

## 🎵 Forstå Audio Features

MusikkMeta bruker Spotifys audio features for å analysere musikk:

- **Popularity** (0-100): Hvor populær låten er globalt
- **Danceability** (0-100%): Hvor dansbar låten er basert på tempo og rytme
- **Energy** (0-100%): Intensitet og kraft - høy energi føles kraftfull og intens
- **Valence** (0-100%): Lykkefølelse - høy valence = glad musikk, lav = trist
- **Acousticness** (0-100%): Sannsynlighet for at låten er akustisk
- **Instrumentalness** (0-100%): Hvor lite vokal det er i låten
- **Liveness** (0-100%): Sannsynlighet for live-opptak med publikum
- **Speechiness** (0-100%): Mengde tale/rap i låten
- **Loudness** (dB): Gjennomsnittlig lydnivå gjennom hele låten
- **Tempo** (BPM): Estimert tempo i beats per minutt

## 📱 Brukerveiledning

### Søking
- Skriv i søkefeltet for å finne låter etter artist, låtnavn eller album
- Bruk `⌘K` eller `Ctrl+K` for kommandopaletten (hurtigsøk)
- Klikk på kolonneoverskrifter for å sortere resultater

### Navigering
- **Kommandopalett**: Rask navigering og søk i hele databasen
- **Sortering**: Klikk på kolonneoverskrifter for å sortere
- **Responsive**: Fungerer på mobil, nettbrett og desktop

## 🔧 Utviklingsinfo

### Prosjektstruktur
```
musikk-meta/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── components/  # UI komponenter
│   │   ├── brain/      # Data layer (Google Sheets/Static)
│   │   ├── stores/     # Zustand state management
│   │   └── types/      # TypeScript type definisjoner
│   └── public/
├── backend/            # FastAPI backend (valgfritt)
└── .github/workflows/  # GitHub Actions for deployment
```

### Deployment
- **GitHub Pages**: Automatisk deployment ved push til main branch
- **Vercel/Netlify**: Enkel deployment med miljøvariabler
- **Backend**: Kan deployes til Heroku, Railway, eller Vercel

## 🤝 Bidrag

Har du forslag til forbedringer? Opprett en issue eller pull request!

### Kjente issues
- [ ] Optimalisering for store datasett (>10k låter)
- [ ] Offline support med service workers
- [ ] Eksport av søkeresultater til CSV/JSON

## 📄 Lisens

Dette prosjektet er privat og tilhører elzacka.

---

*Laget med ❤️ av elzacka*

**MusikkMeta** - Utforsk musikkens DNA gjennom data
