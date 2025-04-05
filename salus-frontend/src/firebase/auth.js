// Servizio di autenticazione Firebase per Salus App
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

// Funzione per registrare un nuovo utente
export const registerWithEmailAndPassword = async (email, password, name) => {
  try {
    // Crea l'utente con email e password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Aggiorna il profilo con il nome
    await updateProfile(user, {
      displayName: name
    });
    
    // Invia email di verifica
    await sendEmailVerification(user);
    
    console.log("Utente registrato con successo:", user);
    return { success: true, user };
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    return { 
      success: false, 
      error: translateFirebaseError(error.code) || error.message 
    };
  }
};

// Funzione per effettuare il login
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login effettuato con successo:", user);
    return { success: true, user };
  } catch (error) {
    console.error("Errore durante il login:", error);
    return { 
      success: false, 
      error: translateFirebaseError(error.code) || error.message 
    };
  }
};

// Funzione per effettuare il logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("Logout effettuato con successo");
    return { success: true };
  } catch (error) {
    console.error("Errore durante il logout:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Funzione per inviare email di reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Email di reset password inviata a:", email);
    return { success: true };
  } catch (error) {
    console.error("Errore durante l'invio dell'email di reset:", error);
    return { 
      success: false, 
      error: translateFirebaseError(error.code) || error.message 
    };
  }
};

// Funzione per inviare nuovamente l'email di verifica
export const resendVerificationEmail = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: "Nessun utente autenticato" };
    }
    
    await sendEmailVerification(currentUser);
    console.log("Email di verifica inviata nuovamente a:", currentUser.email);
    return { success: true };
  } catch (error) {
    console.error("Errore durante l'invio dell'email di verifica:", error);
    return { 
      success: false, 
      error: translateFirebaseError(error.code) || error.message 
    };
  }
};

// Funzione per aggiornare il profilo utente (nome)
export const updateUserProfile = async (displayName) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: "Nessun utente autenticato" };
    }
    
    await updateProfile(currentUser, { displayName });
    console.log("Profilo aggiornato con successo");
    return { success: true, user: auth.currentUser };
  } catch (error) {
    console.error("Errore durante l'aggiornamento del profilo:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Funzione per aggiornare l'email dell'utente
export const updateUserEmail = async (newEmail) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: "Nessun utente autenticato" };
    }
    
    await updateEmail(currentUser, newEmail);
    console.log("Email aggiornata con successo");
    return { success: true, user: auth.currentUser };
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'email:", error);
    return { 
      success: false, 
      error: translateFirebaseError(error.code) || error.message 
    };
  }
};

// Funzione per ottenere l'utente corrente
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Funzione per tradurre gli errori di Firebase in messaggi più user-friendly
export const translateFirebaseError = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'Questo indirizzo email è già registrato. Prova ad accedere.',
    'auth/invalid-email': 'L\'indirizzo email non è valido.',
    'auth/user-not-found': 'Nessun account trovato con questa email.',
    'auth/wrong-password': 'Password errata. Riprova o usa "Password dimenticata".',
    'auth/weak-password': 'La password è troppo debole. Usa almeno 6 caratteri.',
    'auth/network-request-failed': 'Errore di connessione. Verifica la tua connessione internet.',
    'auth/too-many-requests': 'Troppi tentativi falliti. Riprova più tardi.',
    'auth/user-disabled': 'Questo account è stato disabilitato.',
    'auth/requires-recent-login': 'Questa operazione richiede un login recente. Esci e accedi nuovamente.'
  };
  
  return errorMessages[errorCode] || null;
};

// Funzione per osservare i cambiamenti nello stato di autenticazione
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
}; 