// Environment bindings
export interface Env {
  CACHE: KVNamespace;
  ENVIRONMENT: string;
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
  SITE_URL?: string;
  LINKEDIN_PROFILE: string;
  PROFILE_PHOTO_URL: string;
  // Optional: URL to a JSON file that contains accurate resume/profile data
  // Example: https://raw.githubusercontent.com/<user>/<repo>/main/data/profile.json
  PROFILE_JSON_URL?: string;
  // LinkedIn OAuth (optional)
  LINKEDIN_CLIENT_ID?: string;
  LINKEDIN_CLIENT_SECRET?: string;
  LINKEDIN_REDIRECT_URI?: string;
  
  // Google Photos OAuth (deprecated - using GitHub photos instead)
  GOOGLE_PHOTOS_CLIENT_ID?: string;
  GOOGLE_PHOTOS_CLIENT_SECRET?: string;
  GOOGLE_PHOTOS_REDIRECT_URI?: string;
  GOOGLE_PHOTOS_ALBUM_URL?: string;
  GOOGLE_PHOTOS_API_KEY?: string;
  
  // GitHub Photos Configuration
  GITHUB_USERNAME?: string;
  GITHUB_PHOTOS_REPO?: string;
  GITHUB_PHOTOS_PATH?: string;
  GITHUB_PHOTOS_METADATA_PATH?: string;
  
  // KV Storage
  PORTFOLIO_KV?: KVNamespace;
  // Legacy LinkedIn API (deprecated in favor of OAuth)
  LINKEDIN_API_KEY?: string;
}

// LinkedIn Profile Data
export interface LinkedInProfile {
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  location: string;
  industry: string;
  profilePicture?: string;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
  certifications: LinkedInCertification[];
}

export interface LinkedInExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

export interface LinkedInEducation {
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear?: string;
  description?: string;
}

export interface LinkedInCertification {
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

// Google Photos Data
export interface PhotoAlbum {
  id: string;
  title: string;
  description?: string;
  coverPhotoUrl?: string;
  mediaItemsCount: number;
  photos: Photo[];
}

export interface Photo {
  id: string;
  filename: string;
  description?: string;
  baseUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  creationTime: string;
  location?: PhotoLocation;
  metadata?: PhotoMetadata;
}

export interface PhotoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface PhotoMetadata {
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  iso?: string;
  shutterSpeed?: string;
  captureTime?: string;
}

// Application Projects
export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  githubUrl?: string;
  technologies: string[];
  status: 'live' | 'development' | 'coming-soon';
  screenshots: string[];
  features: string[];
  launchDate?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  cacheExpiry?: string;
  source?: 'linkedin_oauth' | 'github_json' | 'static_fallback';
}

// Contact Form
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}
