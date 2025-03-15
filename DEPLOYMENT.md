# Guida al Deployment di Salus

## Configurazione MongoDB Atlas

1. **Configurazione Già Completata**:
   - È stato creato un cluster MongoDB Atlas con il nome "salus-cluster"
   - Nome utente del database: `pierpaololaurito`
   - Stringa di connessione: `mongodb+srv://pierpaololaurito:<db_password>@salus-cluster.ekonk.mongodb.net/?retryWrites=true&w=majority&appName=salus-cluster`

2. **Completare la Configurazione**:
   - Sostituire `<db_password>` nella stringa di connessione con la password effettiva
   - Aggiungere l'indirizzo IP di Vercel alla whitelist di MongoDB Atlas:
     1. Vai al dashboard di MongoDB Atlas
     2. Seleziona il cluster "salus-cluster"
     3. Clicca su "Network Access" nel menu laterale
     4. Clicca su "Add IP Address"
     5. Per l'ambiente di test, seleziona "Allow Access from Anywhere" (0.0.0.0/0)
     6. Per l'ambiente di produzione, aggiungi gli indirizzi IP specifici di Vercel

## Deployment su Vercel

1. **Preparazione Repository**:
   - Assicurati che il codice sia in un repository Git (GitHub, GitLab, Bitbucket)
   - Verifica che il file `vercel.json` sia nella root del progetto
   - Verifica che `package.json` contenga gli script corretti

2. **Deployment su Vercel**:
   - Vai su [Vercel](https://vercel.com) e accedi o registrati
   - Clicca "New Project" e importa il tuo repository
   - Configura le variabili d'ambiente:
     - `MONGODB_URI`: `mongodb+srv://pierpaololaurito:<db_password>@salus-cluster.ekonk.mongodb.net/?retryWrites=true&w=majority&appName=salus-cluster` (con password reale)
     - `JWT_SECRET`: `salus_jwt_secret_key_2025_sicurezza_app`
     - `OPENAI_API_KEY`: la tua chiave API OpenAI (se utilizzi questa funzionalità)
     - `NODE_ENV`: `production`
     - `PORT`: Vercel gestirà questa variabile, non è necessario configurarla

3. **Verifica Deployment**:
   - Una volta completato il deployment, Vercel fornirà un URL del progetto
   - Verifica che l'API funzioni correttamente facendo una richiesta di test
   - Esempio: `curl https://tuo-progetto.vercel.app/api/health`

## Risoluzione Problemi

Se riscontri problemi con il deployment, verifica:

1. **Logs su Vercel**:
   - Vai alla dashboard di Vercel, seleziona il tuo progetto
   - Clicca su "Deployments" e poi sul deployment più recente
   - Clicca su "Functions" o "Logs" per vedere gli errori

2. **Connessione MongoDB**:
   - Verifica che la password nel MONGODB_URI sia corretta
   - Controlla che Vercel possa accedere a MongoDB Atlas (verifica la whitelist)
   - Verifica nei log se ci sono errori di connessione al database

## Migrazione Dati (Opzionale)

Se hai dati esistenti nel database locale che vuoi migrare su MongoDB Atlas:

1. Esporta i dati dal database locale:
   ```
   mongodump --db salus --out ./backup
   ```

2. Importa i dati su MongoDB Atlas:
   ```
   mongorestore --uri "mongodb+srv://pierpaololaurito:<db_password>@salus-cluster.ekonk.mongodb.net/?retryWrites=true&w=majority&appName=salus-cluster" --db salus ./backup/salus
   ```

## Note Finali

- Ricorda di non condividere mai le tue credenziali o chiavi API nei repository pubblici
- Aggiorna regolarmente le dipendenze per mantenere l'applicazione sicura
- Configura sistemi di monitoraggio per l'applicazione in produzione 