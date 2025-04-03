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
  
  // Calcola l'URL completo per la richiesta
  let fullUrl = `${apiUrl}${normalizedPath}`;
  
  // Caso speciale per il dominio in produzione
  if (typeof window !== 'undefined' && window.location.hostname.includes('wearesalusapp.com')) {
    // Rimuovi esplicitamente eventuali duplicazioni di /api
    fullUrl = fullUrl.replace('/api/api/', '/api/');
    console.log('URL modificato per wearesalusapp.com:', fullUrl);
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

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete
}; 