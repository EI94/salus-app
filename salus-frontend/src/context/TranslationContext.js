import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslator, getCurrentLanguage } from '../i18n';

// Crea il contesto
const TranslationContext = createContext({
  t: (key, fallback) => fallback || key,
  currentLanguage: 'it',
  changeLanguage: () => {},
  isReady: false
});

// Provider per il contesto di traduzione
export const TranslationProvider = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isReady, setIsReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  
  // Crea un traduttore ottimizzato che utilizza memoization per migliorare le performance
  const translator = useMemo(() => {
    // Wrapper per la funzione di traduzione che aggiunge fallback e gestione degli errori
    return (key, fallback) => {
      if (!key) return '';
      
      try {
        const translation = t(key, { lng: currentLanguage });
        
        // Se la traduzione è la stessa della chiave, potrebbe essere mancante
        if (translation === key) {
          // Se c'è un fallback, usalo
          if (fallback) return fallback;
          
          // Formatta la chiave come testo leggibile se non c'è traduzione
          return key.split('.').pop()
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        }
        
        return translation;
      } catch (error) {
        console.error(`Errore nella traduzione per chiave: ${key}`, error);
        return fallback || key;
      }
    };
  }, [t, currentLanguage]);
  
  // Effetto per gestire i cambiamenti di lingua
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18n.language || 'it');
    };
    
    // Imposta lo stato iniziale
    setIsReady(true);
    
    // Registra un listener per i cambiamenti di lingua
    i18n.on('languageChanged', handleLanguageChange);
    
    // Registra un listener per l'evento custom che abbiamo definito
    document.addEventListener('i18nextLanguageChanged', handleLanguageChange);
    
    // Pulisci i listener quando il componente viene smontato
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      document.removeEventListener('i18nextLanguageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  // Funzione per cambiare la lingua
  const changeLanguage = async (lang) => {
    await i18n.changeLanguage(lang);
    setCurrentLanguage(lang);
  };
  
  // Valore del contesto
  const contextValue = {
    t: translator,
    currentLanguage,
    changeLanguage,
    isReady
  };
  
  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook personalizzato per utilizzare il contesto di traduzione
export const useAppTranslation = () => {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useAppTranslation deve essere utilizzato all\'interno di un TranslationProvider');
  }
  
  return context;
};

// Componente HOC (Higher Order Component) per avvolgere altri componenti con traduzioni
export const withTranslation = (Component) => {
  const WithTranslation = (props) => {
    const { t, currentLanguage, changeLanguage, isReady } = useAppTranslation();
    
    // Se le traduzioni non sono ancora pronte, mostra un loader o null
    if (!isReady) return null;
    
    // Passa le funzioni di traduzione come props al componente avvolto
    return (
      <Component
        {...props}
        t={t}
        currentLanguage={currentLanguage}
        changeLanguage={changeLanguage}
      />
    );
  };
  
  // Assegna un nome display per il debugging
  WithTranslation.displayName = `WithTranslation(${Component.displayName || Component.name || 'Component'})`;
  
  return WithTranslation;
};

export default TranslationContext; 