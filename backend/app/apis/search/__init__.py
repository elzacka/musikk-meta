from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import databutton as db
import asyncpg
import math

router = APIRouter()

class Track(BaseModel):
    id: int
    track_uri: str | None
    track_name: str | None
    album_name: str | None
    artist_names: str | None
    release_date: str | None
    duration_ms: int | None
    popularity: int | None
    explicit: bool | None
    genres: str | None
    record_label: str | None
    danceability: float | None
    energy: float | None
    key_mode: int | None
    loudness: float | None
    mode: int | None
    speechiness: float | None
    acousticness: float | None
    instrumentalness: float | None
    liveness: float | None
    valence: float | None
    tempo: float | None

class SearchResponse(BaseModel):
    tracks: list[Track]
    pages: int
    total: int

@router.get("/search", response_model=SearchResponse)
async def search_tracks(query: str, page: int = 1, page_size: int = 20):
    database_url = db.secrets.get("DATABASE_URL_DEV")
    if not database_url:
        raise HTTPException(status_code=500, detail="Database URL not configured")

    conn = None
    try:
        conn = await asyncpg.connect(database_url)
        
        # First, get the total count of matching records from the new table
        count_sql = "SELECT COUNT(*) FROM tracks_new WHERE track_name ILIKE $1 OR artist_names ILIKE $1"
        total_records_result = await conn.fetchrow(count_sql, f"%{query}%")
        total_records = total_records_result[0] if total_records_result else 0
        total_pages = math.ceil(total_records / page_size)

        # Then, get the paginated results from the new table
        offset = (page - 1) * page_size
        sql_query = """
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
            WHERE track_name ILIKE $1 OR artist_names ILIKE $1
            ORDER BY popularity DESC, track_name ASC
            LIMIT $2 OFFSET $3;
        """
        results = await conn.fetch(sql_query, f"%{query}%", page_size, offset)
        
        # Directly create Track objects from the results
        processed_results = [Track(**dict(r)) for r in results]
            
        return SearchResponse(tracks=processed_results, pages=total_pages, total=total_records)
    except Exception as e:
        print(f"Database query failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            await conn.close()
