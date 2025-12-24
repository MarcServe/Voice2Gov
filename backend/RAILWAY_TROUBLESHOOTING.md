# Railway Backend Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Deploys Successfully But Then Fails

#### Check Railway Logs
1. Go to Railway dashboard → Your service → "Deployments" → Click latest deployment
2. Check the "Logs" tab for error messages

#### Common Causes:

**A. Database Connection Issues**
- **Symptom**: `OperationalError`, `Connection refused`, or `database does not exist`
- **Solution**: 
  - Verify `DATABASE_URL` is set correctly in Railway environment variables
  - Check if PostgreSQL service is running
  - Ensure database URL format: `postgresql://user:password@host:port/database`

**B. Missing Environment Variables**
- **Symptom**: `KeyError` or `NoneType` errors
- **Solution**: Add all required environment variables:
  ```
  DATABASE_URL=<from-railway-postgres>
  SECRET_KEY=<generate-random-32-chars>
  OPENAI_API_KEY=sk-...
  ALLOWED_ORIGINS=https://your-app.vercel.app
  ```

**C. Port Configuration**
- **Symptom**: `Address already in use` or service won't start
- **Solution**: Railway automatically sets `$PORT` - ensure Procfile uses it:
  ```
  web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

**D. Database Tables Don't Exist**
- **Symptom**: `relation "representatives" does not exist` or similar
- **Solution**: 
  - If using Supabase: Tables should already exist
  - If using Railway PostgreSQL: Run migrations or create tables manually
  - Check if you're using Supabase database (recommended) vs Railway PostgreSQL

**E. Import Errors**
- **Symptom**: `ModuleNotFoundError` or `ImportError`
- **Solution**: 
  - Verify all dependencies in `requirements.txt`
  - Check Railway build logs for missing packages
  - Ensure `backend` is set as root directory

### 2. Health Check Failing

#### Test the Health Endpoint
```bash
curl https://your-app.railway.app/health
```

Should return: `{"status":"healthy"}`

If it fails:
- Check if the service is actually running
- Verify the port is correct
- Check Railway logs for startup errors

### 3. Database Connection Timeout

**Solution**: Add connection timeout to database.py:
```python
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 10}
)
```

### 4. CORS Errors

**Symptom**: Frontend can't connect to backend

**Solution**: Add your Vercel URL to `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://voice2gov.ng
```

### 5. Service Keeps Restarting

**Check**:
1. Railway logs for crash reasons
2. Memory limits (Railway free tier has limits)
3. Database connection pool size (reduce if needed)

## Quick Diagnostic Steps

1. **Check Railway Logs**
   ```
   Railway Dashboard → Service → Deployments → Latest → Logs
   ```

2. **Test Health Endpoint**
   ```bash
   curl https://your-app.railway.app/health
   ```

3. **Test API Docs**
   ```
   https://your-app.railway.app/docs
   ```

4. **Verify Environment Variables**
   - Railway Dashboard → Service → Variables
   - Ensure all required vars are set

5. **Check Database Connection**
   - Railway Dashboard → PostgreSQL → Connect
   - Verify tables exist

## Recommended Setup

### Use Supabase Database (Easier)
1. Create Supabase project
2. Get connection string
3. Set `DATABASE_URL` in Railway to Supabase connection string
4. Tables already exist in Supabase

### Use Railway PostgreSQL (More Setup)
1. Create Railway PostgreSQL service
2. Set `DATABASE_URL` (auto-set by Railway)
3. Run migrations or create tables manually
4. Seed initial data if needed

## Getting Help

If issues persist:
1. Check Railway logs for specific error messages
2. Verify all environment variables are set
3. Test database connection separately
4. Check if port is correctly configured
5. Verify root directory is set to `backend`

