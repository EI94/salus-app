/**
 * Servizio di caching delle immagini per migliorare le prestazioni su mobile
 */
class ImageCache {
  constructor() {
    this.cache = new Map();
    this.inProgressCache = new Map();
    
    // Verifica se l'API Cache è disponibile nel browser
    this.cacheAvailable = 'caches' in window;
    
    // Nome della cache per le immagini
    this.CACHE_NAME = 'salus-image-cache-v1';
    
    // Inizializza la cache
    this.init();
  }
  
  /**
   * Inizializza la cache
   */
  async init() {
    if (!this.cacheAvailable) return;
    
    try {
      // Apre o crea la cache
      const cache = await caches.open(this.CACHE_NAME);
      
      // Precarica immagini comuni come logo e icone
      const commonImages = [
        '/logo-light.svg',
        '/logo-dark.svg',
        '/favicon.ico'
      ];
      
      // Precarica le immagini comuni
      commonImages.forEach(url => this.preloadImage(url));
    } catch (error) {
      console.error('Errore nell\'inizializzazione della cache delle immagini:', error);
    }
  }
  
  /**
   * Precarica un'immagine nella cache
   * @param {string} url - URL dell'immagine da precaricare
   */
  async preloadImage(url) {
    if (!url) return;
    
    try {
      // Se l'immagine è già nella cache, non fare nulla
      if (this.cache.has(url)) return;
      
      // Se il caricamento è già in corso, non fare nulla
      if (this.inProgressCache.has(url)) return;
      
      // Segna questa immagine come "in fase di caricamento"
      this.inProgressCache.set(url, true);
      
      // Carica l'immagine
      const response = await fetch(url, { cache: 'force-cache' });
      
      if (!response.ok) {
        throw new Error(`Impossibile caricare l'immagine: ${url}`);
      }
      
      // Salva l'immagine nella cache del browser se disponibile
      if (this.cacheAvailable) {
        const cache = await caches.open(this.CACHE_NAME);
        await cache.put(url, response.clone());
      }
      
      // Salva l'immagine nella cache di memoria
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      this.cache.set(url, objectURL);
      
      // Rimuovi l'immagine dalla cache "in fase di caricamento"
      this.inProgressCache.delete(url);
      
      return objectURL;
    } catch (error) {
      console.error(`Errore nel precaricare l'immagine ${url}:`, error);
      this.inProgressCache.delete(url);
      return url;
    }
  }
  
  /**
   * Ottiene un'immagine dalla cache o la carica se non presente
   * @param {string} url - URL dell'immagine da ottenere
   * @returns {Promise<string>} - URL o Object URL dell'immagine
   */
  async getImage(url) {
    if (!url) return url;
    
    // Se l'immagine è nella cache, restituiscila immediatamente
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    // Altrimenti, carica l'immagine e restituisci l'URL originale nel frattempo
    this.preloadImage(url);
    return url;
  }
  
  /**
   * Elimina un'immagine dalla cache
   * @param {string} url - URL dell'immagine da eliminare
   */
  async clearImage(url) {
    if (!url) return;
    
    // Rimuovi dalla cache di memoria
    if (this.cache.has(url)) {
      URL.revokeObjectURL(this.cache.get(url));
      this.cache.delete(url);
    }
    
    // Rimuovi dalla cache del browser
    if (this.cacheAvailable) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        await cache.delete(url);
      } catch (error) {
        console.error(`Errore nell'eliminazione dell'immagine ${url} dalla cache:`, error);
      }
    }
  }
  
  /**
   * Pulisce tutta la cache delle immagini
   */
  async clearAll() {
    // Pulisci la cache di memoria
    this.cache.forEach((objectURL) => {
      URL.revokeObjectURL(objectURL);
    });
    this.cache.clear();
    
    // Pulisci la cache del browser
    if (this.cacheAvailable) {
      try {
        await caches.delete(this.CACHE_NAME);
      } catch (error) {
        console.error('Errore nella pulizia della cache delle immagini:', error);
      }
    }
  }
}

// Esporta una singola istanza del servizio
export default new ImageCache(); 