import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { csuTemplates } from './scripts/templates.mjs'

export default defineConfig({
  // Page markup lives in src/pages/**/*.html and is compiled to React views before React runs.
  plugins: [csuTemplates(), react()],
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'leaflet', test: /node_modules[\\/](leaflet|react-leaflet|@react-leaflet)/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'icons', test: /node_modules[\\/]lucide-react/ },
          ],
        },
      },
    },
  },
})
