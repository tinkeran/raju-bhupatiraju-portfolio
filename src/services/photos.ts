import { Env, PhotoAlbum, Photo, ApiResponse } from '../types';

export class PhotosService {
  private env: Env;
  private cacheKey = 'bird_photography_album';
  private cacheExpiry = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

  constructor(env: Env) {
    this.env = env;
  }

  async getBirdPhotographyAlbum(): Promise<ApiResponse<PhotoAlbum>> {
    try {
      // Try to get cached data first
      const cached = await this.getCachedAlbum();
      if (cached) {
        return {
          success: true,
          data: cached,
          cached: true,
          cacheExpiry: new Date(Date.now() + this.cacheExpiry).toISOString()
        };
      }

      // If no API credentials available, return static fallback data
      if (!this.env.GOOGLE_PHOTOS_API_KEY || !this.env.GOOGLE_PHOTOS_CLIENT_ID) {
        const staticAlbum = this.getStaticAlbum();
        await this.cacheAlbum(staticAlbum);
        return {
          success: true,
          data: staticAlbum,
          cached: false
        };
      }

      // TODO: Implement actual Google Photos API integration
      // For now, return static data
      const album = this.getStaticAlbum();
      await this.cacheAlbum(album);

      return {
        success: true,
        data: album,
        cached: false
      };
    } catch (error) {
      console.error('Photos service error:', error);
      return {
        success: false,
        error: 'Failed to fetch bird photography album'
      };
    }
  }

  private async getCachedAlbum(): Promise<PhotoAlbum | null> {
    try {
      const cached = await this.env.CACHE.get(this.cacheKey);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();
      
      if (data.expiry && now > data.expiry) {
        await this.env.CACHE.delete(this.cacheKey);
        return null;
      }

      return data.album;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  private async cacheAlbum(album: PhotoAlbum): Promise<void> {
    try {
      const cacheData = {
        album,
        expiry: Date.now() + this.cacheExpiry
      };
      
      await this.env.CACHE.put(this.cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  private getStaticAlbum(): PhotoAlbum {
    return {
      id: "bird-photography-2024",
      title: "Bird Photography Collection",
      description: "A curated collection of bird photography showcasing the beauty and diversity of avian life captured in their natural habitats.",
      coverPhotoUrl: "/assets/images/birds/cover-bird.jpg",
      mediaItemsCount: 12,
      photos: [
        {
          id: "bird-001",
          filename: "cardinal-winter.jpg",
          description: "Northern Cardinal perched on a snow-covered branch during winter",
          baseUrl: "/assets/images/birds/cardinal-winter.jpg",
          thumbnailUrl: "/assets/images/birds/thumbs/cardinal-winter-thumb.jpg",
          width: 1920,
          height: 1280,
          creationTime: "2024-01-15T08:30:00Z",
          metadata: {
            camera: "Canon EOS R5",
            lens: "Canon RF 100-500mm f/4.5-7.1L IS USM",
            focalLength: "400mm",
            aperture: "f/5.6",
            iso: "800",
            shutterSpeed: "1/500s",
            captureTime: "2024-01-15T08:30:00Z"
          }
        },
        {
          id: "bird-002",
          filename: "blue-jay-flight.jpg",
          description: "Blue Jay captured mid-flight with wings spread wide",
          baseUrl: "/assets/images/birds/blue-jay-flight.jpg",
          thumbnailUrl: "/assets/images/birds/thumbs/blue-jay-flight-thumb.jpg",
          width: 1920,
          height: 1280,
          creationTime: "2024-02-03T14:45:00Z",
          metadata: {
            camera: "Canon EOS R5",
            lens: "Canon RF 100-500mm f/4.5-7.1L IS USM",
            focalLength: "500mm",
            aperture: "f/7.1",
            iso: "1600",
            shutterSpeed: "1/1000s",
            captureTime: "2024-02-03T14:45:00Z"
          }
        },
        {
          id: "bird-003",
          filename: "red-tailed-hawk.jpg",
          description: "Majestic Red-tailed Hawk soaring against a clear blue sky",
          baseUrl: "/assets/images/birds/red-tailed-hawk.jpg",
          thumbnailUrl: "/assets/images/birds/thumbs/red-tailed-hawk-thumb.jpg",
          width: 1920,
          height: 1280,
          creationTime: "2024-03-12T11:20:00Z",
          metadata: {
            camera: "Canon EOS R5",
            lens: "Canon RF 100-500mm f/4.5-7.1L IS USM",
            focalLength: "500mm",
            aperture: "f/6.3",
            iso: "400",
            shutterSpeed: "1/800s",
            captureTime: "2024-03-12T11:20:00Z"
          }
        },
        {
          id: "bird-004",
          filename: "goldfinch-thistle.jpg",
          description: "American Goldfinch feeding on thistle seeds in summer plumage",
          baseUrl: "/assets/images/birds/goldfinch-thistle.jpg",
          thumbnailUrl: "/assets/images/birds/thumbs/goldfinch-thistle-thumb.jpg",
          width: 1920,
          height: 1280,
          creationTime: "2024-06-08T16:15:00Z",
          metadata: {
            camera: "Canon EOS R5",
            lens: "Canon RF 100-500mm f/4.5-7.1L IS USM",
            focalLength: "350mm",
            aperture: "f/5.6",
            iso: "640",
            shutterSpeed: "1/640s",
            captureTime: "2024-06-08T16:15:00Z"
          }
        },
        {
          id: "bird-005",
          filename: "great-blue-heron.jpg",
          description: "Great Blue Heron standing motionless in shallow water",
          baseUrl: "/assets/images/birds/great-blue-heron.jpg",
          thumbnailUrl: "/assets/images/birds/thumbs/great-blue-heron-thumb.jpg",
          width: 1920,
          height: 1280,
          creationTime: "2024-04-22T07:45:00Z",
          metadata: {
            camera: "Canon EOS R5",
            lens: "Canon RF 100-500mm f/4.5-7.1L IS USM",
            focalLength: "450mm",
            aperture: "f/6.3",
            iso: "320",
            shutterSpeed: "1/400s",
            captureTime: "2024-04-22T07:45:00Z"
          }
        },
        {
          id: "bird-006",
          filename: "ruby-throated-hummingbird.jpg",
          description: "Ruby-throated Hummingbird hovering near red flowers",
          baseUrl: "/assets/images/birds/ruby-throated-hummingbird.jpg",
          thumbnailUrl: "/assets/images/birds/thumbs/ruby-throated-hummingbird-thumb.jpg",
          width: 1920,
          height: 1280,
          creationTime: "2024-07-14T09:30:00Z",
          metadata: {
            camera: "Canon EOS R5",
            lens: "Canon RF 100-500mm f/4.5-7.1L IS USM",
            focalLength: "300mm",
            aperture: "f/5.6",
            iso: "1000",
            shutterSpeed: "1/1250s",
            captureTime: "2024-07-14T09:30:00Z"
          }
        }
      ]
    };
  }
}
