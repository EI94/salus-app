import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslator, getCurrentLanguage } from '../i18n';

// Crea il contesto
const TranslationContext = createContext({
  t: (key, fallback) => fallback || key,
  currentLanguage: 'it',
  changeLanguage: () => {},
  isReady: false,
  autoTranslate: (text) => text // Aggiungiamo la funzione di traduzione automatica
});

// Lista di stringhe comuni che devono essere tradotte direttamente
const COMMON_STRINGS = [
  'Salus', 'Salus Health', 'Dashboard', 'Sintomi', 'Farmaci', 'Benessere', 'Profilo', 'Impostazioni',
  'Umore', 'Sonno', 'Meteo', 'Attività', 'Promemoria', 'Appuntamenti', 'Assistente',
  'Il mio giorno', 'Azioni rapide', 'Oggi', 'Aggiungi', 'Modifica', 'Elimina', 'Salva', 'Annulla',
  'Conferma', 'Chiudi', 'Indietro', 'Avanti', 'Fine', 'Inizia', 'Continua', 'Salta', 'Esci',
  'Non registrato', 'Caricamento', 'Errore', 'Successo', 'Attenzione', 'Informazione',
  'Soleggiato', 'Nuvoloso', 'Pioggia leggera', 'Sereno',
  'Utente', 'Paziente', 'Dottore', 'Medico',
  'Consigli di salute', 'Consiglio del giorno', 'Statistiche', 'Grafici', 'Analytics'
];

// Mappa per stringhe comuni già tradotte (cache)
const translatedStringsCache = {};

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
  
  // Funzione per traduzione automatica di testo senza chiave
  const autoTranslate = useMemo(() => {
    return (text) => {
      if (!text || typeof text !== 'string') return text;
      
      // Se la traduzione è già in cache, usala
      if (translatedStringsCache[text]) {
        return translatedStringsCache[text][currentLanguage] || text;
      }
      
      // Se è una stringa comune, prova a ricavare una chiave e tradurla
      if (COMMON_STRINGS.includes(text)) {
        const possibleKey = text
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '.');
        
        // Prova diverse possibili chiavi
        const tryKeys = [
          possibleKey,
          `common.${possibleKey}`,
          `ui.${possibleKey}`,
          text // prova la stringa stessa come chiave
        ];
        
        for (const key of tryKeys) {
          const translated = t(key, { lng: currentLanguage });
          if (translated && translated !== key) {
            // Salva in cache
            if (!translatedStringsCache[text]) {
              translatedStringsCache[text] = {};
            }
            translatedStringsCache[text][currentLanguage] = translated;
            return translated;
          }
        }
      }
      
      // Se non è possibile tradurre, restituisci il testo originale
      return text;
    };
  }, [t, currentLanguage]);
  
  // Effetto per gestire i cambiamenti di lingua
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = i18n.language || 'it';
      setCurrentLanguage(newLang);
      
      // Forza l'aggiornamento di tutti i componenti che usano traduzioni
      document.documentElement.setAttribute('lang', newLang);
      document.dispatchEvent(new CustomEvent('translationChanged', { detail: newLang }));
      
      // Ricarica la cache delle traduzioni
      Object.keys(translatedStringsCache).forEach(key => {
        // Mantieni solo la lingua corrente e quella di default nella cache
        const newCache = {};
        newCache[newLang] = translatedStringsCache[key][newLang];
        if (newLang !== 'it') {
          newCache['it'] = translatedStringsCache[key]['it'];
        }
        translatedStringsCache[key] = newCache;
      });
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
    // Forza l'aggiornamento degli elementi statici
    document.dispatchEvent(new CustomEvent('translationChanged', { detail: lang }));
  };
  
  // Valore del contesto
  const contextValue = {
    t: translator,
    currentLanguage,
    changeLanguage,
    isReady,
    autoTranslate
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
    const { t, currentLanguage, changeLanguage, isReady, autoTranslate } = useAppTranslation();
    
    // Se le traduzioni non sono ancora pronte, mostra un loader o null
    if (!isReady) return null;
    
    // Passa le funzioni di traduzione come props al componente avvolto
    return (
      <Component
        {...props}
        t={t}
        currentLanguage={currentLanguage}
        changeLanguage={changeLanguage}
        autoTranslate={autoTranslate}
      />
    );
  };
  
  // Assegna un nome display per il debugging
  WithTranslation.displayName = `WithTranslation(${Component.displayName || Component.name || 'Component'})`;
  
  return WithTranslation;
};

export default TranslationContext; 