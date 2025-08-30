# 🎵 Music Data Export Guide

This guide helps you export your music database to Excel or CSV format for Google Sheets upload.

## 📋 Prerequisites

1. **Database access** - Your `.env` file with database credentials
2. **Python environment** - Backend dependencies installed

## 🚀 Quick Start

### Option 1: Excel Export (Recommended)
```bash
cd backend
./run_export.sh
```

### Option 2: CSV Export (Simple)
```bash
cd backend
python export_to_csv.py
```

### Option 3: Manual Excel Export
```bash
cd backend
pip install pandas openpyxl
python export_music_data.py
```

## 📊 What You Get

### Excel Export Creates:
- **Music_Data** sheet - All track data
- **Summary** sheet - Database statistics
- **Data_Quality** sheet - Issues to clean up

### CSV Export Creates:
- Single CSV file with all track data

## 🔍 Data Structure

The export includes these fields:

| Field | Description | Type |
|-------|-------------|------|
| id | Unique track ID | Integer |
| track_uri | Spotify URI | String |
| track_name | Song title | String |
| album_name | Album title | String |
| artist_names | Artist name(s) | String |
| release_date | Release date | Date |
| duration_ms | Length in milliseconds | Integer |
| popularity | Spotify popularity (0-100) | Integer |
| explicit | Explicit content flag | Boolean |
| genres | Music genres | String |
| record_label | Record label | String |
| **Audio Features:** | | |
| danceability | How danceable (0.0-1.0) | Float |
| energy | Energy level (0.0-1.0) | Float |
| key_mode | Musical key (0-11) | Integer |
| loudness | Average loudness (dB) | Float |
| mode | Major (1) or Minor (0) | Integer |
| speechiness | Spoken word content (0.0-1.0) | Float |
| acousticness | Acoustic vs electric (0.0-1.0) | Float |
| instrumentalness | Vocal vs instrumental (0.0-1.0) | Float |
| liveness | Live performance feel (0.0-1.0) | Float |
| valence | Happy vs sad (0.0-1.0) | Float |
| tempo | Beats per minute | Float |

## 🧹 Data Quality Issues to Look For

The export script will identify:

- **Missing data** - Null values in important fields
- **Duplicate tracks** - Same song/artist combinations
- **Unusual values** - Very short/long tracks
- **Inconsistent formats** - Date, genre formatting issues

## 📤 Next Steps: Google Sheets Upload

1. **Open** the exported Excel/CSV file
2. **Review** data quality issues
3. **Upload** to Google Sheets
4. **Clean** and organize the data
5. **Set up** Google Sheets API integration

## 🔧 Troubleshooting

### "Database URL not found"
- Check your `.env` file exists in the backend directory
- Ensure `DATABASE_URL_DEV` or `DATABASE_URL_ADMIN_DEV` is set

### "No data found"
- Database connection is working but table is empty
- Check if you're connecting to the right database environment

### "Permission denied"
- Run: `chmod +x run_export.sh`
- Or use the manual commands instead

### Python dependency errors
```bash
pip install databutton asyncpg pandas openpyxl python-dotenv
```

## 📞 Need Help?

If you encounter issues:
1. Check the error messages
2. Verify your `.env` file configuration  
3. Try the CSV export as a simpler alternative
4. Check database connectivity manually