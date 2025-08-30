import {
  CallbackData,
  CallbackError,
  CallbackParams,
  CheckHealthData,
  CreatePlaylistData,
  CreatePlaylistError,
  LoginData,
  PlaylistRequest,
  SearchTracksData,
  SearchTracksError,
  SearchTracksParams,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:spotify
   * @name login
   * @summary Login
   * @request GET:/routes/api/spotify/login
   */
  login = (params: RequestParams = {}) =>
    this.request<LoginData, any>({
      path: `/routes/api/spotify/login`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:spotify
   * @name callback
   * @summary Callback
   * @request GET:/routes/api/spotify/callback
   */
  callback = (query: CallbackParams, params: RequestParams = {}) =>
    this.request<CallbackData, CallbackError>({
      path: `/routes/api/spotify/callback`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:spotify
   * @name create_playlist
   * @summary Create Playlist
   * @request POST:/routes/api/spotify/create-playlist
   */
  create_playlist = (data: PlaylistRequest, params: RequestParams = {}) =>
    this.request<CreatePlaylistData, CreatePlaylistError>({
      path: `/routes/api/spotify/create-playlist`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:search
   * @name search_tracks
   * @summary Search Tracks
   * @request GET:/routes/search
   */
  search_tracks = (query: SearchTracksParams, params: RequestParams = {}) =>
    this.request<SearchTracksData, SearchTracksError>({
      path: `/routes/search`,
      method: "GET",
      query: query,
      ...params,
    });
}
