import React, { useContext, useEffect, useState } from 'react';
import { getTranslation, getCurrentLanguage } from '../i18n';
import TranslationContext from '../context/TranslationContext';

// Cache condivisa per le traduzioni
let translationCache = {};

/**
 * Traduce automaticamente un testo usando il sistema i18n con fallback
 * @param {string} key - Chiave di traduzione o testo da tradurre
 * @param {string} fallback - Testo di fallback
 * @returns {string} Testo tradotto
 */
export const translate = (key, fallback = '') => {
  // Non usare useContext in funzioni normali (non-hook)
  if (!key) return fallback || '';
  
  // Usa getTranslation come fallback sicuro
  return getTranslation(key, fallback);
};

/**
 * Componente che renderizza un testo tradotto
 * @param {Object} props - Proprietà React
 * @param {string} props.i18nKey - Chiave di traduzione (opzionale)
 * @param {string} props.fallback - Testo di fallback o testo diretto da tradurre
 * @param {string} props.component - Componente da utilizzare (default: span)
 * @param {Object} props.componentProps - Proprietà da passare al componente
 * @param {boolean} props.direct - Forza la traduzione diretta del testo
 * @returns {React.ReactElement} Elemento React con testo tradotto
 */
export const Trans = ({ 
  i18nKey, 
  fallback = '', 
  component = 'span', 
  componentProps = {},
  direct = false,
  children,
  ...rest 
}) => {
  const [translation, setTranslation] = useState(null);
  const context = useContext(TranslationContext);
  const textToTranslate = children || fallback;
  
  // Usa un effetto per aggiornare la traduzione quando cambia la lingua
  useEffect(() => {
    let result = '';
    
    if (i18nKey && !direct) {
      // Se c'è una chiave di traduzione e non è forzata la traduzione diretta
      result = context?.t?.(i18nKey, textToTranslate) || getTranslation(i18nKey, textToTranslate);
    } else if (context?.autoTranslate && typeof textToTranslate === 'string') {
      // Altrimenti prova a tradurre direttamente il testo
      result = context.autoTranslate(textToTranslate) || textToTranslate;
    } else {
      // Fallback
      result = textToTranslate;
    }
    
    setTranslation(result);
    
    // Aggiorna la traduzione quando cambia la lingua
    const handleLanguageChange = () => {
      if (i18nKey && !direct) {
        setTranslation(context?.t?.(i18nKey, textToTranslate) || getTranslation(i18nKey, textToTranslate));
      } else if (context?.autoTranslate && typeof textToTranslate === 'string') {
        setTranslation(context.autoTranslate(textToTranslate) || textToTranslate);
      }
    };
    
    document.addEventListener('translationChanged', handleLanguageChange);
    return () => {
      document.removeEventListener('translationChanged', handleLanguageChange);
    };
  }, [i18nKey, textToTranslate, context, direct]);
  
  const Component = component;
  return <Component {...componentProps} {...rest}>{translation || textToTranslate}</Component>;
};

/**
 * HOC (Higher Order Component) che aggiunge automaticamente traduzioni a un componente
 * @param {React.Component} Component - Componente da avvolgere
 * @param {Object} translations - Mappa delle chiavi di traduzione
 * @returns {React.Component} Componente avvolto con traduzioni
 */
export const withAutoTranslations = (Component, translations = {}) => {
  // Questa è una funzione di componente, quindi può usare useContext
  return (props) => {
    const translatedProps = { ...props };
    const context = useContext(TranslationContext);
    
    // Traduci tutte le props che sono nel dizionario delle traduzioni
    Object.entries(translations).forEach(([propName, translationKey]) => {
      if (props[propName]) {
        if (translationKey && typeof translationKey === 'string') {
          // Se è specificata una chiave di traduzione, usala
          translatedProps[propName] = context?.t?.(translationKey, props[propName]) || 
                                      getTranslation(translationKey, props[propName]);
        } else if (context?.autoTranslate && typeof props[propName] === 'string') {
          // Altrimenti prova a tradurre direttamente
          translatedProps[propName] = context.autoTranslate(props[propName]) || props[propName];
        }
      }
    });
    
    return <Component {...translatedProps} />;
  };
};

/**
 * Hook per ottenere il contesto di traduzione in funzioni non-hook
 * @returns {Object} Il contesto di traduzione o null
 */
const getTranslationContext = () => {
  // Questa è una soluzione imperfetta, ma evita l'errore del linter
  // In un ambiente reale, userebbe Context API in modo più appropriato
  try {
    return translationCache.context || null;
  } catch (error) {
    return null;
  }
};

/**
 * Funzione wrapper che aggiorna il contesto nella cache
 * Usata internamente dai componenti hook-based
 */
export const setTranslationContextCache = (context) => {
  translationCache.context = context;
};

/**
 * Traduce un oggetto di stringhe usando le chiavi come chiavi di traduzione
 * @param {Object} obj - Oggetto con stringhe da tradurre
 * @returns {Object} Oggetto con stringhe tradotte
 */
export const translateObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Usa la cache invece di useContext direttamente
  const context = getTranslationContext();
  const result = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Prima prova con la chiave esplicita
      result[key] = context?.t?.(key, value) || getTranslation(key, value);
      
      // Se è uguale al valore originale, prova la traduzione automatica
      if (result[key] === value && context?.autoTranslate) {
        result[key] = context.autoTranslate(value) || value;
      }
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => {
        if (typeof item === 'string') {
          const translated = context?.t?.(`${key}.${item}`, item) || getTranslation(`${key}.${item}`, item);
          
          // Se è uguale al valore originale, prova la traduzione automatica
          if (translated === item && context?.autoTranslate) {
            return context.autoTranslate(item) || item;
          }
          
          return translated;
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null) {
      result[key] = translateObject(value);
    } else {
      result[key] = value;
    }
  });
  
  return result;
};

/**
 * Componente che renderizza un testo pluralizzato tradotto
 * @param {Object} props - Proprietà React
 * @param {string} props.i18nKey - Chiave di traduzione base
 * @param {number} props.count - Numero per la pluralizzazione
 * @param {Object} props.options - Opzioni per i18next
 * @returns {React.ReactElement} Elemento React con testo tradotto e pluralizzato
 */
export const TransPlural = ({ i18nKey, count, options = {}, ...rest }) => {
  const context = useContext(TranslationContext);
  
  // Aggiorna la cache del contesto
  if (context) {
    setTranslationContextCache(context);
  }
  
  const lang = context?.currentLanguage || getCurrentLanguage();
  const pluralOptions = { ...options, count };
  
  let translated;
  try {
    // Usa il contesto se disponibile
    if (context?.t) {
      translated = context.t(i18nKey, null, pluralOptions);
    } else {
      // Fallback a getTranslation
      translated = getTranslation(i18nKey, null, pluralOptions);
    }
    
    // Fallback per lingue con pluralizzazione diversa
    if (translated === i18nKey && lang !== 'it') {
      // Prova con la lingua italiana come fallback
      translated = getTranslation(i18nKey, null, { ...pluralOptions, lng: 'it' });
    }
  } catch (error) {
    console.error(`Errore nella pluralizzazione per chiave: ${i18nKey}`, error);
    translated = i18nKey;
  }
  
  return <Trans i18nKey="" fallback={translated} {...rest} />;
};

/**
 * Hook per tradurre un testo statico
 * @param {string} key - Chiave di traduzione
 * @param {string} fallback - Testo di fallback
 * @returns {string} Testo tradotto
 */
export const useStaticTranslation = (key, fallback = '') => {
  const context = useContext(TranslationContext);
  
  // Aggiorna la cache del contesto per funzioni non-hook
  if (context) {
    setTranslationContextCache(context);
  }
  
  return context?.t?.(key, fallback) || translate(key, fallback);
};

/**
 * Hook per tradurre automaticamente un testo senza chiave
 * @param {string} text - Testo da tradurre
 * @returns {string} Testo tradotto
 */
export const useAutoTranslation = (text) => {
  const [translation, setTranslation] = useState(text);
  const context = useContext(TranslationContext);
  
  // Aggiorna la cache del contesto per funzioni non-hook
  if (context) {
    setTranslationContextCache(context);
  }
  
  useEffect(() => {
    if (context?.autoTranslate && typeof text === 'string') {
      setTranslation(context.autoTranslate(text) || text);
    }
    
    // Aggiorna la traduzione quando cambia la lingua
    const handleLanguageChange = () => {
      if (context?.autoTranslate && typeof text === 'string') {
        setTranslation(context.autoTranslate(text) || text);
      }
    };
    
    document.addEventListener('translationChanged', handleLanguageChange);
    return () => {
      document.removeEventListener('translationChanged', handleLanguageChange);
    };
  }, [text, context]);
  
  return translation;
};

// Esporta una funzione per sostituire tutte le stringhe in un componente
// tramite un "proxy" che intercetta il rendering e traduce automaticamente
export const createAutoTranslatingComponent = (Component) => {
  return (props) => {
    const context = useContext(TranslationContext);
    
    // Aggiorna la cache del contesto per funzioni non-hook
    if (context) {
      setTranslationContextCache(context);
    }
    
    // Funzione ricorsiva per tradurre tutti i testi nei children
    const translateChildren = (children) => {
      // Se non c'è contesto o autoTranslate, restituisci i children originali
      if (!context?.autoTranslate) return children;
      
      // Se è una stringa, traducila
      if (typeof children === 'string') {
        return context.autoTranslate(children);
      }
      
      // Se è un array, traduci ogni elemento
      if (Array.isArray(children)) {
        return children.map(child => translateChildren(child));
      }
      
      // Se è un elemento React, traduci i suoi children
      if (React.isValidElement(children)) {
        // Clona l'elemento con children tradotti
        return React.cloneElement(children, {
          ...children.props,
          children: translateChildren(children.props.children)
        });
      }
      
      // Altrimenti restituisci i children originali
      return children;
    };
    
    return <Component {...props}>{translateChildren(props.children)}</Component>;
  };
};

/**
 * Lista di etichette comuni già tradotte
 */
export const CommonLabels = {
  save: translate('save', 'Salva'),
  cancel: translate('cancel', 'Annulla'),
  delete: translate('delete', 'Elimina'),
  edit: translate('edit', 'Modifica'),
  confirm: translate('confirm', 'Conferma'),
  close: translate('close', 'Chiudi'),
  search: translate('search', 'Cerca'),
  loading: translate('loading', 'Caricamento...'),
  error: translate('error', 'Errore'),
  success: translate('success', 'Successo'),
  warning: translate('warning', 'Attenzione'),
  info: translate('info', 'Informazione'),
  yes: translate('yes', 'Sì'),
  no: translate('no', 'No'),
  ok: translate('ok', 'OK'),
  apply: translate('apply', 'Applica'),
  reset: translate('reset', 'Reimposta'),
  next: translate('next', 'Avanti'),
  previous: translate('previous', 'Indietro'),
  back: translate('back', 'Indietro'),
  continue: translate('continue', 'Continua'),
  submit: translate('submit', 'Invia'),
  logout: translate('logout', 'Esci'),
  login: translate('login', 'Accedi'),
  register: translate('register', 'Registrati'),
  username: translate('username', 'Nome utente'),
  password: translate('password', 'Password'),
  email: translate('email', 'Email'),
  phone: translate('phone', 'Telefono'),
  address: translate('address', 'Indirizzo'),
  city: translate('city', 'Città'),
  country: translate('country', 'Paese'),
  zipCode: translate('zipCode', 'CAP'),
  notifications: translate('notifications', 'Notifiche'),
  settings: translate('settings', 'Impostazioni'),
  profile: translate('profile', 'Profilo'),
  help: translate('help', 'Aiuto'),
  about: translate('about', 'Informazioni'),
  contact: translate('contact', 'Contatti'),
  support: translate('support', 'Supporto'),
  terms: translate('terms', 'Termini e condizioni'),
  privacy: translate('privacy', 'Privacy'),
  dashboard: translate('dashboard', 'Dashboard'),
  symptoms: translate('symptoms', 'Sintomi'),
  medications: translate('medications', 'Farmaci'),
  wellness: translate('wellness', 'Benessere'),
  aiAssistant: translate('aiAssistant', 'Assistente IA'),
}; 