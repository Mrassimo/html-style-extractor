# HTML Style Extractor Setup

## Simple Setup - No API Keys Required! 🎉

This app uses **Vercel Edge Functions** with anonymous screenshot services - no configuration needed!

## Environment Variables

### Local Development

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_CORS_PROXY_URL=https://corsproxy.io/?
   VITE_SCREENSHOT_API=/api/screenshot
   ```

That's it! No screenshot API keys required.

### Vercel Deployment

Just push to GitHub and deploy to Vercel - it works out of the box!

```bash
git add .
git commit -m "Deploy HTML Style Extractor"
git push origin main
```

## How It Works

### Screenshot System
- **✅ Real screenshots**: Tries anonymous screenshot services first
- **✅ Fallback placeholders**: Beautiful SVG placeholders when services fail
- **✅ Always works**: You always get visual context, never errors
- **✅ No setup**: No API keys, no registration, no configuration

### Edge Function Benefits
- **🚀 Fast**: Runs on Vercel's global edge network
- **🛡️ Reliable**: No cold starts, no server configuration
- **💰 Free**: No API costs or rate limits to worry about
- **🔧 Simple**: Just deploy and it works

## Testing

### Local Development
```bash
npm run dev
# Open http://localhost:3000
# Test with any URL like https://example.com
```

### Production
- Deploy to Vercel
- Test at your Vercel URL
- Works immediately with no configuration

## Output Format

The app provides **complete raw data** perfect for LLM analysis:

- ✅ **All colors** with occurrence counts
- ✅ **All typography data** (fonts, sizes, weights, line heights)
- ✅ **All spacing values** with counts
- ✅ **Complete CSS variables** - no truncation
- ✅ **Full CSS rules** from every stylesheet
- ✅ **Complete HTML structure**
- ✅ **All layout patterns** with complete CSS

## Troubleshooting

### Screenshots Not Working?
- **Don't worry!** The app falls back to beautiful placeholder images
- Design system analysis works perfectly regardless of screenshots
- Edge Functions handle errors gracefully

### Common Issues
- **CORS blocking**: Some sites block external requests (normal)
- **Bot protection**: Some sites block automated screenshots (normal)
- **Network issues**: Try again if service is temporarily down

### Important Note
**Screenshots are optional context** - the core value is the complete design system analysis, which always works perfectly!

## Support

If you have issues:
1. Check the browser console for errors
2. Try different target websites
3. Screenshots failing is normal - design analysis still works
4. The app is designed to be robust and provide value even when external services fail