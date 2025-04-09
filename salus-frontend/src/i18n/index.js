import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importa i file di traduzione
import en from './locales/en.json';
import it from './locales/it.json';
import hi from './locales/hi.json';

// Debug flag per individuare problemi con i18n (solo in sviluppo)
const DEBUG_I18N = process.env.NODE_ENV === 'development';

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
}

// Ottieni la lingua salvata dall'utente o usa italiano come predefinito
const getSavedLanguage = () => {
  // Priorità: userLanguage (nostra chiave) -> i18nextLng (chiave di i18next) -> it (default)
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userLanguage') || 
           localStorage.getItem('i18nextLng') || 
           'it';
  }
  return 'it';
};

// Aggiungi traduzioni mancanti per i messaggi di errore
const addErrorMessages = (translations) => {
  return {
    ...translations,
    // Messaggi di errore per la validazione del form
    errorEmailRequired: translations.emailRequired || 'Email richiesta',
    errorEmailInvalid: translations.invalidEmail || 'Email non valida',
    errorPasswordRequired: translations.passwordRequired || 'Password richiesta',
    errorPasswordLength: translations.passwordTooShort || 'La password deve avere almeno 6 caratteri',
    errorPasswordMatch: translations.passwordsDoNotMatch || 'Le password non corrispondono',
    errorGeneric: translations.genericError || 'Si è verificato un errore. Riprova.',
    
    // Funzionalità in sviluppo
    featureInDevelopment: translations.featureInDevelopment || 'Questa funzionalità è in fase di sviluppo'
  };
};

// Inizializza i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: addErrorMessages(en)
      },
      it: {
        translation: addErrorMessages(it)
      },
      hi: {
        translation: addErrorMessages(hi)
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
    }
  });

// Assicurati che la lingua sia sincronizzata tra i18n e localStorage
i18n.on('languageChanged', (lng) => {
  if (DEBUG_I18N) {
    console.log(`Lingua cambiata a: ${lng}`);
  }
  
  // Aggiorna localStorage
  localStorage.setItem('userLanguage', lng);
  localStorage.setItem('i18nextLng', lng);
  
  // Aggiorna l'attributo lang dell'HTML
  document.documentElement.setAttribute('lang', lng);
});

// API per cambiare la lingua e sincronizzare tutto
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('userLanguage', lng);
  localStorage.setItem('i18nextLng', lng);
  return lng;
};

export default i18n;
