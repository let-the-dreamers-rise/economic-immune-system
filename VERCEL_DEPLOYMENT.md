# 🚀 Vercel Deployment Guide

## Quick Setup

Your project is now configured for Vercel deployment! The frontend will be deployed to Vercel while the backend remains on Google Cloud.

### What's Configured:

✅ **vercel.json**: Configures Vercel to build only the frontend and proxy API calls to Google Cloud backend
✅ **package.json**: Cleaned up to include only frontend dependencies  
✅ **.vercelignore**: Excludes backend files from Vercel deployment
✅ **vite.config.ts**: Updated to handle production vs development API routing

### Architecture:
- **Frontend**: Deployed on Vercel (static hosting)
- **Backend**: Running on Google Cloud App Engine
- **API Proxy**: Vercel rewrites `/api/*` requests to `https://agentic-finance-dashboard.uc.r.appspot.com/api/*`

## Deployment Steps:

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository: `let-the-dreamers-rise/economic-immune-system`

2. **Configure Project**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend

## Expected URLs:
- **Frontend**: `https://your-project-name.vercel.app`
- **Backend API**: `https://agentic-finance-dashboard.uc.r.appspot.com` (already deployed)

## How API Routing Works:

### Development (localhost:3000):
```
Frontend Request: /api/balance
↓ (Vite proxy)
Backend: https://agentic-finance-dashboard.uc.r.appspot.com/api/balance
```

### Production (Vercel):
```
Frontend Request: /api/balance  
↓ (Vercel rewrite)
Backend: https://agentic-finance-dashboard.uc.r.appspot.com/api/balance
```

## Troubleshooting:

### If build fails:
1. Check that only frontend dependencies are in package.json
2. Ensure no backend imports in frontend code
3. Verify vercel.json configuration

### If API calls fail:
1. Check that backend is running: https://agentic-finance-dashboard.uc.r.appspot.com/api/health
2. Verify CORS settings on backend allow your Vercel domain
3. Check browser network tab for actual request URLs

## Files Created/Modified:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to exclude from deployment  
- ✅ `package.json` - Frontend-only dependencies
- ✅ `vite.config.ts` - Environment-aware API routing

Your project is now ready for seamless Vercel deployment! 🎉