import axios from 'axios';

// URL di base dell'API: usa l'URL di produzione se disponibile, altrimenti localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configura l'istanza di axios
const API = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 secondi di timeout
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Importante per CORS con credenziali
});

// Intercettore di richieste
API.interceptors.request.use(
  config => {
    console.log('Richiesta in uscita:', config.url);
    return config;
  },
  error => {
    console.error('Errore nella richiesta:', error);
    return Promise.reject(error);
  }
);

// Intercettore di risposte
API.interceptors.response.use(
  response => {
    console.log('Risposta ricevuta da:', response.config.url);
    return response;
  },
  error => {
    if (error.response) {
      // Il server ha risposto con un codice di stato che non rientra nell'intervallo 2xx
      console.error('Errore di risposta:', error.response.status, error.response.data);
    } else if (error.request) {
      // La richiesta è stata inviata ma non è stata ricevuta una risposta
      console.error('Errore di richiesta (nessuna risposta):', error.request);
    } else {
      // Si è verificato un errore durante l'impostazione della richiesta
      console.error('Errore:', error.message);
    }
    return Promise.reject(error);
  }
);

export default API; 