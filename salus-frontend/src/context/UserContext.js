import React, { createContext, useState, useEffect } from 'react';

// Creazione del contesto utente
export const UserContext = createContext(null);

// Provider del contesto
export const UserProvider = ({ children }) => {
  // Stato per i dati dell'utente
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Carica i dati utente dal localStorage al mount del componente
  useEffect(() => {
    const loadUserData = () => {
      try {
        // Controlla se esiste un token valido
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Controlla se ci sono dati utente salvati
        const storedUser = localStorage.getItem('currentUser');
        
        if (storedUser) {
          setUserData(JSON.parse(storedUser));
        }
        
        // Implementazione futura: verificare il token con il backend
        // e caricare dati utente aggiornati
        
      } catch (error) {
        console.error('Errore nel caricamento dei dati utente:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  // Funzione per aggiornare i dati utente
  const updateUserData = (newData) => {
    const updatedData = { ...userData, ...newData };
    setUserData(updatedData);
    
    // Salva i dati aggiornati nel localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedData));
  };
  
  // Funzione per il logout
  const logout = () => {
    // Rimuovi token e dati utente
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setUserData(null);
  };
  
  return (
    <UserContext.Provider 
      value={{ 
        userData, 
        setUserData, 
        updateUserData, 
        logout, 
        loading 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider; 