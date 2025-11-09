High-level implementation plan: robust screenshots, reliability, and Vercel hosting

You chose:
- Screenshot backend: custom Vercel serverless function using Playwright (good for control and reliability).
- Goals: 
  - Fix screenshot pain.
  - Improve reliability across many websites.
  - Make it easy to host on Vercel.
  - Keep scope tight and internal-focused.

This document is a concise blueprint of what to fix and build next.

1. Robust screenshot pipeline (Vercel + Playwright)

Core idea:
- Frontend calls a single endpoint (e.g. /api/screenshot?url=...) hosted on Vercel.
- The endpoint:
  - Spins up Playwright Chromium.
  - Loads the page with a fixed desktop viewport.
  - Waits for network idle or a short timeout.
  - Returns a PNG/JPEG buffer as an image response.
- The React app:
  - Uses this endpoint instead of Microlink + corsproxy.
  - Handles errors and shows explicit UI when screenshots fail.

Key pieces to add:

1.1. API route (Vercel serverless function)

For Vercel with the `app` or `functions` directory (using Vercel v3+ build):

- Create `api/screenshot.ts` (for Node runtime) with:
  - Input:
    - `url` (required, https only)
  - Logic:
    - Validate URL (hosted, http(s), no localhost, etc.).
    - Launch Playwright Chromium in serverless mode.
    - `page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })`
    - `page.screenshot({ fullPage: true, type: 'png' })`
    - Return `Content-Type: image/png` binary response.
  - Error handling:
    - Return structured JSON error when navigation fails and 4xx/5xx.

Note: On Vercel, using Playwright requires:
- Using the proper runtime (e.g. `@playwright/test` or `playwright-core` + `chrome-aws-lambda` style if needed).
- For a first iteration, target Node runtime with Playwright and test; if cold starts/size are issues, fall back to a lightweight headless Chromium bundle.

1.2. Frontend integration

In `services/extractorService.ts`:
- Replace existing Microlink + corsproxy screenshot flow with:

  - New config:
    - `SCREENSHOT_API = import.meta.env.VITE_SCREENSHOT_API || '/api/screenshot';`
  - For each URL:
    - Call `${SCREENSHOT_API}?url=${encodeURIComponent(url)}`.
    - If 200 and image, create object URL: 
      - `URL.createObjectURL(await blob())`
    - Push `{ url: objectUrl, label: ... }` into screenshots.
    - If non-200 or JSON error:
      - Log and skip; do not fail the entire extraction.

UI behavior:
- If no screenshots are returned:
  - Show a clear message in `ResultsDisplay`:
    - “No screenshots could be captured by the screenshot service. Style extraction may still be correct. Check that the target URL is publicly accessible.”
- When some screenshots fail:
  - Optionally list which URLs failed in the markdown or in a small info block.

This gives you:
- Deterministic, self-owned screenshot path.
- Better observability and easier debugging.

2. Improve extraction reliability across many websites

2.1. Harden `extractAllStyles`

In `extractAllStyles`:
- Add per-request timeouts:
  - For main HTML fetch.
  - For stylesheet fetches.
- Do not let a single bad stylesheet break the flow:
  - Already increments `inaccessibleSheets`; extend this with:
    - Optional list of failed stylesheet URLs in the markdown for debugging.
- Ensure robust URL resolution:
  - Use `new URL(href, analysisUrl)` (already used; good).

2.2. Config-driven proxy (for CORS/HTML)

Currently:
- Uses `corsproxy.io` directly.

Adjust to:
- `const CORS_PROXY = import.meta.env.VITE_CORS_PROXY_URL || 'https://corsproxy.io/?';`
- For Vercel and reliability:
  - Optionally point `VITE_CORS_PROXY_URL` to your own `/api/proxy` that:
    - Fetches HTML/CSS from the server-side (bypassing browser CORS issues).
    - Enforces allowlist/size limits.
- Even if you do not implement `/api/proxy` immediately:
  - The env-driven config lets you switch without code changes.

3. Minimal automated checks (smoke tests)

Keep this very small:

3.1. Add a single script:
- In `package.json`:
  - `"test:smoke": "node scripts/smoke-check.js"`

3.2. `scripts/smoke-check.js` (to create later):
- Performs:
  - Basic import of `App.tsx` to ensure no runtime import-time errors (like missing env).
  - Optional:
    - Fetch a known simple URL (e.g. https://example.com) using the same logic as `extractAllStyles` but mocked to avoid real network in CI.

This is not a full test setup; just a guardrail for obvious breakage.

4. Prepare for Vercel deployment

4.1. Environment variables

Standardize:
- `GEMINI_API_KEY`:
  - Used in `geminiService.ts` via `import.meta.env.VITE_GEMINI_API_KEY` (frontend) or server-side env if you later move Gemini calls server-side.
- `VITE_CORS_PROXY_URL`:
  - Optional; default to public proxy.
- `VITE_SCREENSHOT_API`:
  - Optional; default to `/api/screenshot`.

Vercel setup:
- In Vercel dashboard:
  - Add `GEMINI_API_KEY`.
  - If needed, add `VITE_CORS_PROXY_URL`.
  - (No need for Microlink key with your Playwright function setup.)

4.2. Routing

This app is a SPA with Vite:
- Vercel config:
  - Root: build with `npm run build`.
  - Output: `dist`.
  - Use Vercel’s static file hosting for the built assets plus `/api/*` functions.

4.3. README additions

Add concise sections:
- “Deployment on Vercel”:
  - `npm run build`
  - Set env vars.
  - Note `/api/screenshot` dependency if used.
- “Screenshot service”:
  - Document that screenshots depend on Vercel serverless + Playwright or configured endpoint.

Summary of what to implement next (ordered)

1) Introduce configuration layer:
   - `VITE_CORS_PROXY_URL`, `VITE_SCREENSHOT_API`, `VITE_GEMINI_API_KEY` usage.
2) Implement `/api/screenshot` Playwright-based function for Vercel.
3) Update `getScreenshots` in `extractorService` to use the new screenshot endpoint, with strong error handling and clear UI states.
4) Slightly harden `extractAllStyles` with timeouts and improved logging/marking of failed resources.
5) Add a tiny smoke test script and `test:smoke` npm script.
6) Update README with Vercel deploy steps, env expectations, and screenshot service description.

This plan directly addresses:
- Your screenshot pain (own, reliable service).
- Reliability across sites (timeouts, controlled proxy behavior).
- Vercel readiness (env + api).
- While keeping scope small and focused for internal use.