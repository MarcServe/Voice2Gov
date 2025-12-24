# Backend Optional API Keys Setup Guide

## Overview

Both **Resend (Email)** and **Twitter/X API** are **OPTIONAL** features. Your app will work fine without them, but they enable additional functionality.

---

## 📧 Resend API (Email Service)

### What It's Used For:
- **Petition Notifications**: Sending emails to representatives when petitions are created
- **Petition Updates**: Notifying users when their petitions receive signatures or status updates
- **User Communications**: General email functionality

### Is It Required?
**NO** - The app will work without it. Email features will simply be disabled.

### When You Need It:
- ✅ If you want representatives to receive email notifications about petitions
- ✅ If you want users to receive email updates about their petitions
- ✅ If you plan to send transactional emails

### Setup Instructions:

1. **Get Resend API Key**:
   - Go to https://resend.com
   - Sign up for a free account (100 emails/day free)
   - Go to API Keys section
   - Create a new API key
   - Copy the key (starts with `re_`)

2. **Add to Railway**:
   - Railway Dashboard → Your Service → Variables
   - Add: `RESEND_API_KEY` = `re_your-key-here`
   - Add: `FROM_EMAIL` = `noreply@yourdomain.com` (or use Resend's default)
   - Railway will auto-redeploy

3. **Verify Domain (Optional)**:
   - For production, verify your domain in Resend
   - This improves email deliverability

### Cost:
- **Free tier**: 100 emails/day
- **Paid**: Starts at $20/month for 50,000 emails

---

## 🐦 Twitter/X API (Social Media Feed)

### What It's Used For:
- **Social Media Monitoring**: Collecting tweets/posts about representatives
- **Sentiment Analysis**: Analyzing public sentiment about government officials
- **Social Digests**: Generating summaries of social media activity
- **Representative Tracking**: Tracking mentions of representatives on Twitter/X

### Is It Required?
**NO** - The app will work without it. Social media features will be disabled.

### When You Need It:
- ✅ If you want to monitor social media mentions of representatives
- ✅ If you want to analyze public sentiment about government officials
- ✅ If you want to provide social media digests to representatives

### Setup Instructions:

1. **Get Twitter/X API Access**:
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Apply for a developer account (free)
   - Create a new app/project
   - Generate API keys

2. **Required Keys** (you need ALL of these):
   - `TWITTER_API_KEY` (Consumer Key)
   - `TWITTER_API_SECRET` (Consumer Secret)
   - `TWITTER_ACCESS_TOKEN` (Access Token)
   - `TWITTER_ACCESS_TOKEN_SECRET` (Access Token Secret)
   - `TWITTER_BEARER_TOKEN` (Bearer Token) - **Most important for API v2**

3. **Add to Railway**:
   - Railway Dashboard → Your Service → Variables
   - Add all 5 Twitter variables:
     ```
     TWITTER_API_KEY=your-api-key
     TWITTER_API_SECRET=your-api-secret
     TWITTER_ACCESS_TOKEN=your-access-token
     TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
     TWITTER_BEARER_TOKEN=your-bearer-token
     ```
   - Railway will auto-redeploy

### Cost:
- **Free tier**: Limited API access (varies by plan)
- **Basic**: $100/month for more requests
- **Note**: Twitter/X API pricing changed significantly in 2023

### Important Notes:
- ⚠️ Twitter/X API access can be difficult to get approved
- ⚠️ Free tier has very limited rate limits
- ⚠️ Consider if you really need this feature before applying

---

## 🎯 Quick Decision Guide

### Do I Need Resend (Email)?
- **Yes** if: You want email notifications for petitions
- **No** if: You're okay with in-app notifications only

### Do I Need Twitter/X API?
- **Yes** if: You want social media monitoring features
- **No** if: You're focusing on core petition/representative features

---

## 📋 Railway Environment Variables Checklist

### Required (Core Features):
- ✅ `DATABASE_URL` (auto-set by Railway PostgreSQL)
- ✅ `SECRET_KEY` (JWT signing)
- ✅ `ALLOWED_ORIGINS` (CORS)
- ✅ `OPENAI_API_KEY` (Legal assistant)

### Optional (Additional Features):
- ⚪ `RESEND_API_KEY` (Email notifications)
- ⚪ `FROM_EMAIL` (Email sender address)
- ⚪ `TWITTER_API_KEY` (Social media)
- ⚪ `TWITTER_API_SECRET` (Social media)
- ⚪ `TWITTER_ACCESS_TOKEN` (Social media)
- ⚪ `TWITTER_ACCESS_TOKEN_SECRET` (Social media)
- ⚪ `TWITTER_BEARER_TOKEN` (Social media)

---

## 🚀 Recommended Setup Order

1. **Start with Required**: Set up all required variables first
2. **Test Core Features**: Make sure legal assistant, petitions, etc. work
3. **Add Resend** (if needed): Easy to set up, free tier available
4. **Add Twitter/X** (if needed): More complex, requires developer approval

---

## 💡 Pro Tips

### Resend:
- Start with free tier (100 emails/day)
- Upgrade only if you exceed limits
- Verify your domain for better deliverability

### Twitter/X:
- Apply for developer access early (approval can take time)
- Start with free tier to test
- Consider if you really need real-time social media monitoring
- Alternative: Manual social media tracking or scheduled jobs

---

## ❓ FAQ

**Q: Will my app break without these?**
A: No! Both are optional. The app checks if they're configured before using them.

**Q: Can I add them later?**
A: Yes! Just add the variables and redeploy. No code changes needed.

**Q: Do I need both?**
A: No, they're independent. Add only what you need.

**Q: What about Grok API?**
A: Grok is also optional - it's for advanced Twitter/X AI analysis. Only add if you're using Twitter/X features and want AI-powered analysis.

