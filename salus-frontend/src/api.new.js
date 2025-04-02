import axios from 'axios';

// URL dell'API - definisce un URL finale indipendentemente dall'ambiente
const baseURL = 'https://www.wearesalusapp.com/api';

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

// Interceptor per aggiungere il token di autenticazione alle richieste
API.interceptors.request.use(
  config => {
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
    // Log dell'errore per debug
    console.error('Errore di risposta:', error.response ? error.response.status : error.message);

    // Se il token è scaduto (status 401), logout automatico
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  }
);

export default API; 