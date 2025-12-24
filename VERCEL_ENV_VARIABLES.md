# Vercel Environment Variables Guide

## ✅ Frontend API Keys (Add to Vercel)

These are the **ONLY** environment variables you need to add to Vercel for the frontend:

### Required:

```bash
# Supabase (Database & Authentication)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (REQUIRED for legal assistant and voice conversations)
# ⚠️ This is CRITICAL - without this, legal questions and voice mode will fail!
OPENAI_API_KEY=sk-your-openai-api-key
```

### Optional (but recommended):

```bash
# ElevenLabs (for Nigerian TTS voices)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Supabase Service Role Key (for admin operations only)
# ⚠️ WARNING: This is sensitive - only add if you need admin features
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

---

## ❌ Backend-Only Keys (DO NOT Add to Vercel)

These API keys are **ONLY used in the backend** and should **NOT** be added to Vercel:

### ❌ GROK_API_KEY
- **Used in**: `backend/app/services/grok_service.py`
- **Purpose**: Grok AI (X/Twitter AI) for social media analysis
- **Where to add**: Backend deployment (Railway/Render) only

### ❌ Twitter/X API Keys (All of these)
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_TOKEN_SECRET`
- `TWITTER_BEARER_TOKEN`
- **Used in**: `backend/app/services/twitter_service.py`
- **Purpose**: Social media feed gathering from Twitter/X
- **Where to add**: Backend deployment (Railway/Render) only

### ❌ Other Backend-Only Keys
- `RESEND_API_KEY` - Email service (backend only)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - SMS service (backend only)
- `DATABASE_URL` - Database connection (backend only)
- `SECRET_KEY` - JWT signing (backend only)

---

## 📋 Complete Vercel Environment Variables List

Add these to Vercel → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=sk-your-openai-api-key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

That's it! **Only 4 variables** (3 required, 1 optional).

---

## 🔐 Backend Environment Variables

For social media features, add these to your **backend deployment** (Railway/Render):

```bash
# Twitter/X API (for social media gathering)
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
TWITTER_BEARER_TOKEN=your-bearer-token

# Grok AI (optional - for advanced Twitter analysis)
GROK_API_KEY=your-grok-api-key

# Other backend keys
DATABASE_URL=your-database-url
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-your-openai-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key
```

---

## 🎯 Summary

**Vercel (Frontend):**
- ✅ Supabase keys (public)
- ✅ OpenAI API key
- ✅ ElevenLabs API key (optional)
- ❌ NO Twitter/X keys
- ❌ NO Grok API key
- ❌ NO backend-only keys

**Backend (Railway/Render):**
- ✅ All Twitter/X API keys
- ✅ Grok API key
- ✅ Database and security keys
- ✅ All backend service keys

---

## 🚨 Security Note

- **Never** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel unless absolutely necessary
- **Never** add backend API keys to Vercel - they won't work anyway
- **Always** use `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser
- Variables without `NEXT_PUBLIC_` prefix are server-side only in Next.js

