import axios from 'axios';

// Imposta l'URL di base dell'API
// Verifichiamo se l'URL contiene già /api per evitare duplicazioni
export const apiUrl = process.env.REACT_APP_API_URL || 'https://salus-backend.onrender.com';

// Logging per debug
console.log('API URL configurato:', apiUrl);

// Funzione migliorata per normalizzare i percorsi API ed evitare duplicazioni
export const normalizePath = (path) => {
  console.log('Normalizzando percorso:', path, 'con baseURL:', apiUrl);
  
  // RISOLUZIONE SPECIFICA per il dominio di produzione
  // Se stiamo utilizzando il dominio wearesalusapp.com e il path contiene /api,
  // rimuovi completamente la parte /api dal percorso
  if (
    typeof window !== 'undefined' && 
    window.location.hostname.includes('wearesalusapp.com')
  ) {
    console.log('Rilevato dominio di produzione wearesalusapp.com');
    
    // Se il percorso inizia con /api/ o api/, rimuovilo
    if (path.startsWith('/api/')) {
      const cleanPath = '/' + path.substring(5);
      console.log('Percorso pulito (rimozione /api/):', cleanPath);
      return cleanPath;
    } else if (path.startsWith('api/')) {
      const cleanPath = '/' + path.substring(4);
      console.log('Percorso pulito (rimozione api/):', cleanPath);
      return cleanPath;
    }
  }
  
  // REGOLA GENERALE per tutti gli altri casi
  // Se l'URL di base termina con /api
  if (apiUrl.endsWith('/api')) {
    console.log('URL base termina con /api');
    
    // Se il path inizia con /api/, rimuovilo
    if (path.startsWith('/api/')) {
      const cleanPath = path.substring(4);
      console.log('Percorso pulito (rimozione /api/ per URL che termina con /api):', cleanPath);
      return cleanPath;
    }
    
    // Se il path inizia con api/, rimuovilo
    if (path.startsWith('api/')) {
      const cleanPath = path.substring(3);
      console.log('Percorso pulito (rimozione api/ per URL che termina con /api):', cleanPath);
      return cleanPath;
    }
  }
  
  // Se l'URL di base contiene /api ma non alla fine
  if (apiUrl.includes('/api') && !apiUrl.endsWith('/api')) {
    console.log('URL base contiene /api ma non alla fine');
    
    // Se il path inizia con /api/, rimuovilo
    if (path.startsWith('/api/')) {
      const cleanPath = path.substring(4);
      console.log('Percorso pulito (rimozione /api/ per URL che contiene /api):', cleanPath);
      return cleanPath;
    }
    
    // Se il path inizia con api/, rimuovilo
    if (path.startsWith('api/')) {
      const cleanPath = path.substring(3);
      console.log('Percorso pulito (rimozione api/ per URL che contiene /api):', cleanPath);
      return cleanPath;
    }
  }
  
  // REGOLA BASE: assicurati che il percorso abbia uno slash iniziale se necessario
  if (!path.startsWith('/') && !apiUrl.endsWith('/')) {
    const cleanPath = '/' + path;
    console.log('Aggiunto slash iniziale al percorso:', cleanPath);
    return cleanPath;
  }
  
  console.log('Percorso non modificato:', path);
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