# Deployment Fix Guide

## Problem Identified

Your frontend code is **correctly configured** to use environment variables. The issue is:

1. ✅ **Code is correct**: Your frontend properly uses `import.meta.env.VITE_API_BASE_URL`
2. ❌ **Environment variable missing on Vercel**: The `.env` file is not committed to Git (correct), so Vercel doesn't have the variable
3. ❌ **Typo in example file**: Had `backkend` instead of `backend` (now fixed)

## Root Cause

When you deploy to Vercel, the frontend needs to know where your backend API is located. Since environment variables aren't committed to Git for security reasons, you must configure them **manually** in the Vercel dashboard.

## Step-by-Step Fix

### Step 1: Verify Your Backend URL

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your `ecommerce-backend` service
3. Copy the exact URL (should look like: `https://ecommerce-backend-mlyz.onrender.com`)
4. **Important**: No trailing slash `/`

### Step 2: Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `ecommerce` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://ecommerce-backend-mlyz.onrender.com` (your actual backend URL)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development (check all three)
5. Click **Save**

### Step 3: Redeploy Frontend

Environment variables are injected at **build time**, so you must redeploy:

**Option A: Redeploy from Vercel Dashboard**
1. Go to Vercel Dashboard → Your project → **Deployments**
2. Find the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**

**Option B: Push a new commit**
```bash
git add .
git commit -m "fix: update .env.example with correct backend URL"
git push origin main
```

### Step 4: Verify the Fix

1. After deployment completes, open your live site
2. Open browser DevTools (F12) → **Console**
3. Temporarily add this line to check the variable (you can add it to `src/App.jsx`):
   ```javascript
   console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
   ```
4. Check the **Network** tab - requests should now go to your backend URL, not the frontend URL

### Step 5: Remove Debug Code (Optional)

After verifying, remove the console.log statement added in Step 4.

## Backend CORS Configuration

Make sure your backend allows requests from your Vercel frontend. Check your backend code has:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://ecommerce-tan-theta-10.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

If CORS is not configured, your frontend requests will be blocked by the browser.

## Common Mistakes

### ❌ Wrong: Hardcoded relative paths
```javascript
// BAD - calls the frontend itself
fetch('/api/products')
```

### ✅ Correct: Using environment variable
```javascript
// GOOD - uses env variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
fetch(`${API_BASE_URL}/api/products`)
```

Your code is already correct! Just need to set the env variable on Vercel.

## Environment Variable Notes

- **Vite requires prefix**: Variables must start with `VITE_` to be exposed to the client
- **Build-time injection**: Vite replaces `import.meta.env.VITE_*` during build, not runtime
- **No trailing slash**: Backend URL should NOT end with `/`
  - ✅ `https://ecommerce-backend-mlyz.onrender.com`
  - ❌ `https://ecommerce-backend-mlyz.onrender.com/`

## Testing Locally

To test with your production backend locally:

1. Create `.env` file in `frontend/` directory (not committed to Git):
   ```
   VITE_API_BASE_URL=https://ecommerce-backend-mlyz.onrender.com
   ```

2. Run development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:5173` and check if it connects to your backend

## Troubleshooting

### Still calling wrong URL?

1. Check Vercel dashboard → Settings → Environment Variables (verify it's set)
2. Force a new deployment (redeploy)
3. Check browser DevTools → Network tab to see actual request URLs
4. Add console.log to verify: `console.log(import.meta.env.VITE_API_BASE_URL)`

### CORS errors?

1. Verify backend has CORS middleware configured
2. Check backend allows your Vercel domain
3. Check browser console for specific CORS error messages

### Backend not responding?

1. Check Render dashboard → your backend service is running
2. Test backend URL directly in browser: `https://ecommerce-backend-mlyz.onrender.com/api/products`
3. Check Render logs for any errors

## Files Already Correct

Your code structure is already properly configured:

- ✅ `frontend/src/config/api.js` - Uses `import.meta.env.VITE_API_BASE_URL`
- ✅ `frontend/vite.config.js` - Has proxy configuration for dev
- ✅ All API calls use relative paths (`/api/products`) which combine with baseURL

**You only need to set the environment variable on Vercel and redeploy!**

## Quick Checklist

- [ ] Verified backend URL on Render (no typos)
- [ ] Added `VITE_API_BASE_URL` to Vercel environment variables
- [ ] Set for all environments (Production, Preview, Development)
- [ ] Triggered redeployment
- [ ] Verified in browser DevTools → Network tab that requests go to backend
- [ ] Checked browser console for any CORS errors
- [ ] Verified backend is running on Render
