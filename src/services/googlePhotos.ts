import { Env } from '../types';
import { GitHubPhotosService, ProcessedPhoto } from './githubPhotos';

export interface Photo {
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
  };
}

export class GooglePhotosService {
  private env: Env;
  private githubPhotosService: GitHubPhotosService;

  constructor(env: Env) {
    this.env = env;
    this.githubPhotosService = new GitHubPhotosService(env);
  }

  async getPhotos(): Promise<{ success: boolean; data?: Photo[]; error?: string }> {
    try {
      console.log('Fetching photos from GitHub...');
      
      // Use GitHub photos service
      const result = await this.githubPhotosService.getPhotos();
      
      if (!result.success || !result.data) {
        return { success: false, error: result.error || 'Failed to fetch photos' };
      }

      // Convert ProcessedPhoto to Photo format
      const photos: Photo[] = result.data.map(photo => ({
        id: photo.id,
        baseUrl: photo.baseUrl,
        filename: photo.filename,
        title: photo.title,
        description: photo.description,
        metadata: {
          camera: photo.metadata.camera,
          lens: photo.metadata.lens,
          settings: photo.metadata.settings,
          location: photo.metadata.location,
          date: photo.metadata.date,
          tags: photo.metadata.tags
        }
      }));

      return { success: true, data: photos };
    } catch (error) {
      console.error('Error fetching photos:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async clearCache(): Promise<void> {
    await this.githubPhotosService.clearCache();
  }
}
