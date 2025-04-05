// Configurazione Firebase per Salus App
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configurazione Firebase
// Utilizziamo variabili d'ambiente per evitare di esporre le chiavi API
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCLDDpv53AQ-SlbTeRbC0RVftiZHT-1E",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "salus-demo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "salus-demo",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "salus-demo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta l'oggetto Auth per l'utilizzo in altri file
export const auth = getAuth(app);
export default app; 