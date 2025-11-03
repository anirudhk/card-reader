# 🚀 Quick Start - Deploy in 5 Minutes

## Fastest Way: Deploy to Vercel

### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/card-reader.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to **https://vercel.com**
2. Sign up/Login with GitHub
3. Click **"Add New Project"**
4. Import your `card-reader` repository
5. Click **"Deploy"** (no config needed!)

### Step 3: Done! 🎉
Your app is live! Share the URL with users.

**URL will be:** `https://your-project.vercel.app`

---

## Alternative: Netlify

1. Push to GitHub (same as above)
2. Go to **https://netlify.com**
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your repo
5. Click **"Deploy site"**

**URL will be:** `https://random-name.netlify.app`

---

## Test Locally First (Optional)

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test the production build
npm run preview
```

Visit `http://localhost:4173` to preview.

---

## After Deployment

✅ **Share the URL** - Users can access the app  
✅ **PWA Install** - Users can install as an app  
✅ **Works Offline** - After first visit  
✅ **Auto Updates** - When you deploy new versions  

---

## Need Custom Domain?

- **Vercel:** Project Settings → Domains
- **Netlify:** Site Settings → Domain Management

Both support free custom domains!

---

## Troubleshooting

**Build fails?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**App not working?**
- Must be HTTPS (automatic on Vercel/Netlify)
- Check browser console for errors
- Test camera permissions on actual device

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.

