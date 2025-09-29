# MusikkMeta 🎵

A web application for exploring and analyzing music metadata with detailed audio features from Spotify. Perfect for music enthusiasts who want to understand what makes music *music*.

## 🚀 Live Demo

🔗 **[View live demo](https://elzacka.github.io/musikk-meta)**

## ✨ Features

- 🔍 **Advanced Search** - Find tracks by artist, song, album, or genre
- 📊 **Spotify Audio Features** - Detailed analysis of musical elements:
  - Danceability, Energy, Valence
  - Acousticness, Instrumentalness, Liveness
  - Loudness, Speechiness, Tempo, and Key
- ⌨️ **Command Palette** - Quick navigation using `⌘K` / `Ctrl+K`
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎨 **Glassmorphic UI** - Modern, elegant design with background blur
- ⚡ **Real-time Search** - Instant results as you type
- 🎯 **Sorting and Filtering** - Sort results by any audio feature

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** as a fast build tool and dev server
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible UI components
- **Zustand** for simple state management
- **React Query** for server state and caching
- **Lucide React** for consistent icons

### Data Sources
- **Google Sheets API** - Primary data source (configurable)
- **Static Data** - Fallback for demo and GitHub Pages
- **Smart Caching** - 5-minute cache for optimal performance

### Backend (optional)
- **FastAPI** Python server
- **PostgreSQL** database
- **Firebase Authentication**

## 🚀 Getting Started

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/elzacka/musikk-meta.git
   cd musikk-meta
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   yarn install
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

   Applikasjonen kjører nå på `http://localhost:3000`

### Configure Google Sheets (optional)

To use Google Sheets as a data source, add the environment variables:

```env
VITE_GOOGLE_SHEETS_API_KEY=din_api_nøkkel
VITE_GOOGLE_SHEET_ID=din_sheet_id
```

### Build for Production

```bash
# Standard build
yarn build

# GitHub Pages build
yarn build:gh
```

## 📊 Data Structure

The application works with rich music metadata:

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

## 🎵 Understanding Audio Features

MusikkMeta uses Spotify's audio features to analyze music:

- **Popularity** (0–100): How globally popular the track is
- **Danceability** (0–100%): How suitable the track is for dancing based on tempo and rhythm
- **Energy** (0–100%): Intensity and power – high energy feels loud and dynamic
- **Valence** (0–100%): Positivity – high valence = happy music, low = sad music
- **Acousticness** (0–100%): Likelihood that the track is acoustic
- **Instrumentalness** (0–100%): Degree to which the track lacks vocals
- **Liveness** (0–100%): Probability the track was recorded live with an audience
- **Speechiness** (0–100%): Presence of spoken words/rap
- **Loudness** (dB): Average volume level throughout the track
- **Tempo** (BPM): Estimated tempo in beats per minute


## 📱 User Guide

### Searching
- Type in the search field to find tracks by artist, track name, or album
- Use `⌘K` or `Ctrl+K` to open the command palette (quick search)
- Click column headers to sort results

### Navigation
- **Command Palette**: Quick navigation and database search
- **Sorting**: Click on column headers to sort
- **Responsive**: Works on mobile, tablet, and desktop

## 🔧 Development Info

### Project Structure
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
- **GitHub Pages**: Automatic deployment on push to main branch
- **Vercel/Netlify**: Easy deployment with environment variables
- **Backend**: Can be deployed to Heroku, Railway, or Vercel

## 🤝 Contributing

Got ideas for improvements? Create an issue or submit a pull request!

### Known Issues
- [ ] Optimization for large datasets (>10k tracks)
- [ ] Offline support with service workers
- [ ] Export search results to CSV/JSON

## 📄 License

MIT - see LICENSE

---

*Made with ❤️ by elzacka*

**MusikkMeta** – Explore the DNA of music through data
