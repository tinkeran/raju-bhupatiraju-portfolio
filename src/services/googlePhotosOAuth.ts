import { Env } from '../types';

export interface GooglePhotosOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface GooglePhotosTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface GooglePhotosMediaItem {
  id: string;
  description?: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: {
      cameraMake?: string;
      cameraModel?: string;
      focalLength?: number;
      apertureFNumber?: number;
      isoEquivalent?: number;
      exposureTime?: string;
    };
  };
  filename: string;
}

export interface GooglePhotosAlbum {
  id: string;
  title: string;
  productUrl: string;
  mediaItemsCount: string;
  coverPhotoBaseUrl?: string;
  coverPhotoMediaItemId?: string;
}

export interface GooglePhotosMediaItemsResponse {
  mediaItems: GooglePhotosMediaItem[];
  nextPageToken?: string;
}

export interface GooglePhotosAlbumsResponse {
  albums: GooglePhotosAlbum[];
  nextPageToken?: string;
}

export class GooglePhotosOAuthService {
  private env: Env;
  private config: GooglePhotosOAuthConfig;
  private baseUrl = 'https://photoslibrary.googleapis.com/v1';
  private authUrl = 'https://accounts.google.com/o/oauth2/v2';

  constructor(env: Env) {
    this.env = env;
    this.config = {
      clientId: env.GOOGLE_PHOTOS_CLIENT_ID || '',
      clientSecret: env.GOOGLE_PHOTOS_CLIENT_SECRET || '',
      redirectUri: env.GOOGLE_PHOTOS_REDIRECT_URI || `${env.SITE_URL || 'http://localhost:8787'}/auth/google-photos/callback`,
      scope: [
        'https://www.googleapis.com/auth/photoslibrary.readonly',
        'https://www.googleapis.com/auth/photoslibrary.sharing'
      ]
    };
  }

  /**
   * Generate Google Photos OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state })
    });

    return `${this.authUrl}/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<GooglePhotosTokenResponse> {
    const response = await fetch(`${this.authUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Photos token exchange failed: ${error}`);
    }

    return await response.json() as GooglePhotosTokenResponse;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GooglePhotosTokenResponse> {
    const response = await fetch(`${this.authUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Photos token refresh failed: ${error}`);
    }

    return await response.json() as GooglePhotosTokenResponse;
  }

  /**
   * Get user's albums
   */
  async getAlbums(accessToken: string, pageSize: number = 50, pageToken?: string): Promise<GooglePhotosAlbumsResponse> {
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
      ...(pageToken && { pageToken })
    });

    const response = await fetch(`${this.baseUrl}/albums?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Photos albums fetch failed: ${error}`);
    }

    return await response.json() as GooglePhotosAlbumsResponse;
  }

  /**
   * Get media items from a specific album
   */
  async getAlbumMediaItems(accessToken: string, albumId: string, pageSize: number = 100, pageToken?: string): Promise<GooglePhotosMediaItemsResponse> {
    const requestBody = {
      albumId,
      pageSize,
      ...(pageToken && { pageToken })
    };

    const response = await fetch(`${this.baseUrl}/mediaItems:search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Photos media items fetch failed: ${error}`);
    }

    return await response.json() as GooglePhotosMediaItemsResponse;
  }

  /**
   * Get shared albums (albums shared with the user)
   */
  async getSharedAlbums(accessToken: string, pageSize: number = 50, pageToken?: string): Promise<GooglePhotosAlbumsResponse> {
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
      ...(pageToken && { pageToken })
    });

    const response = await fetch(`${this.baseUrl}/sharedAlbums?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Photos shared albums fetch failed: ${error}`);
    }

    return await response.json() as GooglePhotosAlbumsResponse;
  }

  /**
   * Get cached access token or refresh if needed
   */
  async getCachedToken(): Promise<string | null> {
    if (!this.env.PORTFOLIO_KV) return null;
    
    try {
      const cached = await this.env.PORTFOLIO_KV.get('google_photos_access_token');
      if (!cached) return null;

      const tokenData = JSON.parse(cached);
      const now = Date.now();

      // Check if token is expired (with 5 minute buffer)
      if (tokenData.expires_at && now > (tokenData.expires_at - 300000)) {
        // Try to refresh the token
        if (tokenData.refresh_token) {
          try {
            const refreshedToken = await this.refreshAccessToken(tokenData.refresh_token);
            await this.cacheToken(refreshedToken, tokenData.refresh_token);
            return refreshedToken.access_token;
          } catch (error) {
            console.error('Error refreshing Google Photos token:', error);
            await this.env.PORTFOLIO_KV.delete('google_photos_access_token');
            return null;
          }
        } else {
          await this.env.PORTFOLIO_KV.delete('google_photos_access_token');
          return null;
        }
      }

      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting cached Google Photos token:', error);
      return null;
    }
  }

  /**
   * Cache access token with expiration
   */
  async cacheToken(tokenResponse: GooglePhotosTokenResponse, refreshToken?: string): Promise<void> {
    if (!this.env.PORTFOLIO_KV) return;
    
    try {
      const tokenData = {
        access_token: tokenResponse.access_token,
        expires_at: Date.now() + (tokenResponse.expires_in * 1000),
        refresh_token: refreshToken || tokenResponse.refresh_token,
        scope: tokenResponse.scope,
        token_type: tokenResponse.token_type
      };

      await this.env.PORTFOLIO_KV.put('google_photos_access_token', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error caching Google Photos token:', error);
    }
  }

  /**
   * Handle OAuth callback and return token data
   */
  async handleOAuthCallback(code: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Exchange code for access token
      const tokenResponse = await this.getAccessToken(code);
      
      // Cache the token
      await this.cacheToken(tokenResponse);
      
      return { success: true, data: { token: tokenResponse.access_token } };
    } catch (error) {
      console.error('Google Photos OAuth callback error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown OAuth error' 
      };
    }
  }

  /**
   * Find album by title (case-insensitive search)
   */
  async findAlbumByTitle(accessToken: string, title: string): Promise<GooglePhotosAlbum | null> {
    try {
      // Search in regular albums
      const albumsResponse = await this.getAlbums(accessToken);
      const album = albumsResponse.albums?.find(album => 
        album.title.toLowerCase().includes(title.toLowerCase())
      );
      
      if (album) return album;

      // Search in shared albums
      const sharedAlbumsResponse = await this.getSharedAlbums(accessToken);
      const sharedAlbum = sharedAlbumsResponse.albums?.find(album => 
        album.title.toLowerCase().includes(title.toLowerCase())
      );
      
      return sharedAlbum || null;
    } catch (error) {
      console.error('Error finding album by title:', error);
      return null;
    }
  }

  /**
   * Check if Google Photos OAuth is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }

  /**
   * Clear cached tokens
   */
  async clearCache(): Promise<void> {
    if (!this.env.PORTFOLIO_KV) return;
    
    try {
      await this.env.PORTFOLIO_KV.delete('google_photos_access_token');
    } catch (error) {
      console.error('Error clearing Google Photos cache:', error);
    }
  }
}
