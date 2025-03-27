import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importa i file di traduzione
import translationIT from './locales/it.json';
import translationEN from './locales/en.json';
import translationHI from './locales/hi.json';

// Risorse di traduzione
const resources = {
  it: {
    translation: translationIT
  },
  en: {
    translation: translationEN
  },
  hi: {
    translation: translationHI
  }
};

i18n
  // Rileva automaticamente la lingua del browser
  .use(LanguageDetector)
  // Passa i18n all'istanza react-i18next
  .use(initReactI18next)
  // Inizializza i18next
  .init({
    resources,
    fallbackLng: 'it',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // non necessario per React
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'userLanguage',
      caches: ['localStorage'],
    },
  });

// Funzione per cambiare lingua
export const changeLanguage = (language) => {
  i18n.changeLanguage(language);
  localStorage.setItem('userLanguage', language);
  
  // Salviamo la lingua anche nell'utente corrente se esiste
  try {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      user.language = language;
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Aggiorniamo anche nell'elenco degli utenti registrati
      const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      const updatedUsers = users.map(u => {
        if (u.id === user.id) {
          return { ...u, language };
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