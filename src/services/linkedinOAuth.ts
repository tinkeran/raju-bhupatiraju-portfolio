import { Env } from '../types';

export interface LinkedInOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface LinkedInProfileResponse {
  id: string;
  firstName: {
    localized: Record<string, string>;
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  lastName: {
    localized: Record<string, string>;
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  headline?: {
    localized: Record<string, string>;
  };
  summary?: string;
  industry?: string;
  location?: {
    name: string;
  };
  profilePicture?: {
    displayImage: string;
  };
}

export class LinkedInOAuthService {
  private env: Env;
  private config: LinkedInOAuthConfig;
  private baseUrl = 'https://api.linkedin.com/v2';
  private authUrl = 'https://www.linkedin.com/oauth/v2';

  constructor(env: Env) {
    this.env = env;
    this.config = {
      clientId: env.LINKEDIN_CLIENT_ID || '',
      clientSecret: env.LINKEDIN_CLIENT_SECRET || '',
      redirectUri: env.LINKEDIN_REDIRECT_URI || `${env.SITE_URL || 'http://localhost:8787'}/auth/linkedin/callback`,
      scope: [
        'r_liteprofile',
        'r_emailaddress',
        'w_member_social'
      ]
    };
  }

  /**
   * Generate LinkedIn OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope.join(' '),
      ...(state && { state })
    });

    return `${this.authUrl}/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<LinkedInTokenResponse> {
    const response = await fetch(`${this.authUrl}/accessToken`, {
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
      throw new Error(`LinkedIn token exchange failed: ${error}`);
    }

    return await response.json() as LinkedInTokenResponse;
  }

  /**
   * Get LinkedIn profile data using access token
   */
  async getProfile(accessToken: string): Promise<LinkedInProfileResponse> {
    const response = await fetch(`${this.baseUrl}/people/~:(id,firstName,lastName,headline,summary,industry,location,profilePicture(displayImage~:playableStreams))`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LinkedIn profile fetch failed: ${error}`);
    }

    return await response.json() as LinkedInProfileResponse;
  }

  /**
   * Get cached access token or refresh if needed
   */
  async getCachedToken(): Promise<string | null> {
    try {
      const cached = await this.env.CACHE.get('linkedin_access_token');
      if (!cached) return null;

      const tokenData = JSON.parse(cached);
      const now = Date.now();

      // Check if token is expired (with 5 minute buffer)
      if (tokenData.expires_at && now > (tokenData.expires_at - 300000)) {
        await this.env.CACHE.delete('linkedin_access_token');
        return null;
      }

      return tokenData.access_token;
    } catch (error) {
      console.error('Error getting cached LinkedIn token:', error);
      return null;
    }
  }

  /**
   * Cache access token with expiration
   */
  async cacheToken(tokenResponse: LinkedInTokenResponse): Promise<void> {
    try {
      const tokenData = {
        access_token: tokenResponse.access_token,
        expires_at: Date.now() + (tokenResponse.expires_in * 1000),
        scope: tokenResponse.scope,
        token_type: tokenResponse.token_type
      };

      await this.env.CACHE.put('linkedin_access_token', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Error caching LinkedIn token:', error);
    }
  }

  /**
   * Transform LinkedIn API response to our internal format
   */
  transformProfileData(linkedinProfile: LinkedInProfileResponse): any {
    const getLocalizedString = (localized: any) => {
      if (!localized?.localized) return '';
      const locale = localized.preferredLocale || { language: 'en', country: 'US' };
      const key = `${locale.language}_${locale.country}`;
      return localized.localized[key] || Object.values(localized.localized)[0] || '';
    };

    return {
      firstName: getLocalizedString(linkedinProfile.firstName),
      lastName: getLocalizedString(linkedinProfile.lastName),
      headline: linkedinProfile.headline ? getLocalizedString(linkedinProfile.headline) : '',
      summary: linkedinProfile.summary || '',
      location: linkedinProfile.location?.name || '',
      industry: linkedinProfile.industry || '',
      profilePicture: linkedinProfile.profilePicture?.displayImage || this.env.PROFILE_PHOTO_URL,
      // Note: LinkedIn API v2 has limited access to experience/education data
      // These would need additional API calls and permissions
      experience: [],
      education: [],
      skills: [],
      certifications: []
    };
  }

  /**
   * Handle OAuth callback and return profile data
   */
  async handleOAuthCallback(code: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Exchange code for access token
      const tokenResponse = await this.getAccessToken(code);
      
      // Cache the token
      await this.cacheToken(tokenResponse);
      
      // Get profile data
      const profileResponse = await this.getProfile(tokenResponse.access_token);
      
      // Transform to our format
      const profileData = this.transformProfileData(profileResponse);
      
      return { success: true, data: profileData };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown OAuth error' 
      };
    }
  }

  /**
   * Check if LinkedIn OAuth is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }
}
