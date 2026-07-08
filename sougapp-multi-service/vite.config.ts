import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from "path"

export default defineConfig({
  plugins: [react(), visualizer({ filename: 'dist/stats.html', open: false, gzipSize: true, brotliSize: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) return 'vendor-react';
          if (id.includes('node_modules/recharts/')) return 'vendor-charts';
          if (id.includes('node_modules/leaflet/') || id.includes('node_modules/react-leaflet/')) return 'vendor-maps';
          if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) return 'vendor-i18n';
          if (id.includes('node_modules/lucide-react/')) return 'vendor-icons';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
})
