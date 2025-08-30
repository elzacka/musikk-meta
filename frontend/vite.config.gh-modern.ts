import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// GitHub Pages specific build configuration
export default defineConfig({
  plugins: [react()],
  base: '/musikk-meta/',
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/features": path.resolve(__dirname, "./src/features"),
    },
  },

  // GitHub Pages build optimization
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-scroll-area', 'lucide-react'],
          state: ['zustand', '@tanstack/react-query'],
        },
      },
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },

  // Environment variables for GitHub Pages
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'import.meta.env.VITE_GOOGLE_SHEETS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_SHEETS_API_KEY || ''),
    'import.meta.env.VITE_GOOGLE_SHEET_ID': JSON.stringify(process.env.VITE_GOOGLE_SHEET_ID || ''),
  },
})