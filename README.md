# Salus - Backend API

Salus è un'applicazione per il monitoraggio della salute personale. Questo repository contiene il codice del backend API.

## Requisiti

- Node.js (versione 14.x o superiore)
- MongoDB (locale o MongoDB Atlas)

## Installazione

1. Clona questo repository:
```
git clone <url-repository>
cd salus
```

2. Installa le dipendenze:
```
npm install
```

3. Configura le variabili d'ambiente:
   - Crea un file `.env` nella directory principale (se non esiste già)
   - Inserisci le seguenti variabili:
```
PORT=3001
MONGODB_URI=mongodb+srv://pierpaololaurito:<db_password>@salus-cluster.ekonk.mongodb.net/?retryWrites=true&w=majority&appName=salus-cluster
JWT_SECRET=il_tuo_secret_jwt
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
```

## MongoDB Atlas

L'applicazione è configurata per utilizzare MongoDB Atlas come database:

1. Sostituisci `<db_password>` nella stringa di connessione con la password effettiva.
2. Assicurati che il tuo indirizzo IP sia autorizzato nella whitelist di MongoDB Atlas.
3. Se desideri utilizzare un database locale invece di Atlas, modifica la stringa di connessione in:
```
MONGODB_URI=mongodb://localhost:27017/salus
```

## Avvio del server

Per avviare il server in modalità sviluppo:
```
npm run dev
```

Per avviare il server in produzione:
```
npm start
```

## Deployment su Vercel

L'applicazione è configurata per il deployment su Vercel:

1. Configura le variabili d'ambiente su Vercel (vedi il file DEPLOYMENT.md).
2. Collega il repository GitHub al tuo progetto Vercel.
3. Vercel utilizzerà automaticamente il file `vercel.json` per la configurazione del deployment.

## Struttura del progetto

- `server.js` - Il punto di ingresso dell'applicazione
- `config/` - Configurazioni del sistema
  - `database.js` - Configurazione della connessione a MongoDB
- `middleware/` - Contiene i middleware personalizzati
  - `cors.js` - Gestione delle richieste cross-origin
- `models/` - Modelli Mongoose per il database
- `routes/` - API routes per le diverse funzionalità
  - `auth.js` - Autenticazione e gestione utenti
  - `users.js` - Gestione utenti
  - `symptoms.js` - Gestione sintomi
  - `medications.js` - Gestione farmaci
  - `wellness.js` - Gestione benessere quotidiano
  - `ai.js` - Integrazione con AI (OpenAI)
  - `health.js` - Endpoint per il monitoraggio dello stato del server

## API Endpoints

### Autenticazione

- `POST /api/auth/register` - Registrazione nuovo utente
- `POST /api/auth/login` - Login utente
- `GET /api/auth/user` - Ottieni dati utente corrente

### Utenti

- `GET /api/auth/users/:userId` - Ottieni dati di un utente specifico
- `PUT /api/auth/users/:userId` - Aggiorna dati utente
- `DELETE /api/auth/users/:userId` - Elimina utente

### Sintomi

- `GET /api/symptoms/:userId` - Ottieni tutti i sintomi di un utente
- `GET /api/symptoms/:userId/:symptomId` - Ottieni un sintomo specifico
- `POST /api/symptoms` - Registra un nuovo sintomo
- `PUT /api/symptoms/:symptomId` - Aggiorna un sintomo
- `DELETE /api/symptoms/:symptomId` - Elimina un sintomo

### Farmaci

- `GET /api/medications/:userId` - Ottieni tutti i farmaci di un utente
- `GET /api/medications/:userId/active` - Ottieni farmaci attivi
- `GET /api/medications/:userId/:medicationId` - Ottieni un farmaco specifico
- `POST /api/medications` - Registra un nuovo farmaco
- `PUT /api/medications/:medicationId` - Aggiorna un farmaco
- `DELETE /api/medications/:medicationId` - Elimina un farmaco

### Benessere

- `GET /api/wellness/:userId` - Ottieni tutti i log benessere
- `GET /api/wellness/:userId/stats` - Ottieni statistiche benessere
- `GET /api/wellness/:userId/:wellnessId` - Ottieni un log specifico
- `POST /api/wellness` - Registra un nuovo log benessere
- `PUT /api/wellness/:wellnessId` - Aggiorna un log benessere
- `DELETE /api/wellness/:wellnessId` - Elimina un log benessere

### AI

- `POST /api/ai/chat` - Invia un messaggio all'AI
- `POST /api/ai/analyze-symptoms` - Analizza sintomi con AI

### Health Check

- `GET /api/health` - Verifica lo stato del server e delle connessioni

## Sicurezza

- Autenticazione JWT per proteggere le API
- Password criptate con bcrypt
- Validazione dati in entrata
- CORS configurato per ambienti di produzione e sviluppo

## Licenza

MIT 