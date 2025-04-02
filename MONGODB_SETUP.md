# Configurazione Whitelist MongoDB Atlas

1. Accedi al tuo account MongoDB Atlas (https://cloud.mongodb.com/)
2. Seleziona il tuo progetto e il cluster "salus-cluster"
3. Nel menu laterale, clicca su "Network Access"
4. Clicca sul pulsante "+ ADD IP ADDRESS"
5. Seleziona "Allow Access from Anywhere" (0.0.0.0/0)
6. Clicca su "Confirm"

Questa configurazione permette l'accesso al database da qualsiasi indirizzo IP, incluso Vercel. In un ambiente di produzione definitivo, dovresti limitare l'accesso solo agli IP necessari, ma per i test questa configurazione è adeguata.

## Note Importanti:
- La configurazione "Allow Access from Anywhere" è adatta solo per testing e sviluppo
- Per un ambiente di produzione, dovresti aggiungere solo gli IP specifici di Vercel e dei tuoi server 