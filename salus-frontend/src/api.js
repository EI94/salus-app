import axios from 'axios';

// Imposta l'URL di base dell'API
// Verifichiamo se l'URL contiene già /api per evitare duplicazioni
export const apiUrl = process.env.REACT_APP_API_URL || 'https://salus-backend.onrender.com';

// Logging per debug
console.log('API URL configurato:', apiUrl);

// Funzione per normalizzare i percorsi API ed evitare duplicazioni
export const normalizePath = (path) => {
  // Log per debug
  console.log('Normalizzando percorso:', path, 'con baseURL:', apiUrl);
  
  // Rimuovi 'api' o '/api' se l'URL di base contiene già '/api'
  if (apiUrl.includes('/api')) {
    if (path.startsWith('/api/')) {
      console.log('Rimozione prefisso /api/ dal percorso');
      return path.substring(4); // Rimuovi '/api'
    }
    if (path.startsWith('api/')) {
      console.log('Rimozione prefisso api/ dal percorso');
      return path.substring(3); // Rimuovi 'api'
    }
  }
  
  // Verifica se l'URL è quello di produzione con wearesalusapp.com
  if (apiUrl.includes('wearesalusapp.com')) {
    console.log('Rilevato URL di produzione wearesalusapp.com');
    // Per l'URL di produzione, assicuriamoci che non ci siano duplicazioni di /api
    if (path.startsWith('/api/')) {
      console.log('Rimozione prefisso /api/ dal percorso per URL produzione');
      return path.substring(4); // Rimuovi '/api'
    }
  }
  
  // Assicurati che il percorso inizi con / se necessario
  if (!path.startsWith('/') && !apiUrl.endsWith('/')) {
    console.log('Aggiunta / iniziale al percorso');
    return '/' + path;
  }
  
  console.log('Percorso normalizzato:', path);
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