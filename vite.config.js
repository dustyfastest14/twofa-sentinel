import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import prerender from '@prerenderer/rollup-plugin'
import puppeteerRenderer from '@prerenderer/renderer-puppeteer'

// Check if we're in a CI/CD environment where Puppeteer might not work
// Cloudflare Workers and other CI environments often lack required system libraries
const shouldPrerender = process.env.CI !== 'true' && 
                        !process.env.CF_PAGES && 
                        !process.env.NETLIFY &&
                        process.env.ENABLE_PRERENDER !== 'false'

// Plugin to inject Plausible analytics if configured via environment variable
// Set PLAUSIBLE_SCRIPT to your Plausible script URL to enable analytics
// Example: PLAUSIBLE_SCRIPT=https://plausible.io/js/pa-YOUR-DOMAIN.js
const plausibleScript = process.env.PLAUSIBLE_SCRIPT
const plausibleAnalytics = plausibleScript ? {
  name: 'plausible-analytics',
  transformIndexHtml(html) {
    const scriptTag = `
  <!-- Privacy-friendly analytics by Plausible -->
  <script async src="${plausibleScript}"></script>
  <script>
    window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
    plausible.init()
  </script>`
    return html.replace('</head>', `${scriptTag}\n</head>`)
  }
} : null

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Add Plausible analytics if PLAUSIBLE_SCRIPT environment variable is set
    ...(plausibleAnalytics ? [plausibleAnalytics] : []),
    // Only enable prerendering in local development builds
    // Puppeteer requires system libraries not available in Cloudflare Workers
    ...(shouldPrerender ? [
      prerender({
        routes: ['/'],
        renderer: puppeteerRenderer,
        rendererOptions: {
          // Wait for the app to be fully rendered
          renderAfterDocumentEvent: 'app-rendered',
          headless: true,
        },
        postProcess(renderedRoute) {
          // Inject a flag to indicate this is pre-rendered
          renderedRoute.html = renderedRoute.html.replace(
            '<head>',
            '<head><meta name="prerendered" content="true">'
          )
          return renderedRoute
        }
      })
    ] : []),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'icon.svg', 'robots.txt', 'sitemap.xml', 'site.webmanifest'],
      manifest: {
        name: 'twofa.dev',
        short_name: 'TOTP',
        description: 'Generate secure TOTP 2FA codes offline in your browser. No account needed, no data sent to servers.',
        theme_color: '#18181b',
        background_color: '#fafafa',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        // Cache all assets for offline use
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Precache all necessary files
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      devOptions: {
        enabled: true // Enable PWA in dev mode for testing
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
