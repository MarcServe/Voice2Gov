# Backend Environment Variables

Copy this file to `.env` and fill in your values.

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security - Generate a random secret key (32+ characters)
SECRET_KEY=your-secret-key-change-in-production

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Supabase (if using Supabase database)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-supabase-service-role-key

# CORS - Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-app.vercel.app

# Email (Optional - Resend)
RESEND_API_KEY=re_your-resend-api-key
FROM_EMAIL=noreply@voice2gov.ng

# Twitter/X API (Optional)
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
TWITTER_BEARER_TOKEN=your-bearer-token

# SMS (Optional - Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Grok/X AI (Optional)
GROK_API_KEY=your-grok-api-key
```

## Generate Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

