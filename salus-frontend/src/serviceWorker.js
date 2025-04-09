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
    caches.open(CACHE_NAME).then(cache => {
      // Aggiunge le risorse di base alla cache
      cache.addAll(PRECACHE_RESOURCES);
    });
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

/**
 * Evento di installazione:
 * Precaricare e memorizzare nella cache le risorse essenziali
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta');
        return cache.addAll(PRECACHE_RESOURCES);
      })
  );
  
  // Forza l'attivazione immediata del service worker
  self.skipWaiting();
});

/**
 * Evento di attivazione:
 * Ripulisce le vecchie cache
 */
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Elimina le vecchie cache
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Fa in modo che il service worker prenda il controllo immediatamente
  self.clients.claim();
});

/**
 * Evento fetch:
 * Strategia di caching basata sul tipo di risorsa
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Non memorizzare nella cache le chiamate API in POST o altre richieste non GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategia per le API: Network first, poi fallback alla cache
  if (url.href.startsWith(API_URL)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Strategia per le risorse statiche: Cache first, poi fallback alla rete
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Strategia Network First:
 * Prova prima la rete, se fallisce usa la cache
 */
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      // Controlla se la risposta è valida
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }
      
      // Clona la risposta perché il body può essere usato solo una volta
      const responseToCache = response.clone();
      
      // Memorizza nella cache la risposta per uso futuro
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseToCache);
      });
      
      return response;
    })
    .catch(() => {
      // Se la rete fallisce, controlla la cache
      return caches.match(request);
    });
}

/**
 * Strategia Cache First:
 * Prova prima la cache, se non trova usa la rete
 */
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(cachedResponse => {
      // Se troviamo una risposta nella cache, la restituiamo
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Altrimenti, prendiamo dalla rete
      return fetch(request).then(response => {
        // Controlla se la risposta è valida
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clona la risposta perché il body può essere usato solo una volta
        const responseToCache = response.clone();
        
        // Memorizza nella cache la risposta per uso futuro
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    });
} 