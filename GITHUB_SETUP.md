# GitHub Setup Guide for Your Professional Portfolio

## 🚀 Complete GitHub Integration Steps

### Step 1: Create GitHub Repository

1. **Go to GitHub**: Visit [github.com](https://github.com) and sign in
2. **Create New Repository**:
   - Click the **"+"** button → **"New repository"**
   - **Repository name**: `raju-bhupatiraju-portfolio`
   - **Description**: `Professional portfolio website - Enterprise Applications Leader & Bird Photography Enthusiast`
   - **Visibility**: **Public** ✅ (required for image hosting)
   - **Initialize**: ✅ Add a README file
   - **License**: MIT License
   - Click **"Create repository"**

### Step 2: Upload Your Professional Headshot

1. **In your new GitHub repository**:
   - Click **"uploading an existing file"** link in the quick setup section
   - OR click **"Add file"** → **"Upload files"**

2. **Create the folder structure**:
   - Before uploading, type in the file path: `assets/images/`
   - This will create the folder structure automatically

3. **Upload your headshot**:
   - Drag and drop your professional headshot photo
   - **Rename it to**: `profile-photo.jpg`
   - **Commit message**: `Add professional headshot for portfolio`
   - Click **"Commit changes"**

### Step 3: Get Your Image URL

After uploading, your professional headshot will be available at:
```
https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/raju-bhupatiraju-portfolio/main/assets/images/profile-photo.jpg
```

**Example**: If your GitHub username is `rajubhupatiraju`, the URL would be:
```
https://raw.githubusercontent.com/rajubhupatiraju/raju-bhupatiraju-portfolio/main/assets/images/profile-photo.jpg
```

### Step 4: Update Your Portfolio Configuration

1. **Open** `wrangler.toml` in your portfolio project
2. **Find this line**:
   ```toml
   PROFILE_PHOTO_URL = "https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/raju-bhupatiraju-portfolio/main/assets/images/profile-photo.jpg"
   ```
3. **Replace** `YOUR_GITHUB_USERNAME` with your actual GitHub username
4. **Save** the file

### Step 5: Push Your Portfolio Code to GitHub

1. **Connect your local repository to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/raju-bhupatiraju-portfolio.git
   git branch -M main
   ```

2. **Push your code**:
   ```bash
   git push -u origin main
   ```

### Step 6: Test Your Portfolio

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Visit your portfolio**:
   - Homepage: http://localhost:8787
   - Resume: http://localhost:8787/resume

3. **Verify your photo appears** in both the homepage hero section and resume page header

## 🎯 What You'll See

Once completed, your professional headshot will appear:
- **Homepage**: Large circular photo (300x300px) in the hero section
- **Resume Page**: Medium circular photo (150x150px) in the header
- **Future Pages**: Consistent professional branding

## 🔧 Troubleshooting

**If your photo doesn't appear**:
1. Check that the image URL is correct and accessible
2. Ensure the repository is public
3. Verify the file path is exactly: `assets/images/profile-photo.jpg`
4. Make sure you've restarted the development server

**Image URL Format**:
- ✅ Correct: `https://raw.githubusercontent.com/username/repo/main/assets/images/profile-photo.jpg`
- ❌ Wrong: `https://github.com/username/repo/blob/main/assets/images/profile-photo.jpg`

## 🚀 Next Steps

After your headshot is working:
1. Deploy your portfolio to Cloudflare Workers
2. Set up custom domain (optional)
3. Implement photography gallery
4. Add more projects to showcase

## 📞 Need Help?

If you encounter any issues:
1. Check that your GitHub repository is public
2. Verify the image file path and name
3. Ensure you've updated the correct GitHub username in `wrangler.toml`
4. Restart your development server after making changes

Your professional portfolio is ready to showcase your expertise as an Enterprise Applications Leader! 🌟
