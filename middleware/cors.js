const cors = require('cors');

// Lista di domini consentiti per le richieste CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://salus-frontend.vercel.app', // Cambia con il tuo dominio di produzione
  'https://salus-app.vercel.app',       // Aggiungi altri domini se necessario
  'https://www.wearesalusapp.com',       // Dominio principale
  'https://wearesalusapp.com',             // Senza www
  'https://salus-app-lk16.vercel.app',     // Nuovo dominio fork Vercel
  'https://salus-frontend-fork.vercel.app'  // Altro dominio fork
];

// Opzioni di configurazione CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Consentire richieste senza origine (come le app mobili o Postman)
    if (!origin) return callback(null, true);
    
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
  },
  credentials: true,            // Abilitare l'invio di credenziali (cookies, headers auth)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Opzioni CORS permissive per debug
const permissiveCorsOptions = {
  origin: '*',                  // Consenti qualsiasi origine
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
};

// Middleware CORS basato sull'ambiente
const setupCors = (app) => {
  if (process.env.NODE_ENV === 'production') {
    // In produzione, temporaneamente usiamo una configurazione permissiva per debug
    app.use(cors(permissiveCorsOptions));
    console.log('CORS configurato in modalità PERMISSIVA per debug');
  } else {
    // In sviluppo, consenti tutte le richieste
    app.use(cors());
    console.log('CORS configurato in modalità sviluppo');
  }
};

module.exports = setupCors; 