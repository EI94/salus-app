/**
 * Service Worker per Salus App
 * Questo file deve essere posizionato nella cartella public per essere disponibile alla root del sito
 */

// Nome della cache
const CACHE_NAME = 'salus-cache-v1';

// Lista delle risorse da mettere in cache
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

// URL dell'API
const API_URL = self.location.origin.includes('localhost') 
  ? 'http://localhost:5000/api' 
  : 'https://salus-backend.onrender.com/api';

/**
 * Evento di installazione:
 * Precaricare e memorizzare nella cache le risorse essenziali
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
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
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Elimina le vecchie cache
            return caches.delete(cacheName);
          }
          return null;
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
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Non memorizzare nella cache le chiamate API in POST o altre richieste non GET
  if (request.method !== 'GET') {
    return;
  }
  
  try {
    const url = new URL(request.url);
    
    // Strategia per le API: Network first, poi fallback alla cache
    if (url.href.includes('/api/')) {
      event.respondWith(networkFirstStrategy(request));
      return;
    }
  } catch (e) {
    // URL non valido, continua normalmente
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
    .then((response) => {
      // Controlla se la risposta è valida
      if (!response || response.status !== 200) {
        return response;
      }
      
      // Clona la risposta perché il body può essere usato solo una volta
      const responseToCache = response.clone();
      
      // Memorizza nella cache la risposta per uso futuro
      caches.open(CACHE_NAME).then((cache) => {
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
    .then((cachedResponse) => {
      // Se troviamo una risposta nella cache, la restituiamo
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Altrimenti, prendiamo dalla rete
      return fetch(request).then((response) => {
        // Controlla se la risposta è valida
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Clona la risposta perché il body può essere usato solo una volta
        const responseToCache = response.clone();
        
        // Memorizza nella cache la risposta per uso futuro
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      });
    });
} 