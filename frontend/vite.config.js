import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'TraderAssistant - Gold & Silver Trading Dashboard',
        short_name: 'TraderAssistant',
        description: 'Professional commodity trading dashboard for gold and silver',
        theme_color: '#1a237e',
        background_color: '#0a0e1a',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: { port: 3000 },
  build: { outDir: 'dist', sourcemap: false },
})
