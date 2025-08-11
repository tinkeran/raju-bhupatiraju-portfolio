# Google Photos OAuth Setup Guide

This guide will help you set up Google Photos OAuth integration to display your actual bird photography from Google Photos on your portfolio website.

## Prerequisites

- Google account with photos in Google Photos
- Google Cloud Console access
- Your portfolio website running locally

## Step 1: Create Google Cloud Project

1. Go to [Google API Console](https://console.developers.google.com/apis/library)
2. From the menu bar, select a project or create a new project
3. Note your project ID for reference

## Step 2: Enable Google Photos Library API

1. In the Google API Console, from the Navigation menu, select **APIs & Services** > **Library**
2. Search for "Photos"
3. Select **Photos Library API** and click **Enable**

## Step 3: Create OAuth 2.0 Client ID

1. Go to [Google API Console](https://console.developers.google.com/apis/library) and select your project
2. From the menu, select **APIs & Services** > **Credentials**
3. On the Credentials page, click **Create Credentials** > **OAuth client ID**

   **Note**: If you're setting up a new project, you may be prompted to configure your project's consent screen first.

4. Select **Web application** as your Application type
5. Enter a name to identify the client ID (e.g., "Portfolio Google Photos Integration")
6. Configure the authorized origins and redirect URIs:

   **Authorized JavaScript origins** (where your app runs):
   - For local development: `http://localhost:8787`
   - For production: `https://your-domain.workers.dev`

   **Authorized redirect URIs** (OAuth callback endpoints):
   - For local development: `http://localhost:8787/auth/google-photos/callback`
   - For production: `https://your-domain.workers.dev/auth/google-photos/callback`

7. Click **Create**
8. Copy the **Client ID** and **Client Secret** from the popup

## Step 4: Configure OAuth Consent Screen (if prompted)

If you need to configure the consent screen:

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - **App name**: "Raju Bhupatiraju Portfolio"
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue**
5. On the **Scopes** page, you can skip adding scopes manually (they'll be requested programmatically)
6. Click **Save and Continue**
7. On **Test users**, add your own email address for testing
8. Click **Save and Continue**

## Step 5: Configure Environment Variables

### For Local Development

Update your `wrangler.toml` file:

```toml
# Google Photos Integration
GOOGLE_PHOTOS_CLIENT_ID = "your-client-id-here"
GOOGLE_PHOTOS_REDIRECT_URI = "http://localhost:8787/auth/google-photos/callback"
```

### Set the Client Secret

Run this command to securely set your client secret:

```bash
wrangler secret put GOOGLE_PHOTOS_CLIENT_SECRET
```

When prompted, paste your OAuth client secret.

### For Production Deployment

Update your production environment variables:

```bash
# Set client ID
wrangler secret put GOOGLE_PHOTOS_CLIENT_ID

# Set client secret  
wrangler secret put GOOGLE_PHOTOS_CLIENT_SECRET

# Update redirect URI for production
wrangler secret put GOOGLE_PHOTOS_REDIRECT_URI
```

## Step 6: Test the Integration

1. **Start your local server**:
   ```bash
   npm run dev
   ```

2. **Visit the authentication URL**:
   ```
   http://localhost:8787/auth/google-photos
   ```

3. **Complete OAuth flow**:
   - You'll be redirected to Google's consent screen
   - Grant permission to access your photos
   - You'll be redirected back to your site with a success message

4. **View your photos**:
   ```
   http://localhost:8787/photography
   ```

## Step 7: Organize Your Photos

For best results, create a Google Photos album specifically for your bird photography:

1. Go to [Google Photos](https://photos.google.com)
2. Create a new album called "Bird Photography" or similar
3. Add your best bird photos to this album
4. The system will automatically find and display photos from albums with "bird" in the title

## Troubleshooting

### Common Issues

**"OAuth not configured" error**:
- Ensure `GOOGLE_PHOTOS_CLIENT_ID` and `GOOGLE_PHOTOS_CLIENT_SECRET` are set
- Check that the values don't have extra spaces or quotes

**"No valid access token" error**:
- Complete the OAuth flow by visiting `/auth/google-photos`
- Check that your OAuth consent screen is properly configured

**"No albums found" error**:
- Ensure you have albums in Google Photos
- Try creating an album with "bird" in the title
- The system will fall back to any album with photos if no bird album is found

**Redirect URI mismatch**:
- Ensure the redirect URI in Google Cloud Console matches your `GOOGLE_PHOTOS_REDIRECT_URI`
- For local development: `http://localhost:8787/auth/google-photos/callback`

### API Endpoints

- **Authenticate**: `GET /auth/google-photos`
- **OAuth Callback**: `GET /auth/google-photos/callback`
- **Get Photos**: `GET /api/photos`
- **Clear Cache**: `POST /api/photos/refresh-cache`

### Cache Management

The system caches your photos for performance. To refresh:

```bash
curl -X POST http://localhost:8787/api/photos/refresh-cache
```

## Security Notes

- Client secrets are stored securely using Wrangler secrets
- Access tokens are cached with automatic refresh
- Only read-only access to your photos is requested
- You can revoke access anytime in your Google account settings

## Production Deployment

When deploying to production:

1. Update redirect URIs in Google Cloud Console
2. Set production environment variables
3. Deploy with `wrangler deploy`
4. Complete OAuth flow on your live site

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Ensure your Google Cloud project has the Photos Library API enabled
4. Check that your OAuth consent screen is properly configured

---

**Next Steps**: After completing this setup, your photography page will display your actual Google Photos instead of fallback images!
