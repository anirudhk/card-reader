# Deploy to GitHub Pages - Step by Step

## Quick Deploy (No Account Required for Users!)

GitHub Pages is **free** and **public** - anyone can access your app without needing accounts.

## Step-by-Step Instructions

### 1. Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in (or create free account)
2. Click **"New repository"** (green button)
3. Repository name: `card-reader` (or your preferred name)
4. Make it **Public** (required for free GitHub Pages)
5. ✅ Check "Add a README file"
6. Click **"Create repository"**

### 2. Push Your Code

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"

# Connect to your GitHub repo (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/card-reader.git
git branch -M main
git push -u origin main
```

### 3. Configure Repository Name in vite.config.js

**Important:** Update the base path in `vite.config.js` to match your repository name:

```js
// In vite.config.js, find this line:
return process.env.GITHUB_PAGES === 'true' ? '/card-reader/' : '/';

// Replace 'card-reader' with YOUR repository name
return process.env.GITHUB_PAGES === 'true' ? '/YOUR-REPO-NAME/' : '/';
```

Or use environment variable (automatically set in GitHub Actions).

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select: **"GitHub Actions"**
5. Click **Save**

### 5. Deploy (Choose One Method)

#### Method A: Automatic (Recommended)

**Automatic deployment is already configured!**

Just push to the `main` branch:
```bash
git push
```

GitHub Actions will automatically:
- Build your app
- Deploy to GitHub Pages
- Make it live!

**First deployment:** Go to **Actions** tab → Wait for workflow to complete (~2 minutes)

#### Method B: Manual Deployment

```bash
# Install dependencies (if not done)
npm install

# Deploy manually
npm run deploy
```

This will:
- Build the app
- Push to `gh-pages` branch
- Deploy to GitHub Pages

### 6. Access Your App

Your app will be live at:
- **Project Pages:** `https://USERNAME.github.io/card-reader/`
- Or check: **Settings → Pages** for the exact URL

### 7. Share with Users!

Users can:
- ✅ Visit the URL directly
- ✅ Install as PWA (Add to Home Screen)
- ✅ Use offline after first visit
- ✅ No account required to access!

## Troubleshooting

### Build Fails?
```bash
npm install
npm run build
```

### Wrong Base Path?

If your app shows 404, check the base path in `vite.config.js` matches your repo name.

### Manual Fix Base Path:

1. Open `vite.config.js`
2. Find: `'/card-reader/'`
3. Replace with: `'/YOUR-REPO-NAME/'`
4. Commit and push

### Enable GitHub Actions Permissions

If deployment fails:
1. Go to **Settings → Actions → General**
2. Under **Workflow permissions**, select: **"Read and write permissions"**
3. Check **"Allow GitHub Actions to create and approve pull requests"**
4. Click **Save**

## Custom Domain (Optional)

1. Go to **Settings → Pages**
2. Under **Custom domain**, enter your domain
3. Follow DNS configuration instructions

## Update Your App

Just push changes:
```bash
git add .
git commit -m "Update app"
git push
```

GitHub Actions will automatically redeploy! 🚀

---

**That's it!** Your app is now live on GitHub Pages - free, fast, and accessible to everyone!

