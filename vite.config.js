import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// C18: CSS purging — Vite uses lightningcss + tree-shaking by default.
// For production, enable cssMinify and cssCodeSplit to eliminate unused CSS.
// PurgeCSS can be added as a PostCSS plugin for deeper purging if needed.

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    // C18: Enable CSS code splitting so each route only loads its CSS
    devSourcemap: true,
  },
  build: {
    // C18: Aggressive CSS minification
    cssMinify: 'lightningcss',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large libs
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
        }
      }
    }
  }
})
