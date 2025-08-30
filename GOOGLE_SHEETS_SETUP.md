# 🔗 Google Sheets Integration Setup

This guide walks you through setting up Google Sheets as your music database, following Sporjeger's proven architecture.

## 📋 Prerequisites

- Exported CSV file from your database (use the scripts in `/backend/`)
- Google account
- 10 minutes for setup

## 🚀 Step 1: Prepare Your Google Sheet

### Upload Your Music Data

1. **Export your data** (if not done yet):
   ```bash
   cd backend
   python3 export_simple.py "your-database-url"
   ```

2. **Create new Google Sheet**:
   - Go to https://sheets.google.com
   - Create a new spreadsheet
   - Name it "MusikkMeta Database"

3. **Import your CSV**:
   - File → Import → Upload → Select your CSV file
   - Choose "Replace spreadsheet"
   - Import

4. **Verify column order** (should match this exact order):
   ```
   A: id
   B: track_uri  
   C: track_name
   D: album_name
   E: artist_names
   F: release_date
   G: duration_ms
   H: popularity
   I: explicit
   J: genres
   K: record_label
   L: danceability
   M: energy
   N: key_mode
   O: loudness
   P: mode
   Q: speechiness
   R: acousticness
   S: instrumentalness
   T: liveness
   U: valence
   V: tempo
   ```

5. **Make it public**:
   - Click "Share" → "Anyone with the link" → "Viewer"
   - Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)

## 🔑 Step 2: Get Google Sheets API Key

### Create API Credentials

1. **Go to Google Cloud Console**:
   - Visit https://console.cloud.google.com
   - Create a new project (or select existing)

2. **Enable Google Sheets API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key (keep it secure!)

4. **Restrict API Key** (recommended):
   - Click on your API key → "Edit"
   - Application restrictions: "HTTP referrers"
   - Add: `https://yourusername.github.io/*`
   - API restrictions: "Google Sheets API"
   - Save

## ⚙️ Step 3: Configure Your App

### Local Development

1. **Create environment file**:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. **Add your credentials** to `.env.local`:
   ```env
   VITE_GOOGLE_SHEETS_API_KEY=AIzaSyC-your-api-key-here
   VITE_GOOGLE_SHEET_ID=1HOxZklC4NPdyDV7GSaRBWdY-your-sheet-id-here
   ```

3. **Test locally**:
   ```bash
   yarn dev
   ```

### GitHub Pages Deployment

1. **Add secrets to GitHub**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add repository secrets:
     - `VITE_GOOGLE_SHEETS_API_KEY`: Your API key
     - `VITE_GOOGLE_SHEET_ID`: Your Sheet ID

2. **Push to deploy**:
   ```bash
   git add .
   git commit -m "Add Google Sheets integration"
   git push origin main
   ```

## 🔍 Step 4: Verify Setup

### Check Your App

1. **Visit your deployed app**:
   - https://yourusername.github.io/musikk-meta

2. **Look for status banner**:
   - ✅ Green: "Live Data - Koblet til Google Sheets..."
   - 🔵 Blue: "Demo Mode" (fallback to sample data)

3. **Test search functionality**:
   - Search should return your actual music data
   - Check browser console for Google Sheets connection logs

### Troubleshooting

**"Demo Mode" instead of "Live Data"?**
- Check GitHub Secrets are set correctly
- Verify Sheet ID format (no extra characters)
- Ensure API key is valid and unrestricted

**No search results?**
- Check Google Sheet has data in correct format
- Verify sheet is publicly viewable
- Check browser console for API errors

**API quota errors?**
- Google Sheets API has generous free limits
- Consider adding caching if needed

## 📊 Step 5: Data Management

### Updating Your Music Data

1. **Edit the Google Sheet directly**:
   - Add/edit/delete rows in Google Sheets
   - Changes appear in your app within 5 minutes (cached)

2. **Bulk updates**:
   - Export new CSV from database
   - Import into Google Sheets (replace data)

3. **Force refresh**:
   - Clear browser cache or wait 5 minutes for cache refresh

### Data Quality Tips

- **Use data validation** in Google Sheets for consistent formats
- **Sort by popularity** for better search relevance  
- **Clean duplicates** using Google Sheets built-in tools
- **Standardize genres** (comma-separated: "pop, rock, indie")

## 🎯 Benefits of This Setup

✅ **No server costs** - Static hosting with Google Sheets backend  
✅ **Easy updates** - Edit data directly in Google Sheets UI  
✅ **Fast performance** - Client-side caching with 5min refresh  
✅ **Reliable** - Google's infrastructure with 99.9% uptime  
✅ **Scalable** - Handles thousands of tracks efficiently  
✅ **Team-friendly** - Multiple people can edit the sheet  

## 🔒 Security Notes

- API keys are public in client-side apps (this is normal)
- Restrict API key to your domain for security
- Google Sheets data is read-only from the app
- Consider using environment variables for sensitive data

---

🎉 **You're done!** Your MusikkMeta app now uses Google Sheets as its live database, just like Sporjeger!