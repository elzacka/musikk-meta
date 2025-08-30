#!/usr/bin/env python3
"""
Simple CSV export - provide database URL via environment variable or command line.

Usage:
  export DATABASE_URL="postgresql://username:password@host:port/database"
  python3 export_simple.py

Or:
  python3 export_simple.py "postgresql://username:password@host:port/database"
"""

import asyncio
import asyncpg
import csv
import os
import sys
from datetime import datetime

async def export_music_data_csv(db_url):
    """Export all music data from the database to CSV format."""
    
    print("🎵 Starting CSV export...")
    print(f"🔗 Connecting to database...")
    
    conn = None
    try:
        # Connect to database
        conn = await asyncpg.connect(db_url)
        print("✅ Connected successfully!")
        
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
            print("📋 Checking available tables...")
            tables = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
            if tables:
                print("Available tables:")
                for table in tables:
                    print(f"   - {table['table_name']}")
            else:
                print("No tables found in public schema")
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
        
        # Show a sample of the data
        print(f"\n📋 Sample data (first 3 tracks):")
        for i, row in enumerate(results[:3]):
            artist = row.get('artist_names', 'Unknown Artist')
            track = row.get('track_name', 'Unknown Track')
            popularity = row.get('popularity', 'N/A')
            print(f"   {i+1}. {artist} - {track} (Popularity: {popularity})")
        
        return output_file
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Export failed: {error_msg}")
        
        # Provide helpful error messages
        if "password authentication failed" in error_msg.lower():
            print("💡 Database credentials are incorrect")
        elif "connection refused" in error_msg.lower():
            print("💡 Cannot connect to database server")
        elif "does not exist" in error_msg.lower():
            print("💡 Database or table does not exist")
        elif "timeout" in error_msg.lower():
            print("💡 Database connection timeout")
        
        print("\n🔧 Troubleshooting:")
        print("- Check your database URL format: postgresql://username:password@host:port/database")
        print("- Verify the database is running and accessible")
        print("- Check if the 'tracks_new' table exists")
        
        return None
        
    finally:
        if conn:
            await conn.close()
            print("🔌 Database connection closed")

def main():
    """Main function to run the CSV export."""
    print("🎵 MusikkMeta Simple CSV Export")
    print("=" * 50)
    
    # Try to get database URL from multiple sources
    db_url = None
    
    # 1. Command line argument
    if len(sys.argv) > 1:
        db_url = sys.argv[1].strip()
        print("📡 Using database URL from command line")
    
    # 2. Environment variables
    if not db_url:
        db_url = (os.getenv('DATABASE_URL') or 
                 os.getenv('DATABASE_URL_DEV') or 
                 os.getenv('DATABASE_URL_ADMIN_DEV') or
                 os.getenv('POSTGRES_URL') or
                 os.getenv('POSTGRESQL_URL'))
        if db_url:
            print("📡 Using database URL from environment variable")
    
    # 3. Check for a simple config file
    if not db_url:
        config_file = 'database_url.txt'
        if os.path.exists(config_file):
            with open(config_file, 'r') as f:
                db_url = f.read().strip()
                print(f"📡 Using database URL from {config_file}")
    
    if not db_url:
        print("❌ No database URL found!")
        print("\n📋 How to provide database URL:")
        print("1. Command line: python3 export_simple.py 'postgresql://user:pass@host:port/db'")
        print("2. Environment: export DATABASE_URL='postgresql://user:pass@host:port/db'")
        print("3. Config file: echo 'postgresql://user:pass@host:port/db' > database_url.txt")
        print("\n🔑 Get your database URL from:")
        print("- Neon Dashboard: https://console.neon.tech/")
        print("- Databutton Secrets section")
        return
    
    # Basic validation
    if not db_url.startswith(('postgresql://', 'postgres://')):
        print(f"⚠️  Warning: URL doesn't look like a PostgreSQL URL")
        print(f"URL starts with: {db_url[:20]}...")
    
    # Run the export
    print(f"🚀 Starting export...")
    result = asyncio.run(export_music_data_csv(db_url))
    
    if result:
        print("\n✅ Export completed successfully!")
        print(f"📁 Your music data: {result}")
        print("\n📋 Next steps:")
        print("1. Open the CSV file to review the data")
        print("2. Upload to Google Sheets")
        print("3. Clean and organize the data")
        print("4. Set up Google Sheets API integration")
    else:
        print("\n❌ Export failed. See error messages above.")

if __name__ == "__main__":
    main()