// PWA Service Worker-registrering og hjelpe-funksjoner

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      // Bruk relativ sti for å støtte GitHub Pages sub-paths
      const swUrl = new URL('./sw.js', import.meta.url).pathname;
      const registration = await navigator.serviceWorker.register(swUrl);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Ny versjon tilgjengelig
            console.info('MusikkMeta: ny versjon tilgjengelig — last siden på nytt for å oppdatere.');
          }
        });
      });
    } catch (error) {
      console.error('Service Worker-registrering feilet:', error);
    }
  });
}

export function isInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  );
}

export function getConnectionStatus() {
  return {
    online: navigator.onLine,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    effectiveType: (navigator as any).connection?.effectiveType ?? 'ukjent',
  };
}

export async function clearAppCache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}
