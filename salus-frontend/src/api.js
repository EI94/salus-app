import axios from 'axios';

// Definisci l'URL dell'API e indicatore modalità offline
export const apiUrl = process.env.REACT_APP_API_URL || 'https://www.wearesalusapp.com/api';

// Variabile per gestire la modalità offline - usiamo localStorage invece di sessionStorage per mantenerla
let offlineMode = localStorage.getItem('offlineMode') === 'true';

// Funzione per verificare se siamo in modalità offline
export const isInOfflineMode = () => {
  return offlineMode || localStorage.getItem('offlineMode') === 'true';
};

// Funzione per attivare/disattivare la modalità offline
export const toggleOfflineMode = (value) => {
  console.log(`Modalità offline ${value ? 'attivata' : 'disattivata'}`);
  offlineMode = value;
  localStorage.setItem('offlineMode', value ? 'true' : 'false');
};

// Se non c'è connessione, attiva la modalità offline automaticamente
// Controlliamo la connessione all'avvio dell'app
fetch(`${apiUrl}/api/health-check`, { 
  method: 'GET',
  timeout: 3000,
  headers: { 'bypass-offline-check': 'true' }
})
.catch(() => {
  console.log('API non raggiungibile, attivazione automatica modalità offline');
  toggleOfflineMode(true);
});

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
    // Se siamo in modalità offline e non è una richiesta speciale con bypass, evita di fare chiamate al server
    if (isInOfflineMode() && !config.headers['bypass-offline-check']) {
      console.log('Richiesta bloccata: modalità offline attiva');
      // Creiamo un errore speciale che verrà intercettato più tardi
      return Promise.reject({ 
        isOfflineError: true,
        request: config
      });
    }
    
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

// Interceptor per gestire le risposte e gli errori
api.interceptors.response.use(
  (response) => {
    // Se riceviamo una risposta valida e siamo in modalità offline, disattiviamo la modalità offline
    if (isInOfflineMode()) {
      console.log('Connessione al server ristabilita, disattivazione modalità offline');
      toggleOfflineMode(false);
    }
    return response;
  },
  (error) => {
    // Gestiamo l'errore speciale di offline
    if (error.isOfflineError) {
      console.log('Intercettata richiesta in modalità offline, reindirizzata a mock data');
      
      // Estraiamo i dati della richiesta per passarli a getMockResponse
      const { method, url, data } = error.request;
      
      // Restituiamo i dati simulati invece di propagare l'errore
      return getMockResponse(url, method, data ? JSON.parse(data) : {});
    }
    
    // Se il server non è raggiungibile o l'API restituisce un errore 405 o errore di rete
    if (!error.response || error.response.status === 405 || error.response.status >= 500 || error.code === 'ECONNABORTED') {
      // Attiva modalità offline
      console.log('Errore di connessione rilevato:', error.message || error.code);
      toggleOfflineMode(true);
      
      // Se abbiamo i dati della richiesta, possiamo provare a fornire una risposta simulata
      if (error.config) {
        const { method, url, data } = error.config;
        console.log('Tentativo di fornire dati simulati per:', url);
        
        try {
          // Proviamo a parsificare i dati se sono in formato stringa
          const parsedData = data && typeof data === 'string' ? JSON.parse(data) : data;
          
          // Restituiamo i dati simulati invece di propagare l'errore
          return getMockResponse(url, method, parsedData || {});
        } catch (e) {
          console.error('Errore nel fornire dati simulati:', e);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Funzione per simulare una risposta in modalità offline
const getMockResponse = (url, method, data) => {
  console.log(`[Modalità Offline] Richiesta ${method} a ${url}`);
  
  // Ritorna promesse diverse in base all'URL
  return new Promise((resolve, reject) => {
    // Simuliamo un ritardo nella risposta
    setTimeout(() => {
      try {
        // Possiamo definire mock data per diversi endpoint
        if (url.includes('/auth/login')) {
          // In modalità offline, verifichiamo le credenziali contro gli utenti registrati
          console.log('Tentativo di login con:', data?.email);
          
          // Otteniamo la lista degli utenti registrati
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          console.log('Utenti registrati trovati:', registeredUsers.length);
          
          // Verifichiamo se email e password sono presenti
          if (!data?.email || !data?.password) {
            const error = new Error('Email o password mancanti');
            error.response = { status: 401, data: { message: 'Email o password mancanti' } };
            return reject(error);
          }
          
          // Cerchiamo l'utente nella lista
          const foundUser = registeredUsers.find(u => 
            u.email.toLowerCase() === data.email.toLowerCase() && 
            u.password === data.password
          );
          
          console.log('Utente trovato:', foundUser ? 'sì' : 'no');
          
          // Se abbiamo trovato l'utente, restituiamo i suoi dati
          if (foundUser) {
            console.log('Login riuscito per:', foundUser.email);
            const { password, ...userWithoutPassword } = foundUser; // Rimuovi la password dai dati
            
            resolve({
              data: {
                token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15),
                user: userWithoutPassword
              }
            });
          } else {
            // Se non ci sono utenti registrati, per retrocompatibilità accettiamo qualsiasi credenziale
            if (registeredUsers.length === 0) {
              console.log('Nessun utente registrato, accettazione automatica per retrocompatibilità');
              
              const userData = {
                id: 'user-' + Math.random().toString(36).substring(2, 9),
                email: data.email,
                name: data.email.split('@')[0]
              };
              
              resolve({
                data: {
                  token: 'mock-jwt-token-for-demo-purposes-' + Math.random().toString(36).substring(2, 15),
                  user: userData
                }
              });
            } else {
              // Utente non trovato
              console.log('Credenziali non valide');
              const error = new Error('Credenziali non valide');
              error.response = { status: 401, data: { message: 'Email o password non valide' } };
              return reject(error);
            }
          }
        } else if (url.includes('/auth/register')) {
          // Permettiamo la registrazione con qualsiasi email e password
          if (data?.email && data?.password) {
            console.log('Registrazione utente:', data.email);
            
            // Otteniamo la lista degli utenti registrati
            let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            // Verifichiamo se l'email è già registrata
            if (registeredUsers.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
              console.log('Email già registrata');
              const error = new Error('Email già registrata');
              error.response = { status: 409, data: { message: 'Questa email è già registrata' } };
              return reject(error);
            }
            
            // Creiamo un nuovo utente
            const newUser = {
              id: 'new-user-' + Math.random().toString(36).substring(2, 9),
              email: data.email,
              password: data.password, // In un'app reale non memorizzeremmo mai password in chiaro
              name: data.name || data.email.split('@')[0],
              dateRegistered: new Date().toISOString()
            };
            
            // Aggiungiamo l'utente alla lista
            registeredUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            console.log('Utente registrato con successo. Totale utenti:', registeredUsers.length);
            
            // Restituiamo i dati dell'utente senza la password
            const { password, ...userWithoutPassword } = newUser;
            resolve({
              data: {
                token: 'mock-jwt-token-for-demo-purposes-' + Math.random().toString(36).substring(2, 15),
                user: userWithoutPassword
              }
            });
          } else {
            const error = new Error('Dati di registrazione incompleti');
            error.response = { status: 400, data: { message: 'Email e password sono obbligatorie' } };
            return reject(error);
          }
        } else if (url.includes('/symptoms')) {
          resolve({
            data: [] // Array vuoto invece di dati di esempio
          });
        } else if (url.includes('/medications')) {
          resolve({
            data: [] // Array vuoto invece di dati di esempio
          });
        } else if (url.includes('/wellness')) {
          resolve({
            data: [] // Array vuoto invece di dati di esempio
          });
        } else if (url.includes('/ai/chat')) {
          // Implementiamo una risposta più intelligente per l'assistente virtuale
          const userMessage = data?.message || '';
          let aiReply = "Ciao! Sono Salus, il tuo assistente sanitario. Ti ricordo che non sono un medico e le mie informazioni sono solo educative. Come posso aiutarti oggi?";
          
          // Risposte predefinite basate su parole chiave nel messaggio dell'utente
          if (userMessage.toLowerCase().includes('mal di testa')) {
            aiReply = "Il mal di testa può essere causato da diversi fattori come stress, disidratazione, problemi di vista o tensione muscolare. Ti consiglio di bere acqua, riposare in una stanza buia e silenziosa, e considerare l'uso di farmaci da banco se necessario. Se il mal di testa è persistente o particolarmente forte, consulta un medico.";
          } else if (userMessage.toLowerCase().includes('febbre')) {
            aiReply = "La febbre è spesso un segno che il tuo corpo sta combattendo un'infezione. È importante riposare, bere molti liquidi e monitorare la temperatura. Se supera i 39°C o persiste per più di tre giorni, consulta un medico. Anche sintomi come difficoltà respiratorie o forte mal di testa insieme alla febbre richiedono attenzione medica immediata.";
          } else if (userMessage.toLowerCase().includes('tosse')) {
            aiReply = "La tosse può essere causata da allergie, raffreddore, influenza o altre condizioni. Per alleviare i sintomi, prova a bere tè caldo con miele, usa un umidificatore e mantieniti idratato. Se la tosse è accompagnata da febbre alta, difficoltà respiratorie o dura più di due settimane, consulta un medico.";
          } else if (userMessage.toLowerCase().includes('stanco') || userMessage.toLowerCase().includes('stanchezza') || userMessage.toLowerCase().includes('fatica')) {
            aiReply = "La stanchezza cronica può essere causata da vari fattori come stress, cattiva alimentazione, mancanza di sonno o condizioni mediche sottostanti. Prova a migliorare la tua routine di sonno, fare esercizio regolarmente e mangiare cibi nutrienti. Se la stanchezza persiste nonostante questi cambiamenti, potrebbe essere utile consultare un medico.";
          } else if (userMessage.toLowerCase().includes('dormire') || userMessage.toLowerCase().includes('sonno') || userMessage.toLowerCase().includes('insonnia')) {
            aiReply = "Per migliorare la qualità del sonno, mantieni un programma regolare, crea un ambiente rilassante, evita caffeina e schermi nelle ore prima di coricarti. Tecniche di rilassamento come la meditazione possono essere utili. Se l'insonnia persiste, parla con un professionista sanitario che può valutare se ci sono problemi sottostanti.";
          } else if (userMessage.toLowerCase().includes('stress') || userMessage.toLowerCase().includes('ansia')) {
            aiReply = "Lo stress e l'ansia sono risposte naturali, ma quando diventano eccessivi possono influire sulla salute. Tecniche come la respirazione profonda, l'esercizio fisico, la meditazione e attività rilassanti possono aiutare. Mantieni uno stile di vita equilibrato e, se necessario, considera di parlare con un professionista della salute mentale.";
          } else if (userMessage.length > 10) {
            // Se il messaggio è abbastanza lungo ma non corrisponde a nessuna parola chiave
            aiReply = "Grazie per la tua domanda. In modalità offline, le mie risposte sono limitate. Posso fornire consigli generali su sintomi comuni, stili di vita sani e primi soccorsi. Per domande mediche specifiche, ti consiglio di consultare un professionista sanitario quando possibile.";
          }
          
          resolve({
            data: {
              reply: aiReply
            }
          });
        } else {
          resolve({ data: {} });
        }
      } catch (error) {
        console.error("Errore nel mock della risposta:", error);
        reject(error);
      }
    }, 300);
  });
};

// Funzione per inviare un messaggio all'AI Assistant
export const sendMessageToAI = async (message) => {
  try {
    const token = localStorage.getItem('token');
    if (!token && !isInOfflineMode()) {
      throw new Error('Utente non autenticato');
    }

    if (isInOfflineMode()) {
      return getMockResponse('/api/ai/chat', 'POST', { message }).then(res => res.data);
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
      throw new Error('Errore nella richiesta all\'AI');
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel servizio AI:', error);
    // In caso di errore, fornisci una risposta predefinita
    return {
      reply: "Mi dispiace, si è verificato un errore nella comunicazione. Riprova più tardi."
    };
  }
};

export default api; 