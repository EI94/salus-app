const mongoose = require('mongoose');

/**
 * Configura e stabilisce la connessione a MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // Opzioni di connessione
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout dopo 5 secondi
      socketTimeoutMS: 45000, // Chiude i socket dopo 45 secondi di inattività
      family: 4, // Usa IPv4, evita problemi con IPv6
      directConnection: true // Evita errori di risoluzione DNS SRV
    };

    // Controlla se è stata fornita una stringa di connessione valida
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI non definito nelle variabili d\'ambiente');
    }

    // Verifica che la stringa di connessione non contenga segnaposti
    if (uri.includes('<db_password>')) {
      throw new Error('Sostituisci <db_password> nella stringa di connessione con la password effettiva');
    }

    // Stabilisce la connessione a MongoDB Atlas
    await mongoose.connect(uri, options);

    console.log('MongoDB connesso');
    
    // Gestione degli errori di connessione dopo la connessione iniziale
    mongoose.connection.on('error', (err) => {
      console.error(`Errore di connessione MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnesso. Tentativo di riconnessione...');
    });

    // Gestione della chiusura dell'applicazione
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Connessione a MongoDB chiusa. Applicazione terminata.');
      process.exit(0);
    });

  } catch (error) {
    console.error(`Errore connessione MongoDB: ${error.message}`);
    // In produzione, non terminare il processo ma riprova
    if (process.env.NODE_ENV === 'production') {
      console.log('Riprovo la connessione tra 5 secondi...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB; 