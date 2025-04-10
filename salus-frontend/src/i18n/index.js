import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { memoize } from 'lodash';

// Importa i file di traduzione
import en from './locales/en.json';
import it from './locales/it.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import de from './locales/de.json';

// Debug flag per individuare problemi con i18n (solo in sviluppo)
const DEBUG_I18N = process.env.NODE_ENV === 'development';

// Cache per le chiavi di traduzione mancanti
const missingKeys = new Set();

// Verifica che le traduzioni siano caricate correttamente in modalità sviluppo
if (DEBUG_I18N) {
  console.log('Verifica traduzioni:');
  console.log('- Italiano:', Object.keys(it).length, 'chiavi');
  console.log('  Dashboard:', it.dashboard);
  console.log('  Sintomi:', it.symptoms);
  console.log('  Farmaci:', it.medications);
  console.log('  Benessere:', it.wellness);
  
  console.log('- Inglese:', Object.keys(en).length, 'chiavi');
  console.log('  Dashboard:', en.dashboard);
  console.log('  Symptoms:', en.symptoms);
  console.log('  Medications:', en.medications);
  console.log('  Wellness:', en.wellness);
  
  console.log('- Hindi:', Object.keys(hi).length, 'chiavi');
  
  console.log('- Spagnolo:', Object.keys(es).length, 'chiavi');
  
  console.log('- Tedesco:', Object.keys(de).length, 'chiavi');
}

// Ottieni la lingua salvata dall'utente o usa italiano come predefinito
const getSavedLanguage = () => {
  // Priorità: userLanguage (nostra chiave) -> preferredLanguage -> i18nextLng (chiave di i18next) -> it (default)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userLanguage') || 
           localStorage.getItem('preferredLanguage') ||
           localStorage.getItem('i18nextLng') || 
           'it';
  }
  return 'it';
};

// Controllo coerenza delle traduzioni - verifica che tutte le chiavi presenti in una lingua
// siano disponibili anche nelle altre lingue
const validateTranslationCompleteness = () => {
  if (!DEBUG_I18N) return;
  
  const allKeys = new Set([
    ...Object.keys(it),
    ...Object.keys(en),
    ...Object.keys(hi),
    ...Object.keys(es),
    ...Object.keys(de)
  ]);
  
  const missingInIt = [...allKeys].filter(key => !it[key]);
  const missingInEn = [...allKeys].filter(key => !en[key]);
  const missingInHi = [...allKeys].filter(key => !hi[key]);
  const missingInEs = [...allKeys].filter(key => !es[key]);
  const missingInDe = [...allKeys].filter(key => !de[key]);
  
  if (missingInIt.length > 0) {
    console.warn('🔴 Chiavi mancanti in ITALIANO:', missingInIt);
  }
  
  if (missingInEn.length > 0) {
    console.warn('🔴 Chiavi mancanti in INGLESE:', missingInEn);
  }
  
  if (missingInHi.length > 0) {
    console.warn('🔴 Chiavi mancanti in HINDI:', missingInHi);
  }
  
  if (missingInEs.length > 0) {
    console.warn('🔴 Chiavi mancanti in SPAGNOLO:', missingInEs);
  }
  
  if (missingInDe.length > 0) {
    console.warn('🔴 Chiavi mancanti in TEDESCO:', missingInDe);
  }
};

// Esegui validazione durante lo sviluppo
validateTranslationCompleteness();

// Fallback traduzione - implementiamo una funzione che gestisce traduzioni mancanti
const handleMissingKey = (lng, ns, key) => {
  if (DEBUG_I18N && !missingKeys.has(key)) {
    console.warn(`🔍 Chiave di traduzione mancante: "${key}" per lingua "${lng}"`);
    missingKeys.add(key);
  }
  
  // Fallback alla traduzione italiana se disponibile
  if (lng !== 'it' && it[key]) {
    return it[key];
  }
  
  // Fallback a una versione "sensata" della chiave
  return key.split('.').pop()
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

// Aggiungi traduzioni mancanti e fallback per messaggi di errore
const enhanceTranslations = (translations) => {
  return {
    ...translations,
    // UI comune
    appName: translations.appName || 'Salus',
    loading: translations.loading || 'Caricamento...',
    save: translations.save || 'Salva',
    cancel: translations.cancel || 'Annulla',
    delete: translations.delete || 'Elimina',
    edit: translations.edit || 'Modifica',
    confirm: translations.confirm || 'Conferma',
    close: translations.close || 'Chiudi',
    search: translations.search || 'Cerca',
    
    // Messaggi di errore per la validazione del form
    errorEmailRequired: translations.emailRequired || 'Email richiesta',
    errorEmailInvalid: translations.invalidEmail || 'Email non valida',
    errorPasswordRequired: translations.passwordRequired || 'Password richiesta',
    errorPasswordLength: translations.passwordTooShort || 'La password deve avere almeno 6 caratteri',
    errorPasswordMatch: translations.passwordsDoNotMatch || 'Le password non corrispondono',
    errorGeneric: translations.genericError || 'Si è verificato un errore. Riprova.',
    
    // Notifiche e messaggi
    successNotification: translations.successNotification || 'Operazione completata con successo',
    errorNotification: translations.errorNotification || 'Si è verificato un errore',
    warningNotification: translations.warningNotification || 'Attenzione',
    infoNotification: translations.infoNotification || 'Informazione',
    
    // Funzionalità in sviluppo
    featureInDevelopment: translations.featureInDevelopment || 'Questa funzionalità è in fase di sviluppo'
  };
};

// Crea una versione memoizzata della funzione di traduzione
export const createTranslator = memoize(
  (language) => (key, fallback) => {
    // Verifica che la chiave e la lingua siano definite
    if (!key) return '';
    if (!language) return fallback || key;
    
    // Ottieni la traduzione dal sistema i18n
    const translated = i18n.t(key, { lng: language });
    
    // Se la traduzione è uguale alla chiave, potrebbe essere mancante
    if (translated === key) {
      if (fallback) return fallback;
      return handleMissingKey(language, 'translation', key);
    }
    
    return translated;
  },
  (language) => language // Funzione di risoluzione della cache
);

// Inizializza i18next
i18n
  .use(Backend) // Aggiungiamo il supporto per caricare traduzioni da backend (opzionale)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enhanceTranslations(en)
      },
      it: {
        translation: enhanceTranslations(it)
      },
      hi: {
        translation: enhanceTranslations(hi)
      },
      es: {
        translation: enhanceTranslations(es)
      },
      de: {
        translation: enhanceTranslations(de)
      }
    },
    lng: getSavedLanguage(), // Usa la lingua salvata dall'utente
    fallbackLng: 'it', // Lingua di fallback
    debug: DEBUG_I18N,
    
    interpolation: {
      escapeValue: false // Non è necessario per React
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'userLanguage',
      caches: ['localStorage']
    },
    
    // Gestione traduzioni mancanti
    saveMissing: DEBUG_I18N,
    missingKeyHandler: (lng, ns, key) => {
      handleMissingKey(lng, ns, key);
    }
  });

// Assicurati che la lingua sia sincronizzata tra i18n e localStorage
i18n.on('languageChanged', (lng) => {
  if (DEBUG_I18N) {
    console.log(`Lingua cambiata a: ${lng}`);
  }
  
  // Aggiorna localStorage con tutte le chiavi che usiamo per la lingua
  localStorage.setItem('userLanguage', lng);
  localStorage.setItem('preferredLanguage', lng);
  localStorage.setItem('i18nextLng', lng);
  
  // Aggiorna l'attributo lang dell'HTML
  document.documentElement.setAttribute('lang', lng);
  
  // Forza l'aggiornamento dei componenti React che usano le traduzioni
  document.dispatchEvent(new CustomEvent('i18nextLanguageChanged', { detail: lng }));
});

// API per cambiare la lingua e sincronizzare tutto
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('userLanguage', lng);
  localStorage.setItem('preferredLanguage', lng);
  localStorage.setItem('i18nextLng', lng);
  return lng;
};

// Ottieni la lingua corrente
export const getCurrentLanguage = () => {
  return i18n.language || getSavedLanguage();
};

// Ottieni un translator per una lingua specifica
export const getTranslator = (language) => {
  return createTranslator(language || getCurrentLanguage());
};

// Utility per ottenere una traduzione con fallback
export const getTranslation = (key, fallback) => {
  const translator = getTranslator(getCurrentLanguage());
  return translator(key, fallback);
};

export default i18n;
