export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url || !isValidUrl(url)) {
    return new Response(
      JSON.stringify({ error: 'Invalid url parameter. Must be a public http(s) URL.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use GET with ?url=' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Use ScreenshotOne API for Edge Functions (no API key required for basic usage)
    const screenshotUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&format=png&viewport_width=1440&viewport_height=900&full_page=true&device_scale_factor=1`;

    console.log(`📸 Edge Function: Taking screenshot of ${url}`);
    const response = await fetch(screenshotUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Screenshot service error ${response.status}: ${errorText}`);
      throw new Error(`Screenshot service responded with ${response.status}: ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    console.log(`✅ Screenshot captured successfully, size: ${buffer.byteLength} bytes`);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=300'
      }
    });

  } catch (error: any) {
    console.error('Edge Function screenshot error:', error);
    return new Response(
      JSON.stringify({
        error: 'Screenshot service temporarily unavailable',
        message: 'Screenshots are temporarily unavailable on Vercel Edge Functions. The design system analysis will still work perfectly.',
        fallback: true
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function isValidUrl(value: string | null): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
}