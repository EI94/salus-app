const cors = require('cors');

// Lista di domini consentiti per le richieste CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://salus-frontend.vercel.app', // Cambia con il tuo dominio di produzione
  'https://salus-app.vercel.app'       // Aggiungi altri domini se necessario
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
      callback(new Error('Non consentito da CORS'));
    }
  },
  credentials: true,            // Abilitare l'invio di credenziali (cookies, headers auth)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware CORS basato sull'ambiente
const setupCors = (app) => {
  if (process.env.NODE_ENV === 'production') {
    // In produzione, usa la configurazione restrittiva
    app.use(cors(corsOptions));
    console.log('CORS configurato in modalità produzione');
  } else {
    // In sviluppo, consenti tutte le richieste
    app.use(cors());
    console.log('CORS configurato in modalità sviluppo');
  }
};

module.exports = setupCors; 