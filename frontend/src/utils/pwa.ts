// PWA Service Worker registration and utilities

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered successfully:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New version available
                  console.log('🔄 New version available - reload to update');
                  showUpdateNotification();
                } else {
                  // App is cached for first time
                  console.log('📱 App is now available offline');
                }
              }
            });
          }
        });
        
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    });
  }
}

function showUpdateNotification() {
  // You could show a toast or banner here
  // For now, just log to console
  console.log('💡 New version available - refresh to update');
}

export function checkPWASupport(): boolean {
  return !!(
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: fullscreen)').matches ||
         // @ts-ignore - iOS Safari
         window.navigator.standalone === true;
}

export function getInstallPrompt() {
  // Modern browsers
  if ('BeforeInstallPromptEvent' in window) {
    let deferredPrompt: any = null;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
    });
    
    return {
      canInstall: () => deferredPrompt !== null,
      install: async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const result = await deferredPrompt.userChoice;
          deferredPrompt = null;
          return result.outcome === 'accepted';
        }
        return false;
      }
    };
  }
  
  return {
    canInstall: () => false,
    install: () => Promise.resolve(false)
  };
}

export function getConnectionStatus() {
  return {
    online: navigator.onLine,
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
    downlink: (navigator as any).connection?.downlink || 0
  };
}

// Cache management utilities
export async function clearAppCache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    console.log('🧹 App cache cleared');
  }
}

export async function getCacheSize() {
  if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      total: estimate.quota || 0,
      percentage: estimate.usage && estimate.quota ? 
        Math.round((estimate.usage / estimate.quota) * 100) : 0
    };
  }
  return { used: 0, total: 0, percentage: 0 };
}