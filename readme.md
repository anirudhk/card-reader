# Card Reader - Business Card Scanner PWA

A Progressive Web Application (PWA) that intelligently scans business cards, extracts contact information (name, email, phone, LinkedIn, company, job title, website, address), and automatically saves the data to **Google Sheets** or **Zoho Sheets** with smart column mapping.

## 🚀 Quick Deploy to GitHub Pages (Recommended)

**Deploy for FREE on GitHub Pages - No account required for users!**

📖 **[See GitHub Pages Deployment Guide](./GITHUB_PAGES_DEPLOY.md)** - Complete step-by-step instructions

**Quick Steps:**
1. Push code to GitHub
2. Enable GitHub Pages in Settings
3. Done! App is live at `https://YOUR-USERNAME.github.io/card-reader/`

**Or see [QUICK_START.md](./QUICK_START.md)** for other hosting options.

## Features

- 📸 **Camera & Image Upload**: Take photos directly from your device or upload existing images
- 🤖 **AI-Powered OCR**: Choose between Google Cloud Vision API (95%+ accuracy) or offline Tesseract.js
- 🎯 **Intelligent Data Extraction**: Automatically identifies and extracts:
  - Name
  - Email address
  - Phone number
  - LinkedIn profile URL
  - Company name
  - Job title
  - Website URL
  - Physical address
- 📊 **Dual Sheets Integration**: Seamlessly saves extracted data to Google Sheets or Zoho Sheets
- 🧠 **Smart Column Mapping**: Automatically detects existing columns in your sheet and maps data accordingly. If a column doesn't exist, it intelligently creates one.
- 📱 **Cross-Platform**: Works on Android, iOS, and desktop browsers as a PWA
- ✨ **Offline Capable**: Progressive Web App with service worker support

## Tech Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **UI Framework**: Material-UI (MUI)
- **OCR Engines**: Google Cloud Vision API (AI-powered, recommended) + Tesseract.js (offline fallback)
- **Sheets APIs**: Google Sheets API v4, Zoho Sheets API v2
- **PWA**: Vite PWA Plugin

## Prerequisites

- Node.js 16+ and npm/yarn
- **(Optional but Recommended)** Google Cloud Vision API key for better OCR accuracy (first 1,000 requests/month free)
- Google Sheets API setup OR Zoho Sheets API setup (see below)

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd card-reader
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **(Optional but Recommended) Set up Google Cloud Vision API for Better OCR**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the **Cloud Vision API**:
     - Go to "APIs & Services" > "Library"
     - Search for "Cloud Vision API"
     - Click "Enable"
   - Create an API Key:
     - Go to "APIs & Services" > "Credentials"
     - Click "Create Credentials" > "API Key"
     - Copy the API key
     - (Optional) Click "Restrict Key" to limit it to Vision API for security
   - Enter the API key in the app's OCR Configuration section
   - **Free Tier:** First 1,000 requests/month are free!

4. **Set up Google Sheets (Optional - if using Google Sheets)**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the **Google Sheets API**
   - Create a **Service Account**:
     - Go to "IAM & Admin" > "Service Accounts"
     - Click "Create Service Account"
     - Give it a name (e.g., "card-reader-service")
     - Grant it the "Editor" role (or create a custom role with Sheets API permissions)
     - Click "Create Key" and download the JSON credentials file
   - Save the credentials file securely (do NOT commit it to version control)
   - Create a new Google Spreadsheet or use an existing one
   - Copy the Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Share the spreadsheet with the service account email (found in the credentials JSON file)
   - Give it "Editor" permissions

   **OR**

4. **Set up Zoho Sheets (Optional - if using Zoho Sheets)**:
   - Go to [Zoho API Console](https://api-console.zoho.com/)
   - Create a new application or select an existing one
   - Generate OAuth credentials:
     - Note your **Client ID** and **Client Secret**
     - Set redirect URI (for OAuth flow) or use Self Client for server-to-server
   - Generate an **Access Token** with `ZohoSheet.workbooks.ALL` scope:
     - Visit: `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoSheet.workbooks.ALL&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=YOUR_REDIRECT_URI`
     - Authorize and get the authorization code
     - Exchange the code for an access token via POST to `https://accounts.zoho.com/oauth/v2/token`
   - Create a new Zoho Workbook or use an existing one
   - Copy the Workbook ID from the URL: `https://sheet.zoho.com/sheet/WORKBOOK_ID`
   - Save your access token securely (do NOT commit it to version control)

## Usage

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Build for production**:
   ```bash
   npm run build
   ```

3. **Preview production build**:
   ```bash
   npm run preview
   ```

## How to Use the App

1. **Configure OCR (Optional but Recommended)**:
   - Open the app in your browser
   - In the "OCR Configuration" section, choose:
     - **AI-Powered (Google Vision)**: Enter your Google Vision API key for 95%+ accuracy
     - **Offline (Tesseract)**: Works without API key but with ~70-80% accuracy
   - If using Google Vision API, paste your API key and it will be saved locally

2. **Configure Sheets**:
   - Open the app in your browser
   - Select either "Google Sheets" or "Zoho Sheets" tab
   - **For Google Sheets**:
     - Enter your Google Spreadsheet ID
     - Upload your Service Account credentials JSON file
   - **For Zoho Sheets**:
     - Enter your Zoho Workbook ID
     - Enter your OAuth Access Token

3. **Scan a Business Card**:
   - Click "Take Photo" to use your device camera
   - Or click "Upload Image" to select an image file
   - Wait for the OCR processing to complete:
     - **With Google Vision API:** 1-2 seconds
     - **With Tesseract (offline):** 5-15 seconds

4. **Review Extracted Data**:
   - The app will display all extracted information
   - Check which OCR method was used (shown below the extracted data)
   - Review and verify the data accuracy
   - Edit if necessary (future feature)

5. **Save to Sheets**:
   - Click "Save to Google Sheets" or "Save to Zoho Sheets" (depending on your selection)
   - The app will intelligently map the data to existing columns or create new ones
   - You'll receive a confirmation message when successful

## Intelligent Column Mapping

The app uses smart algorithms to map extracted data to your spreadsheet columns:

- **Detects existing columns** by matching keywords:
  - Name: "name", "full name", "person", "contact name"
  - Email: "email", "e-mail", "email address", "mail"
  - Phone: "phone", "telephone", "mobile", "cell", "phone number"
  - LinkedIn: "linkedin", "linkedin profile", "linkedin url"
  - Company: "company", "organization", "org", "firm", "business"
  - Job Title: "title", "job title", "position", "role", "designation"
  - Website: "website", "url", "web", "site"
  - Address: "address", "location", "street", "office"

- **Creates new columns** automatically if matching columns don't exist
- **Preserves existing data** and only appends new rows

## Data Extraction Intelligence

The OCR service uses advanced pattern recognition:

- **Email**: Regex pattern matching for valid email formats
- **Phone**: Supports various formats (US, international, with/without country codes)
- **LinkedIn**: Detects LinkedIn URLs and profile identifiers
- **Website**: Identifies company websites (excludes social media)
- **Name**: Uses heuristics to identify the person's name (usually first substantial line)
- **Company**: Detects business entity names with keywords like "Inc", "Ltd", "LLC"
- **Job Title**: Recognizes common professional titles
- **Address**: Pattern matching for street addresses with zip codes

## Installing as a PWA

### Android (Chrome/Edge):
1. Open the app in Chrome/Edge browser
2. Tap the menu (three dots) > "Add to Home Screen"
3. The app will appear as an icon on your home screen

### iOS (Safari):
1. Open the app in Safari browser
2. Tap the Share button > "Add to Home Screen"
3. The app will appear as an icon on your home screen

### Desktop:
- Chrome/Edge: Click the install icon in the address bar
- The app will open in a standalone window

## Project Structure

```
card-reader/
├── src/
│   ├── components/
│   │   ├── CardScanner.jsx          # Camera/upload component
│   │   ├── ExtractedDataDisplay.jsx # Data review component
│   │   └── SheetsConfig.jsx         # Google/Zoho Sheets setup
│   ├── services/
│   │   ├── ocrService.js            # OCR and data extraction
│   │   ├── sheetsService.js         # Google Sheets integration
│   │   └── zohoSheetsService.js     # Zoho Sheets integration
│   ├── App.jsx                       # Main app component
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Global styles
├── index.html                        # HTML template
├── vite.config.js                    # Vite configuration with PWA plugin
├── package.json                      # Dependencies and scripts
└── readme.md                         # This file
```

## Environment Variables (Optional)

For production deployments, you can use environment variables:

```env
VITE_SHEETS_API_KEY=your_api_key
VITE_DEFAULT_SPREADSHEET_ID=your_spreadsheet_id
```

## Troubleshooting

### OCR Not Working Properly:
- Ensure good lighting when taking photos
- Hold the camera steady and focus on the text
- Clean the camera lens
- Try with a higher resolution image

### Google Sheets Errors:
- Verify the Spreadsheet ID is correct
- Ensure the service account email has access to the sheet
- Check that the Google Sheets API is enabled in your project
- Verify the credentials JSON file is valid

### Zoho Sheets Errors:
- Verify the Workbook ID is correct (from the URL)
- Ensure your Access Token is valid and not expired
- Check that the token has `ZohoSheet.workbooks.ALL` scope
- Verify you have write permissions to the workbook
- Access tokens expire - you may need to generate a new one

### PWA Not Installing:
- Make sure you're using HTTPS (required for PWA)
- Clear browser cache and try again
- Check browser console for errors

## Security Notes

- **Never commit** your credentials to version control:
  - Google Service Account JSON files
  - Zoho Access Tokens
- All credential files are already in `.gitignore`
- For production, consider using environment variables or a secure backend service
- The app processes images locally; OCR happens in the browser
- Zoho access tokens have expiration times - consider implementing token refresh logic for production use

## Future Enhancements

- [ ] Edit extracted data before saving
- [ ] Batch processing (multiple cards at once)
- [ ] Contact list management
- [ ] Export to other formats (CSV, vCard)
- [ ] Improved OCR accuracy with image preprocessing
- [ ] Multi-language support
- [ ] QR code scanning for digital business cards
- [ ] History of scanned cards
- [ ] Data validation and correction suggestions

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Deployment & Hosting

The app is ready to deploy to various hosting platforms. Choose the one that best fits your needs:

### Option 1: Vercel (Recommended - Easiest)

**Steps:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in with your Git provider
3. Click "Add New Project"
4. Import your repository
5. Vercel will auto-detect Vite settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Click "Deploy"
7. Your app will be live at `https://your-project.vercel.app`

**Features:**
- ✅ Free HTTPS/SSL
- ✅ Automatic deployments on git push
- ✅ Custom domain support
- ✅ Global CDN
- ✅ Zero configuration needed (vercel.json is already included)

### Option 2: Netlify

**Steps:**
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Select your Git provider and repository
5. Netlify will auto-detect settings (netlify.toml is already included):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"
7. Your app will be live at `https://random-name.netlify.app`

**Features:**
- ✅ Free HTTPS/SSL
- ✅ Automatic deployments
- ✅ Custom domain support
- ✅ Global CDN
- ✅ Form handling (if needed later)

### Option 3: GitHub Pages (✅ Recommended - Free & No Account Needed)

**Best for:** Public apps, free hosting, no user account required

**Complete Guide:** See [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md) for detailed instructions.

**Quick Steps:**
1. Push code to GitHub repository
2. Update base path in `vite.config.js` (replace `'card-reader'` with your repo name)
3. Enable GitHub Pages: **Settings → Pages → Source: GitHub Actions**
4. Push to `main` branch - automatic deployment!
5. Your app will be at `https://YOUR-USERNAME.github.io/card-reader/`

**Manual Deployment Alternative:**
```bash
npm install
npm run deploy  # Builds and deploys to gh-pages branch
```

**Features:**
- ✅ Completely FREE
- ✅ No account required for users
- ✅ Automatic HTTPS/SSL
- ✅ Custom domain support
- ✅ Automatic deployments via GitHub Actions
- ✅ Public access for everyone

### Option 4: Other Hosting Services

**Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

**AWS Amplify:**
- Connect your Git repository
- Amplify auto-detects Vite and builds automatically

**Cloudflare Pages:**
- Connect Git repository
- Build command: `npm run build`
- Build output directory: `dist`

### Local Production Build Test

Before deploying, test the production build locally:

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:4173` to test your production build.

### Environment Variables

For production, you can set environment variables in your hosting platform:

- `VITE_DEFAULT_PROVIDER`: Default sheet provider ('google' or 'zoho')
- Other environment variables if needed

**Note:** Environment variables must be prefixed with `VITE_` to be accessible in the browser.

### PWA Icons

Before deploying, you may want to add custom PWA icons:

1. Create icons:
   - `public/pwa-192x192.png` (192x192)
   - `public/pwa-512x512.png` (512x512)
   - `public/apple-touch-icon.png` (180x180)
   - `public/mask-icon.svg`

2. Use tools like:
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

3. The icons will be automatically included in the build.

### After Deployment

Once deployed:
1. ✅ Share the URL with users
2. ✅ Users can install as PWA from their browser
3. ✅ App works offline after first visit
4. ✅ Automatic updates when you deploy new versions

**Important:** Make sure your hosting platform serves the app over **HTTPS** (required for PWAs and camera access).

## Support

For issues, questions, or feature requests, please open an issue on the repository.

---

**Built with ❤️ using React, Tesseract.js, Google Sheets API, and Zoho Sheets API**

