import {
  CallbackData,
  CheckHealthData,
  CreatePlaylistData,
  LoginData,
  PlaylistRequest,
  SearchTracksData,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * No description
   * @tags dbtn/module:spotify
   * @name login
   * @summary Login
   * @request GET:/routes/api/spotify/login
   */
  export namespace login {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = LoginData;
  }

  /**
   * No description
   * @tags dbtn/module:spotify
   * @name callback
   * @summary Callback
   * @request GET:/routes/api/spotify/callback
   */
  export namespace callback {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Code */
      code: string;
      /** State */
      state: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CallbackData;
  }

  /**
   * No description
   * @tags dbtn/module:spotify
   * @name create_playlist
   * @summary Create Playlist
   * @request POST:/routes/api/spotify/create-playlist
   */
  export namespace create_playlist {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PlaylistRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreatePlaylistData;
  }

  /**
   * No description
   * @tags dbtn/module:search
   * @name search_tracks
   * @summary Search Tracks
   * @request GET:/routes/search
   */
  export namespace search_tracks {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Query */
      query: string;
      /**
       * Page
       * @default 1
       */
      page?: number;
      /**
       * Page Size
       * @default 20
       */
      page_size?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = SearchTracksData;
  }
}
