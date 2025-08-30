import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// GitHub Pages specific configuration
export default defineConfig({
  base: './', // Use relative paths for GitHub Pages
  define: {
    __APP_ID__: JSON.stringify("musikk-meta-demo"),
    __API_PATH__: JSON.stringify(""),
    __API_HOST__: JSON.stringify(""),
    __API_PREFIX_PATH__: JSON.stringify(""),
    __API_URL__: JSON.stringify(""), // No backend for static build
    __WS_API_URL__: JSON.stringify(""), // No websocket for static build
    __APP_BASE_PATH__: JSON.stringify("./"),
    __APP_TITLE__: JSON.stringify("MusikkMeta - Demo"),
    __APP_FAVICON_LIGHT__: JSON.stringify("./favicon-light.svg"),
    __APP_FAVICON_DARK__: JSON.stringify("./favicon-dark.svg"),
    __APP_DEPLOY_USERNAME__: JSON.stringify(""),
    __APP_DEPLOY_APPNAME__: JSON.stringify(""),
    __APP_DEPLOY_CUSTOM_DOMAIN__: JSON.stringify(""),
    __STACK_AUTH_CONFIG__: JSON.stringify({}),
    __FIREBASE_CONFIG__: JSON.stringify({}),
  },
  plugins: [react(), tsConfigPaths()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});