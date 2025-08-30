# MusikkMeta 🎵

En web-applikasjon for å utforske og analysere musikkmeta-data med detaljerte audio features fra Spotify.

## Demo

🔗 **[Se live demo](https://yourusername.github.io/musikk-meta)**

*Demo-versjonen kjører med eksempeldata. Den fulle versjonen har tilgang til en omfattende database med musikkspor.*

## Funksjoner

- 🔍 **Søk i musikkdatabase** - Finn låter etter artist, sang eller album
- 📊 **Audio Features** - Detaljerte analyser av musikkelementene:
  - Danceability, Energy, Valence
  - Acousticness, Instrumentalness, Liveness
  - Loudness, Speechiness, Tempo
  - Key/Mode analyse
- 📱 **Responsiv design** - Fungerer på alle enheter
- 🎨 **Glassmorphic UI** - Moderne, elegant grensesnitt
- ⚡ **Real-time søk** - Øyeblikkelige resultater mens du skriver

## Teknologi

### Frontend
- **React 18** med TypeScript
- **Vite** som build tool
- **Tailwind CSS** for styling
- **Radix UI** komponenter
- **Lucide React** ikoner

### Backend (fullversjon)
- **FastAPI** Python server
- **PostgreSQL** database (Neon)
- **asyncpg** for database-tilkobling
- **Databutton** deployment platform

## Installasjon og Utvikling

### Forutsetninger
- Node.js 18+
- Yarn pakkemanager

### Lokalt oppsett

1. **Klon repository**
   ```bash
   git clone https://github.com/yourusername/musikk-meta.git
   cd musikk-meta
   ```

2. **Installer avhengigheter**
   ```bash
   make install
   # eller
   cd frontend && yarn install
   cd ../backend && ./install.sh
   ```

3. **Start utviklingsservere**
   ```bash
   # Terminal 1: Backend
   make run-backend
   
   # Terminal 2: Frontend
   make run-frontend
   ```

4. **Åpne applikasjonen**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## Deployment

### GitHub Pages (Statisk demo)

Automatisk deployment via GitHub Actions når du pusher til `main` branch:

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### Manuell build for GitHub Pages

```bash
cd frontend
yarn build:gh
```

## Datastruktur

Applikasjonen arbeider med omfattende musikkmeta-data inkludert:

```typescript
interface Track {
  id: number;
  track_uri: string;
  track_name: string;
  album_name: string;
  artist_names: string;
  release_date: string;
  duration_ms: number;
  popularity: number;
  explicit: boolean;
  genres: string;
  record_label: string;
  
  // Spotify Audio Features
  danceability: number;      // 0.0 - 1.0
  energy: number;           // 0.0 - 1.0
  valence: number;          // 0.0 - 1.0 (lykkefølelse)
  acousticness: number;     // 0.0 - 1.0
  instrumentalness: number; // 0.0 - 1.0
  liveness: number;         // 0.0 - 1.0
  loudness: number;         // dB
  speechiness: number;      // 0.0 - 1.0
  tempo: number;            // BPM
  key_mode: number;         // 0-11 (C, C#, D...)
  mode: number;             // 0 = minor, 1 = major
}
```

## Bidrag

1. Fork repository
2. Lag en feature branch (`git checkout -b feature/amazing-feature`)
3. Commit endringene (`git commit -m 'Add amazing feature'`)
4. Push til branch (`git push origin feature/amazing-feature`)
5. Åpne en Pull Request

## Lisens

Dette prosjektet er privat og tilhører Lene.

## Audio Features Forklaring

- **Popularity**: Hvor populær låta er (0-100)
- **Energy**: Intensitet og tempo (0.0-1.0)
- **Danceability**: Hvor dansbar låta er basert på tempo og rytme
- **Valence**: Måler hvor glad/trist låta føles
- **Loudness**: Gjennomsnittlig lydnivå i dB
- **Acousticness**: Hvor akustisk låta er
- **Speechiness**: Mengde prating/rap i låta
- **Instrumentalness**: Hvor lite vokal det er
- **Liveness**: Om det høres ut som live-opptak
- **Key**: Toneart (C, G#, D osv.)
- **Mode**: Dur (major) eller moll (minor)

---

*Laget med ❤️ av Lene*