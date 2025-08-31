# MusikkMeta 🎵

En web-applikasjon for å utforske og analysere musikkens metadata med detaljerte lydegenskaper fra Spotify.

## Demo

🔗 **[Se live demo](https://elzacka.github.io/musikk-meta)**


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

## Lisens

Dette prosjektet er privat og tilhører elzacka.

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

*Laget med ❤️ av elzacka*
