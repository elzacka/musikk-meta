#!/usr/bin/env python3
"""
Simple CSV export - no additional dependencies required.
Export music data from PostgreSQL database to CSV file.
"""

import asyncio
import asyncpg
import csv
import os
from datetime import datetime
import databutton as db
from app.env import mode, Mode

async def export_music_data_csv():
    """Export all music data from the database to CSV format."""
    
    print("🎵 Starting CSV export...")
    
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
        
        # Create output filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = f"music_data_export_{timestamp}.csv"
        
        # Export to CSV
        print(f"💾 Saving to {output_file}...")
        
        # Get column names from the first row
        if results:
            column_names = list(results[0].keys())
            
            with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=column_names)
                
                # Write header
                writer.writeheader()
                
                # Write data rows
                for row in results:
                    writer.writerow(dict(row))
        
        print(f"🎉 CSV export completed successfully!")
        print(f"📁 File saved: {os.path.abspath(output_file)}")
        print(f"📊 Exported {len(results)} tracks with {len(column_names)} columns")
        
        return output_file
        
    except Exception as e:
        print(f"❌ Export failed: {str(e)}")
        return None
        
    finally:
        if conn:
            await conn.close()
            print("🔌 Database connection closed")

def main():
    """Main function to run the CSV export."""
    print("🎵 MusikkMeta CSV Export Tool")
    print("=" * 50)
    
    # Run the export
    result = asyncio.run(export_music_data_csv())
    
    if result:
        print("\n✅ CSV export completed successfully!")
        print(f"📁 Your music data is now available in: {result}")
        print("\n📋 Next steps:")
        print("1. Open the CSV file to review the data")
        print("2. Upload to Google Sheets for cleaning")
        print("3. Set up Google Sheets API integration")
    else:
        print("\n❌ Export failed. Please check the error messages above.")

if __name__ == "__main__":
    main()