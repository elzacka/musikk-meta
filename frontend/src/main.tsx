import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppWrapper } from './AppWrapper.tsx'
import './index.css'
// Polyfill for support react use in react 18
import "./polyfills/react-polyfill";
// PWA Service Worker registration
import { registerServiceWorker } from './utils/pwa';

// Register PWA Service Worker
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)
