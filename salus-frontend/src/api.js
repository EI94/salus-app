import axios from 'axios';

// Determina l'URL di base in base all'ambiente
const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment 
  ? 'http://localhost:3001/api' 
  : 'https://www.wearesalusapp.com/api';

// Crea una istanza di axios con configurazione personalizzata
const API = axios.create({
  baseURL,
  timeout: 15000, // 15 secondi
  withCredentials: true, // Necessario per i cookie CORS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor per aggiungere il token di autenticazione alle richieste
API.interceptors.request.use(
  config => {
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
      // Redirect alla pagina di login se necessario
      // window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

export default API; 