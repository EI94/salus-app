import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importa i file di traduzione
import en from './locales/en.json';
import it from './locales/it.json';
import hi from './locales/hi.json';

// Debug flag per individuare problemi con i18n
const DEBUG_I18N = true;

// Verifica che le traduzioni siano caricate correttamente
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

// Forza la lingua italiana come default
const forcedLanguage = 'it';
if (typeof window !== 'undefined') {
  localStorage.setItem('userLanguage', forcedLanguage);
  localStorage.setItem('i18nextLng', forcedLanguage);
}

// Aggiungi traduzioni mancanti per l'autenticazione
const addErrorMessages = (translations) => {
  return {
    ...translations,
    // Messaggi di errore per la validazione del form
    errorEmailRequired: translations.emailRequired || 'Email required',
    errorEmailInvalid: translations.invalidEmail || 'Invalid email',
    errorPasswordRequired: translations.passwordRequired || 'Password required',
    errorPasswordLength: translations.passwordTooShort || 'Password must be at least 6 characters',
    errorPasswordMatch: translations.passwordsDoNotMatch || 'Passwords do not match',
    errorGeneric: 'An error occurred. Please try again.',
    
    // Funzionalità in sviluppo
    featureInDevelopment: 'This feature is currently in development'
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
    lng: forcedLanguage, // Forza la lingua italiana
    fallbackLng: 'it', // Lingua predefinita
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

// Forza l'uso dell'italiano dopo l'inizializzazione
i18n.changeLanguage(forcedLanguage).then(() => {
  if (DEBUG_I18N) {
    console.log(`Lingua impostata a: ${i18n.language}`);
    console.log(`Traduzione 'dashboard': ${i18n.t('dashboard')}`);
    console.log(`Traduzione 'symptoms': ${i18n.t('symptoms')}`);
    console.log(`Traduzione 'medications': ${i18n.t('medications')}`);
    console.log(`Traduzione 'wellness': ${i18n.t('wellness')}`);
  }
});

// Assicurati che la lingua sia aggiornata quando cambia
i18n.on('languageChanged', (lng) => {
  if (DEBUG_I18N) {
    console.log(`Lingua cambiata a: ${lng}`);
  }
  document.documentElement.setAttribute('lang', lng);
});

export default i18n;
