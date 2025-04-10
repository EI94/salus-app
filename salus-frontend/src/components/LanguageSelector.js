import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import '../styles/LanguageSelector.css';

/**
 * Componente per selezionare e cambiare la lingua dell'app
 * Salva la lingua selezionata nel localStorage e nel contesto utente
 */
const LanguageSelector = ({ variant = 'default', className = '' }) => {
  const { i18n, t } = useTranslation();
  const { user, updateLanguage } = useContext(UserContext);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'it');

  // Carica la lingua salvata all'avvio del componente
  useEffect(() => {
    // Cerca in tutte le chiavi di storage che usiamo per la lingua
    const savedLanguage = 
      localStorage.getItem('userLanguage') || 
      localStorage.getItem('preferredLanguage') ||
      localStorage.getItem('i18nextLng') || 
      'it';
      
    if (savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
    setSelectedLanguage(savedLanguage);
  }, [i18n]);

  // Funzione per gestire il cambio lingua
  const handleLanguageChange = async (language) => {
    try {
      // Aggiorna lo stato locale
      setSelectedLanguage(language);
      
      // Cambia la lingua nell'app
      await i18n.changeLanguage(language);
      
      // Salva la lingua nel localStorage per persistenza usando tutte le chiavi che usiamo
      localStorage.setItem('userLanguage', language);
      localStorage.setItem('preferredLanguage', language);
      localStorage.setItem('i18nextLng', language);
      
      // Se l'utente è autenticato, aggiorna anche nel contesto utente
      if (user && updateLanguage) {
        await updateLanguage(language);
      }
      
      console.log(`Lingua impostata a: ${language}`);
      
      // Forza l'aggiornamento dei componenti React che usano le traduzioni
      document.dispatchEvent(new CustomEvent('i18nextLanguageChanged', { detail: language }));
    } catch (error) {
      console.error('Errore durante il cambio lingua:', error);
    }
  };

  // Renderizza il selettore come dropdown
  if (variant === 'dropdown') {
    return (
      <div className={`language-selector dropdown ${className}`}>
        <select
          value={selectedLanguage}
          onChange={(e) => handleLanguageChange(e.target.value)}
          aria-label={t('languageSelector', 'Seleziona lingua')}
        >
          <option value="it">{t('italian', 'Italiano')}</option>
          <option value="en">{t('english', 'English')}</option>
          <option value="es">{t('spanish', 'Español')}</option>
          <option value="hi">{t('hindi', 'हिन्दी (Hindi)')}</option>
        </select>
      </div>
    );
  }

  // Renderizza il selettore come pulsanti (default)
  return (
    <div className={`language-selector buttons ${className}`}>
      <button
        className={selectedLanguage === 'it' ? 'active' : ''}
        onClick={() => handleLanguageChange('it')}
        aria-label={t('italian', 'Italiano')}
        title={t('italian', 'Italiano')}
      >
        IT
      </button>
      <button
        className={selectedLanguage === 'en' ? 'active' : ''}
        onClick={() => handleLanguageChange('en')}
        aria-label={t('english', 'English')}
        title={t('english', 'English')}
      >
        EN
      </button>
      <button
        className={selectedLanguage === 'es' ? 'active' : ''}
        onClick={() => handleLanguageChange('es')}
        aria-label={t('spanish', 'Español')}
        title={t('spanish', 'Español')}
      >
        ES
      </button>
      <button
        className={selectedLanguage === 'hi' ? 'active' : ''}
        onClick={() => handleLanguageChange('hi')}
        aria-label={t('hindi', 'हिन्दी')}
        title={t('hindi', 'हिन्दी')}
      >
        HI
      </button>
    </div>
  );
};

export default LanguageSelector; 