import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importa le traduzioni
import itTranslations from './locales/it.json';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';

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

// Configurazione i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      it: {
        translation: addErrorMessages(itTranslations)
      },
      en: {
        translation: addErrorMessages(enTranslations)
      },
      hi: {
        translation: addErrorMessages(hiTranslations)
      }
    },
    fallbackLng: 'it',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // non necessario per React
    }
  });

// Funzione esportata per cambiare lingua
export const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('preferredLanguage', lng);
  
  // Salviamo la lingua anche nell'utente corrente se esiste
  try {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      user.language = lng;
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Aggiorniamo anche nell'elenco degli utenti registrati
      const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return { ...u, language: lng };
        }
        return u;
      });
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    }
  } catch (error) {
    console.error('Errore nel salvataggio della lingua:', error);
  }
};

export default i18n;
