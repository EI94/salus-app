import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl, isInOfflineMode, toggleOfflineMode } from '../api';
import { useNavigate } from 'react-router-dom';

// Creazione del contesto utente
export const UserContext = createContext(null);

// Provider del contesto
export const UserProvider = ({ children }) => {
  // Stato per i dati dell'utente
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Lista di utenti autorizzati per test
  const authorizedUsers = [
    { email: "admin@salus.com", password: "password123" },
    { email: "test@example.com", password: "test1234" }
    // Puoi aggiungere altri utenti autorizzati per test
  ];

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
            setUser(JSON.parse(savedUser));
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
      
      // Forza la navigazione alla dashboard
      navigate('/dashboard', { replace: true });
      
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
    // Lista di utenti autorizzati per il login simulato
    const authorizedUsers = [
      { email: 'admin@salus.com', password: 'password123' },
      { email: 'test@example.com', password: 'test1234' }
    ];
    
    // Verifica credenziali
    const matchedUser = authorizedUsers.find(
      user => user.email === email && user.password === password
    );
    
    if (!matchedUser) {
      console.log('Login simulato: credenziali non valide');
      return { 
        success: false, 
        error: 'Email o password non valide' 
      };
    }
    
    // Crea un token fittizio per simulazione
    const token = 'simulated-jwt-token-' + Math.random().toString(36).substring(2, 15);
    
    // Crea dati utente di esempio
    const userData = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      email: email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'user'
    };
    
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
    
    // Forza il reindirizzamento alla dashboard
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 10);
    
    return { success: true };
  };
  
  // Funzione per la registrazione
  const register = async (email, password) => {
    try {
      if (isInOfflineMode()) {
        console.log("Usando registrazione simulata per modalità offline/sviluppo");
        // Aggiungi alla lista di utenti autorizzati
        authorizedUsers.push({ email, password });
        return await simulatedLogin(email, password);
      }
      
      // Tentativo di registrazione con il server reale
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        email,
        password
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
        
        // Aggiungi utente alla lista autorizzati e completa registrazione simulata
        authorizedUsers.push({ email, password });
        return await simulatedLogin(email, password);
      }
      
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
    localStorage.removeItem('currentUser');
    setUser(null);
    
    return { success: true };
  };
  
  // Verifica se l'utente è autenticato
  const isAuthenticated = () => {
    return !!user && (!!localStorage.getItem('token') || !!sessionStorage.getItem('token'));
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
        error
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider; 