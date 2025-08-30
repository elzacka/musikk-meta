#!/usr/bin/env python3
"""
Standalone CSV export - works without Databutton dependencies.
You'll need to provide the database URL manually.
"""

import asyncio
import asyncpg
import csv
import os
from datetime import datetime
import getpass

async def export_music_data_csv(db_url):
    """Export all music data from the database to CSV format."""
    
    print("🎵 Starting CSV export...")
    
    if not db_url:
        print("❌ Error: Database URL not provided")
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
            print("📋 Available tables:")
            tables = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
            for table in tables:
                print(f"   - {table['table_name']}")
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
            print(f"   {i+1}. {row.get('artist_names', 'Unknown')} - {row.get('track_name', 'Unknown')}")
        
        return output_file
        
    except Exception as e:
        print(f"❌ Export failed: {str(e)}")
        
        # Try to provide helpful error messages
        if "password authentication failed" in str(e):
            print("💡 The database URL might be incorrect or the credentials have expired.")
        elif "connection refused" in str(e):
            print("💡 The database server might be down or the connection details are incorrect.")
        elif "does not exist" in str(e):
            print("💡 The database or table might not exist. Check the database name in your URL.")
        
        return None
        
    finally:
        if conn:
            await conn.close()
            print("🔌 Database connection closed")

def get_database_url():
    """Get database URL from user input."""
    print("🔑 Database URL needed")
    print("You can find this in your Neon database dashboard or Databutton secrets.")
    print("Format: postgresql://username:password@host:port/database")
    print()
    
    # Try to get from environment first
    db_url = os.getenv('DATABASE_URL') or os.getenv('DATABASE_URL_DEV')
    if db_url:
        print(f"📡 Found DATABASE_URL in environment")
        return db_url
    
    # Ask user to input manually
    print("Please enter your PostgreSQL database URL:")
    db_url = getpass.getpass("Database URL (hidden): ").strip()
    
    if not db_url:
        print("❌ No database URL provided")
        return None
        
    # Basic validation
    if not db_url.startswith(('postgresql://', 'postgres://')):
        print("⚠️  Warning: URL doesn't start with postgresql:// or postgres://")
        confirm = input("Continue anyway? (y/N): ").strip().lower()
        if confirm != 'y':
            return None
    
    return db_url

def main():
    """Main function to run the CSV export."""
    print("🎵 MusikkMeta Standalone CSV Export")
    print("=" * 50)
    
    # Get database URL
    db_url = get_database_url()
    if not db_url:
        print("❌ Cannot proceed without database URL")
        return
    
    # Run the export
    result = asyncio.run(export_music_data_csv(db_url))
    
    if result:
        print("\n✅ CSV export completed successfully!")
        print(f"📁 Your music data is now available in: {result}")
        print("\n📋 Next steps:")
        print("1. Open the CSV file to review the data")
        print("2. Upload to Google Sheets for cleaning")
        print("3. Set up Google Sheets API integration")
        print(f"\n💡 File location: {os.path.abspath(result)}")
    else:
        print("\n❌ Export failed. Please check the error messages above.")
        print("\n🔧 Troubleshooting tips:")
        print("- Verify your database URL is correct")
        print("- Check that the database is accessible from your network")
        print("- Ensure the 'tracks_new' table exists in your database")

if __name__ == "__main__":
    main()