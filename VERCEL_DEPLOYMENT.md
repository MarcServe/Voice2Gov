# Vercel Deployment Guide for Voice2Gov

This guide will help you deploy the Voice2Gov frontend to Vercel.

## Prerequisites

1. GitHub repository connected (✅ Already done: https://github.com/MarcServe/Voice2Gov)
2. Vercel account (sign up at https://vercel.com)
3. Environment variables ready

## Step-by-Step Deployment

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `MarcServe/Voice2Gov`
4. Vercel will auto-detect it's a Next.js project

### 2. Configure Project Settings

**Root Directory**: Set to `frontend`
- In Vercel project settings, go to "Settings" → "General"
- Under "Root Directory", select `frontend`

**Build Settings** (should auto-detect, but verify):
- Framework Preset: Next.js
- Build Command: `npm run build` (runs in frontend directory)
- Output Directory: `.next`
- Install Command: `npm install`

### 3. Add Environment Variables

Go to "Settings" → "Environment Variables" and add:

#### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

#### Optional (for ElevenLabs voices):

```
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

**Important**: 
- Add these for **Production**, **Preview**, and **Development** environments
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Never commit `.env.local` files to git (already in `.gitignore`)

### 4. Deploy

1. Click "Deploy" button
2. Vercel will:
   - Install dependencies
   - Build the Next.js app
   - Deploy to a production URL
3. Your app will be live at: `https://voice2gov.vercel.app` (or your custom domain)

## Post-Deployment Checklist

- [ ] Test the homepage loads correctly
- [ ] Test authentication (login/signup)
- [ ] Test voice input functionality
- [ ] Test admin panel (if accessible)
- [ ] Test API routes (`/api/representatives`, etc.)
- [ ] Verify environment variables are set correctly
- [ ] Test ElevenLabs TTS (if API key is set)
- [ ] Test OpenAI integration (legal chat, etc.)

## Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

## Backend Deployment

The FastAPI backend needs to be deployed separately. Options:

### Option 1: Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub repo
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

### Option 2: Render
1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set root directory to `backend`
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Option 3: Vercel (Serverless Functions)
- Convert FastAPI routes to Next.js API routes
- More complex but keeps everything in one place

## Environment Variables Reference

### Frontend (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `ELEVENLABS_API_KEY` - ElevenLabs API key for TTS (optional)

### Backend (Railway/Render)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase service role key

## Troubleshooting

### Build Fails
- Check that root directory is set to `frontend`
- Verify all dependencies in `package.json`
- Check build logs in Vercel dashboard

### API Routes Not Working
- Ensure environment variables are set
- Check API route files are in `frontend/app/api/`
- Verify CORS settings if calling external APIs

### Environment Variables Not Working
- Variables starting with `NEXT_PUBLIC_` are available in browser
- Other variables are server-side only
- Redeploy after adding new variables

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches (creates preview URLs)

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Issues: Open an issue on GitHub

