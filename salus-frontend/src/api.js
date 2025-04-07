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

// Funzione per inviare un messaggio all'AI Assistant
export const sendMessageToAI = async (message) => {
  try {
    console.log('Invio messaggio all\'assistente AI');
    
    // Verifica token nei diversi metodi di storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    // Se nessun token o userId è disponibile, restituisci una risposta offline
    if (!token && !userId) {
      console.log('Utente non autenticato, utilizzando risposta di fallback');
      return {
        reply: "Per utilizzare l'assistente AI devi effettuare l'accesso. Accedi o registrati per continuare.",
        offline: true
      };
    }
    
    // Tentativo di richiesta API
    try {
      const response = await api.post('/ai/chat', { message });
      console.log('Risposta AI ricevuta con successo');
      return response.data;
    } catch (apiError) {
      console.error('Errore nella chiamata API AI:', apiError);
      
      // Restituisci una risposta offline in caso di errore
      return {
        reply: "Mi dispiace, in questo momento non riesco a connettermi al servizio AI. Riprova più tardi o contatta assistenza.",
        offline: true,
        error: apiError.message
      };
    }
  } catch (error) {
    console.error('Errore generale nel servizio AI:', error);
    return {
      reply: "Si è verificato un problema con l'assistente AI. Riprova più tardi.",
      offline: true,
      error: error.message
    };
  }
};

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