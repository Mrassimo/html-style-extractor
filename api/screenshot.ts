export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  // Basic validation
  if (!url || !isValidUrl(url)) {
    return svgResponse(
      'Invalid URL',
      'Provide a public http(s) URL in the "url" query string.',
      400
    );
  }

  if (req.method !== 'GET') {
    return svgResponse(
      'Method not allowed',
      'Use GET /api/screenshot?url=...',
      405
    );
  }

  try {
    // TRY 1: Anonymous screenshot service (best effort, no key)
    // Some services allow limited unauthenticated usage.
    // If it stops working, we just fall back to SVG.
    const tryUrls = [
      // ScreenshotOne without key (may or may not work; harmless if it fails)
      `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&format=png&viewport_width=1440&viewport_height=900&full_page=true&device_scale_factor=1`,
      // Add more unauthenticated services here if desired.
    ];

    for (const target of tryUrls) {
      const res = await fetch(target);

      // If we got a proper image, stream it back.
      const ct = res.headers.get('content-type') || '';
      if (res.ok && ct.startsWith('image/')) {
        const buf = await res.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            'Content-Type': ct,
            'Cache-Control': 'no-store, max-age=300',
          },
        });
      }

      // Otherwise, try next; do not throw yet.
    }

    // If no anonymous provider gave us an image, use a placeholder.
    return svgResponse(
      'Screenshot unavailable',
      'Using a placeholder image. Design system analysis still works perfectly.',
      200
    );
  } catch (error) {
    console.error('Edge screenshot error:', error);
    // On any error, still give a placeholder image.
    return svgResponse(
      'Screenshot error',
      'Using a placeholder image. Design system analysis still works perfectly.',
      200
    );
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

function svgResponse(title: string, message: string, status: number) {
  const safeTitle = escapeSvg(title);
  const safeMessage = escapeSvg(message);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#1f2937"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="40" y="40" width="1120" height="550" rx="24"
        fill="#020817" stroke="#374151" stroke-width="2"/>
  <text x="600" y="260" text-anchor="middle"
        fill="#e5e7eb"
        font-family="system-ui, -apple-system, BlinkMacSystemFont, -apple-system"
        font-size="32" font-weight="600">
    ${safeTitle}
  </text>
  <text x="600" y="320" text-anchor="middle"
        fill="#9ca3af"
        font-family="system-ui, -apple-system, BlinkMacSystemFont"
        font-size="18">
    ${safeMessage}
  </text>
  <text x="600" y="380" text-anchor="middle"
        fill="#6b7280"
        font-family="system-ui, -apple-system, BlinkMacSystemFont"
        font-size="14">
    HTML Style Extractor • Screenshots are optional context
  </text>
</svg>`.trim();

  return new Response(svg, {
    status,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store, max-age=300',
    },
  });
}

function escapeSvg(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}