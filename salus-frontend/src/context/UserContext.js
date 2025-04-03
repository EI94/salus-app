import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, normalizePath } from '../api';
import { apiGet, apiPost, apiPut } from '../utils/apiHelper';
import i18n from '../i18n';

// Creazione del contesto utente
export const UserContext = createContext(null);

// Provider del contesto
export const UserProvider = ({ children }) => {
  // Stato per i dati dell'utente
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Carica i dati utente dal localStorage al mount del componente
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Verifica validità del token con il server
        try {
          // Normalizziamo il percorso
          const normalizedPath = normalizePath('/users/me');
          console.log('Percorso normalizzato per getUserData:', normalizedPath);
          
          const response = await axios.get(`${apiUrl}${normalizedPath}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data && response.data.user) {
            setUser(response.data.user);
            
            // Impostiamo la lingua dell'utente
            if (response.data.user.language) {
              i18n.changeLanguage(response.data.user.language);
              localStorage.setItem('preferredLanguage', response.data.user.language);
            }
          }
        } catch (error) {
          console.error('Errore verifica token:', error);
          // Token non valido, rimuovi i dati di autenticazione
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Errore caricamento utente:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  
  // Funzione per aggiornare i dati utente
  const updateUser = async (userData) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        return { success: false, error: 'Utente non autenticato' };
      }
      
      // Normalizziamo il percorso
      const normalizedPath = normalizePath('/users/profile');
      console.log('Percorso normalizzato per updateUser:', normalizedPath);
      
      // Invia dati aggiornati al server
      const response = await axios.put(`${apiUrl}${normalizedPath}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: 'Errore aggiornamento profilo' };
      }
    } catch (error) {
      console.error('Errore aggiornamento utente:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Errore durante l\'aggiornamento dell\'utente' 
      };
    }
  };
  
  // Funzione per il login
  const login = async (email, password, rememberMe = true) => {
    try {
      // OVERRIDE DI EMERGENZA PER IL DOMINIO DI PRODUZIONE
      if (typeof window !== 'undefined' && window.location.hostname === 'www.wearesalusapp.com') {
        console.log('OVERRIDE EMERGENZA - Login su www.wearesalusapp.com');
        
        // URL hardcoded per il login sul backend
        const directUrl = 'https://salus-backend.onrender.com/auth/login';
        console.log('Usando URL diretto:', directUrl);
        
        const response = await axios({
          method: 'POST',
          url: directUrl,
          data: {
            email,
            password
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.data || !response.data.token) {
          return { success: false, error: 'Risposta dal server non valida' };
        }
        
        const { token, user: userData } = response.data;
        
        // Salva token in base alla scelta "remember me"
        if (rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }
        
        // Aggiorna lo stato
        setUser(userData);
        
        // Imposta la lingua dell'utente se disponibile
        if (userData.language) {
          i18n.changeLanguage(userData.language);
          localStorage.setItem('preferredLanguage', userData.language);
        }
        
        return { success: true };
      }
      
      // Normale flusso per ambienti non di produzione
      // Utilizziamo il nuovo helper API per il login
      const response = await apiPost('/auth/login', {
        email,
        password
      });
      
      if (!response.data || !response.data.token) {
        return { success: false, error: 'Risposta dal server non valida' };
      }
      
      const { token, user: userData } = response.data;
      
      // Salva token in base alla scelta "remember me"
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      // Aggiorna lo stato
      setUser(userData);
      
      // Imposta la lingua dell'utente se disponibile
      if (userData.language) {
        i18n.changeLanguage(userData.language);
        localStorage.setItem('preferredLanguage', userData.language);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Errore login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Email o password non valide' 
      };
    }
  };
  
  // Funzione per la registrazione
  const register = async (email, password, name = '') => {
    try {
      // OVERRIDE DI EMERGENZA PER IL DOMINIO DI PRODUZIONE
      if (typeof window !== 'undefined' && window.location.hostname === 'www.wearesalusapp.com') {
        console.log('OVERRIDE EMERGENZA - Registrazione su www.wearesalusapp.com');
        
        // URL hardcoded per la registrazione sul backend
        const directUrl = 'https://salus-backend.onrender.com/auth/register';
        console.log('Usando URL diretto:', directUrl);
        
        const response = await axios({
          method: 'POST',
          url: directUrl,
          data: {
            email,
            password,
            name
          },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.data || !response.data.token) {
          return { success: false, error: 'Risposta dal server non valida' };
        }
        
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        setUser(userData);
        
        if (userData.language) {
          i18n.changeLanguage(userData.language);
          localStorage.setItem('preferredLanguage', userData.language);
        }
        
        return { success: true };
      }
      
      // Normale flusso per ambienti non di produzione
      // Utilizziamo il nuovo helper API per la registrazione
      const response = await apiPost('/auth/register', {
        email,
        password,
        name
      });
      
      if (!response.data || !response.data.token) {
        return { success: false, error: 'Risposta dal server non valida' };
      }
      
      const { token, user: userData } = response.data;
      
      // Salva token
      localStorage.setItem('token', token);
      
      // Aggiorna lo stato
      setUser(userData);
      
      // Imposta la lingua dell'utente se disponibile
      if (userData.language) {
        i18n.changeLanguage(userData.language);
        localStorage.setItem('preferredLanguage', userData.language);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Errore registrazione:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Errore durante la registrazione' 
      };
    }
  };
  
  // Funzione per il logout
  const logout = () => {
    // Rimuovi dati autenticazione
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
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
        return { success: false, error: 'Utente non autenticato' };
      }
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Normalizziamo il percorso
      const normalizedPath = normalizePath('/users/language');
      
      // Aggiorna la lingua sul server
      await axios.put(`${apiUrl}${normalizedPath}`, { language }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Aggiorna l'oggetto utente localmente
      const updatedUser = { ...user, language };
      setUser(updatedUser);
      
      // Aggiorna i18n
      i18n.changeLanguage(language);
      localStorage.setItem('preferredLanguage', language);
      
      return { success: true };
    } catch (error) {
      console.error('Errore aggiornamento lingua:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Errore durante l\'aggiornamento della lingua' 
      };
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