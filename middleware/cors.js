const cors = require('cors');

// Lista di domini consentiti per le richieste CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://salus-frontend.vercel.app',
  'https://salus-app.vercel.app',
  'https://www.wearesalusapp.com',
  'https://wearesalusapp.com',
  'https://salus-app-lk16.vercel.app',
  'https://salus-frontend-fork.vercel.app',
  '*'  // Consenti tutte le origini per risoluzione problemi
];

// Opzioni di configurazione CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Consentire richieste senza origine (come le app mobili o Postman)
    if (!origin) return callback(null, true);
    
    // Debug: Log di tutte le origini per tracciamento
    console.log(`Richiesta CORS da origine: ${origin}`);
    
    // In modalità debug, consenti tutte le origini
    return callback(null, true);
    
    // Codice originale disabilitato per consentire tutte le origini
    /*
    // Verificare se l'origine è nella lista dei domini consentiti
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Per risolvere i problemi temporaneamente, consentire tutte le origini
      // ma loggare quelle non autorizzate per debugging
      console.log(`Origin non in whitelist (ma consentito): ${origin}`);
      callback(null, true);
      
      // Disabilitato il blocco CORS per permettere i test
      // callback(new Error('Non consentito da CORS'));
    }
    */
  },
  credentials: true,            // Abilitare l'invio di credenziali (cookies, headers auth)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization,Accept',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware CORS basato sull'ambiente
const setupCors = (app) => {
  // In qualsiasi ambiente, per ora usa un approccio permissivo per CORS
  app.use(cors({ origin: true, credentials: true }));
  console.log('CORS configurato in modalità permissiva globale');
  
  // Middleware extra per gestire preventivamente le richieste OPTIONS
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      console.log('Gestione preventiva richiesta OPTIONS da: ' + (req.headers.origin || 'unknown'));
      
      // Imposta intestazioni CORS permissive
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      return res.status(204).end();
    }
    
    // Log per ogni richiesta
    const origin = req.headers.origin;
    console.log(`Richiesta ricevuta da origine: ${origin || 'unknown'}, metodo: ${req.method}, URL: ${req.url}`);
    
    // Imposta intestazioni CORS per tutte le altre richieste
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    next();
  });
  
  /* Disabilito la configurazione ambiente-specifica per usare un approccio permissivo globale
  if (process.env.NODE_ENV === 'production') {
    // In produzione, usa opzioni CORS che accettano origin specifici
    app.use(cors(corsOptions));
    console.log('CORS configurato in modalità produzione con whitelist estesa');
    
    // Aggiunge anche un middleware per gestire le opzioni CORS manualmente per i casi problematici
    app.use((req, res, next) => {
      const origin = req.headers.origin;
      
      // Log per tutte le richieste
      console.log(`Richiesta ricevuta da origine: ${origin}, metodo: ${req.method}, URL: ${req.url}`);
      
      // Se l'origine è nella lista consentita, imposta l'header esplicitamente
      if (origin && allowedOrigins.indexOf(origin) !== -1) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
      } else if (origin) {
        // Per origine non nella whitelist ma con richieste in arrivo, imposta comunque gli header CORS
        // Questo è utile durante lo sviluppo e il testing con nuovi domini
        console.log(`Imposto CORS per origine non in whitelist: ${origin}`);
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      
      // Gestione speciale per l'origin salus-app-lk16.vercel.app che sta causando problemi
      if (origin && origin.includes('salus-app-lk16.vercel.app')) {
        console.log('Richiesta da dominio problematico: ' + origin);
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      
      // Gestione speciale per le richieste OPTIONS (preflight)
      if (req.method === 'OPTIONS') {
        console.log('Ricevuta richiesta OPTIONS/preflight da: ' + origin);
        return res.status(200).end();
      }
      
      next();
    });
  } else {
    // In sviluppo, consenti tutte le richieste
    app.use(cors());
    console.log('CORS configurato in modalità sviluppo');
  }
  */
};

module.exports = setupCors; 