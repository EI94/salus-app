/**
 * Service Worker per l'applicazione Salus
 * Implementa funzionalità offline-first e caching strategico
 */

// Nome della cache
const CACHE_NAME = 'salus-cache-v1';

// Risorse da precare e mettere in cache all'installazione
const PRECACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo-light.svg',
  '/logo-dark.svg',
  '/placeholder.svg',
  '/error-image.svg'
];

// API URLs che non dovrebbero essere messe in cache
const API_URL = process.env.REACT_APP_API_URL || 'https://salus-backend.onrender.com/api';

/**
 * Registra il service worker
 */
export function register() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
      
      registerValidSW(swUrl);
      
      // Aggiorna la cache quando l'utente è online
      window.addEventListener('online', () => {
        console.log('App è tornata online. Aggiornamento della cache...');
        updateCache();
      });
    });
  }
}

/**
 * Registra un service worker valido
 * @param {string} swUrl - URL del service worker
 */
function registerValidSW(swUrl) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      console.log('Service Worker registrato con successo:', registration);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // A questo punto, il contenuto precariato è stato recuperato,
              // ma il vecchio contenuto verrà mostrato finché tutte le
              // schede non vengono chiuse.
              console.log(
                'Nuovo contenuto disponibile e verrà utilizzato quando ' +
                'tutte le schede per questa pagina sono chiuse.'
              );
            } else {
              // A questo punto, tutto è stato precariato.
              console.log('Contenuto memorizzato nella cache per l\'uso offline.');
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Errore durante la registrazione del service worker:', error);
    });
}

/**
 * Aggiorna la cache quando l'app è online
 */
function updateCache() {
  if ('serviceWorker' in navigator) {
    // Forza l'aggiornamento del service worker
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
    
    // Aggiorna le risorse in cache
    if ('caches' in window) {
      caches.open(CACHE_NAME).then(cache => {
        // Aggiunge le risorse di base alla cache
        cache.addAll(PRECACHE_RESOURCES);
      });
    }
  }
}

/**
 * Cancella la registrazione del service worker
 */
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
} 