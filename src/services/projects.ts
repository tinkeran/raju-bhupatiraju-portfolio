import { Project, ApiResponse } from '../types';

export class ProjectsService {
  
  async getProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const projects = this.getStaticProjects();
      
      return {
        success: true,
        data: projects,
        cached: false
      };
    } catch (error) {
      console.error('Projects service error:', error);
      return {
        success: false,
        error: 'Failed to fetch projects'
      };
    }
  }

  private getStaticProjects(): Project[] {
    return [
      {
        id: "remindme",
        name: "RemindMe",
        description: "A comprehensive personal reminder assistant for life's important moments. Track birthdays, anniversaries, and special milestones with intelligent notifications and contact management.",
        url: "https://remindme-workers.rama-bhupatiraju.workers.dev",
        githubUrl: "https://github.com/rajubhupatiraju/remindme",
        technologies: [
          "TypeScript",
          "Cloudflare Workers",
          "Cloudflare D1",
          "Hono Framework",
          "JWT Authentication",
          "Bootstrap 5",
          "RESTful APIs"
        ],
        status: "live",
        screenshots: [
          "/assets/images/projects/remindme/dashboard.jpg",
          "/assets/images/projects/remindme/contacts.jpg",
          "/assets/images/projects/remindme/milestones.jpg"
        ],
        features: [
          "User authentication and secure login",
          "Contact management with detailed profiles",
          "Milestone tracking (birthdays, anniversaries, etc.)",
          "Smart reminder notifications",
          "Responsive design for all devices",
          "Search and filter functionality",
          "Dashboard with upcoming events",
          "RESTful API architecture"
        ],
        launchDate: "2024-12"
      },
      {
        id: "portfolio-website",
        name: "Professional Portfolio",
        description: "This very website! A modern, responsive portfolio showcasing professional experience, bird photography, and application projects. Built with cutting-edge web technologies.",
        url: "https://raju-bhupatiraju-portfolio.workers.dev",
        githubUrl: "https://github.com/rajubhupatiraju/portfolio",
        technologies: [
          "TypeScript",
          "Cloudflare Workers",
          "Hono Framework",
          "LinkedIn API Integration",
          "Google Photos API",
          "Responsive Design",
          "Modern CSS",
          "Progressive Web App"
        ],
        status: "live",
        screenshots: [
          "/assets/images/projects/portfolio/homepage.jpg",
          "/assets/images/projects/portfolio/resume.jpg",
          "/assets/images/projects/portfolio/photography.jpg"
        ],
        features: [
          "Dynamic LinkedIn profile integration",
          "Automated bird photography gallery",
          "Responsive design with smooth animations",
          "Professional resume display",
          "Project showcase with live demos",
          "Contact form with email integration",
          "SEO optimized",
          "Fast loading with edge computing"
        ],
        launchDate: "2024-12"
      },
      {
        id: "enterprise-dashboard",
        name: "Enterprise Analytics Dashboard",
        description: "A comprehensive business intelligence platform for enterprise-level data visualization and analytics. Real-time insights with interactive charts and customizable dashboards.",
        technologies: [
          "React",
          "TypeScript",
          "D3.js",
          "Node.js",
          "PostgreSQL",
          "Redis",
          "Docker",
          "Kubernetes"
        ],
        status: "coming-soon",
        screenshots: [
          "/assets/images/projects/enterprise/preview.jpg"
        ],
        features: [
          "Real-time data visualization",
          "Customizable dashboard widgets",
          "Advanced filtering and drill-down",
          "Export capabilities (PDF, Excel, CSV)",
          "Role-based access control",
          "API integration framework",
          "Mobile-responsive design",
          "Enterprise SSO integration"
        ],
        launchDate: "2025-Q1"
      },
      {
        id: "ai-photo-organizer",
        name: "AI Photo Organizer",
        description: "An intelligent photo management system that uses machine learning to automatically categorize, tag, and organize your photo collection. Perfect for photographers and content creators.",
        technologies: [
          "Python",
          "TensorFlow",
          "OpenCV",
          "FastAPI",
          "PostgreSQL",
          "Redis",
          "Docker",
          "AWS S3"
        ],
        status: "development",
        screenshots: [
          "/assets/images/projects/ai-organizer/concept.jpg"
        ],
        features: [
          "AI-powered photo categorization",
          "Automatic tagging and metadata extraction",
          "Duplicate photo detection",
          "Smart album creation",
          "Facial recognition and grouping",
          "Batch processing capabilities",
          "Cloud storage integration",
          "Advanced search functionality"
        ],
        launchDate: "2025-Q2"
      }
    ];
  }
}
