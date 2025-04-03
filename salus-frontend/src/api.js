import axios from 'axios';

// Imposta l'URL di base dell'API
export const apiUrl = process.env.REACT_APP_API_URL || 'https://salus-backend.onrender.com';

// Funzione per normalizzare i percorsi API ed evitare duplicazioni
export const normalizePath = (path) => {
  // Se il percorso inizia con /api e l'URL di base termina con /api,
  // rimuoviamo /api dal percorso
  if (path.startsWith('/api/') && apiUrl.endsWith('/api')) {
    return path.substring(4); // Rimuovi '/api' all'inizio
  }
  
  // Se il percorso inizia con api/ (senza slash iniziale)
  if (path.startsWith('api/') && apiUrl.endsWith('/api')) {
    return path.substring(3); // Rimuovi 'api' all'inizio
  }
  
  // Se il percorso non inizia con / ma deve essere aggiunto
  if (!path.startsWith('/') && !apiUrl.endsWith('/')) {
    return '/' + path;
  }
  
  return path;
};

// Configurazione istanza Axios con intercettore per normalizzare i percorsi
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // 10 secondi di timeout per le richieste
});

// Aggiungi un interceptor per il debug delle richieste API e normalizzazione dei percorsi
api.interceptors.request.use(
  (config) => {
    // Normalizza il percorso per evitare duplicazioni
    config.url = normalizePath(config.url);
    
    // Stampa l'URL completo della richiesta per debug
    console.log('API Request URL:', config.baseURL + config.url);
    
    // Aggiungi token di autenticazione
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire gli errori
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestione errori standard
    console.error('Errore API:', error);
    
    // Se il server restituisce un 401 Unauthorized, eseguiamo il logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login'; // Reindirizza al login in caso di sessione scaduta
    }
    
    return Promise.reject(error);
  }
);

// Funzione per inviare un messaggio all'AI Assistant
export const sendMessageToAI = async (message) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('Utente non autenticato');
    }
    
    // Utilizziamo il percorso normalizzato
    const normalizedPath = normalizePath('/ai/chat');

    const response = await fetch(`${apiUrl}${normalizedPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`Errore ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel servizio AI:', error);
    throw error;
  }
};

export default api; 