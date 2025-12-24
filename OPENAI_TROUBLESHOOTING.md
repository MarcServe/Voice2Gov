# OpenAI API Troubleshooting Guide

## Issue: Text Mode Not Working / "OpenAI not configured"

If even **Text Mode** isn't working, it means the OpenAI API key is not properly configured in Vercel.

## Quick Diagnosis

### Step 1: Check Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `voice2-gov`
3. Go to **Settings** → **Environment Variables**
4. Look for `OPENAI_API_KEY`

### Step 2: Verify the Key

**The key should:**
- ✅ Start with `sk-`
- ✅ Be at least 50 characters long
- ✅ Be set for **Production**, **Preview**, and **Development** environments (or at least Production)

**Common issues:**
- ❌ Key is missing
- ❌ Key is empty or has extra spaces
- ❌ Key is only set for Development, not Production
- ❌ Key format is wrong (doesn't start with `sk-`)

### Step 3: Get Your OpenAI API Key

If you don't have a key:

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-`)
5. ⚠️ **Save it immediately** - you won't see it again!

### Step 4: Add to Vercel

1. In Vercel → Settings → Environment Variables
2. Click **"Add New"**
3. **Name**: `OPENAI_API_KEY`
4. **Value**: `sk-your-actual-key-here` (paste your key)
5. **Environment**: Select all (Production, Preview, Development)
6. Click **"Save"**

### Step 5: Redeploy

**Important:** After adding/changing environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

**OR** trigger a new deployment by pushing a commit to your repo.

## Testing

After redeploying, test in **Text Mode**:

1. Go to `/legal` page
2. Make sure **Text Mode** is selected (not Voice Mode)
3. Type a question: "What are my rights as a tenant?"
4. Click **"Get Guidance"**
5. Should get a response (not an error)

## Error Messages Explained

### "OpenAI API key is not configured"
- **Meaning**: The environment variable is missing or empty
- **Fix**: Add `OPENAI_API_KEY` to Vercel environment variables

### "OpenAI API key format is invalid"
- **Meaning**: The key doesn't start with `sk-`
- **Fix**: Check that you copied the full key correctly

### "OpenAI API key is invalid or expired"
- **Meaning**: The key exists but is wrong or expired
- **Fix**: Generate a new key from OpenAI and update it in Vercel

### "Rate limit exceeded"
- **Meaning**: You've used up your OpenAI quota
- **Fix**: Check your OpenAI usage at https://platform.openai.com/usage

### "Failed to get response from AI service"
- **Meaning**: Generic error - check server logs
- **Fix**: Check Vercel deployment logs for more details

## Check Vercel Logs

To see detailed error messages:

1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. Click on the latest deployment
4. Click **"Functions"** tab
5. Look for `/api/legal/chat` or `/api/legal/constitution`
6. Check the logs for error messages

## Quick Test Command

You can test the API directly using curl:

```bash
curl -X POST https://voice2-gov.vercel.app/api/legal/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

If you get `{"error":"OpenAI not configured"}`, the API key is missing.

## Still Not Working?

1. **Double-check** the environment variable name is exactly `OPENAI_API_KEY` (case-sensitive)
2. **Verify** you redeployed after adding the variable
3. **Check** Vercel logs for specific error messages
4. **Test** your OpenAI API key directly at https://platform.openai.com/playground
5. **Ensure** your OpenAI account has credits/quota available

## Need Help?

Check the browser console (F12) and Vercel logs for specific error messages. The improved error handling will now show exactly what's wrong.

