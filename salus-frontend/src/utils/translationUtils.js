import React from 'react';
import { getTranslation, getCurrentLanguage } from '../i18n';

/**
 * Traduce automaticamente un testo usando il sistema i18n con fallback
 * @param {string} key - Chiave di traduzione
 * @param {string} fallback - Testo di fallback
 * @returns {string} Testo tradotto
 */
export const translate = (key, fallback = '') => {
  if (!key) return fallback || '';
  return getTranslation(key, fallback);
};

/**
 * Componente che renderizza un testo tradotto
 * @param {Object} props - Proprietà React
 * @param {string} props.i18nKey - Chiave di traduzione
 * @param {string} props.fallback - Testo di fallback
 * @param {string} props.component - Componente da utilizzare (default: span)
 * @param {Object} props.componentProps - Proprietà da passare al componente
 * @returns {React.ReactElement} Elemento React con testo tradotto
 */
export const Trans = ({ 
  i18nKey, 
  fallback = '', 
  component = 'span', 
  componentProps = {}, 
  ...rest 
}) => {
  const translated = translate(i18nKey, fallback);
  const Component = component;
  
  return <Component {...componentProps} {...rest}>{translated}</Component>;
};

/**
 * HOC (Higher Order Component) che aggiunge automaticamente traduzioni a un componente
 * @param {React.Component} Component - Componente da avvolgere
 * @param {Object} translations - Mappa delle chiavi di traduzione
 * @returns {React.Component} Componente avvolto con traduzioni
 */
export const withAutoTranslations = (Component, translations = {}) => {
  return (props) => {
    const translatedProps = { ...props };
    
    // Traduci tutte le props che sono nel dizionario delle traduzioni
    Object.entries(translations).forEach(([propName, translationKey]) => {
      if (props[propName]) {
        translatedProps[propName] = translate(translationKey, props[propName]);
      }
    });
    
    return <Component {...translatedProps} />;
  };
};

/**
 * Traduce un oggetto di stringhe usando le chiavi come chiavi di traduzione
 * @param {Object} obj - Oggetto con stringhe da tradurre
 * @returns {Object} Oggetto con stringhe tradotte
 */
export const translateObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result[key] = translate(key, value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item => {
        if (typeof item === 'string') {
          return translate(`${key}.${item}`, item);
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
  const lang = getCurrentLanguage();
  const pluralOptions = { ...options, count };
  
  let translated;
  try {
    // Usa i18n direttamente per la pluralizzazione
    translated = getTranslation(i18nKey, null, pluralOptions);
    
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
  return translate(key, fallback);
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