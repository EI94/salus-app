import axios from 'axios';
import { apiUrl, normalizePath } from '../api';

/**
 * Helper per effettuare chiamate API con normalizzazione dei percorsi
 * 
 * @param {string} method - Metodo HTTP (GET, POST, PUT, DELETE, ecc.)
 * @param {string} path - Percorso relativo dell'endpoint API
 * @param {object} data - Dati da inviare nel corpo della richiesta (per POST, PUT)
 * @param {object} options - Opzioni aggiuntive per la richiesta
 * @returns {Promise} - Promise con la risposta della richiesta
 */
export const apiRequest = async (method, path, data = null, options = {}) => {
  const normalizedPath = normalizePath(path);
  let fullUrl = '';
  
  // OVERRIDE DI EMERGENZA: CONFIGURAZIONE SPECIFICA PER DOMINIO DI PRODUZIONE
  if (typeof window !== 'undefined' && window.location.hostname === 'www.wearesalusapp.com') {
    // Sostituiamo completamente l'URL con quello corretto per il sito di produzione
    // Per i percorsi di autenticazione
    if (path.includes('/auth/')) {
      // URL backend diretto per autenticazione, senza prefisso /api
      fullUrl = `https://salus-backend.onrender.com${path.startsWith('/') ? path : '/' + path}`;
    } else {
      // URL backend standard
      fullUrl = `https://salus-backend.onrender.com${path.startsWith('/') ? path : '/' + path}`;
    }
    console.log('OVERRIDE EMERGENZA - URL diretto:', fullUrl);
  } else {
    // Per ambienti diversi dalla produzione, usa l'approccio precedente
    fullUrl = `${apiUrl}${normalizedPath}`;
    
    // Rimozione esplicita di potenziali duplicazioni
    fullUrl = fullUrl.replace('/api/api/', '/api/');
  }
  
  console.log(`Richiesta ${method} a:`, fullUrl);
  console.log('Dati inviati:', data);
  
  // Configurazione base della richiesta
  const config = {
    method: method.toUpperCase(),
    url: fullUrl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  // Aggiungi token di autenticazione se disponibile
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Aggiungi i dati in base al metodo
  if (data) {
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data;
    } else {
      config.params = data;
    }
  }
  
  try {
    const response = await axios(config);
    console.log('Risposta ricevuta:', response.status, response.data);
    return response;
  } catch (error) {
    console.error('Errore nella richiesta API:', error);
    
    // Logging dettagliato dell'errore
    if (error.response) {
      console.error('Dettagli errore:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config.url
      });
    }
    
    throw error;
  }
};

/**
 * Wrapper per richieste GET
 */
export const apiGet = (path, params = {}, options = {}) => {
  return apiRequest('GET', path, params, options);
};

/**
 * Wrapper per richieste POST
 */
export const apiPost = (path, data = {}, options = {}) => {
  return apiRequest('POST', path, data, options);
};

/**
 * Wrapper per richieste PUT
 */
export const apiPut = (path, data = {}, options = {}) => {
  return apiRequest('PUT', path, data, options);
};

/**
 * Wrapper per richieste DELETE
 */
export const apiDelete = (path, options = {}) => {
  return apiRequest('DELETE', path, null, options);
};

const apiHelper = {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete
};

export default apiHelper; 