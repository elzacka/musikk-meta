#!/usr/bin/env python3
"""
Export music data from PostgreSQL database to Excel file.
This script connects to your Neon database and exports all tracks to an Excel file.
"""

import asyncio
import asyncpg
import pandas as pd
import os
from datetime import datetime
import databutton as db
from app.env import mode, Mode

async def export_music_data():
    """Export all music data from the database to Excel format."""
    
    print("🎵 Starting music data export...")
    
    # Get database connection
    if mode == Mode.PROD:
        db_url = db.secrets.get("DATABASE_URL_ADMIN_PROD")
    else:
        db_url = db.secrets.get("DATABASE_URL_ADMIN_DEV")
    
    if not db_url:
        print("❌ Error: Database URL not found in secrets")
        return
    
    conn = None
    try:
        # Connect to database
        print("🔗 Connecting to database...")
        conn = await asyncpg.connect(db_url)
        
        # Query all data from tracks_new table
        print("📊 Fetching music data...")
        query = """
            SELECT
                id,
                track_uri,
                track_name,
                album_name,
                artist_names,
                release_date,
                duration_ms,
                popularity,
                explicit,
                genres,
                record_label,
                danceability,
                energy,
                key_mode,
                loudness,
                mode,
                speechiness,
                acousticness,
                instrumentalness,
                liveness,
                valence,
                tempo
            FROM tracks_new
            ORDER BY popularity DESC NULLS LAST, track_name ASC;
        """
        
        results = await conn.fetch(query)
        
        if not results:
            print("❌ No data found in tracks_new table")
            return
        
        print(f"✅ Found {len(results)} tracks")
        
        # Convert to pandas DataFrame
        print("📝 Converting to Excel format...")
        df = pd.DataFrame([dict(row) for row in results])
        
        # Clean up data types and format
        numeric_cols = [
            'duration_ms', 'popularity', 'danceability', 'energy', 
            'key_mode', 'loudness', 'mode', 'speechiness', 'acousticness',
            'instrumentalness', 'liveness', 'valence', 'tempo'
        ]
        
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Format boolean column
        if 'explicit' in df.columns:
            df['explicit'] = df['explicit'].astype('boolean')
        
        # Create output filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"music_data_export_{timestamp}.xlsx"
        
        # Export to Excel with multiple sheets
        print(f"💾 Saving to {output_file}...")
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # Main data sheet
            df.to_excel(writer, sheet_name='Music_Data', index=False)
            
            # Summary sheet
            summary_data = {
                'Metric': [
                    'Total Tracks',
                    'Unique Artists',
                    'Unique Albums',
                    'Date Exported',
                    'Average Popularity',
                    'Most Common Key',
                    'Most Common Genre'
                ],
                'Value': [
                    len(df),
                    df['artist_names'].nunique() if 'artist_names' in df.columns else 'N/A',
                    df['album_name'].nunique() if 'album_name' in df.columns else 'N/A',
                    datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    f"{df['popularity'].mean():.1f}" if 'popularity' in df.columns else 'N/A',
                    df['key_mode'].mode().iloc[0] if 'key_mode' in df.columns and not df['key_mode'].empty else 'N/A',
                    df['genres'].mode().iloc[0] if 'genres' in df.columns and not df['genres'].empty else 'N/A'
                ]
            }
            
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Data quality sheet - identify potential issues
            quality_issues = []
            
            # Check for missing data
            for col in df.columns:
                null_count = df[col].isnull().sum()
                if null_count > 0:
                    quality_issues.append({
                        'Issue': f'Missing {col}',
                        'Count': null_count,
                        'Percentage': f"{(null_count/len(df)*100):.1f}%"
                    })
            
            # Check for duplicates
            duplicates = df.duplicated(subset=['track_name', 'artist_names']).sum()
            if duplicates > 0:
                quality_issues.append({
                    'Issue': 'Potential duplicate tracks',
                    'Count': duplicates,
                    'Percentage': f"{(duplicates/len(df)*100):.1f}%"
                })
            
            # Check for unusual values
            if 'duration_ms' in df.columns:
                short_tracks = (df['duration_ms'] < 30000).sum()  # Less than 30 seconds
                long_tracks = (df['duration_ms'] > 600000).sum()   # More than 10 minutes
                if short_tracks > 0:
                    quality_issues.append({
                        'Issue': 'Very short tracks (<30s)',
                        'Count': short_tracks,
                        'Percentage': f"{(short_tracks/len(df)*100):.1f}%"
                    })
                if long_tracks > 0:
                    quality_issues.append({
                        'Issue': 'Very long tracks (>10min)',
                        'Count': long_tracks,
                        'Percentage': f"{(long_tracks/len(df)*100):.1f}%"
                    })
            
            if quality_issues:
                quality_df = pd.DataFrame(quality_issues)
                quality_df.to_excel(writer, sheet_name='Data_Quality', index=False)
        
        print(f"🎉 Export completed successfully!")
        print(f"📁 File saved: {os.path.abspath(output_file)}")
        print(f"📊 Exported {len(df)} tracks with {len(df.columns)} columns")
        
        if quality_issues:
            print(f"⚠️  Found {len(quality_issues)} data quality issues - check 'Data_Quality' sheet")
        
        return output_file
        
    except Exception as e:
        print(f"❌ Export failed: {str(e)}")
        return None
        
    finally:
        if conn:
            await conn.close()
            print("🔌 Database connection closed")

def main():
    """Main function to run the export."""
    print("🎵 MusikkMeta Data Export Tool")
    print("=" * 50)
    
    # Run the export
    result = asyncio.run(export_music_data())
    
    if result:
        print("\n✅ Export completed successfully!")
        print(f"📁 Your music data is now available in: {result}")
        print("\n📋 Next steps:")
        print("1. Open the Excel file to review the data")
        print("2. Upload to Google Sheets for cleaning")
        print("3. Set up Google Sheets API integration")
    else:
        print("\n❌ Export failed. Please check the error messages above.")

if __name__ == "__main__":
    main()