import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Modern Vite config focused on performance and developer experience
export default defineConfig({
  plugins: [react()],
  
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

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
  },

  // Build optimization
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          react: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-scroll-area', 'lucide-react'],
          state: ['zustand', '@tanstack/react-query'],
        },
      },
    },
    // Remove console logs in production
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },

  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
})