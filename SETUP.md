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
   VITE_SCREENSHOT_API=/api/screenshot-edge
   ```

## Vercel Deployment

### Edge Function Benefits

✅ **No API keys required** - Uses free screenshot services
✅ **Faster performance** - Edge Functions run closer to users
✅ **Better reliability** - No cold start issues
✅ **Simpler setup** - Just deploy and it works

### Testing

1. **Local development:**
   ```bash
   npm run dev
   # Test with any URL like https://example.com
   ```

2. **Vercel deployment:**
   - Push changes to trigger redeploy
   - Edge Functions are automatically configured
   - Test the deployed app

### How It Works

The app now uses **Vercel Edge Functions** with multiple free screenshot services:

1. **Primary**: HTMLCSSToImage demo service
2. **Fallback**: ScreenshotOne (no API key required for basic usage)
3. **Final fallback**: Mock screenshots with clear messaging

### Troubleshooting

**Screenshots not working:**
1. Check Vercel Edge Function logs
2. Verify URL is accessible (not blocked by CORS)
3. Try different target websites
4. Edge Functions work better with HTTPS URLs

**Common issues:**
- **CORS blocking**: Some sites block external requests
- **Large pages**: Very complex pages may timeout
- **Bot protection**: Some sites block automated requests
- **Network issues**: Try again if service is temporarily down

**Note**: The design system analysis works perfectly even if screenshots fail, so you always get useful results.