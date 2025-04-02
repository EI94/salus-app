# Salus Backend

Backend per l'applicazione Salus, un'app per il monitoraggio dei sintomi e il tracciamento del benessere.

## Variabili d'Ambiente Richieste

Per eseguire questa applicazione, è necessario configurare le seguenti variabili d'ambiente:

- `PORT`: Porta su cui il server ascolterà (default: 5000)
- `MONGO_URI`: URI di connessione a MongoDB
- `OPENAI_API_KEY`: Chiave API per OpenAI (utilizzata per l'assistente AI)
- `CORS_ORIGIN`: Elenco di domini consentiti, separati da virgole

## Installazione

```bash
npm install
```

## Avvio del Server

```bash
npm start
```

## Note per il Deployment

Quando esegui il deployment su servizi come Render:

1. Configura le variabili d'ambiente nel pannello di controllo del servizio
2. Assicurati di configurare la stringa di connessione MongoDB Atlas
3. Imposta il comando di avvio su `npm start`
4. Verifica che il dominio frontend sia incluso nella variabile CORS_ORIGIN 