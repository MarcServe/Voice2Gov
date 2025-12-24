# Railway Environment Variables Setup

## Required Variables

### 1. DATABASE_URL (Already set by Railway PostgreSQL)
- **Purpose**: Database connection string
- **Format**: `postgresql://user:password@host:port/database`
- **Note**: Automatically set if you added Railway PostgreSQL service

### 2. SECRET_KEY (Required)
- **Purpose**: JWT token signing and encryption
- **How to generate**: 
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- **Example**: `your-random-32-character-secret-key-here`

## Suggested Variables (Add These)

### 3. ALLOWED_ORIGINS (Important for CORS)
- **Purpose**: Allows your Vercel frontend to call the backend API
- **Value**: Your Vercel app URL(s), comma-separated
- **Example**: 
  ```
  https://voice2gov.vercel.app,https://voice2gov.ng
  ```
- **Note**: Add your actual Vercel deployment URL here

### 4. VERCEL_URL (Optional)
- **Purpose**: Automatically adds Vercel preview URLs to CORS
- **Value**: Your Vercel app URL (without https://)
- **Example**: `voice2gov.vercel.app`
- **Note**: This is optional if you set ALLOWED_ORIGINS

## Optional Variables (For Full Functionality)

### 5. OPENAI_API_KEY ⚠️ REQUIRED for Legal Features
- **Purpose**: AI features (legal guidance, sentiment analysis, content extraction)
- **Value**: Your OpenAI API key
- **Format**: `sk-...`
- **Note**: This is REQUIRED if you want the backend legal API endpoints to work. The same key can be used in both Vercel and Railway.

### 6. SUPABASE_URL
- **Purpose**: If using Supabase for database
- **Value**: Your Supabase project URL
- **Format**: `https://xxx.supabase.co`

### 7. SUPABASE_KEY
- **Purpose**: Supabase service role key (if using Supabase)
- **Value**: Your Supabase service role key

### 8. RESEND_API_KEY (Optional - Email Notifications)
- **Purpose**: Send email notifications for petitions
- **Value**: Your Resend API key (starts with `re_`)
- **Get it**: https://resend.com (unlimited emails/day free)
- **Also add**: `FROM_EMAIL=noreply@yourdomain.com`

### 9. Twitter/X API Keys (Optional - Social Media)
- **Purpose**: Monitor social media mentions of representatives
- **Required variables** (all 5):
  - `TWITTER_API_KEY`
  - `TWITTER_API_SECRET`
  - `TWITTER_ACCESS_TOKEN`
  - `TWITTER_ACCESS_TOKEN_SECRET`
  - `TWITTER_BEARER_TOKEN`
- **Get them**: https://developer.twitter.com/en/portal/dashboard
- **Note**: Requires developer account approval

### 10. GROK_API_KEY (Optional - Advanced Twitter AI)
- **Purpose**: AI-powered Twitter/X analysis
- **Value**: Your Grok API key
- **Note**: Only needed if using Twitter/X features with AI analysis

## How to Add Variables in Railway

1. Go to Railway Dashboard → Your Service → "Variables" tab
2. Click "+ New Variable"
3. Enter the variable name (e.g., `ALLOWED_ORIGINS`)
4. Enter the value
5. Click "Add"
6. Railway will automatically redeploy

## Quick Setup Checklist

### Required (Core Features):
- [ ] DATABASE_URL is set (auto-set by Railway PostgreSQL)
- [ ] SECRET_KEY is set (generate a random key)
- [ ] ALLOWED_ORIGINS is set (your Vercel URL)
- [ ] OPENAI_API_KEY is set (⚠️ REQUIRED for legal features - same key as Vercel)

### Optional (Additional Features):
- [ ] RESEND_API_KEY (for email notifications)
- [ ] FROM_EMAIL (email sender address)
- [ ] Twitter/X API keys (for social media monitoring)
- [ ] GROK_API_KEY (for advanced Twitter AI analysis)

### Testing:
- [ ] Test health endpoint: `https://your-app.railway.app/health`
- [ ] Test API docs: `https://your-app.railway.app/docs`

## After Adding Variables

1. Railway will automatically redeploy
2. Check logs to ensure no errors
3. Test the health endpoint again
4. Update your frontend to use the backend URL

## 📚 More Information

- **For optional APIs**: See `BACKEND_OPTIONAL_APIS.md` for detailed setup instructions
- **For OpenAI setup**: See `OPENAI_SETUP.md` for complete guide
- **For Vercel setup**: See `VERCEL_ENV_VARIABLES.md` for frontend variables

