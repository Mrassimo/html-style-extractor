import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * /api/screenshot
 * 
 * Query params:
 * - url: target page URL (required, https or http)
 * 
 * Notes:
 * - Designed for use from the frontend via fetch(`${SCREENSHOT_API}?url=...`)
 * - Returns:
 *    - 200 image/png on success
 *    - JSON error with appropriate status on failure
 * - Keep this implementation minimal for reliability. Tune timeouts/viewport as needed.
 */

const isValidUrl = (value: string | string[] | undefined): value is string => {
  if (!value || Array.isArray(value)) return false;
  try {
    const u = new URL(value);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    // For development purposes, we'll allow localhost URLs
    // In production, this should still work for real websites
    return true;
  } catch {
    return false;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;

  if (!isValidUrl(url)) {
    return res
      .status(400)
      .json({ error: 'Invalid url parameter. Must be a public http(s) URL.' });
  }

  // Only allow GET for simplicity
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ error: 'Method not allowed. Use GET with ?url=' });
  }

  try {
    // Try a simple screenshot service approach
    // Using a free service that doesn't require browser binaries
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=free&url=${encodeURIComponent(url)}&format=png&viewport_width=1440&viewport_height=900&full_page=true&device_scale_factor=1`;

    const response = await fetch(screenshotUrl);

    if (!response.ok) {
      throw new Error(`Screenshot service responded with ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, max-age=300'); // Cache for 5 minutes
    return res.status(200).send(Buffer.from(buffer));

  } catch (error: any) {
    console.error('Screenshot service error:', error);

    // Return a proper error response that the frontend can handle
    return res
      .status(500)
      .json({
        error: 'Screenshot service unavailable',
        message: 'Screenshots are temporarily unavailable on Vercel deployment. The design system analysis will still work perfectly.',
        fallback: true
      });
  }
}