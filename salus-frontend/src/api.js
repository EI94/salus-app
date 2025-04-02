import axios from 'axios';

// Definisci l'URL dell'API
export const apiUrl = process.env.REACT_APP_API_URL || 'https://www.wearesalusapp.com/api';

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

    const response = await fetch(`${apiUrl}/api/ai/chat`, {
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