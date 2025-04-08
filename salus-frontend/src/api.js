import axios from 'axios';
import { auth } from './firebase/config';
import { localStorageService } from './utils/localStorageUtil';
import { callAIAssistant } from './firebase/functions';

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

/**
 * Invia un messaggio all'assistente AI e riceve una risposta
 * @param {string} message - Il messaggio da inviare all'AI
 * @param {Array} conversationHistory - La storia della conversazione
 * @returns {Promise<Object>} - La risposta dell'AI
 */
export const sendMessageToAI = async (message, conversationHistory = []) => {
  try {
    // Prima verifica se l'utente è autenticato
    if (!auth.currentUser) {
      console.log('Utente non autenticato per AI assistant');
      return {
        response: "Per utilizzare l'assistente AI devi effettuare l'accesso. Accedi o registrati per continuare.",
        offline: true
      };
    }

    console.log('Invio richiesta AI ad OpenAI');
    
    // Prepara la conversazione nel formato richiesto da OpenAI
    const messages = [
      { 
        role: "system", 
        content: "Sei un assistente medico chiamato Salus che aiuta gli utenti a gestire la loro salute. Fornisci consigli generali sulla salute, ma ricorda all'utente di consultare un medico per diagnosi o trattamenti specifici. Rispondi in italiano in modo breve e chiaro." 
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];
    
    // Invia direttamente la richiesta a OpenAI
    // Nota: process.env.OPENAI_API_KEY viene inserito da Vercel al momento del build
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Errore nella risposta OpenAI:', errorData);
      throw new Error(errorData.error?.message || 'Errore nel servizio OpenAI');
    }

    const data = await response.json();
    const aiResponseText = data.choices[0]?.message?.content || 
      "Mi dispiace, non sono riuscito a generare una risposta. Riprova più tardi.";
    
    console.log('Risposta AI ricevuta da OpenAI');
    
    return {
      response: aiResponseText,
      offline: false
    };
    
  } catch (error) {
    console.error('Errore durante la comunicazione con OpenAI:', error);
    
    // Verifica se è offline
    if (!navigator.onLine) {
      console.log('Browser offline, usando risposta offline');
      return {
        response: "Sembra che tu sia offline. Riprova quando avrai una connessione a internet.",
        offline: true
      };
    }
    
    // Se la chiave API non è valida o mancante
    if (error.message?.includes('API key')) {
      return {
        response: "Non è stato possibile connettersi al servizio AI a causa di un problema di configurazione. Contatta l'amministratore.",
        offline: true,
        error: error.message
      };
    }
    
    // Fallback per altri errori
    return {
      response: "Mi dispiace, ho riscontrato un problema nel comunicare con il servizio AI. Riprova più tardi.",
      offline: true,
      error: error.message
    };
  }
};

/**
 * Genera una risposta simulata in locale basata su regole predefinite
 * @param {string} message - Il messaggio dell'utente
 * @param {string} systemPrompt - Il prompt di sistema
 * @returns {string} - La risposta simulata
 */
function generateSimulatedResponse(message, systemPrompt) {
  // Converti il messaggio in minuscolo per confronti case-insensitive
  const lowerMessage = message.toLowerCase();
  
  // Risposte per saluti
  if (lowerMessage.includes('ciao') || 
      lowerMessage.includes('salve') || 
      lowerMessage.includes('buongiorno') || 
      lowerMessage.includes('buonasera')) {
    return "Ciao! Sono l'assistente Salus. Come posso aiutarti con la tua salute oggi?";
  }
  
  // Risposte per domande su sintomi
  if (lowerMessage.includes('mal di testa') || lowerMessage.includes('cefalea')) {
    return "Il mal di testa può avere molte cause, come stress, disidratazione, o stanchezza. Assicurati di bere abbastanza acqua, riposare adeguatamente e considerare tecniche di rilassamento. Se il dolore è intenso o persistente, consulta il tuo medico.";
  }
  
  if (lowerMessage.includes('febbre')) {
    return "La febbre è spesso un segnale che il corpo sta combattendo un'infezione. Riposa, bevi molti liquidi e, se necessario, puoi assumere paracetamolo per abbassare la temperatura. Se la febbre supera i 38.5°C o persiste per più di tre giorni, consulta un medico.";
  }
  
  if (lowerMessage.includes('nausea') || lowerMessage.includes('vomito')) {
    return "Nausea e vomito possono essere causati da infezioni gastrointestinali, cibi avariati o stress. Prova a bere piccoli sorsi d'acqua e mangiare cibi leggeri. Se i sintomi persistono più di 24 ore o sono accompagnati da forte dolore addominale, contatta il tuo medico.";
  }
  
  if (lowerMessage.includes('tosse')) {
    return "La tosse può essere secca o con catarro. Mantieni la gola idratata bevendo spesso, usa un umidificatore se l'aria è secca e riposa la voce. Se la tosse persiste per più di una settimana o è accompagnata da difficoltà respiratorie, consulta un medico.";
  }
  
  // Risposte su farmaci
  if (lowerMessage.includes('paracetamolo') || lowerMessage.includes('tachipirina')) {
    return "Il paracetamolo è un farmaco antipiretico e analgesico utile per febbre e dolori lievi/moderati. Segui sempre il dosaggio indicato e non superare i 3g al giorno per adulti. In caso di dubbi, consulta il tuo medico o farmacista.";
  }
  
  if (lowerMessage.includes('ibuprofene') || lowerMessage.includes('brufen')) {
    return "L'ibuprofene è un antinfiammatorio utile per dolori e stati febbrili. Va assunto preferibilmente dopo i pasti per ridurre l'irritazione gastrica. Non utilizzarlo per periodi prolungati senza consulto medico, soprattutto se hai problemi gastrici o renali.";
  }
  
  // Risposte su benessere
  if (lowerMessage.includes('stress') || lowerMessage.includes('ansia')) {
    return "Per gestire lo stress, prova tecniche di respirazione profonda, meditazione o yoga. Mantieni uno stile di vita equilibrato con esercizio regolare, alimentazione sana e tempo per hobby che ti rilassano. Se l'ansia interferisce con la tua vita quotidiana, considera di parlare con uno psicologo.";
  }
  
  if (lowerMessage.includes('sonno') || lowerMessage.includes('insonnia')) {
    return "Per un buon sonno, mantieni orari regolari, evita caffeina e schermi nelle ore serali, e crea una routine rilassante prima di coricarti. Una camera buia, silenziosa e fresca favorisce il riposo. Se l'insonnia persiste, consulta il tuo medico.";
  }
  
  if (lowerMessage.includes('dieta') || lowerMessage.includes('alimentazione')) {
    return "Un'alimentazione equilibrata dovrebbe includere abbondanti frutta e verdura, cereali integrali, proteine magre e grassi sani. Limita zuccheri raffinati, sale e grassi saturi. Ricorda che l'idratazione è altrettanto importante. Per consigli personalizzati, consulta un nutrizionista.";
  }
  
  if (lowerMessage.includes('esercizio') || lowerMessage.includes('attività fisica')) {
    return "L'attività fisica regolare migliora salute fisica e mentale. Cerca di fare almeno 150 minuti di attività moderata a settimana. Trova un'attività che ti piace, che sia camminare, nuotare o ballare, e inizia gradualmente. Prima di iniziare un nuovo regime intenso, consulta il tuo medico.";
  }
  
  // Risposte generiche per domande comuni
  if (lowerMessage.includes('come stai')) {
    return "Sono qui per aiutarti con informazioni sulla salute! Come posso esserti utile oggi?";
  }
  
  if (lowerMessage.includes('cosa puoi fare')) {
    return "Posso fornirti informazioni generali sulla salute, suggerimenti per gestire sintomi comuni, consigli su benessere e stile di vita sano. Ricorda che non sostituisco un consulto medico professionale.";
  }
  
  if (lowerMessage.includes('grazie')) {
    return "Di niente! Sono felice di poterti aiutare. Se hai altre domande, non esitare a chiedere.";
  }
  
  // Se nessuna regola corrisponde, invia una risposta generica
  return "Grazie per la tua domanda. Posso fornirti informazioni generali sulla salute e consigli per il benessere, ma ricorda che è sempre meglio consultare un professionista sanitario per problemi specifici. Puoi chiedermi di sintomi comuni, farmaci di base, o consigli per uno stile di vita sano.";
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