# Backend Deployment Guide for Voice2Gov

This guide covers deploying the FastAPI backend to various platforms.

## Prerequisites

- Python 3.9+ (3.11 recommended)
- PostgreSQL database (Supabase recommended)
- Environment variables ready

## Deployment Options

### Option 1: Railway (Recommended) 🚂

Railway is the easiest option with automatic deployments from GitHub.

#### Steps:

1. **Sign up at [Railway](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `MarcServe/Voice2Gov`

3. **Configure Service**
   - Railway will auto-detect it's a Python project
   - Set **Root Directory** to `backend`
   - Build command: `pip install -r requirements.txt` (auto-detected)
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (auto-detected)

4. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL` environment variable

5. **Add Environment Variables**
   Go to "Variables" tab and add:

   ```
   DATABASE_URL=<auto-set-by-railway-postgres>
   SECRET_KEY=<generate-a-random-secret-key>
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://voice2gov.ng
   ```

6. **Deploy**
   - Railway automatically deploys on every push to main branch
   - Your API will be live at: `https://your-app.railway.app`

7. **Get API URL**
   - Copy the Railway URL (e.g., `https://voice2gov-backend.railway.app`)
   - Update frontend to use this URL for API calls

---

### Option 2: Render 🎨

Render offers free tier with automatic SSL.

#### Steps:

1. **Sign up at [Render](https://render.com)**

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `MarcServe/Voice2Gov`

3. **Configure Service**
   - **Name**: `voice2gov-backend`
   - **Environment**: Python 3
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add PostgreSQL Database**
   - Click "New" → "PostgreSQL"
   - Render will automatically set `DATABASE_URL`

5. **Add Environment Variables**
   In the Web Service settings → Environment:
   ```
   DATABASE_URL=<auto-set-by-render-postgres>
   SECRET_KEY=<generate-random-secret>
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_key
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your API: `https://voice2gov-backend.onrender.com`

---

### Option 3: Heroku 🟣

Heroku requires a credit card but offers easy deployment.

#### Steps:

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   cd backend
   heroku create voice2gov-backend
   ```

4. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set OPENAI_API_KEY=your-openai-key
   heroku config:set SUPABASE_URL=your-supabase-url
   heroku config:set SUPABASE_KEY=your-supabase-key
   heroku config:set ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

6. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

---

### Option 4: Vercel Serverless Functions (Advanced) ⚡

Convert FastAPI routes to Next.js API routes. More complex but keeps everything in one place.

**Note**: This requires refactoring FastAPI routes to Next.js API routes. Not recommended unless you want everything on Vercel.

---

## Environment Variables Reference

### Required Variables:

```bash
# Database (auto-set by Railway/Render if using their PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# Security
SECRET_KEY=<generate-random-32-character-string>

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Supabase (if using Supabase for database)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-service-role-key

# CORS (comma-separated list of allowed origins)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://voice2gov.ng
```

### Optional Variables:

```bash
# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@voice2gov.ng

# Twitter/X API
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...
TWITTER_BEARER_TOKEN=...

# SMS (Twilio)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Grok/X AI
GROK_API_KEY=...
```

## Generate Secret Key

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use online generator
# https://randomkeygen.com/
```

## Update Frontend to Use Backend URL

After deploying backend, update your frontend API calls:

### Option 1: Environment Variable (Recommended)

Add to `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

Then update API calls in frontend to use:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

### Option 2: Update API Routes

Update all API routes in `frontend/app/api/` to proxy to your backend URL.

## Testing Deployment

1. **Health Check**
   ```bash
   curl https://your-backend.railway.app/health
   ```
   Should return: `{"status":"healthy"}`

2. **API Docs**
   Visit: `https://your-backend.railway.app/docs`
   - Should show Swagger UI with all endpoints

3. **Test Endpoints**
   ```bash
   curl https://your-backend.railway.app/api/representatives
   ```

## Troubleshooting

### Build Fails
- Check Python version (should be 3.9+)
- Verify `requirements.txt` is correct
- Check build logs in deployment platform

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check database is accessible from deployment platform
- Ensure SSL is enabled if required

### CORS Errors
- Add your frontend URL to `ALLOWED_ORIGINS`
- Check CORS middleware configuration
- Verify environment variable is set correctly

### Environment Variables Not Working
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)
- Verify `.env` file is not committed (should be in `.gitignore`)

## Continuous Deployment

All platforms support automatic deployments:
- **Railway**: Auto-deploys on push to main branch
- **Render**: Auto-deploys on push to main branch
- **Heroku**: Deploy with git push

## Recommended Setup

1. **Frontend**: Vercel (Next.js)
2. **Backend**: Railway (FastAPI)
3. **Database**: Supabase PostgreSQL (or Railway/Render PostgreSQL)

This gives you:
- ✅ Automatic SSL certificates
- ✅ Free tier available
- ✅ Easy environment variable management
- ✅ Automatic deployments
- ✅ Good performance

## Support

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com

