# LinkedIn OAuth Integration Setup Guide

## 🎯 Overview

Your portfolio now supports **full LinkedIn OAuth integration** to automatically pull your real LinkedIn profile data! This replaces the manual GitHub JSON approach with live data from your LinkedIn profile.

## 🚀 Features

✅ **Live Data**: Automatically pulls your real LinkedIn profile information  
✅ **OAuth Authentication**: Secure LinkedIn login integration  
✅ **Auto-Refresh**: Cached data with automatic updates  
✅ **Fallback System**: Falls back to GitHub JSON if OAuth unavailable  
✅ **Privacy Control**: You control what data is shared  

## 📋 Setup Steps

### Step 1: Create LinkedIn Developer Application

1. **Go to LinkedIn Developers**: https://www.linkedin.com/developers/
2. **Sign in** with your LinkedIn account
3. **Create App**:
   - Click **"Create App"**
   - **App name**: `Raju Bhupatiraju Portfolio`
   - **LinkedIn Page**: Your personal LinkedIn profile
   - **App logo**: Upload your professional headshot
   - **Legal agreement**: Accept terms

4. **Configure App Settings**:
   - **Privacy Policy URL**: `http://localhost:8787/privacy` (we'll create this)
   - **App description**: `Personal portfolio website with LinkedIn integration`

### Step 2: Configure OAuth Settings

1. **In your LinkedIn app dashboard**:
   - Go to **"Auth"** tab
   - **Authorized Redirect URLs**: Add these URLs:
     - `http://localhost:8787/auth/linkedin/callback` (for development)
     - `https://your-domain.workers.dev/auth/linkedin/callback` (for production)

2. **Request Permissions**:
   - Check **"r_liteprofile"** (basic profile info)
   - Check **"r_emailaddress"** (email address)
   - Submit for review if required

3. **Get Your Credentials**:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value (keep it secret!)

### Step 3: Configure Your Portfolio

1. **Update `wrangler.toml`**:
   ```toml
   LINKEDIN_CLIENT_ID = "your_client_id_here"
   SITE_URL = "http://localhost:8787"  # Update for production
   LINKEDIN_REDIRECT_URI = "http://localhost:8787/auth/linkedin/callback"
   ```

2. **Set Client Secret** (keep this secure):
   ```bash
   wrangler secret put LINKEDIN_CLIENT_SECRET
   # Enter your LinkedIn Client Secret when prompted
   ```

### Step 4: Test the Integration

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Authenticate with LinkedIn**:
   - Visit: http://localhost:8787/auth/linkedin
   - You'll be redirected to LinkedIn to authorize your app
   - After authorization, you'll be redirected back with success message

3. **View Your Live Resume**:
   - Visit: http://localhost:8787/resume
   - Your resume should now show live data from your LinkedIn profile!

## 🔧 API Endpoints

### Authentication
- **`GET /auth/linkedin`** - Initiate LinkedIn OAuth flow
- **`GET /auth/linkedin/callback`** - Handle OAuth callback

### Data Management
- **`GET /api/profile`** - Get profile data (now with live LinkedIn data)
- **`POST /api/profile/refresh-cache`** - Clear cache to force refresh

## 📊 Data Sources Priority

Your portfolio now uses this priority order for resume data:

1. **🥇 LinkedIn OAuth** - Live data from your LinkedIn profile (if authenticated)
2. **🥈 GitHub JSON** - Manual data from your repository (fallback)
3. **🥉 Static Data** - Template data (last resort)

## 🔒 Privacy & Security

- **OAuth Flow**: Secure LinkedIn authentication
- **Token Caching**: Access tokens are cached securely in Cloudflare KV
- **Data Control**: You control what LinkedIn data is shared
- **Fallback**: Works even if LinkedIn is unavailable

## 🎯 What LinkedIn Data is Pulled

Currently supported LinkedIn profile fields:
- ✅ **Name** (First & Last)
- ✅ **Headline** (Professional title)
- ✅ **Summary** (About section)
- ✅ **Location** (Current location)
- ✅ **Industry** (Industry category)
- ✅ **Profile Picture** (Professional headshot)

**Note**: LinkedIn API v2 has limited access to experience/education data. For detailed work history, the system will merge LinkedIn basic info with your GitHub JSON data for complete resume.

## 🚀 Production Deployment

When deploying to production:

1. **Update URLs in LinkedIn App**:
   - Add production redirect URL: `https://your-domain.workers.dev/auth/linkedin/callback`

2. **Update `wrangler.toml`**:
   ```toml
   SITE_URL = "https://your-domain.workers.dev"
   LINKEDIN_REDIRECT_URI = "https://your-domain.workers.dev/auth/linkedin/callback"
   ```

3. **Deploy with secrets**:
   ```bash
   wrangler secret put LINKEDIN_CLIENT_SECRET
   wrangler deploy
   ```

## 🔧 Troubleshooting

### "LinkedIn OAuth not configured" Error
- Ensure `LINKEDIN_CLIENT_ID` is set in `wrangler.toml`
- Ensure `LINKEDIN_CLIENT_SECRET` is set via `wrangler secret put`

### "Invalid redirect_uri" Error
- Check that redirect URI in LinkedIn app matches your `LINKEDIN_REDIRECT_URI`
- Ensure URLs are exactly the same (including http/https)

### "Access denied" Error
- Check that your LinkedIn app has the required permissions
- Ensure your app is approved for the requested scopes

### No Live Data Showing
- Visit `/auth/linkedin` to authenticate
- Check browser console for errors
- Clear cache: `curl -X POST http://localhost:8787/api/profile/refresh-cache`

## 🎉 Success!

Once configured, your portfolio will:
- ✅ Show live LinkedIn data on your resume
- ✅ Automatically update when your LinkedIn profile changes
- ✅ Provide a professional, dynamic resume experience
- ✅ Fall back gracefully if LinkedIn is unavailable

Your resume is now a **living document** that stays in sync with your LinkedIn profile! 🚀
