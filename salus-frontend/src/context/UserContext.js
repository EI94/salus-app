import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../api';

// Creazione del contesto utente
export const UserContext = createContext(null);

// Provider del contesto
export const UserProvider = ({ children }) => {
  // Stato per i dati dell'utente
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Carica i dati utente dal localStorage al mount del componente
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Controlla se esiste un token valido
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Controlla se ci sono dati utente salvati
        const storedUser = localStorage.getItem('currentUser');
        
        if (storedUser) {
          // Usa i dati memorizzati per un caricamento rapido
          setUserData(JSON.parse(storedUser));
          
          // Opzionale: verifica col server se i dati sono aggiornati
          try {
            if (process.env.NODE_ENV !== 'development') {
              // In ambiente di produzione, verifica i dati con il server
              const response = await axios.get(`${apiUrl}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (response.data && response.data.user) {
                // Aggiorna i dati se sono diversi
                const serverUser = response.data.user;
                localStorage.setItem('currentUser', JSON.stringify(serverUser));
                setUserData(serverUser);
              }
            }
          } catch (verifyError) {
            console.warn('Verifica dati utente non riuscita:', verifyError);
            // Non interrompiamo il flusso per questo errore
          }
        } else if (token && process.env.NODE_ENV !== 'development') {
          // Se abbiamo un token ma nessun dato utente, prova a recuperarli
          try {
            const response = await axios.get(`${apiUrl}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.user) {
              const serverUser = response.data.user;
              localStorage.setItem('currentUser', JSON.stringify(serverUser));
              setUserData(serverUser);
            }
          } catch (fetchError) {
            console.error('Recupero dati utente fallito:', fetchError);
            // Se non riusciamo a recuperare i dati, rimuoviamo il token
            if (fetchError.response && fetchError.response.status === 401) {
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati utente:', error);
        setError('Errore nel caricamento dei dati utente');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  // Funzione per aggiornare i dati utente
  const updateUserData = (newData) => {
    // Preveniamo aggiornamenti a null o undefined
    if (!newData) return;
    
    try {
      const updatedData = userData ? { ...userData, ...newData } : newData;
      setUserData(updatedData);
      
      // Salva i dati aggiornati nel localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedData));
      
      // Opzionale: sincronizza con il server
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token && process.env.NODE_ENV !== 'development') {
        // Implementazione futura: invia i dati aggiornati al server
        // axios.post(`${apiUrl}/auth/update-profile`, updatedData, { 
        //   headers: { Authorization: `Bearer ${token}` } 
        // });
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento dei dati utente:', error);
    }
  };
  
  // Funzione per il login
  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${apiUrl}/auth/login`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Salva token in base alla scelta "ricordami"
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      // Salva i dati utente
      localStorage.setItem('currentUser', JSON.stringify(user));
      setUserData(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Errore login:', error);
      setError(error.response?.data?.message || 'Errore durante il login');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Credenziali non valide'
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per la registrazione
  const register = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${apiUrl}/auth/register`, {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Salva token e dati utente
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setUserData(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Errore registrazione:', error);
      setError(error.response?.data?.message || 'Errore durante la registrazione');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registrazione fallita'
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Funzione per il logout
  const logout = () => {
    // Rimuovi token e dati utente
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setUserData(null);
    
    // Opzionale: notifica il server del logout
    // if (process.env.NODE_ENV !== 'development') {
    //   axios.post(`${apiUrl}/auth/logout`);
    // }
  };
  
  // Verifica se l'utente è autenticato
  const isAuthenticated = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token && !!userData;
  };
  
  return (
    <UserContext.Provider 
      value={{ 
        userData, 
        setUserData,
        updateUserData,
        login,
        register,
        logout,
        isAuthenticated,
        loading,
        error
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider; 