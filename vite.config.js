import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// For GitHub Pages: set base to '/repository-name/' if deploying to project pages
// Leave empty string '/' if deploying to user/organization root pages
// This will be automatically adjusted during build
const getBase = () => {
  // If REPO_NAME is set, use it (useful for CI/CD)
  if (process.env.REPO_NAME) {
    return `/${process.env.REPO_NAME}/`;
  }
  // Default: empty base for root deployment
  // Change to '/card-reader/' if deploying to project pages
  return process.env.GITHUB_PAGES === 'true' ? '/card-reader/' : '/';
};

export default defineConfig({
  base: getBase(),
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Card Reader - Business Card Scanner',
        short_name: 'Card Reader',
        description: 'Scan business cards and extract contact information',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: getBase(),
        scope: getBase(),
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
