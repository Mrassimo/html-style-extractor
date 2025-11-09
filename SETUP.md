# Environment Variables Setup

## Local Development

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update the environment variables in `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_CORS_PROXY_URL=https://corsproxy.io/?
   VITE_SCREENSHOT_API=/api/screenshot
   SCREENSHOTONE_API_KEY=your_screenshotone_api_key_here
   ```

## Vercel Deployment

### Getting ScreenshotOne API Key

1. Go to [https://screenshotone.com/](https://screenshotone.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it as environment variable in Vercel:

**Via Vercel Dashboard:**
1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add:
   - Name: `SCREENSHOTONE_API_KEY`
   - Value: `your_actual_api_key_here`
   - Environments: Production, Preview, Development

**Via CLI:**
```bash
vercel env add SCREENSHOTONE_API_KEY
```

### Testing

After setting up the API key:

1. **Local development:**
   ```bash
   npm run dev
   # Test with a URL like https://example.com
   ```

2. **Vercel deployment:**
   - Push changes to trigger redeploy
   - Test the deployed app
   - Check Vercel function logs if issues occur

### Troubleshooting

**Screenshots not working:**
1. Verify the API key is correctly set in environment variables
2. Check Vercel function logs for detailed error messages
3. Ensure the API key has available quota
4. Test the API key directly: `https://api.screenshotone.com/take?access_key=YOUR_KEY&url=https://example.com`

**Common errors:**
- `402`: Check API key validity and quota
- `400`: Verify request parameters
- `429`: Rate limit exceeded, try again later
- `500`: Check Vercel function logs for details