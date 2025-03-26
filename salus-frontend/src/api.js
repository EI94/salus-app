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
    // Se ricevi errore 401 (non autorizzato), esci e vai alla pagina di login
    if (error.response && error.response.status === 401) {
      // Pulisci dati di autenticazione
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      
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
    const isAuthRequest = 
      error.config.url.includes('/auth/login') || 
      error.config.url.includes('/auth/register');
    
    if (isAuthRequest && process.env.NODE_ENV === 'development') {
      console.log('Modalità mock/offline per autenticazione');
      const mockData = {
        userId: 'offline-' + Math.random().toString(36).substr(2, 9),
        userName: 'Utente Offline',
        token: 'offline-token'
      };
      
      return Promise.resolve({ data: mockData });
    }
    
    return Promise.reject(error);
  }
);

// Funzione per inviare un messaggio all'AI Assistant
export const sendMessageToAI = async (message) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Utente non autenticato');
    }

    const response = await fetch(`${baseURL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(token).token}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`Errore nella chiamata API: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Errore nella chiamata API:', error);
    throw error;
  }
};

export default API; 