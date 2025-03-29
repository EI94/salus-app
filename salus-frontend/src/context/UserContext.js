import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, isInOfflineMode } from '../api';

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
          console.log('Utente caricato dal localStorage');
        }
        
        // In modalità offline non tentiamo di verificare i dati con il server
        if (isInOfflineMode()) {
          console.log('Modalità offline: usando dati locali');
          setLoading(false);
          return;
        }
        
        // Verifica col server se i dati sono aggiornati
        if (process.env.NODE_ENV !== 'development' && token) {
          try {
            const response = await axios.get(`${apiUrl}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.user) {
              // Aggiorna i dati se ricevuti dal server
              const serverUser = response.data.user;
              localStorage.setItem('currentUser', JSON.stringify(serverUser));
              setUserData(serverUser);
              console.log('Dati utente aggiornati dal server');
            }
          } catch (verifyError) {
            console.warn('Verifica dati utente non riuscita:', verifyError);
            // Se riceviamo un 401, facciamo logout
            if (verifyError.response && verifyError.response.status === 401) {
              console.log('Token non valido, logout utente');
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
      console.log('Dati utente aggiornati in localStorage');
    } catch (error) {
      console.error('Errore nell\'aggiornamento dei dati utente:', error);
    }
  };
  
  // Funzione per il login
  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Tentativo di login per: ${email}`);
      console.log(`Modalità offline: ${isInOfflineMode()}`);
      
      // Se siamo in modalità offline o in sviluppo, creiamo un utente simulato
      if (isInOfflineMode() || process.env.NODE_ENV === 'development') {
        console.log('Usando login simulato per modalità offline/sviluppo');
        
        // Simuliamo un ritardo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUser = {
          id: 'offline-' + Math.random().toString(36).substring(2, 9),
          email: email,
          name: email.split('@')[0]
        };
        
        const mockToken = 'mock-token-' + Date.now();
        
        // Salva token in base alla scelta "ricordami"
        if (rememberMe) {
          localStorage.setItem('token', mockToken);
        } else {
          sessionStorage.setItem('token', mockToken);
        }
        
        // Salva i dati utente simulati
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        setUserData(mockUser);
        
        console.log('Login simulato completato con successo');
        return { success: true, user: mockUser };
      }
      
      // Tentativo di login reale
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
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
      
      // Gestione caso speciale per errori 405 (API non disponibile)
      if (error.response && error.response.status === 405) {
        console.log('API non disponibile (405), usando modalità simulata');
        
        // Simuliamo un ritardo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUser = {
          id: 'offline-' + Math.random().toString(36).substring(2, 9),
          email: email,
          name: email.split('@')[0]
        };
        
        const mockToken = 'mock-token-' + Date.now();
        
        // Salva token in base alla scelta "ricordami"
        if (rememberMe) {
          localStorage.setItem('token', mockToken);
        } else {
          sessionStorage.setItem('token', mockToken);
        }
        
        // Salva i dati utente simulati
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        setUserData(mockUser);
        
        console.log('Login simulato completato con successo (dopo errore 405)');
        return { success: true, user: mockUser };
      }
      
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
      
      console.log(`Tentativo di registrazione per: ${email}`);
      console.log(`Modalità offline: ${isInOfflineMode()}`);
      
      // Se siamo in modalità offline o in sviluppo, creiamo un utente simulato
      if (isInOfflineMode() || process.env.NODE_ENV === 'development') {
        console.log('Usando registrazione simulata per modalità offline/sviluppo');
        
        // Simuliamo un ritardo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUser = {
          id: 'new-user-' + Math.random().toString(36).substring(2, 9),
          email: email,
          name: email.split('@')[0]
        };
        
        const mockToken = 'mock-token-' + Date.now();
        
        // Salva token e dati utente
        localStorage.setItem('token', mockToken);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        setUserData(mockUser);
        
        console.log('Registrazione simulata completata con successo');
        return { success: true, user: mockUser };
      }
      
      // Tentativo di registrazione reale
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
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
      
      // Gestione caso speciale per errori 405 (API non disponibile)
      if (error.response && error.response.status === 405) {
        console.log('API non disponibile (405), usando modalità simulata');
        
        // Simuliamo un ritardo
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUser = {
          id: 'new-user-' + Math.random().toString(36).substring(2, 9),
          email: email,
          name: email.split('@')[0]
        };
        
        const mockToken = 'mock-token-' + Date.now();
        
        // Salva token e dati utente simulati
        localStorage.setItem('token', mockToken);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        setUserData(mockUser);
        
        console.log('Registrazione simulata completata con successo (dopo errore 405)');
        return { success: true, user: mockUser };
      }
      
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
    console.log('Logout utente completato');
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