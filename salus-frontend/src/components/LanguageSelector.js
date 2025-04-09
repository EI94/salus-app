import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import '../styles/LanguageSelector.css';

/**
 * Componente per selezionare e cambiare la lingua dell'app
 * Salva la lingua selezionata nel localStorage e nel contesto utente
 */
const LanguageSelector = ({ variant = 'default', className = '' }) => {
  const { i18n } = useTranslation();
  const { user, updateLanguage } = useContext(UserContext);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'it');

  // Carica la lingua salvata all'avvio del componente
  useEffect(() => {
    const savedLanguage = localStorage.getItem('userLanguage') || 'it';
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
      
      // Salva la lingua nel localStorage per persistenza
      localStorage.setItem('userLanguage', language);
      localStorage.setItem('i18nextLng', language);
      
      // Se l'utente è autenticato, aggiorna anche nel contesto utente
      if (user && updateLanguage) {
        await updateLanguage(language);
      }
      
      console.log(`Lingua impostata a: ${language}`);
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
          aria-label="Seleziona lingua"
        >
          <option value="it">Italiano</option>
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
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
        aria-label="Italiano"
        title="Italiano"
      >
        IT
      </button>
      <button
        className={selectedLanguage === 'en' ? 'active' : ''}
        onClick={() => handleLanguageChange('en')}
        aria-label="English"
        title="English"
      >
        EN
      </button>
      <button
        className={selectedLanguage === 'hi' ? 'active' : ''}
        onClick={() => handleLanguageChange('hi')}
        aria-label="Hindi"
        title="हिन्दी"
      >
        HI
      </button>
    </div>
  );
};

export default LanguageSelector; 