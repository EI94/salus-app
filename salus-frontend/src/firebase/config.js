// Configurazione Firebase per Salus App
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurazione Firebase
// Usiamo direttamente la chiave API fornita
const firebaseConfig = {
  apiKey: "AIzaSyDUTXCmzG-RPKvl9dhyTYeJpR-pKATX60w",
  authDomain: "salus-ai-c9da2.firebaseapp.com",
  projectId: "salus-ai-c9da2",
  storageBucket: "salus-ai-c9da2.firebasestorage.app",
  messagingSenderId: "818422699421",
  appId: "1:818422699421:web:781cbf05b5d20a00dacb74"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta l'oggetto Auth per l'utilizzo in altri file
export const auth = getAuth(app);
// Esporta l'oggetto Firestore per l'utilizzo in altri file
export const db = getFirestore(app);
export default app; 