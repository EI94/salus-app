import axios from 'axios';
import { auth } from './firebase/config';
import { localStorageService } from './utils/localStorageUtil';

// URL di base per l'API
export const apiUrl = process.env.REACT_APP_API_URL || 'https://salus-backend.onrender.com/api';

// Funzione semplificata per normalizzare i percorsi API
export const normalizePath = (path) => {
  // Rimuovi slash iniziale se presente nel path e l'URL base termina già con uno slash
  if (path.startsWith('/') && apiUrl.endsWith('/')) {
    return path.substring(1);
  }
  
  // Aggiungi slash iniziale se né il path né l'URL base terminano con slash
  if (!path.startsWith('/') && !apiUrl.endsWith('/')) {
    return '/' + path;
  }
  
  // Altrimenti restituisci il path così com'è
  return path;
};

// Configurazione istanza Axios con opzioni di base
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // 15 secondi di timeout per le richieste
});

// Interceptor per aggiungere il token di autenticazione a ogni richiesta
api.interceptors.request.use(
  (config) => {
    // Stampa l'URL completo della richiesta per debug
    console.log('Richiesta API:', config.method.toUpperCase(), config.baseURL + config.url);
    
    // Aggiungi token di autenticazione se disponibile
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Errore nella preparazione della richiesta:', error);
    return Promise.reject(error);
  }
);

// Interceptor per gestire gli errori nelle risposte
api.interceptors.response.use(
  (response) => {
    console.log('Risposta API ricevuta:', response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Errore API:', error.response.status, error.response.data);
    
    // Se il server restituisce un 401 Unauthorized, eseguiamo il logout
      if (error.response.status === 401) {
        console.log('Sessione scaduta. Reindirizzamento al login...');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('currentUser');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // La richiesta è stata effettuata ma non è stata ricevuta risposta
      console.error('Nessuna risposta dal server:', error.request);
    } else {
      // Si è verificato un errore durante la configurazione della richiesta
      console.error('Errore di configurazione della richiesta:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Funzione per ottenere un token di autorizzazione
async function getAuthToken() {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('L\'utente non è autenticato');
        }
        const token = await user.getIdToken();
        return token;
    } catch (error) {
        console.error('Errore nel recupero del token:', error);
        throw error;
    }
}

// Funzione per inviare un messaggio all'assistente AI
export async function sendMessageToAI(message, conversationHistory = []) {
    try {
        const token = await getAuthToken();
        
        // Prepara il corpo della richiesta con la storia della conversazione
        const requestBody = {
            message,
            conversation: conversationHistory
        };
        
        const response = await fetch(`${apiUrl}/assistant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore nella comunicazione con l\'assistente AI');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Errore nell\'invio del messaggio all\'AI:', error);
        
        // Fallback a risposte locali se offline o errore API
        try {
            // Salva la richiesta in attesa per sincronizzazione futura
            localStorageService.setJson('pendingAIRequests', 
                [...(localStorageService.getJson('pendingAIRequests') || []), 
                { message, timestamp: new Date().toISOString() }]);
                
            return {
                response: "Mi dispiace, sono attualmente in modalità offline. Ho salvato la tua richiesta e risponderò appena sarà possibile connettersi nuovamente.",
                offline: true
            };
        } catch (localError) {
            console.error('Errore nel fallback locale:', localError);
            throw error;
        }
    }
}

// Funzione per analizzare sintomi e trovare correlazioni con farmaci
export async function analyzeSymptomsMedications(symptoms, medications) {
    try {
        const token = await getAuthToken();
        
        // Prepara il corpo della richiesta con sintomi e farmaci
        const requestBody = {
            symptoms,
            medications
        };
        
        const response = await fetch(`${apiUrl}/analyze/correlations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore nell\'analisi di sintomi e farmaci');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Errore nell\'analisi di sintomi e farmaci:', error);
        
        // Fallback a funzionalità di base se offline
        return {
            correlations: [],
            patterns: [],
            suggestions: [
                "Funzionalità completa disponibile solo online. Salvataggio locale eseguito."
            ],
            offline: true
        };
    }
}

// Funzione per generare suggerimenti in base ai dati dell'utente
export async function generateHealthInsights(userData) {
    try {
        const token = await getAuthToken();
        
        const response = await fetch(`${apiUrl}/insights`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore nella generazione di suggerimenti di salute');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Errore nella generazione di suggerimenti:', error);
        
        // Suggerimenti generici in caso di offline
        return {
            insights: [
                "Ricorda di assumere regolarmente i farmaci prescritti",
                "Mantieni un diario regolare dei tuoi sintomi",
                "Consulta il tuo medico in caso di sintomi persistenti"
            ],
            offline: true
        };
    }
}

// Funzione per esportare dati in formato per i medici
export async function exportMedicalData(dataType, dateRange) {
    try {
        const token = await getAuthToken();
        
        const response = await fetch(`${apiUrl}/export/${dataType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ dateRange })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Errore nell'esportazione dei dati ${dataType}`);
        }
        
        return await response.blob();
    } catch (error) {
        console.error('Errore nell\'esportazione dei dati:', error);
        throw error;
    }
}

export default api; 