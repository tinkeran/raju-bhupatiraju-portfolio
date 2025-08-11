# GitHub Setup Instructions for tinkeran

## 🚀 Complete Setup Process

### Step 1: Create GitHub Repository

1. **Go to GitHub**: Visit [github.com](https://github.com) and sign in as `tinkeran`
2. **Create New Repository**:
   - Click **"+"** → **"New repository"**
   - **Repository name**: `raju-bhupatiraju-portfolio`
   - **Description**: `Professional portfolio website - Enterprise Applications Leader & Bird Photography Enthusiast`
   - **Visibility**: **Public** ✅ (required for raw file access)
   - **Initialize**: ✅ Add a README file
   - **License**: MIT License
   - Click **"Create repository"**

### Step 2: Push Your Code

After creating the repository on GitHub, run these commands locally:

```bash
# Push your portfolio code to GitHub
git push -u origin main
```

### Step 3: Upload Your Professional Headshot

1. **In your GitHub repository**:
   - Navigate to your repo: `https://github.com/tinkeran/raju-bhupatiraju-portfolio`
   - Click **"Add file"** → **"Upload files"**

2. **Create the folder structure**:
   - Before uploading, type: `assets/images/`
   - Upload your professional headshot photo
   - **Rename it to**: `profile-photo.jpg`
   - **Commit message**: `Add professional headshot for portfolio`

### Step 4: Edit Your Resume Data

1. **Navigate to** `data/profile.json` in your GitHub repo
2. **Click the edit button** (pencil icon)
3. **Replace the template data** with your accurate information:
   - Personal details (name, headline, summary, location)
   - Work experience (current and previous roles)
   - Education
   - Skills
   - Certifications

4. **Commit changes** with message: `Update profile with accurate resume data`

### Step 5: Verify Your URLs

After uploading, your files will be available at:
- **Profile Photo**: `https://raw.githubusercontent.com/tinkeran/raju-bhupatiraju-portfolio/main/assets/images/profile-photo.jpg`
- **Profile JSON**: `https://raw.githubusercontent.com/tinkeran/raju-bhupatiraju-portfolio/main/data/profile.json`

### Step 6: Test Locally

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Clear the profile cache**:
   ```bash
   curl -X POST http://localhost:8787/api/profile/refresh-cache
   ```

3. **Visit your portfolio**:
   - Homepage: http://localhost:8787
   - Resume: http://localhost:8787/resume
   - API: http://localhost:8787/api/profile

## 🎯 What You'll See

Once completed:
- **Homepage**: Your professional headshot in the hero section
- **Resume Page**: Accurate data from your `profile.json`
- **Consistent Branding**: Professional styling throughout

## 🔧 Troubleshooting

**If your photo doesn't appear**:
1. Ensure the repository is public
2. Verify the file path is exactly: `assets/images/profile-photo.jpg`
3. Check the raw URL is accessible in your browser

**If resume data isn't updating**:
1. Verify `profile.json` is valid JSON (use a JSON validator)
2. Clear cache: `curl -X POST http://localhost:8787/api/profile/refresh-cache`
3. Restart the development server

## 📝 Profile JSON Template

Your `data/profile.json` should follow this structure:

```json
{
  "firstName": "Raju",
  "lastName": "Bhupatiraju",
  "headline": "Your professional headline",
  "summary": "Your executive summary",
  "location": "Your location",
  "industry": "Your industry",
  "experience": [
    {
      "title": "Current Role",
      "company": "Current Company",
      "location": "City, Country",
      "startDate": "2020-01",
      "description": "Key accomplishments",
      "current": true
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "Degree",
      "field": "Field of Study",
      "startYear": "2010",
      "endYear": "2012"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuer",
      "issueDate": "2023-06",
      "expirationDate": "2026-06"
    }
  ]
}
```

## 🚀 Next Steps

After setup is complete:
1. Deploy your portfolio to Cloudflare Workers
2. Implement the photography gallery
3. Add your RemindMe project showcase
4. Set up a custom domain (optional)

Your professional portfolio is ready to showcase your expertise! 🌟
