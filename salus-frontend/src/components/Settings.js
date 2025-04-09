import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Settings.css';
import LanguageSelector from './LanguageSelector';

const Settings = () => {
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Carica le impostazioni salvate
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Applica il tema scuro se necessario
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }, []);

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
      <h2>{t('settings', 'Impostazioni')}</h2>
      
      <div className="settings-section">
        <h3>{t('language', 'Lingua')}</h3>
        <p className="settings-description">
          {t('languageDescription', 'Seleziona la lingua dell\'applicazione')}
        </p>
        <div className="language-options">
          <LanguageSelector />
        </div>
      </div>

      <div className="settings-section">
        <h3>{t('darkMode', 'Modalità scura')}</h3>
        <p className="settings-description">
          {t('darkModeDescription', 'Attiva la modalità scura per ridurre l\'affaticamento degli occhi')}
        </p>
        <label className="switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleDarkModeToggle}
          />
          <span className="slider round"></span>
        </label>
      </div>
      
      <div className="settings-section">
        <h3>{t('dataExport', 'Esportazione dati')}</h3>
        <p className="settings-description">
          {t('dataExportDescription', 'Esporta i tuoi dati in formato CSV o PDF')}
        </p>
        <button className="export-button">
          {t('exportCSV', 'Esporta in CSV')}
        </button>
      </div>
    </div>
  );
};

export default Settings; 