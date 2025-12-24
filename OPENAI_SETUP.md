# OpenAI API Key Setup Guide

## ⚠️ IMPORTANT: Configure OpenAI in BOTH Places

OpenAI API keys are required in **both Vercel (frontend) and Railway (backend)** for different features to work.

## Why Both?

### Frontend (Vercel) - REQUIRED
- **Used by**: `/api/legal/constitution` and `/api/legal/chat` routes
- **Features**: 
  - Legal question answering (text mode)
  - Voice conversation mode
  - Legal document summarization
- **Without it**: You'll see errors like `"OpenAI API key not configured"` or `"Failed to process your question"`

### Backend (Railway) - REQUIRED for Backend Features
- **Used by**: `backend/app/services/openai_service.py`
- **Features**:
  - Sentiment analysis of social media posts
  - Content extraction from websites
  - Petition categorization
  - Legal document summarization (backend endpoint)
- **Without it**: Backend AI features won't work

## Setup Instructions

### 1. Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. ⚠️ **Save it immediately** - you won't see it again!

### 2. Add to Vercel (Frontend)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. **Variable Name**: `OPENAI_API_KEY`
4. **Value**: `sk-your-actual-key-here`
5. Select environments: Production, Preview, Development (or as needed)
6. Click "Save"
7. **Redeploy** your application (Vercel will auto-redeploy, but you can trigger manually)

### 3. Add to Railway (Backend)

1. Go to Railway Dashboard → Your Service → Variables tab
2. Click "+ New Variable"
3. **Variable Name**: `OPENAI_API_KEY` (uppercase)
4. **Value**: `sk-your-actual-key-here` (same key as Vercel)
5. Click "Add"
6. Railway will automatically redeploy

### 4. Verify Setup

#### Test Frontend (Vercel):
1. Go to your app: `https://your-app.vercel.app/legal`
2. Try asking a question in Text Mode
3. Should work without errors

#### Test Backend (Railway):
1. Go to: `https://your-app.railway.app/docs`
2. Try the `/api/legal/constitution` endpoint
3. Should return a response (not an error)

## Troubleshooting

### Error: "OpenAI API key not configured"
- ✅ Check that `OPENAI_API_KEY` is set in Vercel
- ✅ Check that the variable name is exactly `OPENAI_API_KEY` (uppercase)
- ✅ Redeploy your Vercel app after adding the variable

### Error: "Failed to process your question"
- ✅ Check Vercel logs for more details
- ✅ Verify the API key is valid (starts with `sk-`)
- ✅ Check your OpenAI account has credits/quota

### Backend AI Features Not Working
- ✅ Check that `OPENAI_API_KEY` is set in Railway
- ✅ Check Railway logs for errors
- ✅ Verify the variable name is `OPENAI_API_KEY` (uppercase)

### Same Key for Both?
**Yes!** You can use the same OpenAI API key in both Vercel and Railway. They're separate deployments, so they each need their own copy of the key.

## Cost Considerations

- OpenAI charges per API call (usage-based)
- `gpt-4o-mini` is used (cheaper model)
- Monitor usage at https://platform.openai.com/usage
- Set up billing alerts if needed

## Security Notes

- ✅ Never commit API keys to git
- ✅ Never share API keys publicly
- ✅ Use environment variables (not hardcoded)
- ✅ Rotate keys if compromised
- ✅ Monitor usage regularly

