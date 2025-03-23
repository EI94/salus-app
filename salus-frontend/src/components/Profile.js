import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';

const Profile = ({ userId, userName, userData, activeTab: initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'info');
  
  // Aggiorno il tab attivo quando cambia initialTab
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Funzione per formattare date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/D';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-image">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className="profile-basic-info">
          <h2>{userName || 'Utente'}</h2>
          <p>Membro dal {formatDate(userData?.registrationDate || new Date())}</p>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{userData?.symptoms?.length || 0}</span>
            <span className="stat-label">Sintomi registrati</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userData?.medications?.length || 0}</span>
            <span className="stat-label">Farmaci monitorati</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{userData?.wellnessData?.length || 0}</span>
            <span className="stat-label">Giorni monitorati</span>
          </div>
        </div>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} 
          onClick={() => setActiveTab('info')}
        >
          <i className="fas fa-info-circle"></i>
          Informazioni personali
        </button>
        <button 
          className={`tab-button ${activeTab === 'privacy' ? 'active' : ''}`} 
          onClick={() => setActiveTab('privacy')}
        >
          <i className="fas fa-shield-alt"></i>
          Privacy e sicurezza
        </button>
        <button 
          className={`tab-button ${activeTab === 'export' ? 'active' : ''}`} 
          onClick={() => setActiveTab('export')}
        >
          <i className="fas fa-download"></i>
          Esporta dati
        </button>
      </div>
      
      <div className="profile-content">
        {activeTab === 'info' && (
          <div className="tab-content-info">
            <h3>Informazioni profilo</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nome completo</label>
                <input type="text" value={userName || ''} placeholder="Nome e cognome" readOnly />
              </div>
              <div className="form-group">
                <label>ID Utente</label>
                <input type="text" value={userId || ''} readOnly />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={userData?.email || 'esempio@email.com'} placeholder="La tua email" readOnly />
              </div>
              <div className="form-group">
                <label>Telefono</label>
                <input type="tel" value={userData?.phone || ''} placeholder="Non impostato" readOnly />
              </div>
            </div>
            
            <div className="form-actions">
              <button className="primary-button disabled">
                <i className="fas fa-edit"></i>
                Modifica profilo
              </button>
              <button className="secondary-button disabled">
                <i className="fas fa-key"></i>
                Cambia password
              </button>
            </div>
            
            <div className="notification-preferences">
              <h3>Preferenze notifiche</h3>
              <div className="preference-item">
                <div>
                  <h4>Notifiche promemoria farmaci</h4>
                  <p>Ricevi notifiche quando ├¿ ora di prendere i farmaci</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked disabled />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="preference-item">
                <div>
                  <h4>Rapporti settimanali</h4>
                  <p>Ricevi un riepilogo settimanale del tuo benessere</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked disabled />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'privacy' && (
          <div className="tab-content-privacy">
            <h3>Privacy e sicurezza</h3>
            <p className="tab-description">
              Le tue informazioni personali e i dati di salute sono importanti. Ecco come sono protetti e come puoi 
              controllare la tua privacy.
            </p>
            
            <div className="privacy-settings">
              <div className="privacy-item">
                <div>
                  <h4>Condivisione dati con medici</h4>
                  <p>Permetti ai medici autorizzati di visualizzare i tuoi dati sanitari</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked disabled />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              <div className="privacy-item">
                <div>
                  <h4>Contribuisci a ricerche anonime</h4>
                  <p>Condividi dati anonimizzati per migliorare gli algoritmi sanitari</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" disabled />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div className="data-management">
              <h4>Gestione dati</h4>
              <div className="data-actions">
                <button className="warning-button disabled">
                  <i className="fas fa-trash-alt"></i>
                  Elimina tutti i dati
                </button>
                <button className="secondary-button disabled">
                  <i className="fas fa-ban"></i>
                  Disattiva account
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'export' && (
          <div className="tab-content-export">
            <h3>Esporta i tuoi dati</h3>
            <p className="tab-description">
              Puoi esportare tutti i dati memorizzati nel tuo profilo in vari formati per uso personale o da condividere 
              con i tuoi medici.
            </p>
            
            <div className="export-options">
              <div className="export-card">
                <div className="export-icon">
                  <i className="fas fa-file-csv"></i>
                </div>
                <div className="export-info">
                  <h4>Esporta come CSV</h4>
                  <p>Formato semplice compatibile con Excel e altri fogli di calcolo</p>
                </div>
                <button className="secondary-button disabled">Esporta</button>
              </div>
              
              <div className="export-card">
                <div className="export-icon">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <div className="export-info">
                  <h4>Esporta come PDF</h4>
                  <p>Report completo in formato PDF con grafici e analisi</p>
                </div>
                <button className="secondary-button disabled">Esporta</button>
              </div>
              
              <div className="export-card">
                <div className="export-icon">
                  <i className="fas fa-file-medical"></i>
                </div>
                <div className="export-info">
                  <h4>Formato medico</h4>
                  <p>Formato compatibile con software medici standard</p>
                </div>
                <button className="secondary-button disabled">Esporta</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 
