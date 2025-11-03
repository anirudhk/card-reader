#!/bin/bash

# GitHub Pages Quick Setup Script
# This script helps you set up and deploy to GitHub Pages

echo "🚀 GitHub Pages Deployment Setup"
echo "=================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit"
    echo "✅ Git repository initialized"
    echo ""
fi

# Get repository name from user or git remote
REPO_NAME=""
if git remote get-url origin &> /dev/null; then
    REPO_URL=$(git remote get-url origin)
    REPO_NAME=$(basename -s .git "$REPO_URL")
    echo "📝 Detected repository name: $REPO_NAME"
else
    echo "📝 Please enter your GitHub repository name (e.g., 'card-reader'):"
    read -r REPO_NAME
fi

echo ""
echo "📝 Updating vite.config.js with repository name: $REPO_NAME"
echo ""

# Update vite.config.js with the repository name
sed -i.bak "s|'/card-reader/'|'/$REPO_NAME/'|g" vite.config.js
rm vite.config.js.bak 2>/dev/null || true

echo "✅ Configuration updated!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. If you haven't created a GitHub repository yet:"
echo "   - Go to https://github.com/new"
echo "   - Create a repository named: $REPO_NAME"
echo "   - Make it PUBLIC (required for free GitHub Pages)"
echo ""
echo "2. Connect your repository:"
echo "   git remote add origin https://github.com/YOUR-USERNAME/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to your repository on GitHub"
echo "   - Settings → Pages"
echo "   - Source: Select 'GitHub Actions'"
echo "   - Save"
echo ""
echo "4. Your app will be live at:"
echo "   https://YOUR-USERNAME.github.io/$REPO_NAME/"
echo ""
echo "📖 For detailed instructions, see: GITHUB_PAGES_DEPLOY.md"
echo ""
echo "✨ Done! Ready to deploy!"

