import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Wall of Names',
        short_name: 'Wall of Names',
        description:
          'A live community sign-in wall — add your name and see it appear instantly for everyone.',
        theme_color: '#4a2f1e',
        background_color: '#2b1b12',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // App shell is cached for offline load; live name data still
        // requires a network round-trip to Supabase.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      }
    })
  ]
})
