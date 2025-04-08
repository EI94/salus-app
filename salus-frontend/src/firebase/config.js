// Configurazione Firebase per Salus App
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Configurazione Firebase
// Usiamo direttamente la chiave API fornita
const firebaseConfig = {
  apiKey: "AIzaSyDUTXCmzG-RPKvl9dhyTYeJpR-pKATX60w",
  authDomain: "salus-ai-c9da2.firebaseapp.com",
  projectId: "salus-ai-c9da2",
  storageBucket: "salus-ai-c9da2.appspot.com",
  messagingSenderId: "1048642413328",
  appId: "1:1048642413328:web:2d1051ee93d1ac3ff2d7f3",
  measurementId: "G-C6S4WGGG52"
};

// Inizializza Firebase
export const app = initializeApp(firebaseConfig);

// Inizializza servizi Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Abilita persistenza offline per Firestore
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('Persistenza offline abilitata per Firestore');
    })
    .catch((err) => {
      console.error('Errore nell\'abilitare la persistenza offline:', err);
      if (err.code === 'failed-precondition') {
        console.warn('Persistenza non abilitata: più schede aperte contemporaneamente');
      } else if (err.code === 'unimplemented') {
        console.warn('Il browser non supporta la persistenza offline');
      }
    });
} catch (error) {
  console.error('Errore durante la configurazione della persistenza:', error);
}

// Usa emulatori in ambiente di sviluppo locale
if (window.location.hostname === 'localhost') {
  console.log('Usando emulatori Firebase per ambiente di sviluppo locale');
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app; 