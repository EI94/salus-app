import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiUrl, normalizePath } from '../api';
import { useTranslation } from 'react-i18next';

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

  // Funzione helper per le chiamate API con proxy CORS
  const apiRequestWithCorsProxy = async (method, path, data = null, token = null) => {
    const normalizedPath = normalizePath(path);
    const TARGET_URL = `${apiUrl}${normalizedPath}`;
    const PROXY_URL = 'https://corsproxy.io/?';
    const CORS_PROXY_URL = PROXY_URL + encodeURIComponent(TARGET_URL);
    
    console.log(`[${method.toUpperCase()}] Richiesta con proxy CORS a: ${CORS_PROXY_URL}`);
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await axios({
        method: method,
        url: CORS_PROXY_URL,
        headers: headers,
        data: data
      });
      return response;
    } catch (error) {
      console.error(`Errore durante la richiesta ${method.toUpperCase()} a ${CORS_PROXY_URL}:`, error);
      throw error; // Rilancia l'errore per la gestione a livello superiore
    }
  };

  // Controllo iniziale dell'autenticazione
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          setUser({ id: 'loading' }); // Placeholder durante il caricamento
          
          const response = await apiRequestWithCorsProxy('get', '/users/profile', null, token);
          
          if (response.status === 200 && response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
            
            // Imposta lingua utente
            if (response.data.language) {
              i18n.changeLanguage(response.data.language);
            }
          } else {
            // Token non valido
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Errore nel controllo autenticazione:', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [i18n]); // Aggiunto i18n come dipendenza

  // Funzione per il login con CORS proxy
  const login = async (email, password, rememberMe = true) => { // Aggiunto rememberMe
    try {
      setLoading(true);
      const response = await apiRequestWithCorsProxy('post', '/auth/login', { email, password });

      if (response.status === 200) {
        const { token, user } = response.data;
        
        // Salva token in base alla scelta "remember me"
        if (rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }
        
        setUser(user);
        setIsAuthenticated(true);

        // Imposta la lingua utente se disponibile
        if (user && user.language) {
          i18n.changeLanguage(user.language);
          localStorage.setItem('preferredLanguage', user.language);
        }

        return { success: true, user };
      } else {
        console.log('Risposta login non valida:', response);
        return { success: false, error: 'Risposta dal server non valida' };
      }
    } catch (error) {
      console.log('Errore login:', error);
      setUser(null);
      setIsAuthenticated(false);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Credenziali non valide'
      };
    } finally {
      setLoading(false);
    }
  };

  // Funzione per la registrazione con CORS proxy
  const register = async (email, password, name) => {
    try {
      setLoading(true);
      const response = await apiRequestWithCorsProxy('post', '/auth/register', { email, password, name });

      if (response.status === 201 || response.status === 200) {
        const { token, user } = response.data;
        // Non impostiamo il token qui, l'utente dovrà loggarsi dopo la verifica email
        // localStorage.setItem('token', token);
        setUser(user); // Potremmo voler mostrare un messaggio di successo basato su questo
        setIsAuthenticated(false); // L'utente non è ancora autenticato, deve verificare l'email
        return { success: true, user, message: 'Registrazione completata. Controlla la tua email per la verifica.' };
      } else {
        console.log('Risposta registrazione non valida:', response);
        return { success: false, error: 'Risposta dal server non valida' };
      }
    } catch (error) {
      console.log('Errore registrazione:', error);
      setUser(null);
      setIsAuthenticated(false);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Errore durante la registrazione'
      };
    } finally {
      setLoading(false);
    }
  };

  // Funzione per aggiornare la lingua con CORS proxy
  const updateLanguage = async (language) => {
    try {
      setLoading(true);
      
      // Aggiorna prima localmente
      i18n.changeLanguage(language);
      localStorage.setItem('preferredLanguage', language);
      
      // Se l'utente è autenticato, salva la preferenza nel database
      if (user && user.id && isAuthenticated) { // Aggiunto controllo isAuthenticated
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await apiRequestWithCorsProxy('put', '/users/language', { language }, token);

        if (response.status === 200) {
          setUser({
            ...user,
            language
          });
          return { success: true };
        }
      } else {
        console.log('Aggiornamento lingua: utente non autenticato, aggiorno solo localmente.');
      }
      
      return { success: true }; // Successo anche se aggiornato solo localmente
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

  // Funzione per il logout
  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token'); // Rimuovi anche da sessionStorage
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  // Funzione per aggiornare il profilo utente con CORS proxy
  const updateUserProfile = async (profileData) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !isAuthenticated) {
      return { success: false, error: 'Utente non autenticato' };
    }
    try {
      setLoading(true);
      const response = await apiRequestWithCorsProxy('put', '/users/profile', profileData, token);
      if (response.status === 200 && response.data) {
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        return { success: false, error: 'Errore aggiornamento profilo' };
      }
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      return { success: false, error: error.response?.data?.message || 'Errore server' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser, // Mantenuto per usi diretti se necessario
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateLanguage,
        updateUserProfile // Aggiunto updateUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Hook personalizzato per utilizzare il contesto utente
export const useUser = () => useContext(UserContext); 