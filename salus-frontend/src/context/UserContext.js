import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, isInOfflineMode, toggleOfflineMode } from '../api';
import { useNavigate } from 'react-router-dom';
import i18n from '../i18n'; // Importiamo i18n direttamente

// Creazione del contesto utente
export const UserContext = createContext(null);

// Provider del contesto
export const UserProvider = ({ children }) => {
  // Stato per i dati dell'utente
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Carica i dati utente dal localStorage al mount del componente
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('currentUser');
        console.log('Utente caricato dal localStorage');
        
        if (savedUser) {
          // Controlla se il token esiste
          const token = localStorage.getItem('token');
          
          if (token) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            
            // Impostiamo la lingua dell'utente quando carichiamo il profilo
            if (userData.language) {
              i18n.changeLanguage(userData.language);
              localStorage.setItem('userLanguage', userData.language);
              localStorage.setItem('preferredLanguage', userData.language);
              console.log('Lingua impostata da profilo utente:', userData.language);
            }
            
            console.log(`Modalità offline: ${isInOfflineMode() ? 'usando dati locali' : 'connesso al server'}`);
          } else {
            // Se non c'è token, pulisci i dati utente
            localStorage.removeItem('currentUser');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Errore caricamento utente:', error);
        // In caso di errore, pulisci i dati utente
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  
  // Funzione per aggiornare i dati utente
  const updateUser = (userData) => {
    // Preveniamo aggiornamenti a null o undefined
    if (!userData) return;
    
    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      // Salva i dati aggiornati nel localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      console.log('Dati utente aggiornati in localStorage');
      return { success: true };
    } catch (error) {
      console.error('Errore aggiornamento utente:', error);
      return { success: false, error: 'Errore durante l\'aggiornamento dell\'utente' };
    }
  };
  
  // Funzione per il login
  const login = async (email, password, rememberMe = true) => {
    console.log('Tentativo di login per:', email);
    console.log('Modalità offline:', isInOfflineMode());
    
    try {
      // Se siamo in modalità offline o in ambiente di sviluppo, usiamo il login simulato
      if (isInOfflineMode() || process.env.NODE_ENV === 'development') {
        console.log('Usando login simulato per modalità offline/sviluppo');
        return await simulatedLogin(email, password, rememberMe);
      }
      
      // Altrimenti, facciamo la chiamata API reale
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password
      });
      
      const { token, user: userData } = response.data;
      
      // Salva token a seconda della scelta "remember me"
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      // Salva i dati utente nel localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Aggiorna lo stato
      setUser(userData);
      console.log('Login completato con successo, aggiornato stato utente');
      
      // Non reindirizzo più qui - lasciamo che sia il routing di React a gestire questo
      return { success: true };
    } catch (error) {
      console.log('Errore login:', error.message);
      
      // Se l'API non è disponibile (errore 405), usa il login simulato
      if (error.response && error.response.status === 405) {
        console.log('API non disponibile (405), usando modalità simulata');
        toggleOfflineMode(true);
        return await simulatedLogin(email, password, rememberMe);
      }
      
      // Se è un altro tipo di errore, propagalo
      return { success: false, error: error.message };
    }
  };
  
  // Simula un login in modalità offline
  const simulatedLogin = async (email, password, rememberMe = true) => {
    try {
      // Usa l'API simulata invece della lista di utenti autorizzati
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password
      });
      
      if (response.data && response.data.token) {
        const { token, user: userData } = response.data;
        
        // Salva token a seconda della scelta "remember me"
        if (rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }
        
        // Salva i dati utente nel localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Aggiorna lo stato
        setUser(userData);
        
        console.log('Login simulato completato con successo');
        return { success: true };
      } else {
        return { success: false, error: 'Errore durante il login' };
      }
    } catch (error) {
      console.log('Errore login simulato:', error.message);
      return { success: false, error: error.response?.data?.message || 'Email o password non valide' };
    }
  };
  
  // Funzione per la registrazione
  const register = async (email, password, name = '') => {
    try {
      // Verifichiamo prima se siamo già in modalità offline
      if (isInOfflineMode()) {
        console.log("Usando registrazione simulata per modalità offline/sviluppo");
        
        // Se siamo già in modalità offline, evitiamo di fare la chiamata API reale
        // e creiamo direttamente un utente simulato
        const userData = {
          id: 'new-user-' + Math.random().toString(36).substring(2, 9),
          email: email,
          name: name || email.split('@')[0]
        };
        
        const token = 'mock-jwt-token-for-demo-purposes-' + Math.random().toString(36).substring(2, 15);
        
        // Salviamo i dati dell'utente
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true };
      }
      
      // Tentativo di registrazione con il server reale
      try {
        const response = await axios.post(`${apiUrl}/api/auth/register`, {
          email,
          password,
          name
        });
        
        if (response.data && response.data.token) {
          const { token, user: userData } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('currentUser', JSON.stringify(userData));
          setUser(userData);
          
          return { success: true };
        } else {
          return { success: false, error: 'Errore durante la registrazione' };
        }
      } catch (error) {
        console.log('Errore registrazione:', error.message);
        
        // Verifica se l'errore è dovuto a un 405 Method Not Allowed (API non disponibile)
        if (error.response && error.response.status === 405) {
          console.log('API non disponibile (405), usando modalità simulata per registrazione');
          // Attiva modalità offline automaticamente
          toggleOfflineMode(true);
          
          // Ora che siamo in modalità offline, creiamo un utente simulato
          const userData = {
            id: 'new-user-' + Math.random().toString(36).substring(2, 9),
            email: email,
            name: name || email.split('@')[0]
          };
          
          const token = 'mock-jwt-token-for-demo-purposes-' + Math.random().toString(36).substring(2, 15);
          
          // Salviamo i dati dell'utente
          localStorage.setItem('token', token);
          localStorage.setItem('currentUser', JSON.stringify(userData));
          setUser(userData);
          
          return { success: true };
        }
        
        return { 
          success: false, 
          error: error.response?.data?.message || 'Errore durante la registrazione'
        };
      }
    } catch (error) {
      console.log('Errore critico nella registrazione:', error.message);
      return { 
        success: false, 
        error: 'Si è verificato un errore imprevisto durante la registrazione'
      };
    }
  };
  
  // Funzione per il logout
  const logout = () => {
    // Rimuovi dati autenticazione
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setUser(null);
    
    return { success: true };
  };
  
  // Verifica se l'utente è autenticato
  const isAuthenticated = () => {
    return !!user && (!!localStorage.getItem('token') || !!sessionStorage.getItem('token'));
  };
  
  // Funzione per aggiornare la lingua dell'utente
  const updateLanguage = async (language) => {
    try {
      if (!user) {
        console.log('Nessun utente loggato per aggiornare la lingua');
        return { success: false, error: 'Utente non autenticato' };
      }
      
      // Aggiorna l'oggetto utente
      const updatedUser = { ...user, language };
      setUser(updatedUser);
      
      // Aggiorna i18n
      i18n.changeLanguage(language);
      
      // Salva in localStorage
      localStorage.setItem('userLanguage', language);
      localStorage.setItem('preferredLanguage', language);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      console.log('Lingua utente aggiornata a:', language);
      
      // Se non siamo in modalità offline, aggiorna anche sul server
      if (!isInOfflineMode()) {
        try {
          await axios.put(`${apiUrl}/api/users/language`, { language }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          console.log('Lingua utente aggiornata sul server');
        } catch (error) {
          console.error('Errore aggiornamento lingua sul server:', error);
          // Non consideriamo questo un errore fatale, continuiamo con la lingua aggiornata localmente
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Errore aggiornamento lingua:', error);
      return { success: false, error: 'Errore durante l\'aggiornamento della lingua' };
    }
  };
  
  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser,
        updateUser,
        login,
        register,
        logout,
        isAuthenticated,
        loading,
        error,
        updateLanguage
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider; 