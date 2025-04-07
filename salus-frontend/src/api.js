import axios from 'axios';

// URL di base per l'API
export const apiUrl = process.env.REACT_APP_API_URL || 'https://salus-backend.onrender.com/api';

// Configurazione istanza Axios con opzioni di base
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // 15 secondi di timeout per le richieste
});

// Interceptor per aggiungere il token di autenticazione a ogni richiesta
api.interceptors.request.use(
  (config) => {
    // Stampa l'URL completo della richiesta per debug
    console.log('Richiesta API:', config.method.toUpperCase(), config.baseURL + config.url);
    
    // Aggiungi token di autenticazione se disponibile
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Errore nella preparazione della richiesta:', error);
    return Promise.reject(error);
  }
);

// Interceptor per gestire gli errori nelle risposte
api.interceptors.response.use(
  (response) => {
    console.log('Risposta API ricevuta:', response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Errore API:', error.response.status, error.response.data);
      
      // Se il server restituisce un 401 Unauthorized, eseguiamo il logout
      if (error.response.status === 401) {
        console.log('Sessione scaduta. Reindirizzamento al login...');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // La richiesta è stata effettuata ma non è stata ricevuta risposta
      console.error('Nessuna risposta dal server:', error.request);
    } else {
      // Si è verificato un errore durante la configurazione della richiesta
      console.error('Errore di configurazione della richiesta:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Funzione di utilità per il localStorage con gestione errori
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
  }
};

export default api; 