export const config = {
  runtime: 'edge',
};

const ACCESS_KEY = process.env.SCREENSHOTONE_ACCESS_KEY;

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url || !isValidUrl(url)) {
    return jsonError(400, 'Invalid url parameter. Must be a public http(s) URL.');
  }

  if (req.method !== 'GET') {
    return jsonError(405, 'Method not allowed. Use GET with ?url=');
  }

  if (!ACCESS_KEY) {
    console.error('SCREENSHOTONE_ACCESS_KEY is not set');
    return jsonError(
      500,
      'Screenshot service not configured on server. Missing SCREENSHOTONE_ACCESS_KEY.'
    );
  }

  try {
    // Build ScreenshotOne URL using the access key and incoming URL.
    // Feel free to adjust params, but keep it deterministic.
    const screenshotUrl =
      'https://api.screenshotone.com/take?' +
      `access_key=${encodeURIComponent(ACCESS_KEY)}` +
      `&url=${encodeURIComponent(url)}` +
      '&format=png' +
      '&viewport_width=1440' +
      '&viewport_height=900' +
      '&full_page=true' +
      '&device_scale_factor=1' +
      '&block_ads=true' +
      '&block_cookie_banners=true' +
      '&block_trackers=true' +
      '&response_type=by_format';

    const upstream = await fetch(screenshotUrl);

    const contentType = upstream.headers.get('content-type') || '';

    if (!upstream.ok || !contentType.startsWith('image/')) {
      const body = await upstream.text().catch(() => '');
      console.error(
        'ScreenshotOne API error:',
        upstream.status,
        upstream.statusText,
        body.slice(0, 300)
      );
      return jsonError(502, 'Screenshot provider error');
    }

    const buffer = await upstream.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'image/png',
        'Cache-Control': 'no-store, max-age=300',
      },
    });
  } catch (error) {
    console.error('Edge screenshot handler error:', error);
    return jsonError(500, 'Screenshot service unavailable');
  }
}

function isValidUrl(value: string | null): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}