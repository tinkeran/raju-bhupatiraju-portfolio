import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import { LinkedInService } from './services/linkedin';
import { LinkedInOAuthService } from './services/linkedinOAuth';
import { GooglePhotosService } from './services/googlePhotos';
import { GooglePhotosOAuthService } from './services/googlePhotosOAuth';
import { ProjectsService } from './services/projects';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'raju-bhupatiraju-portfolio'
  });
});

// API endpoints for photo likes
app.get('/api/likes/:photoId', async (c) => {
  try {
    const photoId = c.req.param('photoId');
    const likeCount = await c.env.CACHE.get(`photo-likes-${photoId}`);
    return c.json({ 
      photoId, 
      likes: parseInt(likeCount || '0') 
    });
  } catch (error) {
    return c.json({ error: 'Failed to get like count' }, 500);
  }
});

app.post('/api/likes/:photoId', async (c) => {
  try {
    const photoId = c.req.param('photoId');
    const currentLikes = await c.env.CACHE.get(`photo-likes-${photoId}`);
    const newLikes = parseInt(currentLikes || '0') + 1;
    
    await c.env.CACHE.put(`photo-likes-${photoId}`, newLikes.toString());
    
    return c.json({ 
      photoId, 
      likes: newLikes 
    });
  } catch (error) {
    return c.json({ error: 'Failed to update like count' }, 500);
  }
});

app.get('/api/likes', async (c) => {
  try {
    // Get all like counts for all photos
    const photoLikes: Record<string, number> = {};
    
    // Since KV doesn't support listing by prefix easily, we'll try common photo IDs
    for (let i = 0; i < 20; i++) { // Assuming max 20 photos
      const likeCount = await c.env.CACHE.get(`photo-likes-${i}`);
      if (likeCount) {
        photoLikes[i.toString()] = parseInt(likeCount);
      }
    }
    
    return c.json(photoLikes);
  } catch (error) {
    return c.json({ error: 'Failed to get all like counts' }, 500);
  }
});

// Homepage
app.get('/', (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${c.env?.SITE_NAME || 'Raju Bhupatiraju - Portfolio'}</title>
    <meta name="description" content="${c.env?.SITE_DESCRIPTION || 'Enterprise Applications Leader & Bird Photography Enthusiast'}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👑</text></svg>">
    <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👑</text></svg>">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- AOS Animation Library -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary-color: #1e3a8a;
            --secondary-color: #3b82f6;
            --accent-color: #f59e0b;
            --text-dark: #1f2937;
            --text-light: #6b7280;
            --bg-light: #f8fafc;
            --gradient-primary: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            --gradient-accent: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--text-dark);
            overflow-x: hidden;
        }
        
        .font-display {
            font-family: 'Playfair Display', serif;
        }
        
        /* Navigation */
        .navbar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        
        .navbar-brand {
            font-weight: 700;
            font-size: 1.5rem;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .nav-link {
            font-weight: 500;
            color: var(--text-dark) !important;
            transition: color 0.3s ease;
            position: relative;
        }
        
        .nav-link:hover {
            color: var(--primary-color) !important;
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -5px;
            left: 50%;
            background: var(--gradient-primary);
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }
        
        .nav-link:hover::after {
            width: 100%;
        }
        
        /* Hero Section */
        .hero {
            min-height: 100vh;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="100" fill="url(%23a)"/><circle cx="800" cy="300" r="150" fill="url(%23a)"/><circle cx="400" cy="700" r="80" fill="url(%23a)"/><circle cx="900" cy="800" r="120" fill="url(%23a)"/></svg>');
            opacity: 0.3;
        }
        
        .hero-content {
            position: relative;
            z-index: 2;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            font-weight: 700;
            color: white;
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }
        
        .hero .lead {
            font-size: 1.3rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 2rem;
        }
        
        .btn-primary-custom {
            background: var(--gradient-accent);
            border: none;
            padding: 12px 30px;
            font-weight: 600;
            border-radius: 50px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .btn-primary-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
        }
        
        .btn-outline-custom {
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 30px;
            font-weight: 600;
            border-radius: 50px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .btn-outline-custom:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: white;
            color: white;
            transform: translateY(-2px);
        }
        
        /* Profile Image */
        .profile-image {
            width: 300px;
            height: 300px;
            border-radius: 50%;
            object-fit: cover;
            object-position: center top;
            border: 8px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        }
        
        .profile-image:hover {
            transform: scale(1.05);
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }
        
        /* Section Styling */
        .section {
            padding: 100px 0;
        }
        
        .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 3rem;
            position: relative;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 4px;
            background: var(--gradient-primary);
            border-radius: 2px;
        }
        
        /* Cards */
        .card-custom {
            border: none;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        .card-custom:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        /* Stats */
        .stats {
            background: var(--bg-light);
        }
        
        .stat-item {
            text-align: center;
            padding: 2rem;
        }
        
        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: block;
        }
        
        .stat-label {
            font-size: 1.1rem;
            color: var(--text-light);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        /* Footer */
        .footer {
            background: var(--text-dark);
            color: white;
            padding: 3rem 0;
        }
        
        .social-links a {
            display: inline-block;
            width: 50px;
            height: 50px;
            background: var(--gradient-primary);
            color: white;
            text-align: center;
            line-height: 50px;
            border-radius: 50%;
            margin: 0 10px;
            transition: all 0.3s ease;
            font-size: 1.2rem;
        }
        
        .social-links a:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4);
            color: white;
            text-decoration: none;
        }
        
        /* Animations */
        .fade-in-up {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .fade-in-up.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .hero .lead {
                font-size: 1.1rem;
            }
            
            .profile-image {
                width: 250px;
                height: 250px;
            }
            
            .section {
                padding: 60px 0;
            }
            
            .section-title {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container">
            <a class="navbar-brand font-display" href="#home">Raju Bhupatiraju</a>
            
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#home">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#about">About</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/resume">Resume</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/photography">Photography</a>
                    </li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="projectsDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Tinker Projects
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="projectsDropdown">
                            <li><a class="dropdown-item" href="https://remindme.studior.cc" target="_blank">RemindMe</a></li>
                            <li><a class="dropdown-item text-muted" href="#" onclick="return false;" style="cursor: default;">Coming Soon</a></li>
                        </ul>
                    </li>

                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6 hero-content" data-aos="fade-right">
                    <h1 class="font-display">Business Technology Leader</h1>
                    <p class="lead">Driving digital transformation through innovative technology solutions and passionate about capturing the beauty of nature through bird photography.</p>
                    <div class="mt-4">
                        <a href="/resume" class="btn btn-primary-custom me-3">View Resume</a>
                        <a href="/photography" class="btn btn-outline-custom">See Photography</a>
                    </div>
                </div>
                <div class="col-lg-6 text-center" data-aos="fade-left">
                    <img src="${c.env?.PROFILE_PHOTO_URL || 'https://via.placeholder.com/300x300/1e3a8a/ffffff?text=RB'}" alt="Raju Bhupatiraju" class="profile-image" onerror="this.src='https://via.placeholder.com/300x300/1e3a8a/ffffff?text=RB'">
                </div>
            </div>
        </div>
    </section>



    <!-- About Section -->
    <section id="about" class="section">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto text-center">
                    <h2 class="section-title font-display" data-aos="fade-up">About Me</h2>
                    <p class="lead" data-aos="fade-up" data-aos-delay="100">
                        Relentlessly curious and outcome-obsessed, I lead Business Technology transformations that challenge limits and deliver scalable impact. I turn complex problems into elegant solutions—and when I'm off the clock, I'm out in the wild with my camera, chasing the beauty of bird life.
                    </p>
                    <p data-aos="fade-up" data-aos-delay="200">
                        My professional journey spans over 20 years in technology leadership, where I've had the privilege 
                        of leading cross-functional teams, implementing cutting-edge solutions, and mentoring the next 
                        generation of technology professionals. My hobby in bird photography has taught me patience, 
                        attention to detail, and the importance of being present in the moment—qualities that translate 
                        beautifully into my professional work.
                    </p>
                </div>
            </div>
        </div>
    </section>



    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="col-md-6">
                    <h5 class="font-display">Raju Bhupatiraju</h5>
                    <p class="mb-0">Business Technology Leader & Bird Photography Enthusiast</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <div class="social-links">
                        <a href="${c.env?.LINKEDIN_PROFILE || 'https://www.linkedin.com/in/bhupatiraju/'}" target="_blank">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                        <a href="https://github.com/tinkeran" target="_blank">
                            <i class="fab fa-github"></i>
                        </a>
                    </div>
                </div>
            </div>
            <hr class="my-4">
            <div class="row">
                <div class="col-12 text-center">
                    <p class="mb-0">&copy; 2024 Raju Bhupatiraju. All rights reserved. Built with ❤️ on Cloudflare Workers.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- AOS Animation -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    
    <script>
        // Initialize AOS
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navbar background on scroll
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        });

        // Add loading animation
        window.addEventListener('load', function() {
            document.body.classList.add('loaded');
        });
    </script>
</body>
</html>
  `;
  
  return c.html(html);
});

// API Routes
app.get('/api/profile', async (c) => {
  try {
    const linkedinService = new LinkedInService(c.env as unknown as Env);
    const result = await linkedinService.getProfile();
    
    return c.json(result);
  } catch (error) {
    console.error('Profile API error:', error);
    return c.json({ success: false, error: 'Failed to fetch profile' }, 500);
  }
});

app.get('/api/photos', async (c) => {
  try {
    const googlePhotosService = new GooglePhotosService(c.env as unknown as Env);
    const result = await googlePhotosService.getPhotos();
    
    return c.json(result);
  } catch (error) {
    console.error('Photos API error:', error);
    return c.json({ success: false, error: 'Failed to fetch photos' }, 500);
  }
});

app.get('/api/photos/clear-cache', async (c) => {
  try {
    const googlePhotosService = new GooglePhotosService(c.env as unknown as Env);
    await googlePhotosService.clearCache();
    
    return c.json({ success: true, message: 'Photos cache cleared successfully' });
  } catch (error) {
    console.error('Cache clear error:', error);
    return c.json({ success: false, error: 'Failed to clear cache' }, 500);
  }
});

app.get('/api/projects', async (c) => {
  try {
    const projectsService = new ProjectsService();
    const result = await projectsService.getProjects();
    
    return c.json(result);
  } catch (error) {
    console.error('Projects API error:', error);
    return c.json({ success: false, error: 'Failed to fetch projects' }, 500);
  }
});

// Clear cached profile so changes to PROFILE_JSON_URL propagate immediately
app.post('/api/profile/refresh-cache', async (c) => {
  try {
    const env = c.env as unknown as Env;
    await env.CACHE.delete('linkedin_profile_data');
    await env.CACHE.delete('linkedin_access_token');
    return c.json({ success: true, message: 'Profile and token cache cleared' });
  } catch (error) {
    console.error('Profile cache clear error:', error);
    return c.json({ success: false, error: 'Failed to clear cache' }, 500);
  }
});

// Google Photos OAuth authentication initiation
app.get('/auth/google-photos', async (c) => {
  try {
    const googlePhotosOAuthService = new GooglePhotosOAuthService(c.env as unknown as Env);
    
    if (!googlePhotosOAuthService.isConfigured()) {
      return c.json({ 
        success: false, 
        error: 'Google Photos OAuth not configured. Please set GOOGLE_PHOTOS_CLIENT_ID and GOOGLE_PHOTOS_CLIENT_SECRET.' 
      }, 400);
    }
    
    const authUrl = googlePhotosOAuthService.getAuthorizationUrl();
    
    return c.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google Photos OAuth:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to initiate Google Photos authentication' 
    }, 500);
  }
});

// Google Photos OAuth callback handler
app.get('/auth/google-photos/callback', async (c) => {
  try {
    const code = c.req.query('code');
    const error = c.req.query('error');
    
    if (error) {
      return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Photos Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Google Photos Authentication Error</h1>
          <div class="error">
            <strong>Error:</strong> ${error}<br>
            <strong>Description:</strong> ${c.req.query('error_description') || 'Authentication was cancelled or failed.'}
          </div>
          <p><a href="/photography">← Back to Photography</a></p>
        </body>
        </html>
      `, 400);
    }
    
    if (!code) {
      return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Photos Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Google Photos Authentication Error</h1>
          <div class="error">
            <strong>Error:</strong> No authorization code received
          </div>
          <p><a href="/photography">← Back to Photography</a></p>
        </body>
        </html>
      `, 400);
    }
    
    const googlePhotosOAuthService = new GooglePhotosOAuthService(c.env as unknown as Env);
    const result = await googlePhotosOAuthService.handleOAuthCallback(code);
    
    if (!result.success) {
      return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google Photos Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Google Photos Authentication Failed</h1>
          <div class="error">
            <strong>Error:</strong> ${result.error}
          </div>
          <p><a href="/photography">← Back to Photography</a></p>
        </body>
        </html>
      `, 500);
    }
    
    // Clear photos cache to force refresh with new token
    const googlePhotosService = new GooglePhotosService(c.env as unknown as Env);
    await googlePhotosService.clearCache();
    
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Photos Authentication Success</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .success { color: #2e7d32; background: #e8f5e8; padding: 15px; border-radius: 5px; }
          .btn { display: inline-block; background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <h1>Google Photos Authentication Successful!</h1>
        <div class="success">
          <strong>Success!</strong> Your Google Photos account has been connected successfully.
          Your photography page will now display your actual photos from Google Photos.
        </div>
        <a href="/photography" class="btn">View Your Photography →</a>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error in Google Photos OAuth callback:', error);
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Google Photos Authentication Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Google Photos Authentication Error</h1>
        <div class="error">
          <strong>Unexpected Error:</strong> ${error instanceof Error ? error.message : 'Unknown error occurred'}
        </div>
        <p><a href="/photography">← Back to Photography</a></p>
      </body>
      </html>
    `, 500);
  }
});

// LinkedIn OAuth authentication initiation
app.get('/auth/linkedin', async (c) => {
  try {
    const linkedinOAuthService = new LinkedInOAuthService(c.env as unknown as Env);
    const authUrl = linkedinOAuthService.getAuthorizationUrl();
    
    if (!authUrl) {
      return c.json({ 
        success: false, 
        error: 'LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.' 
      }, 400);
    }
    
    return c.redirect(authUrl);
  } catch (error) {
    console.error('LinkedIn auth initiation error:', error);
    return c.json({ success: false, error: 'Failed to initiate LinkedIn authentication' }, 500);
  }
});

// LinkedIn OAuth callback handler
app.get('/auth/linkedin/callback', async (c) => {
  try {
    const code = c.req.query('code');
    const error = c.req.query('error');
    
    if (error) {
      return c.html(`
        <html>
          <head>
            <title>LinkedIn Authentication Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              h1 { color: #dc3545; }
              .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>LinkedIn Authentication Failed</h1>
            <div class="error">Error: ${error}</div>
            <p>Please try again or contact support if the issue persists.</p>
            <a href="/">Return to Homepage</a>
          </body>
        </html>
      `, 400);
    }
    
    if (!code) {
      return c.html(`
        <html>
          <head>
            <title>LinkedIn Authentication Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              h1 { color: #dc3545; }
            </style>
          </head>
          <body>
            <h1>LinkedIn Authentication Failed</h1>
            <p>No authorization code received from LinkedIn.</p>
            <a href="/">Return to Homepage</a>
          </body>
        </html>
      `, 400);
    }
    
    const linkedinOAuthService = new LinkedInOAuthService(c.env as unknown as Env);
    const result = await linkedinOAuthService.handleOAuthCallback(code);
    
    if (!result.success) {
      return c.html(`
        <html>
          <head>
            <title>LinkedIn Authentication Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              h1 { color: #dc3545; }
              .error { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>LinkedIn Authentication Failed</h1>
            <div class="error">Error: ${result.error}</div>
            <p>Please try again or contact support if the issue persists.</p>
            <a href="/">Return to Homepage</a>
          </body>
        </html>
      `, 500);
    }
    
    // Success! Redirect to resume page to show updated data
    return c.html(`
      <html>
        <head>
          <title>LinkedIn Authentication Successful</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #28a745; }
            .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .loading { margin: 20px 0; }
          </style>
          <script>
            setTimeout(() => {
              window.location.href = '/resume';
            }, 3000);
          </script>
        </head>
        <body>
          <h1>LinkedIn Authentication Successful!</h1>
          <div class="success">
            Your LinkedIn profile has been connected successfully. 
            Your resume will now display live data from your LinkedIn profile.
          </div>
          <div class="loading">Redirecting to your resume in 3 seconds...</div>
          <a href="/resume">View Resume Now</a>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error('LinkedIn OAuth callback error:', error);
    return c.html(`
      <html>
        <head>
          <title>LinkedIn Authentication Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #dc3545; }
          </style>
        </head>
        <body>
          <h1>LinkedIn Authentication Error</h1>
          <p>An unexpected error occurred during authentication.</p>
          <a href="/">Return to Homepage</a>
        </body>
      </html>
    `, 500);
  }
});

// Resume page
app.get('/resume', async (c) => {
  try {
    // Ensure environment is available
    if (!c.env) {
      throw new Error('Environment not available');
    }
    
    const linkedinService = new LinkedInService(c.env as unknown as Env);
    const profileResult = await linkedinService.getProfile();
    
    if (!profileResult.success) {
      throw new Error(profileResult.error || 'Failed to load profile');
    }
    
    const profile = profileResult.data!;
    
    // Helper function to format dates
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    };
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume - ${profile.firstName} ${profile.lastName}</title>
    <meta name="description" content="Professional resume of ${profile.firstName} ${profile.lastName} - ${profile.headline}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👑</text></svg>">
    <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👑</text></svg>">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary-color: #1e3a8a;
            --secondary-color: #3b82f6;
            --accent-color: #f59e0b;
            --text-dark: #1f2937;
            --text-light: #6b7280;
            --bg-light: #f8fafc;
            --gradient-primary: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--text-dark);
            background-color: var(--bg-light);
        }
        
        .font-display {
            font-family: 'Playfair Display', serif;
        }
        
        .navbar {
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .navbar-brand {
            font-weight: 700;
            font-size: 1.5rem;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .resume-header {
            background: var(--gradient-primary);
            color: white;
            padding: 4rem 0 2rem;
        }
        
        .profile-img {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            border: 5px solid rgba(255, 255, 255, 0.2);
            object-fit: cover;
            object-position: center top;
        }
        
        .section-title {
            font-size: 1.8rem;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--accent-color);
        }
        
        .experience-item, .education-item {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
        }
        
        .experience-item:hover, .education-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        
        .job-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .company-name {
            font-size: 1.1rem;
            font-weight: 500;
            color: var(--secondary-color);
            margin-bottom: 0.5rem;
        }
        
        .job-duration {
            color: var(--text-light);
            font-weight: 500;
            margin-bottom: 1rem;
        }
        
        .current-badge {
            background: var(--accent-color);
            color: white;
            padding: 0.2rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-left: 0.5rem;
        }
        
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .skill-tag {
            background: var(--gradient-primary);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .certification-item {
            background: white;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--accent-color);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .cert-name {
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 0.3rem;
        }
        
        .cert-issuer {
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .download-btn {
            background: var(--gradient-primary);
            border: none;
            color: white;
            padding: 0.8rem 2rem;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
            color: white;
        }
        
        @media (max-width: 768px) {
            .resume-header {
                padding: 2rem 0 1rem;
            }
            
            .profile-img {
                width: 120px;
                height: 120px;
            }
            
            .section-title {
                font-size: 1.5rem;
            }
        }
        
        /* Force dropdown positioning consistency */
        .dropdown-menu {
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: auto !important;
            transform: none !important;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container">
            <a class="navbar-brand font-display" href="/">Raju Bhupatiraju</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/#about">About</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/resume">Resume</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/photography">Photography</a>
                    </li>
                    <li class="nav-item dropdown position-relative">
                        <a class="nav-link dropdown-toggle" href="#" id="resumeProjectsDropdown" role="button" onclick="toggleCustomDropdown('resumeProjectsDropdown')" aria-expanded="false">
                            Tinker Projects
                        </a>
                        <ul class="dropdown-menu position-absolute" id="resumeProjectsDropdown-menu" style="top: 100%; left: 0; display: none;">
                            <li><a class="dropdown-item" href="https://remindme.studior.cc" target="_blank">RemindMe</a></li>
                            <li><a class="dropdown-item text-muted" href="#" onclick="return false;" style="cursor: default;">Coming Soon</a></li>
                        </ul>
                    </li>

                </ul>
            </div>
        </div>
    </nav>

    <!-- Resume Header -->
    <section class="resume-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-3 text-center mb-3 mb-md-0">
                    <img src="${profile.profilePicture || 'https://via.placeholder.com/150x150/1e3a8a/ffffff?text=' + profile.firstName.charAt(0) + profile.lastName.charAt(0)}" 
                         alt="${profile.firstName} ${profile.lastName}" class="profile-img">
                </div>
                <div class="col-md-9">
                    <h1 class="font-display mb-2">${profile.firstName} ${profile.lastName}</h1>
                    <h3 class="mb-3" style="color: rgba(255, 255, 255, 0.9);">${profile.headline}</h3>
                    <p class="mb-2"><i class="fas fa-map-marker-alt me-2"></i>${profile.location}</p>
                    <p class="mb-0"><i class="fas fa-industry me-2"></i>${profile.industry}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Resume Content -->
    <div class="container my-5">
        <!-- Professional Summary -->
        <section class="mb-5">
            <h2 class="section-title font-display">Professional Summary</h2>
            <div class="bg-white p-4 rounded-3 shadow-sm">
                <p class="mb-0">${profile.summary.replace(/\n/g, '<br>')}</p>
            </div>
        </section>

        <div class="row">
            <div class="col-lg-8">
                <!-- Professional Experience -->
                <section class="mb-5">
                    <h2 class="section-title font-display">Professional Experience</h2>

                    ${profile.experience.map(exp => `
                        <div class="experience-item">
                            <div class="job-title">
                                ${exp.title}
                                ${exp.current ? '<span class="current-badge">Current</span>' : ''}
                            </div>
                            <div class="company-name">${exp.company}</div>
                            <div class="job-duration">
                                <i class="fas fa-calendar me-1"></i>
                                ${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                ${exp.location ? ' • ' + exp.location : ''}
                            </div>
                            <p class="mb-2">${exp.description}</p>
                            ${exp.industry || exp.skills ? `
                            <div class="text-muted small">
                                ${exp.industry ? `<div class="mb-1"><i class="fas fa-industry me-1"></i><strong>Industry:</strong> ${exp.industry}</div>` : ''}
                                ${exp.skills ? `<div><i class="fas fa-tools me-1"></i><strong>Skills:</strong> ${Array.isArray(exp.skills) ? exp.skills.join(', ') : exp.skills}</div>` : ''}
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </section>

                <!-- Education -->
                <section class="mb-5">
                    <h2 class="section-title font-display">Education</h2>
                    ${profile.education.map(edu => `
                        <div class="education-item">
                            <div class="job-title">${edu.degree} in ${edu.field}</div>
                            <div class="company-name">${edu.school}</div>
                            <div class="job-duration">
                                <i class="fas fa-calendar me-1"></i>
                                ${edu.startYear} - ${edu.endYear || 'Present'}
                            </div>
                            ${edu.description ? '<p class="mb-0">' + edu.description + '</p>' : ''}
                        </div>
                    `).join('')}
                </section>
            </div>

            <div class="col-lg-4">
                <!-- Skills -->
                <section class="mb-5">
                    <h2 class="section-title font-display">Core Skills</h2>
                    <div class="skills-container">
                        ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </section>

                <!-- Certifications -->
                ${profile.certifications.length > 0 ? `
                <section class="mb-5">
                    <h2 class="section-title font-display">Certifications</h2>
                    ${profile.certifications.map(cert => `
                        <div class="certification-item">
                            <div class="cert-name">${cert.name}</div>
                            <div class="cert-issuer">${cert.issuer}</div>
                            <small class="text-muted">
                                Issued: ${formatDate(cert.issueDate)}
                                ${cert.expirationDate ? ' • Expires: ' + formatDate(cert.expirationDate) : ''}
                            </small>
                        </div>
                    `).join('')}
                </section>
                ` : ''}

                <!-- Contact Information -->
                <section class="mb-5">
                    <h2 class="section-title font-display">Contact</h2>
                    <div class="bg-white p-3 rounded-3 shadow-sm">

                        <p class="mb-2">
                            <i class="fab fa-linkedin text-primary me-2"></i>
                            <a href="${c.env?.LINKEDIN_PROFILE || 'https://www.linkedin.com/in/bhupatiraju/'}" target="_blank">LinkedIn Profile</a>
                        </p>
                        <p class="mb-0">
                            <i class="fas fa-globe text-primary me-2"></i>
                            <a href="/">Portfolio Website</a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <script>
        // Custom dropdown functionality
        function toggleCustomDropdown(dropdownId) {
            const menu = document.getElementById(dropdownId + '-menu');
            const isVisible = menu.style.display === 'block';
            
            // Hide all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
            
            // Toggle current dropdown
            menu.style.display = isVisible ? 'none' : 'block';
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });
        
        // Print styles for PDF download
        window.addEventListener('beforeprint', function() {
            document.body.style.backgroundColor = 'white';
        });
        
        window.addEventListener('afterprint', function() {
            document.body.style.backgroundColor = '';
        });
    </script>
</body>
</html>
    `;
    
    return c.html(html);
  } catch (error) {
    console.error('Resume page error:', error);
    return c.html(`
      <html>
        <head>
          <title>Resume - Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #1e3a8a; }
          </style>
        </head>
        <body>
          <h1>Resume Temporarily Unavailable</h1>
          <p>We're having trouble loading the resume data. Please try again later.</p>
          <a href="/">Return to Homepage</a>
        </body>
      </html>
    `, 500);
  }
});

// Photography page  
app.get('/photography', async (c) => {
  try {
    if (!c.env) {
      throw new Error('Environment not available');
    }
    
    const googlePhotosService = new GooglePhotosService(c.env as unknown as Env);
    const photosResult = await googlePhotosService.getPhotos();
    
    if (!photosResult.success) {
      console.error('Failed to load photos:', photosResult.error);
    }
    
    const photos = photosResult.data || [];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photography - Raju Bhupatiraju</title>
    <meta name="description" content="Explore Raju Bhupatiraju's photography portfolio - capturing the beauty and diversity of nature through stunning bird photography and landscape photography.">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👑</text></svg>">
    <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👑</text></svg>">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- AOS Animation -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary-color: #1e3a8a;
            --secondary-color: #3b82f6;
            --accent-color: #f59e0b;
            --text-dark: #1f2937;
            --text-light: #6b7280;
            --bg-light: #f8fafc;
            --gradient-primary: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--text-dark);
            background-color: var(--bg-light);
        }
        
        .font-display {
            font-family: 'Playfair Display', serif;
        }
        
        .navbar {
            background: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .navbar-brand {
            font-weight: 700;
            font-size: 1.5rem;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .hero-photography {
            background: var(--gradient-primary);
            color: white;
            padding: 6rem 0 4rem;
            text-align: center;
        }
        
        .hero-photography h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
        }
        
        .hero-photography .lead {
            font-size: 1.3rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        
        .gallery-section {
            padding: 5rem 0;
        }
        
        .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
        
        .section-subtitle {
            text-align: center;
            font-size: 1.1rem;
            color: var(--text-light);
            margin-bottom: 4rem;
        }
        
        .photo-card {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            margin-bottom: 2rem;
        }
        
        .photo-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .photo-card img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            transition: all 0.3s ease;
        }
        
        .photo-card:hover img {
            transform: scale(1.05);
        }
        
        .photo-info {
            padding: 1.5rem;
        }
        
        .photo-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .photo-description {
            color: var(--text-light);
            font-size: 0.95rem;
            margin-bottom: 1rem;
        }
        
        .photo-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            color: var(--text-light);
        }
        
        .camera-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .location-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .stats-section {
            background: white;
            padding: 4rem 0;
            margin: 4rem 0;
        }
        
        .stat-card {
            text-align: center;
            padding: 2rem;
        }
        
        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            font-size: 1.1rem;
            color: var(--text-light);
            font-weight: 500;
        }
        
        .cta-section {
            background: var(--gradient-primary);
            color: white;
            padding: 4rem 0;
            text-align: center;
        }
        
        .btn-custom {
            background: var(--accent-color);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
        }
        
        .btn-custom:hover {
            background: #e59400;
            color: white;
            transform: translateY(-2px);
        }
        
        /* Modern Filter Chips Styles */
        .filter-controls {
            background: white !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 16px !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        
        .filter-group {
            margin-bottom: 1rem;
        }
        
        .filter-label {
            font-size: 0.75rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.5rem;
            display: inline-block;
            min-width: 80px;
        }
        
        .filter-chips {
            display: inline-flex;
            flex-wrap: wrap;
            gap: 0.375rem;
            align-items: center;
        }
        
        .filter-chip {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            background: #f3f4f6;
            border: 1px solid transparent;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            color: #374151;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            white-space: nowrap;
        }
        
        .filter-chip:hover {
            background: #e5e7eb;
            color: #1f2937;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .filter-chip.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
            box-shadow: 0 2px 8px rgba(30, 58, 138, 0.3);
        }
        
        .filter-chip.active:hover {
            background: var(--secondary-color);
            border-color: var(--secondary-color);
            color: white;
        }
        
        .filter-chip i {
            font-size: 0.625rem;
            margin-right: 0.25rem;
        }
        
        @media (min-width: 768px) {
            .filter-group {
                display: flex;
                align-items: flex-start;
                gap: 1rem;
                margin-bottom: 0.75rem;
            }
            
            .filter-label {
                margin-bottom: 0;
                flex-shrink: 0;
            }
        }
        
        @media (max-width: 767px) {
            .filter-chips {
                justify-content: flex-start;
            }
            
            .filter-chip {
                font-size: 0.7rem;
                padding: 0.2rem 0.6rem;
            }
            
            .filter-chip i {
                font-size: 0.6rem;
                margin-right: 0.2rem;
            }
        }
        
        @media (max-width: 768px) {
            .hero-photography h1 {
                font-size: 2.5rem;
            }
            
            .hero-photography .lead {
                font-size: 1.1rem;
            }
            
            .photo-card img {
                height: 250px;
            }
        }
        
        /* Force dropdown positioning consistency */
        .dropdown-menu {
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: auto !important;
            transform: none !important;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container">
            <a class="navbar-brand font-display" href="/">Raju Bhupatiraju</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/#about">About</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/resume">Resume</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="/photography">Photography</a>
                    </li>
                    <li class="nav-item dropdown position-relative">
                        <a class="nav-link dropdown-toggle" href="#" id="photoProjectsDropdown" role="button" onclick="toggleCustomDropdown('photoProjectsDropdown')" aria-expanded="false">
                            Tinker Projects
                        </a>
                        <ul class="dropdown-menu position-absolute" id="photoProjectsDropdown-menu" style="top: 100%; left: 0; display: none;">
                            <li><a class="dropdown-item" href="https://remindme.studior.cc" target="_blank">RemindMe</a></li>
                            <li><a class="dropdown-item text-muted" href="#" onclick="return false;" style="cursor: default;">Coming Soon</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-photography">
        <div class="container">
            <div data-aos="fade-up">
                <h1 class="font-display">Photography</h1>
                <p class="lead">Capturing the beauty and diversity of nature's most magnificent creatures</p>
                <p>Through my lens, I explore the fascinating world of birds - from majestic raptors to delicate songbirds, each photograph tells a story of nature's incredible artistry.</p>
            </div>
        </div>
    </section>





    <!-- Gallery Section -->
    <section class="py-5">
        <div class="container">
            <div class="row g-4">
                ${photos.map((photo, index) => {
                  const photoUrl = photo.baseUrl;
                  const title = photo.title || 'Untitled';
                  const camera = photo.metadata.camera || 'Camera unavailable';
                  const settings = photo.metadata.settings || 'Settings unavailable';
                  const date = photo.metadata.date ? new Date(photo.metadata.date).toLocaleDateString() : 'Date unavailable';
                  
                  return `
                  <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${index * 100}">
                    <div class="photo-card">
                      <div class="photo-image" onclick="openPhotoModal(${index})" style="cursor: pointer;">
                        <img src="${photoUrl}" alt="${title}" class="img-fluid" loading="lazy">
                        <div class="photo-overlay">
                          <div class="photo-info">
                            <h5>${title}</h5>

                            <div class="photo-meta">
                              <small><i class="fas fa-camera"></i> ${camera}</small><br>
                              <small><i class="fas fa-cog"></i> ${settings}</small><br>
                              <small><i class="fas fa-map-marker-alt"></i> ${photo.metadata.location || 'Location unavailable'}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="photo-actions mt-2 d-flex justify-content-between align-items-center px-2">
                        <button class="btn btn-sm btn-link p-0 like-button" onclick="likePhotoFromGallery(${index})" title="Like photo" style="color: #dc3545; text-decoration: none;">
                          <span id="like-count-${index}">❤️ 0</span>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="sharePhotoFromGallery(${index})" title="Share photo">
                          <i class="fas fa-share"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  `;
                }).join('')}
            </div>
        </div>
    </section>

    <!-- Photo Modal -->
    <div class="modal fade" id="photoModal" tabindex="-1" aria-labelledby="photoModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-fullscreen-lg-down">
            <div class="modal-content bg-dark">
                <div class="modal-header border-0">
                    <h5 class="modal-title text-white" id="photoModalLabel">Photo Title</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center p-0">
                    <img id="modalImage" src="" alt="" class="img-fluid w-100" style="max-height: 80vh; object-fit: contain;">
                    <div class="photo-details p-4 text-white">
                        <div class="row">
                            <div class="col-md-8">
                                <p id="modalDate" class="mb-2"></p>
                                <div id="modalMeta" class="photo-meta"></div>
                            </div>
                            <div class="col-md-4 text-end">
                                <div class="photo-actions">
                                    <button class="btn btn-outline-light me-2" onclick="likePhoto()" id="likeBtn">
                                        <i class="fas fa-heart"></i> <span id="modalLikeCount">0</span>
                                    </button>
                                    <button class="btn btn-outline-light" onclick="sharePhoto()">
                                        <i class="fas fa-share"></i> Share
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- AOS Animation -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
        // Photo data for modal functionality
        const photoData = ${JSON.stringify(photos)};
        let currentPhotoIndex = 0;
        
        // Database-backed like counts
        let likeCounts = {};
        
        // Load like counts from database
        async function loadLikeCounts() {
            try {
                const response = await fetch('/api/likes');
                if (response.ok) {
                    likeCounts = await response.json();
                }
            } catch (error) {
                console.error('Failed to load like counts:', error);
            }
            
            // Update UI with loaded counts
            photoData.forEach((photo, index) => {
                const likeCountElement = document.getElementById(\`like-count-\${index}\`);
                const count = likeCounts[index.toString()] || 0;
                if (likeCountElement) {
                    likeCountElement.textContent = \`❤️ \${count}\`;
                }
            });
        }
        
        // Initialize like counts on page load
        document.addEventListener('DOMContentLoaded', function() {
            loadLikeCounts();
        });
        
        // Open photo modal
        function openPhotoModal(index) {
            currentPhotoIndex = index;
            const photo = photoData[index];
            
            document.getElementById('photoModalLabel').textContent = photo.title;
            document.getElementById('modalImage').src = photo.baseUrl;
            document.getElementById('modalImage').alt = photo.title;
            // Date removed per user request
            document.getElementById('modalDate').textContent = '';
            
            const metaHtml = \`
                <small><i class="fas fa-camera"></i> \${photo.metadata.camera || 'Camera info unavailable'}</small><br>
                <small><i class="fas fa-cog"></i> \${photo.metadata.settings || 'Settings unavailable'}</small><br>
                <small><i class="fas fa-map-marker-alt"></i> \${photo.metadata.location || 'Location unavailable'}</small>
            \`;
            document.getElementById('modalMeta').innerHTML = metaHtml;
            
            const likeCount = likeCounts[index.toString()] || 0;
            document.getElementById('modalLikeCount').textContent = likeCount;
            
            const modal = new bootstrap.Modal(document.getElementById('photoModal'));
            modal.show();
        }
        
        // Like photo functionality
        async function likePhoto() {
            try {
                const response = await fetch(\`/api/likes/\${currentPhotoIndex}\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const newCount = result.likes;
                    
                    // Update local cache
                    likeCounts[currentPhotoIndex.toString()] = newCount;
                    
                    // Update modal like count
                    document.getElementById('modalLikeCount').textContent = newCount;
                    
                    // Update gallery like count
                    const galleryLikeElement = document.getElementById(\`like-count-\${currentPhotoIndex}\`);
                    if (galleryLikeElement) {
                        galleryLikeElement.textContent = \`❤️ \${newCount}\`;
                    }
                    
                    // Visual feedback
                    const likeBtn = document.getElementById('likeBtn');
                    likeBtn.classList.add('btn-danger');
                    likeBtn.classList.remove('btn-outline-light');
                    setTimeout(() => {
                        likeBtn.classList.remove('btn-danger');
                        likeBtn.classList.add('btn-outline-light');
                    }, 300);
                } else {
                    console.error('Failed to like photo');
                    alert('Failed to like photo. Please try again.');
                }
            } catch (error) {
                console.error('Error liking photo:', error);
                alert('Failed to like photo. Please try again.');
            }
        }
        
        // Share photo functionality (from modal)
        function sharePhoto() {
            const photo = photoData[currentPhotoIndex];
            const shareData = {
                title: photo.title,
                text: \`Check out this beautiful bird photo: \${photo.title}\`,
                url: window.location.href
            };
            
            if (navigator.share) {
                navigator.share(shareData);
            } else {
                // Fallback: copy URL to clipboard
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Photo URL copied to clipboard!');
                });
            }
        }
        
        // Share photo functionality (from gallery)
        function sharePhotoFromGallery(index) {
            const photo = photoData[index];
            
            // Check if native share is available (mobile)
            if (navigator.share && navigator.canShare) {
                const shareData = {
                    title: photo.title,
                    text: \`Check out this beautiful bird photo: \${photo.title}\`,
                    url: photo.baseUrl
                };
                
                if (navigator.canShare(shareData)) {
                    navigator.share(shareData);
                    return;
                }
            }
            
            // Desktop fallback - show options
            const userChoice = prompt(
                \`Share "\${photo.title}":\\n\\n\` +
                \`1. Copy Image Link (direct photo URL)\\n\` +
                \`2. Copy Portfolio Link (this page)\\n\\n\` +
                \`Enter 1 or 2:\`
            );
            
            if (userChoice === '1') {
                // Copy direct image link
                navigator.clipboard.writeText(photo.baseUrl).then(() => {
                    alert('✅ Image link copied to clipboard!\\n\\nYou can now paste this link to share the photo directly.');
                }).catch(() => {
                    // Fallback if clipboard fails
                    prompt('Copy this image link:', photo.baseUrl);
                });
            } else if (userChoice === '2') {
                // Copy portfolio page link
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('✅ Portfolio link copied to clipboard!\\n\\nYou can now paste this link to share your photography portfolio.');
                }).catch(() => {
                    // Fallback if clipboard fails
                    prompt('Copy this portfolio link:', window.location.href);
                });
            }
        }
        
        // Like photo functionality (from gallery)
        async function likePhotoFromGallery(index) {
            try {
                const response = await fetch(\`/api/likes/\${index}\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const newCount = result.likes;
                    
                    // Update local cache
                    likeCounts[index.toString()] = newCount;
                    
                    // Update gallery like count
                    const galleryLikeElement = document.getElementById(\`like-count-\${index}\`);
                    if (galleryLikeElement) {
                        galleryLikeElement.textContent = \`❤️ \${newCount}\`;
                    }
                    
                    // Visual feedback - animate the heart
                    const likeButton = galleryLikeElement.parentElement;
                    likeButton.style.transform = 'scale(1.2)';
                    likeButton.style.transition = 'transform 0.2s ease';
                    setTimeout(() => {
                        likeButton.style.transform = 'scale(1)';
                    }, 200);
                    
                } else {
                    console.error('Failed to like photo');
                    alert('Failed to like photo. Please try again.');
                }
            } catch (error) {
                console.error('Error liking photo:', error);
                alert('Failed to like photo. Please try again.');
            }
        }
        
        // Custom dropdown functionality
        function toggleCustomDropdown(dropdownId) {
            const menu = document.getElementById(dropdownId + '-menu');
            const isVisible = menu.style.display === 'block';
            
            // Hide all other dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                dropdown.style.display = 'none';
            });
            
            // Toggle current dropdown
            menu.style.display = isVisible ? 'none' : 'block';
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });
        

        
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true
        });
    </script>
</body>
</html>
    `;

    return c.html(html);
  } catch (error) {
    console.error('Photography page error:', error);
    return c.html(`
      <html>
        <head>
          <title>Photography - Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #1e3a8a; }
          </style>
        </head>
        <body>
          <h1>Photography Gallery Temporarily Unavailable</h1>
          <p>We're having trouble loading the photography gallery. Please try again later.</p>
          <a href="/">Return to Homepage</a>
        </body>
      </html>
    `, 500);
  }
});

// Projects page
app.get('/projects', (c) => {
  // This will be implemented next with project showcase
  return c.redirect('/#projects');
});

// 404 handler
app.notFound((c) => {
  return c.html(`
    <html>
      <head>
        <title>Page Not Found - Raju Bhupatiraju</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #1e3a8a; }
        </style>
      </head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/">Return to Homepage</a>
      </body>
    </html>
  `, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

export default app;
