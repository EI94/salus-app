# Guida al Deployment su Vercel

Questa guida ti aiuterà a configurare correttamente il deployment della tua applicazione Salus su Vercel.

## Prerequisiti

1. Un account su [Vercel](https://vercel.com/)
2. Repository GitHub collegato a Vercel
3. Variabili d'ambiente configurate

## Configurazione del Deployment

### 1. Configurazione del file `vercel.json`

Il file `vercel.json` nella radice del progetto definisce come Vercel deve buildare e servire l'applicazione:

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.js" },
    { "src": "/(.*)", "dest": "/server.js" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

Questa configurazione invia tutte le richieste al file `server.js`.

### 2. Configurazione degli script di build

Nel file `package.json`, abbiamo configurato lo script `vercel-build` per evitare errori durante il processo di build:

```json
"scripts": {
  "vercel-build": "echo 'Building backend only'"
}
```

### 3. Configurazione delle variabili d'ambiente su Vercel

È necessario configurare le seguenti variabili d'ambiente nel pannello di controllo di Vercel:

- `MONGODB_URI`: L'URI di connessione al database MongoDB Atlas
- `JWT_SECRET`: La chiave segreta per la firma dei token JWT
- `OPENAI_API_KEY`: La chiave API di OpenAI (se utilizzi le funzionalità AI)

### 4. Deployment su Vercel

1. Collega il tuo repository GitHub a Vercel
2. Configura le variabili d'ambiente necessarie
3. Avvia il deployment manualmente o tramite push su GitHub

### Nota importante per il deployment full stack

Se desideri deployare sia il backend che il frontend su Vercel:

1. Assicurati che il frontend sia buildato correttamente (`npm run build` nella directory `salus-frontend`)
2. Modifica il file `vercel.json` per includere la configurazione dei file statici:

```json
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" },
    { "src": "salus-frontend/build/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.js" },
    { "src": "/(.*\\.(js|css|ico|png|jpg|svg|json))", "dest": "/salus-frontend/build/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/salus-frontend/build/index.html" }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

E modifica lo script `vercel-build` per buildare il frontend:

```json
"scripts": {
  "vercel-build": "npm run build"
}
```

## Risoluzione dei problemi

### Errore: "salus-frontend: No such file or directory"

Se riscontri questo errore, significa che il deployment sta tentando di accedere alla directory `salus-frontend` che non esiste nel commit attuale. Soluzione:

1. Usa la configurazione solo-backend mostrata sopra
2. Assicurati che il frontend sia presente nel repository prima di utilizzare la configurazione full stack

### Variabili d'ambiente mancanti

Se l'applicazione non riesce a connettersi al database o presenta altri errori relativi alle variabili d'ambiente, verifica che tutte le variabili necessarie siano configurate nel pannello di controllo di Vercel. 