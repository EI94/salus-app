import axios from 'axios';

// Definisci l'URL dell'API e indicatore modalità offline
export const apiUrl = process.env.REACT_APP_API_URL || 'https://www.wearesalusapp.com/api';

// Variabile per gestire la modalità offline
let offlineMode = sessionStorage.getItem('offlineMode') === 'true';

// Funzione per verificare se siamo in modalità offline
export const isInOfflineMode = () => {
  return offlineMode || sessionStorage.getItem('offlineMode') === 'true';
};

// Funzione per attivare/disattivare la modalità offline
export const toggleOfflineMode = (value) => {
  console.log(`Modalità offline ${value ? 'attivata' : 'disattivata'}`);
  offlineMode = value;
  sessionStorage.setItem('offlineMode', value ? 'true' : 'false');
};

// Configurazione istanza Axios
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondi di timeout per le richieste
});

// Interceptor per aggiungere il token alle richieste
api.interceptors.request.use(
  (config) => {
    // Se siamo in modalità offline, rifiuta la richiesta
    if (isInOfflineMode() && !config.headers['bypass-offline-check']) {
      return Promise.reject(new Error('Offline mode enabled'));
    }
    
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

// Interceptor per gestire le risposte e gli errori
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se il server non è raggiungibile o l'API restituisce un errore 405
    if (!error.response || error.response.status === 405 || error.response.status >= 500) {
      // Attiva modalità offline
      toggleOfflineMode(true);
    }
    
    return Promise.reject(error);
  }
);

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

// Funzione per inviare un messaggio all'AI Assistant
export const sendMessageToAI = async (message) => {
  try {
    const token = localStorage.getItem('token');
    if (!token && !isInOfflineMode()) {
      throw new Error('Utente non autenticato');
    }

    if (isInOfflineMode()) {
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

export default api; 