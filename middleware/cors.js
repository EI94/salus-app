const cors = require('cors');

// Rileva se l'ambiente è configurato per consentire tutte le origini
const allowAllOrigins = process.env.CORS_ALLOW_ALL === 'true';

// Lista di domini consentiti dalle variabili d'ambiente
let allowedOrigins = [];

// Se CORS_ORIGIN è definito, usa quei domini
if (process.env.CORS_ORIGIN) {
  allowedOrigins = process.env.CORS_ORIGIN.split(',');
  console.log('Domini CORS consentiti dalle variabili d\'ambiente:', allowedOrigins);
} else {
  // Domini predefiniti se non definiti nella variabile d'ambiente
  allowedOrigins = [
    'http://localhost:3000',
    'https://salus-frontend.vercel.app',
    'https://salus-app.vercel.app',
    'https://www.wearesalusapp.com',
    'https://wearesalusapp.com',
    'https://salus-app-lk16.vercel.app',
    'https://salus-frontend-fork.vercel.app'
  ];
  console.log('Domini CORS consentiti predefiniti:', allowedOrigins);
}

// Middleware CORS configurabile
const setupCors = (app) => {
  console.log(`Configurazione CORS - Consenti tutte le origini: ${allowAllOrigins ? 'SÌ' : 'NO'}`);
  
  // Configurazione base CORS
  if (allowAllOrigins) {
    // In modalità aperta, consenti richieste da qualsiasi origine
    app.use(cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      optionsSuccessStatus: 204
    }));
    console.log('CORS configurato per accettare TUTTE le origini');
  } else {
    // In modalità restrittiva, usa la lista di domini consentiti
    app.use(cors({
      origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`Origine non consentita: ${origin}`);
          callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      optionsSuccessStatus: 204
    }));
    console.log('CORS configurato con lista di domini consentiti');
  }
  
  // Secondo livello di protezione: middleware per gestire manualmente le intestazioni CORS
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Log dettagliato per tutte le richieste
    console.log(`[CORS] Richiesta da: ${origin || 'nessuna origine'}, metodo: ${req.method}, URL: ${req.url}`);
    
    // Imposta intestazioni CORS per qualsiasi origine in modalità apertura
    if (allowAllOrigins) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    } 
    // Altrimenti controlla se l'origine è nella lista consentita
    else if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    // Intestazioni comuni per qualsiasi richiesta accettata
    if (res.getHeader('Access-Control-Allow-Origin')) {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    // Gestione specifica delle richieste OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      console.log(`[CORS] Richiesta OPTIONS da: ${origin || 'nessuna origine'}`);
      return res.status(204).end();
    }
    
    next();
  });
  
  // Preflight globale
  app.options('*', (req, res) => {
    const origin = req.headers.origin;
    console.log(`[CORS] Richiesta OPTIONS globale da: ${origin || 'nessuna origine'}`);
    
    // In modalità aperta o se l'origine è consentita
    if (allowAllOrigins || (origin && allowedOrigins.includes(origin))) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    res.status(204).end();
  });
};

module.exports = setupCors; 