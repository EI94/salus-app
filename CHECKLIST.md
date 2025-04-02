# Checklist per il Deployment di Salus

## Configurazione MongoDB Atlas ✅

- [x] Cluster MongoDB Atlas creato (salus-cluster)
- [x] Utente database creato (pierpaololaurito)
- [ ] Password dell'utente database configurata nel file .env
- [ ] Indirizzo IP aggiunto alla whitelist di MongoDB Atlas

## Configurazione Applicazione ✅

- [x] File .env aggiornato con stringa di connessione MongoDB Atlas
- [x] File config/database.js creato per la gestione della connessione
- [x] File server.js aggiornato per utilizzare la nuova configurazione
- [x] Middleware CORS configurato per la produzione
- [x] Endpoint health check aggiunto per monitoraggio

## Configurazione Vercel ⏳

- [x] File vercel.json creato nella root del progetto
- [ ] Repository caricato su GitHub/GitLab/Bitbucket
- [ ] Progetto creato su Vercel
- [ ] Variabili d'ambiente configurate su Vercel:
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET
  - [ ] NODE_ENV=production
  - [ ] OPENAI_API_KEY (opzionale)

## Passi Finali 🔜

- [ ] Sostituire `<db_password>` con la password effettiva nel file .env
- [ ] Testare l'applicazione localmente con la connessione a MongoDB Atlas
- [ ] Eseguire `npm run build` per verificare che la build sia corretta
- [ ] Verificare il deployment su Vercel tramite endpoint health check

## Note Importanti ⚠️

1. Non condividere mai il file .env nel repository (è già in .gitignore)
2. Assicurati che la password del database sia complessa e sicura
3. Per il deployment finale, rimuovi "Allow Access from Anywhere" nella whitelist di MongoDB Atlas e aggiungi solo gli IP necessari 