import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Settings.css';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('it');

  useEffect(() => {
    // Carica le impostazioni salvate
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('language') || 'it';
    
    setDarkMode(savedDarkMode);
    setSelectedLanguage(savedLanguage);
    
    // Applica il tema scuro se necessario
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  const handleLanguageChange = async (language) => {
    try {
      // Salva la lingua nel localStorage
      localStorage.setItem('language', language);
      
      // Aggiorna lo stato locale
      setSelectedLanguage(language);
      
      // Cambia la lingua nell'app
      await i18n.changeLanguage(language);
      
      // Aggiorna la lingua nel backend
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/users/language', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ language })
        });
      }
    } catch (error) {
      console.error('Errore durante il cambio lingua:', error);
      alert('Errore durante il cambio lingua. Riprova più tardi.');
    }
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <div className="settings-container">
      <h2>{t('settings')}</h2>
      
      <div className="settings-section">
        <h3>{t('language')}</h3>
        <div className="language-options">
          <button 
            className={`language-btn ${selectedLanguage === 'it' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('it')}
          >
            Italiano
          </button>
          <button 
            className={`language-btn ${selectedLanguage === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            English
          </button>
          <button 
            className={`language-btn ${selectedLanguage === 'es' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('es')}
          >
            Español
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>{t('darkMode')}</h3>
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleDarkModeToggle}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
};

export default Settings; 