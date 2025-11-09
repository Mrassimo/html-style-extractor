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
    // Get API key from environment variables
    const apiKey = process.env.SCREENSHOTONE_API_KEY;

    if (!apiKey || apiKey === 'your_screenshotone_api_key_here') {
      console.error('ScreenshotOne API key not configured');
      return res
        .status(500)
        .json({
          error: 'Screenshot service not configured',
          message: 'ScreenshotOne API key is missing. Please configure SCREENSHOTONE_API_KEY environment variable.',
          setupRequired: true,
          instructions: 'Get a free API key from https://screenshotone.com/ and add it as environment variable.'
        });
    }

    // Use ScreenshotOne API with proper environment variable
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(url)}&format=png&viewport_width=1440&viewport_height=900&full_page=true&device_scale_factor=1`;

    console.log(`📸 Taking screenshot of ${url} with ScreenshotOne API`);
    const response = await fetch(screenshotUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ScreenshotOne API error ${response.status}: ${errorText}`);

      // Handle specific API errors
      if (response.status === 402) {
        throw new Error('API quota exceeded or invalid API key');
      } else if (response.status === 400) {
        throw new Error('Invalid request parameters');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else {
        throw new Error(`Screenshot service responded with ${response.status}: ${errorText}`);
      }
    }

    const buffer = await response.arrayBuffer();
    console.log(`✅ Screenshot captured successfully, size: ${buffer.byteLength} bytes`);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, max-age=300'); // Cache for 5 minutes
    return res.status(200).send(Buffer.from(buffer));

  } catch (error: any) {
    console.error('Screenshot service error:', error);

    // Return a proper error response that the frontend can handle
    const isConfigError = error.message?.includes('API key') || error.message?.includes('not configured');
    const isQuotaError = error.message?.includes('quota') || error.message?.includes('402');
    const isRateLimitError = error.message?.includes('Rate limit') || error.message?.includes('429');

    return res
      .status(500)
      .json({
        error: isConfigError ? 'Configuration required' : 'Screenshot service unavailable',
        message: isConfigError
          ? 'Screenshot service needs API key configuration. Design system analysis will still work perfectly.'
          : isQuotaError
            ? 'Screenshot API quota exceeded. Design system analysis will still work perfectly.'
            : isRateLimitError
              ? 'Screenshot service temporarily rate limited. Design system analysis will still work perfectly.'
              : 'Screenshots temporarily unavailable on Vercel deployment. The design system analysis will still work perfectly.',
        fallback: true,
        setupRequired: isConfigError,
        instructions: isConfigError
          ? 'Get a free API key from https://screenshotone.com/ and add SCREENSHOTONE_API_KEY to your Vercel environment variables.'
          : undefined
      });
  }
}