/**
 * Servizio per la gestione di localStorage con gestione errori
 */
export const localStorageService = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Errore nella lettura da localStorage (${key}):`, error);
      return null;
    }
  },
  
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Errore nella scrittura su localStorage (${key}):`, error);
      return false;
    }
  },
  
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Errore nella rimozione da localStorage (${key}):`, error);
      return false;
    }
  },
  
  getJson: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Errore nella lettura/parsing da localStorage (${key}):`, error);
      return null;
    }
  },
  
  setJson: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error(`Errore nel salvataggio in localStorage (${key}):`, error);
      
      // Gestione di localStorage pieno
      if (error instanceof DOMException && 
          (error.name === 'QuotaExceededError' || 
           error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn('Spazio di archiviazione locale esaurito. Alcuni dati potrebbero non essere salvati.');
      }
      
      return false;
    }
  }
}; 