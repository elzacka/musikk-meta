import databutton as db
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import uuid
import os
from urllib.parse import urlencode
from fastapi.exceptions import HTTPException

router = APIRouter(prefix="/api/spotify")

# --- Configuration ---
SPOTIFY_CLIENT_ID = db.secrets.get("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = db.secrets.get("SPOTIFY_CLIENT_SECRET")

def get_redirect_uri(request: Request):
    # This must match the URI in your Spotify Developer Dashboard exactly
    return f"https://api.databutton.com/_projects/9461eb0d-a47e-4c1b-a921-c05260ed1bc2/dbtn/devx/app/routes/api/spotify/callback"

SCOPE = "playlist-modify-public playlist-modify-private"

# A simple in-memory store for session states. Not production-ready.
# In a real app, use a database or a more robust session management system.
_sessions = {}

def get_session_id(request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id:
        session_id = str(uuid.uuid4())
    return session_id

def get_spotify_oauth(request: Request):
    session_id = get_session_id(request)
    cache_path = f"/tmp/{session_id}.json"
    return SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=get_redirect_uri(request),
        scope=SCOPE,
        cache_path=cache_path,
        state=_sessions.get(session_id) # Pass state to the constructor
    )

# --- Endpoints ---

@router.get("/login")
async def login(request: Request):
    session_id = get_session_id(request)
    state = str(uuid.uuid4())
    _sessions[session_id] = state # Store state associated with session
    
    sp_oauth = SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=get_redirect_uri(request),
        scope=SCOPE,
        state=state
    )
    
    auth_url = sp_oauth.get_authorize_url()
    response = RedirectResponse(auth_url)
    
    if not request.cookies.get("session_id"):
        response.set_cookie(key="session_id", value=session_id, httponly=True, max_age=3600, samesite='lax')
    
    return response

@router.get("/callback")
async def callback(request: Request, code: str, state: str):
    session_id = get_session_id(request)
    
    # Validate state to prevent CSRF attacks
    if state != _sessions.get(session_id):
        params = urlencode({"error": "State mismatch. Please try logging in again."})
        return RedirectResponse(url=f"/?spotify_auth=error&{params}")

    cache_path = f"/tmp/{session_id}.json"
    sp_oauth = SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri=get_redirect_uri(request),
        scope=SCOPE,
        cache_path=cache_path,
        state=state
    )
    
    try:
        sp_oauth.get_access_token(code, check_cache=False)
        # Token is now cached in the file
        frontend_url = "/?spotify_auth=success"
        response = RedirectResponse(url=frontend_url)
        return response
    except Exception as e:
        print(f"Error getting token: {e}")
        params = urlencode({"error": "Could not get access token."})
        return RedirectResponse(url=f"/?spotify_auth=error&{params}")


class PlaylistRequest(BaseModel):
    track_uris: list[str]
    playlist_name: str = "VibeCraft Playlist"

@router.post("/create-playlist", status_code=200, responses={401: {"description": "User not authenticated with Spotify"}})
async def create_playlist(request: PlaylistRequest, req: Request):
    session_id = get_session_id(req)
    cache_path = f"/tmp/{session_id}.json"
    print(f"[START] Playlist creation process started for session: {session_id}")
    
    try:
        print("[AUTH] Attempting to create SpotifyOAuth object.")
        sp_oauth = SpotifyOAuth(
            client_id=SPOTIFY_CLIENT_ID,
            client_secret=SPOTIFY_CLIENT_SECRET,
            redirect_uri=get_redirect_uri(req),
            scope=SCOPE,
            cache_path=cache_path
        )
        print("[AUTH] SpotifyOAuth object created. Getting cached token.")
        token_info = sp_oauth.get_cached_token()

        if not token_info:
            print(f"[AUTH_FAILURE] No token found for session: {session_id}")
            raise HTTPException(status_code=401, detail="Authentication token not found. Please log in with Spotify.")
        
        print("[AUTH] Token found. Checking if expired.")
        if sp_oauth.is_token_expired(token_info):
            print("[AUTH] Token is expired. Refreshing...")
            token_info = sp_oauth.refresh_access_token(token_info['refresh_token'])
            print("[AUTH] Token refreshed successfully.")

        sp = spotipy.Spotify(auth=token_info['access_token'])
        
        print("[API] Getting current user info.")
        user_info = sp.current_user()
        user_id = user_info['id']
        print(f"[API] User ID '{user_id}' found.")

        # 1. Create the empty playlist
        print(f"[API] Creating playlist '{request.playlist_name}' for user '{user_id}'.")
        playlist = sp.user_playlist_create(
            user=user_id,
            name=request.playlist_name,
            public=False,
            description="Created with MusikkMeta"
        )
        playlist_id = playlist['id']
        playlist_url = playlist['external_urls']['spotify']
        print(f"[API] Playlist created with ID: {playlist_id}, URL: {playlist_url}")

        # 2. Add tracks to the new playlist
        if request.track_uris:
            print(f"[API] Adding {len(request.track_uris)} tracks to playlist {playlist_id}.")
            # Spotify API can handle up to 100 tracks per request
            for i in range(0, len(request.track_uris), 100):
                chunk = request.track_uris[i:i + 100]
                sp.playlist_add_items(playlist_id, chunk)
            print("[API] Tracks added successfully.")
        
        print(f"[SUCCESS] Process complete. Playlist '{request.playlist_name}' created at {playlist_url}")
        return {"message": "Playlist created successfully!", "playlist_url": playlist_url}

    except spotipy.exceptions.SpotifyException as e:
        print(f"[SPOTIFY_API_ERROR] Details: {e}")
        return {"error": f"A Spotify API error occurred: {e.msg}"}, 500
    except Exception as e:
        print(f"[UNEXPECTED_ERROR] An unexpected error occurred: {e}")
        return {"error": f"An unexpected error occurred: {str(e)}"}, 500




