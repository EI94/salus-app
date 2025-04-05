import axios from 'axios';

// CONFIGURAZIONE DI EMERGENZA PER DOMINIO DI PRODUZIONE
// Se siamo sul dominio di produzione, forziamo esplicitamente l'URL del backend
let forcedApiUrl = null;
if (typeof window !== 'undefined' && window.location.hostname === 'www.wearesalusapp.com') {
  forcedApiUrl = 'https://salus-backend.onrender.com';
  console.log('OVERRIDE EMERGENZA - Forzato URL API a:', forcedApiUrl);
}

// Imposta l'URL di base dell'API SENZA /api alla fine
export const apiUrl = forcedApiUrl || process.env.REACT_APP_API_URL || 'https://salus-backend.onrender.com';

// Logging per debug
console.log('API URL configurato:', apiUrl);

// Funzione migliorata per normalizzare i percorsi API ed evitare duplicazioni
export const normalizePath = (path) => {
  console.log('Normalizzando percorso:', path, 'con baseURL:', apiUrl);
  
  // BYPASS COMPLETO - Forziamo direttamente URL hardcoded per questi endpoint specifici
  if (path === '/auth/login' || path === '/auth/register' || 
      path === 'auth/login' || path === 'auth/register' ||
      path === '/api/auth/login' || path === '/api/auth/register') {
    const directPath = path.replace('/api/', '/');
    if (directPath.startsWith('/')) {
      console.log('PERCORSO DI AUTENTICAZIONE - usando direttamente:', directPath);
      return directPath;
    } else {
      console.log('PERCORSO DI AUTENTICAZIONE - usando direttamente con slash:', '/' + directPath);
      return '/' + directPath;
    }
  }
  
  // BYPASS PER DOMINIO DI PRODUZIONE CON FORZATURA DELL'URL
  if (forcedApiUrl) {
    console.log('Usando percorso semplice per ambiente di produzione forzato');
    // Rimozione di /api se presente all'inizio del percorso
    if (path.startsWith('/api/')) {
      const cleanPath = path.substring(4);
      console.log('Percorso ripulito da /api/:', cleanPath);
      return cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
    } else if (path.startsWith('api/')) {
      const cleanPath = path.substring(3);
      console.log('Percorso ripulito da api/:', cleanPath);
      return cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
    }
    
    return path.startsWith('/') ? path : '/' + path;
  }
  
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
    // Verifica token nei diversi metodi di storage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Verifica userId come fallback aggiuntivo
    const userId = localStorage.getItem('userId') || 
                  sessionStorage.getItem('userId') || 
                  localStorage.getItem('currentUser');
    
    // Log per debug
    console.log('API Assistant - Token disponibile:', !!token);
    console.log('API Assistant - UserId disponibile:', !!userId);
    
    // Controlla se c'è un utente attualmente autenticato
    // Nota: evitiamo di usare firebase direttamente poiché potrebbe non essere disponibile
    const currentUser = localStorage.getItem('currentUser');
    const isUserLoggedIn = !!token || !!userId || !!currentUser;
    
    console.log('Utente loggato:', isUserLoggedIn);
    
    // Se nessun metodo di autenticazione è disponibile, l'utente non è autenticato
    if (!isUserLoggedIn) {
      console.log('Utente non autenticato, utilizzando risposta di fallback');
      return {
        reply: "Per accedere all'assistenza AI, devi prima effettuare l'accesso. Vai alla pagina di login se non hai ancora un account o accedi con le tue credenziali.",
        offline: true
      };
    }
    
    // Recupera le variabili d'ambiente per OpenAI o valori predefiniti
    const openaiApiKey = process.env.REACT_APP_OPENAI_KEY || window.OPENAI_API_KEY;
    console.log('OpenAI API Key disponibile:', !!openaiApiKey);
    
    // Utilizziamo il percorso normalizzato
    const normalizedPath = normalizePath('/ai/chat');
    console.log('Percorso normalizzato per la chiamata AI:', normalizedPath);

    const response = await fetch(`${apiUrl}${normalizedPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-User-ID': userId || ''
      },
      body: JSON.stringify({ 
        message,
        apiKey: openaiApiKey // Passiamo la chiave API per sicurezza
      })
    });

    if (!response.ok) {
      console.error(`Errore nella risposta del server: ${response.status} ${response.statusText}`);
      throw new Error(`Errore ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel servizio AI:', error);
    // Restituisci una risposta di fallback invece di propagare l'errore
    return {
      reply: "Mi dispiace, si è verificato un problema di connessione con l'assistente AI. Verifica che la chiave API di OpenAI sia configurata correttamente o contatta l'amministratore.",
      offline: true,
      error: error.message
    };
  }
};

export default api; 