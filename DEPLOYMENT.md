# Deployment Guide

Quick deployment guide for Card Reader PWA.

## Quick Deploy (5 minutes)

### Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/card-reader.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "Sign Up" and login with GitHub
   - Click "Add New Project"
   - Import your `card-reader` repository
   - Click "Deploy" (no configuration needed!)

3. **Done!** Your app is live at `https://your-project.vercel.app`

## Manual Deployment Steps

### Build Locally

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build
npm run preview
```

The `dist` folder contains your production-ready files.

### Upload to Hosting

Upload the contents of the `dist` folder to your hosting service:

- **Static Hosting:** Upload `dist` contents to your web server
- **CDN:** Upload to Cloudflare, AWS CloudFront, etc.
- **Web Server:** Copy to `/var/www/html` or your web root

## Platform-Specific Instructions

### Vercel
✅ Configuration file already included (`vercel.json`)
- Just connect your Git repository
- Auto-deploys on push

### Netlify
✅ Configuration file already included (`netlify.toml`)
- Connect Git repository
- Build settings auto-detected

### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Update vite.config.js base: `base: '/repo-name/'`
4. Run: `npm run deploy`
5. Enable Pages in repo settings

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select dist as public directory
firebase deploy
```

### AWS S3 + CloudFront
1. Build: `npm run build`
2. Upload `dist/*` to S3 bucket
3. Enable static website hosting
4. Create CloudFront distribution
5. Point to S3 bucket

## Important Notes

1. **HTTPS Required:** PWAs require HTTPS. All modern hosting platforms provide this automatically.

2. **Environment Variables:** If you need environment variables, set them in your hosting platform's dashboard.

3. **Custom Domain:** Most platforms allow custom domains:
   - Vercel: Project Settings → Domains
   - Netlify: Site Settings → Domain Management

4. **PWA Icons:** Before deploying, add custom icons to `public/`:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png`

## Testing After Deployment

1. Visit your deployed URL
2. Check browser console for errors
3. Test PWA installation:
   - Chrome/Edge: Look for install icon in address bar
   - Safari iOS: Share → Add to Home Screen
   - Android Chrome: Menu → Add to Home Screen
4. Test camera access
5. Test sheet saving functionality

## Troubleshooting

### Build Fails
- Check Node.js version (16+ required)
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### App Not Loading
- Check that `index.html` is in root of `dist`
- Verify all paths are relative
- Check browser console for 404 errors

### PWA Not Installing
- Must be served over HTTPS
- Check manifest.json is accessible
- Verify service worker is registered

### Camera Not Working
- Must be HTTPS (except localhost)
- Check browser permissions
- Test on actual device (not just emulator)

## Need Help?

- Check hosting platform documentation
- Review browser console for errors
- Test locally first with `npm run preview`

