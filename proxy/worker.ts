/**
 * Cloudflare Worker — CORS-proxy for Deezer API
 *
 * Videresender forespørsler fra MusikkMeta-frontenden til api.deezer.com
 * og legger til CORS-headere slik at det fungerer fra GitHub Pages.
 *
 * Deploy: npx wrangler deploy (fra proxy/-mappen)
 * Gratis tier: 100 000 req/dag
 */

interface Env {
  ALLOWED_ORIGIN: string;
}

const DEEZER_API = 'https://api.deezer.com';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
      env.ALLOWED_ORIGIN,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ].filter(Boolean);

    const isAllowed = allowedOrigins.some((o) => origin.startsWith(o));

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, isAllowed),
      });
    }

    // Kun GET-forespørsler tillates
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Bygg Deezer-URL fra forespørselens path
    const url = new URL(request.url);
    const deezerUrl = `${DEEZER_API}${url.pathname}${url.search}`;

    try {
      const deezerResponse = await fetch(deezerUrl, {
        headers: {
          'User-Agent': 'MusikkMeta/3.0 (musikkmeta-proxy)',
          'Accept': 'application/json',
        },
      });

      const body = await deezerResponse.text();

      return new Response(body, {
        status: deezerResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
          ...corsHeaders(origin, isAllowed),
        },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Proxy error' }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin, isAllowed),
        },
      });
    }
  },
};

function corsHeaders(origin: string, isAllowed: boolean): Record<string, string> {
  if (!isAllowed) return {};

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}
