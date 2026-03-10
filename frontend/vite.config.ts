import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

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

  server: {
    port: 3000,
    host: true,
    open: true,
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-scroll-area', 'lucide-react'],
          state: ['zustand'],
        },
      },
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
})
