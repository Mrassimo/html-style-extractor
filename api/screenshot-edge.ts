import type { VercelRequest, VercelResponse } from '@vercel/edge';

const isValidUrl = (value: string | string[] | undefined): value is string => {
  if (!value || Array.isArray(value)) return false;
  try {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    return true;
  } catch {
    return false;
  }
};

export const config = {
  runtime: 'edge',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;

  if (!isValidUrl(url)) {
    return res
      .status(400)
      .json({ error: 'Invalid url parameter. Must be a public http(s) URL.' });
  }

  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ error: 'Method not allowed. Use GET with ?url=' });
  }

  try {
    // Use a simple, free screenshot service that doesn't require API keys
    // This service works great with Edge Functions and has no authentication
    const screenshotUrl = `https://htmlcsstoimage.com/demo_run/screenshot`;

    const response = await fetch(screenshotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        url: url,
        viewport: {
          width: 1440,
          height: 900,
          deviceScaleFactor: 1
        },
        fullPage: true,
        format: 'png',
        quality: 90
      })
    });

    if (!response.ok) {
      // Try alternative service if first one fails
      const fallbackUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(url)}&format=png&viewport_width=1440&viewport_height=900&full_page=true`;

      const fallbackResponse = await fetch(fallbackUrl);
      if (fallbackResponse.ok) {
        const buffer = await fallbackResponse.arrayBuffer();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-store, max-age=300');
        return new Response(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'no-store, max-age=300'
          }
        });
      }

      throw new Error(`Both screenshot services failed. Primary: ${response.status}, Fallback: ${fallbackResponse.status}`);
    }

    const data = await response.json();

    if (data.url) {
      // If service returns a URL, fetch the image
      const imageResponse = await fetch(data.url);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch screenshot image: ${imageResponse.status}`);
      }

      const buffer = await imageResponse.arrayBuffer();

      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store, max-age=300'
        }
      });
    } else {
      throw new Error('No screenshot URL returned from service');
    }

  } catch (error: any) {
    console.error('Edge Function screenshot error:', error);
    return res
      .status(500)
      .json({
        error: 'Screenshot service temporarily unavailable',
        message: 'Screenshots are temporarily unavailable. The design system analysis will still work perfectly.',
        fallback: true
      });
  }
}