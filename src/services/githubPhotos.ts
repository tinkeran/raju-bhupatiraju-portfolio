import { Env } from '../types';

export interface GitHubPhoto {
  id: string;
  name: string;
  url: string;
  downloadUrl: string;
  size: number;
  sha: string;
}

export interface PhotoMetadata {
  id: string;
  filename: string;
  title: string;
  description: string;
  camera?: string;
  lens?: string;
  settings?: string;
  location?: string;
  date?: string;
  tags?: string[];
}

export interface ProcessedPhoto {
  id: string;
  baseUrl: string;
  filename: string;
  title: string;
  description: string;
  metadata: {
    camera?: string;
    lens?: string;
    settings?: string;
    location?: string;
    date?: string;
    tags?: string[];
    size: number;
  };
}

export class GitHubPhotosService {
  private env: Env;
  private cacheKey = 'github_photos_cache';
  private cacheExpiry = 3600; // 1 hour

  constructor(env: Env) {
    this.env = env;
  }

  async getPhotos(): Promise<{ success: boolean; data?: ProcessedPhoto[]; error?: string }> {
    try {
      // Try to get from cache first
      const cached = await this.getCachedPhotos();
      if (cached) {
        console.log('Returning cached GitHub photos:', cached.length, 'items');
        return { success: true, data: cached };
      }

      console.log('Fetching photos from GitHub...');
      
      // Get photos from GitHub repository
      const photos = await this.fetchPhotosFromGitHub();
      
      if (!photos || photos.length === 0) {
        console.log('No photos found in GitHub repository, using fallback');
        return this.getFallbackPhotos();
      }

      console.log('Found', photos.length, 'photos in GitHub repository');
      
      // Load metadata if available
      const metadata = await this.loadPhotoMetadata();
      
      // Process photos with metadata
      const processedPhotos = this.processPhotos(photos, metadata);
      
      // Cache the results
      await this.cachePhotos(processedPhotos);
      
      return { success: true, data: processedPhotos };
    } catch (error) {
      console.error('Error fetching GitHub photos:', error);
      console.log('Falling back to sample photos due to error');
      return this.getFallbackPhotos();
    }
  }

  private async fetchPhotosFromGitHub(): Promise<GitHubPhoto[]> {
    const githubUser = this.env.GITHUB_USERNAME || 'tinkeran';
    const githubRepo = this.env.GITHUB_PHOTOS_REPO || 'raju-bhupatiraju-portfolio';
    const photosPath = this.env.GITHUB_PHOTOS_PATH || 'public/photos';
    
    const apiUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${photosPath}`;
    
    console.log('Fetching from GitHub API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Website'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('GitHub photos directory not found, user needs to create it');
        return [];
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const files = await response.json() as any[];
    
    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const photoFiles = files.filter((file: any) => 
      file.type === 'file' && 
      imageExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    return photoFiles.map((file: any) => ({
      id: file.sha,
      name: file.name,
      url: file.html_url,
      downloadUrl: file.download_url,
      size: file.size,
      sha: file.sha
    }));
  }

  private async loadPhotoMetadata(): Promise<PhotoMetadata[]> {
    try {
      const githubUser = this.env.GITHUB_USERNAME || 'tinkeran';
      const githubRepo = this.env.GITHUB_PHOTOS_REPO || 'raju-bhupatiraju-portfolio';
      const metadataPath = this.env.GITHUB_PHOTOS_METADATA_PATH || 'data/photos-metadata.json';
      
      const metadataUrl = `https://raw.githubusercontent.com/${githubUser}/${githubRepo}/main/${metadataPath}`;
      
      console.log('Fetching photo metadata from:', metadataUrl);
      
      const response = await fetch(metadataUrl);
      
      if (!response.ok) {
        console.log('Photo metadata file not found, using default metadata');
        return [];
      }
      
      const metadata = await response.json();
      return Array.isArray(metadata) ? metadata : [];
    } catch (error) {
      console.error('Error loading photo metadata:', error);
      return [];
    }
  }

  private processPhotos(photos: GitHubPhoto[], metadata: PhotoMetadata[]): ProcessedPhoto[] {
    return photos.map((photo, index) => {
      // Find metadata for this photo
      const photoMetadata = metadata.find(m => 
        m.filename === photo.name || m.id === photo.sha
      );
      
      // Generate title from filename if no metadata
      const defaultTitle = photo.name
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[-_]/g, ' ')    // Replace dashes/underscores with spaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Title case
      
      return {
        id: photo.sha,
        baseUrl: photo.downloadUrl,
        filename: photo.name,
        title: photoMetadata?.title || defaultTitle,
        description: photoMetadata?.description || `Beautiful bird photography captured in stunning detail.`,
        metadata: {
          camera: photoMetadata?.camera,
          lens: photoMetadata?.lens,
          settings: photoMetadata?.settings,
          location: photoMetadata?.location,
          date: photoMetadata?.date,
          tags: photoMetadata?.tags,
          size: photo.size
        }
      };
    });
  }

  private async getCachedPhotos(): Promise<ProcessedPhoto[] | null> {
    if (!this.env.PORTFOLIO_KV) return null;
    
    try {
      const cached = await this.env.PORTFOLIO_KV.get(this.cacheKey);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Math.floor(Date.now() / 1000);
      
      if (now - timestamp > this.cacheExpiry) {
        return null; // Cache expired
      }
      
      return data;
    } catch {
      return null;
    }
  }

  private async cachePhotos(photos: ProcessedPhoto[]): Promise<void> {
    if (!this.env.PORTFOLIO_KV) return;
    
    try {
      const cacheData = {
        data: photos,
        timestamp: Math.floor(Date.now() / 1000),
      };
      
      await this.env.PORTFOLIO_KV.put(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching GitHub photos:', error);
    }
  }

  private getFallbackPhotos(): { success: boolean; data: ProcessedPhoto[] } {
    // High-quality bird photography fallback
    const fallbackPhotos: ProcessedPhoto[] = [
      {
        id: 'fallback-1',
        baseUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797',
        filename: 'cardinal-winter.jpg',
        title: 'Northern Cardinal in Winter',
        description: 'A vibrant male cardinal perched on a snow-covered branch during the early morning hours.',
        metadata: {
          camera: 'Canon EOS R5',
          lens: '400mm f/5.6',
          settings: 'f/5.6, 1/500s, ISO 800',
          location: 'Central Park, New York',
          date: '2024-01-15',
          tags: ['cardinal', 'winter', 'snow'],
          size: 2048000
        }
      },
      {
        id: 'fallback-2',
        baseUrl: 'https://images.unsplash.com/photo-1551731409-43eb3e517a1a',
        filename: 'hummingbird-flight.jpg',
        title: 'Ruby-throated Hummingbird',
        description: 'Captured mid-flight as this tiny jewel hovers near a feeder, wings beating at incredible speed.',
        metadata: {
          camera: 'Nikon D850',
          lens: '600mm f/4',
          settings: 'f/4.0, 1/2000s, ISO 1600',
          location: 'Backyard Garden, Connecticut',
          date: '2024-02-20',
          tags: ['hummingbird', 'flight', 'action'],
          size: 1856000
        }
      },
      {
        id: 'fallback-3',
        baseUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176',
        filename: 'eagle-portrait.jpg',
        title: 'Bald Eagle Portrait',
        description: 'A majestic bald eagle showcasing the intense gaze and detailed feather patterns.',
        metadata: {
          camera: 'Sony A7R IV',
          lens: '800mm f/6.3',
          settings: 'f/6.3, 1/1000s, ISO 400',
          location: 'Alaska Wildlife Reserve',
          date: '2024-03-10',
          tags: ['eagle', 'portrait', 'majestic'],
          size: 2304000
        }
      },
      {
        id: 'fallback-4',
        baseUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19',
        filename: 'owl-closeup.jpg',
        title: 'Great Horned Owl',
        description: 'An intimate portrait of a great horned owl, highlighting the piercing yellow eyes.',
        metadata: {
          camera: 'Canon EOS R6',
          lens: '500mm f/4.5',
          settings: 'f/4.5, 1/800s, ISO 1000',
          location: 'Pacific Northwest Forest',
          date: '2024-04-05',
          tags: ['owl', 'eyes', 'nocturnal'],
          size: 1920000
        }
      },
      {
        id: 'fallback-5',
        baseUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7',
        filename: 'kingfisher-dive.jpg',
        title: 'Kingfisher Diving',
        description: 'Perfect timing captures a belted kingfisher just as it dives toward the water.',
        metadata: {
          camera: 'Nikon Z9',
          lens: '600mm f/5.6',
          settings: 'f/5.6, 1/1600s, ISO 640',
          location: 'Lake Tahoe, California',
          date: '2024-05-12',
          tags: ['kingfisher', 'diving', 'action'],
          size: 2176000
        }
      },
      {
        id: 'fallback-6',
        baseUrl: 'https://images.unsplash.com/photo-1574781330855-d0db2706b3d0',
        filename: 'peacock-display.jpg',
        title: 'Peacock Display',
        description: 'A stunning male peacock in full display, showing off the iridescent eye-spots.',
        metadata: {
          camera: 'Sony A1',
          lens: '300mm f/2.8',
          settings: 'f/2.8, 1/250s, ISO 200',
          location: 'Botanical Gardens, San Diego',
          date: '2024-06-18',
          tags: ['peacock', 'display', 'colorful'],
          size: 2432000
        }
      }
    ];

    return { success: true, data: fallbackPhotos };
  }

  async clearCache(): Promise<void> {
    if (!this.env.PORTFOLIO_KV) return;
    
    try {
      await this.env.PORTFOLIO_KV.delete(this.cacheKey);
    } catch (error) {
      console.error('Error clearing GitHub photos cache:', error);
    }
  }
}
