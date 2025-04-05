import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getCurrentUser,
  loginWithEmailAndPassword,
  registerWithEmailAndPassword,
  logoutUser,
  resetPassword,
  resendVerificationEmail,
  updateUserProfile,
  onAuthStateChange
} from '../firebase/auth';

// Creazione del contesto utente
const UserContext = createContext(null);

// Esporto UserContext direttamente
export { UserContext };

// Provider del contesto
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  // Controllo iniziale dell'autenticazione usando Firebase
  useEffect(() => {
    console.log('Controllo autenticazione Firebase...');
    
    // Utilizziamo onAuthStateChange per gestire lo stato dell'utente
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        console.log('Utente Firebase autenticato:', firebaseUser);
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Utente',
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL,
          createdAt: firebaseUser.metadata.creationTime,
          // Conserviamo la lingua nell'utente se disponibile
          language: localStorage.getItem('preferredLanguage') || i18n.language
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Imposta lingua utente
        if (userData.language) {
          i18n.changeLanguage(userData.language);
        }
      } else {
        console.log('Nessun utente Firebase autenticato');
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
    
    // Unsubscribe quando il componente viene smontato
    return () => unsubscribe();
  }, [i18n]);

  // Funzione per il login con Firebase Auth
  const login = async (email, password, rememberMe = true) => {
    try {
      setLoading(true);
      const result = await loginWithEmailAndPassword(email, password);

      if (result.success) {
        // Firebase gestisce automaticamente il token di autenticazione
        // Non dobbiamo più gestire manualmente localStorage/sessionStorage

        // Imposta la lingua utente se disponibile
        if (result.user) {
          // Salviamo la lingua preferita dell'utente
          const preferredLanguage = localStorage.getItem('preferredLanguage') || i18n.language;
          i18n.changeLanguage(preferredLanguage);
        }

        return { success: true, user: result.user };
      } else {
        console.log('Errore login Firebase:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.log('Errore imprevisto durante login:', error);
      return {
        success: false,
        error: error.message || 'Errore durante il login'
      };
    } finally {
      setLoading(false);
    }
  };

  // Funzione per la registrazione con Firebase Auth
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      const result = await registerWithEmailAndPassword(email, password, name);

      if (result.success) {
        // Per Firebase, dopo la registrazione, l'utente deve verificare l'email
        return { 
          success: true, 
          user: result.user,
          message: 'Registrazione completata. Controlla la tua email per la verifica.'
        };
      } else {
        console.log('Errore registrazione Firebase:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.log('Errore imprevisto durante registrazione:', error);
      return {
        success: false,
        error: error.message || 'Errore durante la registrazione'
      };
    } finally {
      setLoading(false);
    }
  };

  // Funzione per aggiornare la lingua dell'utente
  const updateLanguage = async (language) => {
    try {
      setLoading(true);
      
      // Aggiorna prima localmente
      i18n.changeLanguage(language);
      localStorage.setItem('preferredLanguage', language);
      
      // Se l'utente è autenticato, aggiorna anche lo stato utente locale
      if (user && isAuthenticated) {
        setUser({
          ...user,
          language
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Errore aggiornamento lingua:', error);
      return {
        success: false,
        error: error.message || 'Errore durante l\'aggiornamento della lingua'
      };
    } finally {
      setLoading(false);
    }
  };

  // Funzione per il logout con Firebase Auth
  const logout = async () => {
    try {
      await logoutUser();
      // Firebase gestisce la pulizia dei token
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
      return { success: true };
    } catch (error) {
      console.error('Errore durante logout:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Funzione per inviare email di reset password
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const result = await resetPassword(email);
      return result;
    } catch (error) {
      console.error('Errore reset password:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per inviare nuovamente email di verifica
  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      const result = await resendVerificationEmail();
      return result;
    } catch (error) {
      console.error('Errore invio email verifica:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per aggiornare il profilo utente
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      // Per ora supportiamo solo l'aggiornamento del nome
      const result = await updateUserProfile(profileData.name);
      
      if (result.success && result.user) {
        // Aggiorna i dati utente nel contesto
        setUser({
          ...user,
          name: result.user.displayName
        });
      }
      
      return result;
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateLanguage,
        forgotPassword,
        sendVerificationEmail,
        updateProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Hook personalizzato per utilizzare il contesto utente
export const useUser = () => useContext(UserContext); 