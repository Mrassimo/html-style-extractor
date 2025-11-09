import type { VercelRequest, VercelResponse } from '@vercel/node';
import playwright from 'playwright-core';

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

  let browser;
  try {
    // Basic Playwright usage. In Vercel, ensure you have playwright-core and a compatible chromium binary.
    // For internal use, this is sufficient; if cold starts / size are problematic,
    // adapt to use a smaller browser bundle.
    browser = await playwright.chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 15000,
    });

    const buffer = await page.screenshot({
      fullPage: true,
      type: 'png',
    });

    await context.close();
    await browser.close();
    browser = null;

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (error: any) {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore closing errors
      }
    }

    console.error('Screenshot error:', error);
    const message =
      error?.message ||
      'Failed to capture screenshot. The target site may be blocking bots or is unreachable.';
    const status =
      /timeout/i.test(message) || /Navigation timed out/i.test(message)
        ? 504
        : 500;

    return res
      .status(status)
      .json({ error: message });
  }
}