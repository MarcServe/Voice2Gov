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

### 5. OPENAI_API_KEY
- **Purpose**: AI features (legal guidance, sentiment analysis)
- **Value**: Your OpenAI API key
- **Format**: `sk-...`

### 6. SUPABASE_URL
- **Purpose**: If using Supabase for database
- **Value**: Your Supabase project URL
- **Format**: `https://xxx.supabase.co`

### 7. SUPABASE_KEY
- **Purpose**: Supabase service role key (if using Supabase)
- **Value**: Your Supabase service role key

## How to Add Variables in Railway

1. Go to Railway Dashboard → Your Service → "Variables" tab
2. Click "+ New Variable"
3. Enter the variable name (e.g., `ALLOWED_ORIGINS`)
4. Enter the value
5. Click "Add"
6. Railway will automatically redeploy

## Quick Setup Checklist

- [ ] DATABASE_URL is set (auto-set by Railway PostgreSQL)
- [ ] SECRET_KEY is set (generate a random key)
- [ ] ALLOWED_ORIGINS is set (your Vercel URL)
- [ ] OPENAI_API_KEY is set (if using AI features)
- [ ] Test health endpoint: `https://your-app.railway.app/health`
- [ ] Test API docs: `https://your-app.railway.app/docs`

## After Adding Variables

1. Railway will automatically redeploy
2. Check logs to ensure no errors
3. Test the health endpoint again
4. Update your frontend to use the backend URL

