import { Env, LinkedInProfile, ApiResponse } from '../types';
import { LinkedInOAuthService } from './linkedinOAuth';

export class LinkedInService {
  private env: Env;
  private oauthService: LinkedInOAuthService;
  private cacheKey = 'linkedin_profile_data';
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(env: Env) {
    this.env = env;
    this.oauthService = new LinkedInOAuthService(env);
  }

  async getProfile(): Promise<ApiResponse<LinkedInProfile>> {
    try {
      // TEMPORARILY DISABLE CACHE TO FORCE FRESH DATA
      // const cached = await this.getCachedProfile();
      // if (cached) {
      //   return {
      //     success: true,
      //     data: cached,
      //     cached: true,
      //     cacheExpiry: new Date(Date.now() + this.cacheExpiry).toISOString()
      //   };
      // }

      // Priority 1: Try LinkedIn OAuth API if configured
      if (this.oauthService.isConfigured()) {
        try {
          const accessToken = await this.oauthService.getCachedToken();
          if (accessToken) {
            console.log('LinkedIn OAuth: Using cached access token');
            const linkedinProfile = await this.oauthService.getProfile(accessToken);
            const transformedProfile = this.oauthService.transformProfileData(linkedinProfile);
            
            // Merge with static data for missing fields (experience, education, etc.)
            const staticProfile = this.getStaticProfile();
            const mergedProfile = {
              ...staticProfile,
              ...transformedProfile,
              // Ensure we have all required fields
              experience: transformedProfile.experience.length > 0 ? transformedProfile.experience : staticProfile.experience,
              education: transformedProfile.education.length > 0 ? transformedProfile.education : staticProfile.education,
              skills: transformedProfile.skills.length > 0 ? transformedProfile.skills : staticProfile.skills,
              certifications: transformedProfile.certifications.length > 0 ? transformedProfile.certifications : staticProfile.certifications
            };

            await this.cacheProfile(mergedProfile);
            return { success: true, data: mergedProfile, cached: false, source: 'linkedin_oauth' };
          } else {
            console.log('LinkedIn OAuth: No cached token available, user needs to authenticate');
          }
        } catch (error) {
          console.warn('LinkedIn OAuth API failed:', error);
        }
      }

      // Priority 2: Try PROFILE_JSON_URL if configured
      if (this.env.PROFILE_JSON_URL) {
        try {
          console.log('Fetching profile from:', this.env.PROFILE_JSON_URL);
          const resp = await fetch(this.env.PROFILE_JSON_URL, {
            headers: { 
              'accept': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
          });
          console.log('GitHub fetch response status:', resp.status);
          if (resp.ok) {
            const remote = (await resp.json()) as LinkedInProfile;
            console.log('Successfully loaded profile from GitHub, first experience start date:', remote.experience?.[0]?.startDate);
            // Ensure profile photo fallback is applied if missing
            if (!remote.profilePicture) {
              remote.profilePicture = this.env.PROFILE_PHOTO_URL;
            }
            await this.cacheProfile(remote);
            return { success: true, data: remote, cached: false, source: 'github_json' };
          } else {
            console.warn('PROFILE_JSON_URL fetch failed with status', resp.status);
          }
        } catch (e) {
          console.warn('Failed loading PROFILE_JSON_URL, falling back to static profile', e);
        }
      } else {
        console.log('PROFILE_JSON_URL not configured, using static profile');
      }

      // Priority 3: Fallback to static data
      const staticProfile = this.getStaticProfile();
      await this.cacheProfile(staticProfile);
      return {
        success: true,
        data: staticProfile,
        cached: false,
        source: 'static_fallback'
      };

    } catch (error) {
      console.error('LinkedIn service error:', error);
      return {
        success: false,
        error: 'Failed to fetch LinkedIn profile'
      };
    }
  }

  /**
   * Get LinkedIn OAuth authorization URL for user authentication
   */
  getAuthorizationUrl(): string | null {
    if (!this.oauthService.isConfigured()) {
      return null;
    }
    return this.oauthService.getAuthorizationUrl();
  }

  /**
   * Handle OAuth callback and exchange code for access token
   */
  async handleOAuthCallback(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.oauthService.isConfigured()) {
        return { success: false, error: 'LinkedIn OAuth not configured' };
      }

      const tokenResponse = await this.oauthService.getAccessToken(code);
      await this.oauthService.cacheToken(tokenResponse);
      
      // Clear cached profile data to force refresh with new token
      await this.env.CACHE.delete(this.cacheKey);
      
      return { success: true };
    } catch (error) {
      console.error('LinkedIn OAuth callback error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'OAuth callback failed' };
    }
  }

  private async getCachedProfile(): Promise<LinkedInProfile | null> {
    try {
      const cached = await this.env.CACHE.get(this.cacheKey);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();
      
      if (data.expiry && now > data.expiry) {
        await this.env.CACHE.delete(this.cacheKey);
        return null;
      }

      return data.profile;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  private async cacheProfile(profile: LinkedInProfile): Promise<void> {
    try {
      const cacheData = {
        profile,
        expiry: Date.now() + this.cacheExpiry
      };
      
      await this.env.CACHE.put(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  private getStaticProfile(): LinkedInProfile {
    return {
      firstName: "Raju",
      lastName: "Bhupatiraju",
      headline: "Enterprise Applications Leader | Digital Transformation Expert | Technology Strategist",
      summary: "Seasoned Enterprise Applications Leader with extensive experience in driving digital transformation initiatives, leading cross-functional teams, and delivering scalable technology solutions. Passionate about leveraging cutting-edge technologies to solve complex business challenges and optimize operational efficiency.",
      location: "United States",
      industry: "Information Technology & Services",
      profilePicture: this.env.PROFILE_PHOTO_URL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      experience: [
        {
          title: "Senior Director, Enterprise Applications",
          company: "Fortune 500 Technology Company",
          location: "United States",
          startDate: "2020-01",
          endDate: undefined,
          description: "Leading enterprise-wide application strategy and digital transformation initiatives. Managing a team of 50+ engineers and architects across multiple product lines. Driving adoption of cloud-native technologies and modern development practices.",
          current: true
        },
        {
          title: "Director, Application Development",
          company: "Global Technology Solutions",
          location: "United States",
          startDate: "2017-03",
          endDate: "2019-12",
          description: "Directed application development lifecycle for mission-critical enterprise systems. Implemented DevOps practices and CI/CD pipelines, resulting in 40% faster deployment cycles and improved system reliability.",
          current: false
        },
        {
          title: "Senior Manager, Software Engineering",
          company: "Enterprise Software Corp",
          location: "United States",
          startDate: "2014-06",
          endDate: "2017-02",
          description: "Managed software engineering teams developing scalable web applications and microservices. Led migration from monolithic to microservices architecture, improving system scalability and maintainability.",
          current: false
        }
      ],
      education: [
        {
          school: "University of Technology",
          degree: "Master of Science",
          field: "Computer Science",
          startYear: "2010",
          endYear: "2012",
          description: "Specialized in distributed systems and software architecture"
        },
        {
          school: "Engineering Institute",
          degree: "Bachelor of Technology",
          field: "Information Technology",
          startYear: "2006",
          endYear: "2010",
          description: "Foundation in computer science and software engineering principles"
        }
      ],
      skills: [
        "Enterprise Architecture",
        "Digital Transformation",
        "Cloud Computing",
        "Microservices",
        "DevOps",
        "Agile Methodologies",
        "Team Leadership",
        "Strategic Planning",
        "Software Development",
        "System Integration",
        "Project Management",
        "Technology Strategy"
      ],
      certifications: [
        {
          name: "AWS Certified Solutions Architect",
          issuer: "Amazon Web Services",
          issueDate: "2023-06",
          expirationDate: "2026-06",
          credentialId: "AWS-SA-2023-001"
        },
        {
          name: "Certified Scrum Master",
          issuer: "Scrum Alliance",
          issueDate: "2022-03",
          expirationDate: "2024-03",
          credentialId: "CSM-2022-001"
        }
      ]
    };
  }
}
