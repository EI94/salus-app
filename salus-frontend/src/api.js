import axios from 'axios';

// URL dell'API - definisce un URL finale indipendentemente dall'ambiente
// Rimuovo /api dal percorso base poiché già incluso nei percorsi delle richieste
export const apiUrl = process.env.REACT_APP_API_URL || 'https://www.wearesalusapp.com';

// Crea una istanza di axios con configurazione personalizzata
const API = axios.create({
  baseURL: apiUrl,
  timeout: 15000, // 15 secondi
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  withCredentials: false // Imposta esplicitamente a false per evitare problemi CORS
});

// Variabile per modalità offline - imposta a false per default per usare il server reale
let isOfflineMode = false;

// Funzione per simulare una risposta in modalità offline
const getMockResponse = (url, method, data) => {
  console.log(`[Modalità Offline] Richiesta ${method} a ${url}`);
  
  // Ritorna promesse diverse in base all'URL
  return new Promise((resolve) => {
    // Simuliamo un ritardo nella risposta
    setTimeout(() => {
      // Possiamo definire mock data per diversi endpoint
      if (url.includes('/auth/login')) {
        resolve({
          data: {
            token: 'mock-jwt-token-for-demo-purposes',
            user: {
              id: 'demo-user-123',
              email: data?.email || 'utente@demo.com',
              name: 'Utente Demo'
            }
          }
        });
      } else if (url.includes('/auth/register')) {
        resolve({
          data: {
            token: 'mock-jwt-token-for-demo-purposes',
            user: {
              id: 'new-user-' + Math.random().toString(36).substring(2, 9),
              email: data?.email || 'nuovo@utente.com',
              name: 'Nuovo Utente'
            }
          }
        });
      } else if (url.includes('/symptoms')) {
        resolve({
          data: [] // Array vuoto invece di dati di esempio
        });
      } else if (url.includes('/medications')) {
        resolve({
          data: [] // Array vuoto invece di dati di esempio
        });
      } else if (url.includes('/wellness')) {
        resolve({
          data: [] // Array vuoto invece di dati di esempio
        });
      } else if (url.includes('/ai/chat')) {
        resolve({
          data: {
            reply: "Ciao! Sono Salus, il tuo assistente sanitario. Ti ricordo che non sono un medico e le mie informazioni sono solo educative. Come posso aiutarti oggi?"
          }
        });
      } else {
        resolve({ data: {} });
      }
    }, 300);
  });
};

// Funzione per attivare/disattivare la modalità offline
export const toggleOfflineMode = (status) => {
  isOfflineMode = status;
  console.log(`Modalità offline ${isOfflineMode ? 'attivata' : 'disattivata'}`);
  return isOfflineMode;
};

// Verifica se siamo in modalità offline
export const isInOfflineMode = () => isOfflineMode;

// Interceptor per aggiungere il token di autenticazione alle richieste
API.interceptors.request.use(
  config => {
    // Aggiungi token a tutte le richieste tranne login e registrazione
    const token = localStorage.getItem('token');
    const url = config.url || '';
    
    if (token && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire le risposte
API.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.log('API Error:', error);
    
    // Se riceviamo errore 405 (Method Not Allowed), usiamo la modalità offline
    if (error.response && error.response.status === 405) {
      console.log('Errore 405 ricevuto, utilizzo modalità offline');
      
      if (error.config && error.config.method && error.config.url) {
        const data = error.config.data ? JSON.parse(error.config.data) : {};
        return getMockResponse(error.config.url, error.config.method, data);
      }
    }
    
    // Se ricevi errore 401 (non autorizzato), esci e vai alla pagina di login
    if (error.response && error.response.status === 401) {
      // Pulisci dati di autenticazione
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('currentUser');
      
      // Notifica utente
      window.dispatchEvent(new CustomEvent('salus:notification', {
        detail: {
          type: 'error',
          title: 'Sessione scaduta',
          message: 'La tua sessione è scaduta. Effettua nuovamente il login.'
        }
      }));
      
      // Reindirizza alla pagina di login (se non sei già lì)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Gestione fallback per il mock e per modalità offline
    if ((isOfflineMode || process.env.NODE_ENV === 'development') && error.config) {
      console.log('Utilizzo modalità offline per la richiesta fallita');
      const data = error.config.data ? JSON.parse(error.config.data) : {};
      return getMockResponse(error.config.url, error.config.method, data);
    }
    
    return Promise.reject(error);
  }
);

// Funzione per inviare un messaggio all'AI Assistant
export const sendMessageToAI = async (message) => {
  try {
    const token = localStorage.getItem('token');
    if (!token && !isOfflineMode) {
      throw new Error('Utente non autenticato');
    }

    if (isOfflineMode) {
      return getMockResponse('/api/ai/chat', 'POST', { message }).then(res => res.data);
    }

    const response = await fetch(`${apiUrl}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error('Errore nella richiesta all\'AI');
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel servizio AI:', error);
    // In caso di errore, fornisci una risposta predefinita
    return {
      reply: "Mi dispiace, si è verificato un errore nella comunicazione. Riprova più tardi."
    };
  }
};

export default API; 