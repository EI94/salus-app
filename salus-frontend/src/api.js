import axios from 'axios';

// URL dell'API - definisce un URL finale indipendentemente dall'ambiente
const baseURL = process.env.REACT_APP_API_URL || 'https://www.wearesalusapp.com/api';

// Stato offline per il debug e test
let isOfflineMode = false;

// Crea una istanza di axios con configurazione personalizzata
const API = axios.create({
  baseURL,
  timeout: 15000, // 15 secondi
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*'
  },
  withCredentials: false // Imposta esplicitamente a false per evitare problemi CORS
});

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
            userId: 'demo-user-123',
            userName: 'Utente Demo',
            token: 'mock-jwt-token-for-demo-purposes'
          }
        });
      } else if (url.includes('/symptoms')) {
        resolve({
          data: [
            {
              id: 1,
              name: 'Mal di testa',
              intensity: 7,
              category: 'Neurologico',
              description: 'Dolore pulsante alla tempia destra',
              date: '2023-11-01',
              time: '14:30'
            },
            {
              id: 2,
              name: 'Nausea',
              intensity: 4,
              category: 'Digestivo',
              description: 'Leggera nausea dopo pranzo',
              date: '2023-11-02',
              time: '13:45'
            }
          ]
        });
      } else if (url.includes('/medications')) {
        resolve({
          data: [
            {
              id: 1,
              name: 'Paracetamolo',
              dosage: '1000',
              unit: 'mg',
              frequency: 'twice',
              time: ['08:00', '20:00'],
              startDate: '2023-10-15',
              endDate: '2023-11-15',
              notes: 'Prendere con acqua abbondante',
              status: 'active',
              adherence: 0.9
            }
          ]
        });
      } else if (url.includes('/wellness')) {
        resolve({
          data: [
            {
              id: 1,
              date: '2023-11-05',
              mood: 'buono',
              sleepHours: 7,
              activities: ['Camminata', 'Lettura'],
              notes: 'Giornata produttiva'
            }
          ]
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
    // Se in modalità offline, non inviare richieste reali
    if (isOfflineMode) {
      // Annulliamo la richiesta reale e risolviamo con la nostra mock
      const mockMethod = config.method || 'get';
      const mockUrl = config.url;
      const mockData = config.data;
      
      // Creiamo un'istanza di AbortController per annullare la richiesta
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort();
      
      // Memorizziamo i dettagli della richiesta per il nostro gestore di errori
      config.mockResponse = getMockResponse(mockUrl, mockMethod, mockData);
    }

    // Log dell'URL per debug
    console.log('API Request URL:', config.baseURL + config.url);

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
    // Se l'errore è stato generato dalla nostra modalità offline
    if (error.code === 'ERR_CANCELED' && error.config && error.config.mockResponse) {
      return error.config.mockResponse;
    }

    // Log dell'errore per debug
    console.error('Errore di risposta:', error.response ? error.response.status : error.message);

    // Se il token è scaduto (status 401), logout automatico
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      
      // Evento personalizzato per il logout
      window.dispatchEvent(new CustomEvent('salus:auth:logout', {
        detail: { reason: 'token_expired' }
      }));
    }

    // Mostra una notifica all'utente per errori di rete
    if (error.code === 'ERR_NETWORK') {
      window.dispatchEvent(new CustomEvent('salus:notification', {
        detail: { 
          type: 'error',
          message: 'Impossibile connettersi al server. Verifica la tua connessione Internet.' 
        }
      }));
      
      // Attiva automaticamente la modalità offline
      toggleOfflineMode(true);
    }

    return Promise.reject(error);
  }
);

export default API; 