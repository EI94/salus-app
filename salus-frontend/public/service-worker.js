/* eslint-disable no-restricted-globals */

// Questo service worker può essere personalizzato
// https://developers.google.com/web/tools/workbox/

const CACHE_NAME = 'salus-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/vendors~main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Installazione del service worker e memorizzazione delle risorse nella cache
self.addEventListener('install', event => {
  // Esegue l'installazione
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta');
        return cache.addAll(urlsToCache);
      })
  );
});

// Funzione per verificare se un URL è valido per il caching
function isValidCacheRequest(url) {
  // Verifica che l'URL inizi con http o https
  if (!url.startsWith('http')) {
    return false;
  }
  
  // Esclude gli schemi non supportati
  if (url.startsWith('chrome-extension:') || 
      url.startsWith('data:') ||
      url.startsWith('blob:')) {
    return false;
  }
  
  return true;
}

// Gestione delle richieste di rete
self.addEventListener('fetch', (event) => {
  // Interrompe subito se non è una richiesta valida per il caching
  if (!isValidCacheRequest(event.request.url)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clona la richiesta
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Controlla se abbiamo ricevuto una risposta valida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la risposta
            const responseToCache = response.clone();

            // Salva nella cache solo se è un URL valido
            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  if (isValidCacheRequest(event.request.url)) {
                    cache.put(event.request, responseToCache);
                  }
                } catch (e) {
                  console.error('Errore nel caching:', e);
                }
              });

            return response;
          }
        ).catch(error => {
          console.error('Errore nel fetch:', error);
          // Fallback per richieste di rete fallite
          return new Response('Errore di rete', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});

// Aggiornamento della cache quando viene installata una nuova versione del service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Rimuovi le cache precedenti
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 