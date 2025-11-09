# HTML Style Extractor - Vercel Deployment Guide

## ✅ Pre-Deployment Status

Your app is **deployment-ready**! All critical issues have been resolved:

- ✅ Dependencies installed (`playwright-core`, `@google/genai`, `@vercel/node`)
- ✅ Build succeeds without errors
- ✅ Screenshot API tested and working
- ✅ Environment variables configured
- ✅ Vercel configuration file added

## 🚀 Quick Deploy Steps

### 1. Push to GitHub (if not already done)

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Ready for Vercel deployment - all dependencies fixed"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/html-style-extractor.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project" → Import from GitHub
3. Select your `html-style-extractor` repository
4. Vercel will auto-detect the framework (Vite)

### 3. Configure Build Settings

Vercel should automatically detect these settings from your `vercel.json`:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

### 4. Set Environment Variables

In your Vercel project dashboard → Settings → Environment Variables:

```
VITE_CORS_PROXY_URL=https://corsproxy.io/?
VITE_SCREENSHOT_API=/api/screenshot
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 5. Deploy!

Click "Deploy" and wait for the build to complete.

## 🧪 Post-Deployment Testing

Once deployed, test these URLs:

1. **Main App**: `https://your-app.vercel.app`
2. **Screenshot API**: `https://your-app.vercel.app/api/screenshot?url=https://example.com`

### Test Checklist

- [ ] App loads and renders correctly
- [ ] Enter a test URL (e.g., `https://example.com`)
- [ ] Style extraction works
- [ ] Screenshot generation works
- [ ] Report displays properly
- [ ] No console errors

## 🔧 Environment Variables Explained

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_CORS_PROXY_URL` | CORS proxy for cross-origin requests | Yes |
| `VITE_SCREENSHOT_API` | Screenshot API endpoint | Yes |
| `GEMINI_API_KEY` | AI integration for style replication | Optional |

## 📸 Screenshot Function Notes

Your screenshot API is fully functional:

- **Endpoint**: `/api/screenshot?url={encoded_url}`
- **Returns**: PNG image data
- **Features**: Full-page screenshots, 1440x900 viewport
- **Security**: Only allows HTTP/HTTPS URLs, validated input
- **Error Handling**: Proper HTTP status codes and error messages

## 🐛 Troubleshooting

### If Screenshots Fail

1. Check Vercel function logs
2. Verify `playwright-core` is in dependencies
3. Ensure Node.js runtime is compatible (set to 18.x in vercel.json)

### If Build Fails

1. Check that all dependencies are installed
2. Verify `vercel.json` syntax is correct
3. Check build logs in Vercel dashboard

### If Styles Don't Extract

1. Verify CORS proxy is working
2. Check target website is accessible
3. Review browser console for errors

## 📈 Next Steps (Optional)

1. **Add Custom Domain**: Configure in Vercel dashboard
2. **Set Up Analytics**: Add Vercel Analytics or Google Analytics
3. **Optimize Images**: Consider image optimization for screenshots
4. **Add Error Monitoring**: Set up Sentry or similar service

## 🎯 Production URLs to Test

After deployment, test with these diverse URLs:

- `https://example.com` (Simple HTML)
- `https://github.com` (Complex modern site)
- `https://stripe.com` (Heavy CSS animations)
- `https://tailwindcss.com` (Utility-first CSS)

## 📞 Support

If you encounter any issues:

1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test locally with `npm run dev` first
4. Review browser console for JavaScript errors

---

**Your app is ready for production! 🎉**