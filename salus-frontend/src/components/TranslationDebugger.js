import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Componente di diagnostica per verificare il funzionamento delle traduzioni
 * Questo componente può essere aggiunto a qualsiasi schermata per verificare
 * se le traduzioni funzionano correttamente.
 */
const TranslationDebugger = () => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(true);
  
  // Liste di chiavi da testare
  const menuKeys = ['dashboard', 'symptoms', 'medications', 'wellness', 'profile', 'settings', 'aiAssistant', 'notifications', 'quickAssistant', 'logout'];
  
  // Forza il cambio della lingua
  const forceLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('userLanguage', lang);
    localStorage.setItem('i18nextLng', lang);
    console.log(`Lingua impostata manualmente a: ${lang}`);
  };
  
  if (!visible) {
    return (
      <button 
        onClick={() => setVisible(true)}
        style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px', 
          zIndex: 9999,
          padding: '8px',
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}
      >
        Mostra debug traduzioni
      </button>
    );
  }
  
  return (
    <div style={{ 
      padding: '15px', 
      margin: '15px 0', 
      background: '#f8f9fa', 
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      position: 'relative'
    }}>
      <button 
        onClick={() => setVisible(false)}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer'
        }}
      >
        ×
      </button>
      
      <h3 style={{ marginTop: 0 }}>Debug Traduzioni</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Lingua corrente:</strong> {i18n.language}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={() => forceLanguage('it')}
          style={{ 
            marginRight: '10px',
            padding: '5px 10px',
            background: i18n.language === 'it' ? '#d4edda' : '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px'
          }}
        >
          Italiano
        </button>
        
        <button 
          onClick={() => forceLanguage('en')}
          style={{ 
            padding: '5px 10px',
            background: i18n.language === 'en' ? '#d4edda' : '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px'
          }}
        >
          English
        </button>
      </div>
      
      <div>
        <h4>Traduzioni del menu:</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #dee2e6' }}>Chiave</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #dee2e6' }}>Traduzione</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #dee2e6' }}>Fallback</th>
              <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #dee2e6' }}>Stato</th>
            </tr>
          </thead>
          <tbody>
            {menuKeys.map(key => {
              const translation = t(key);
              const fallback = key === 'dashboard' ? 'Dashboard' : 
                              key === 'symptoms' ? 'Sintomi' :
                              key === 'medications' ? 'Farmaci' :
                              key === 'wellness' ? 'Benessere' :
                              key === 'profile' ? 'Profilo' :
                              key === 'settings' ? 'Impostazioni' :
                              key === 'aiAssistant' ? 'Assistente IA' :
                              key === 'notifications' ? 'Notifiche' :
                              key === 'quickAssistant' ? 'Assistente Rapido' :
                              key === 'logout' ? 'Esci' : key;
              
              const isWorkingCorrectly = translation !== key && translation !== '';
              
              return (
                <tr key={key}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>{key}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>{translation}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #dee2e6' }}>{fallback}</td>
                  <td style={{ 
                    padding: '8px', 
                    borderBottom: '1px solid #dee2e6',
                    color: isWorkingCorrectly ? '#28a745' : '#dc3545' 
                  }}>
                    {isWorkingCorrectly ? '✓' : '✗'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#6c757d' }}>
        Questo componente di debug è visibile solo durante lo sviluppo e non sarà mostrato agli utenti finali.
      </div>
    </div>
  );
};

export default TranslationDebugger; 