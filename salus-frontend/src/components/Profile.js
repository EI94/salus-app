import React, { useState, useEffect, useContext } from 'react';
import { loadUserData, saveUserData } from '../utils/dataManager';
import '../styles/Profile.css';
import { useTranslation } from 'react-i18next';
import { UserContext, useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

function Profile({ activeTab = 'profile' }) {
  const [activeSection, setActiveSection] = useState(activeTab);
  const { user, updateLanguage, logout, loading, updateProfile } = useUser();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    gender: '',
    height: '',
    weight: '',
    allergies: '',
    conditions: '',
    medications: '',
    emergencyContact: '',
    emergencyPhone: '',
    doctorName: '',
    doctorPhone: '',
    insuranceProvider: '',
    insuranceNumber: '',
    bloodType: '',
    notes: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    medicationReminders: true,
    appointmentReminders: true,
    dataUpdates: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    shareDataWithDoctor: false,
    allowAnonymousDataUse: false,
    storeDataLocally: true,
    twoFactorAuth: false,
  });

  // Impostazioni della lingua
  const [language, setLanguage] = useState('it');

  // Se non c'è un utente autenticato, reindirizza alla pagina di login
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Inizializza i dati del form quando l'utente è caricato
  useEffect(() => {
    if (user) {
      setFormData(prevForm => ({
        ...prevForm,
        name: user.name || 'Utente',
        email: user.email || ''
      }));
      
      setLanguage(user.language || 'it');
    }
  }, [user]);

  // Carica i dati dell'utente
  useEffect(() => {
    if (user?.id) {
      const data = loadUserData(user.id);
      if (data) {
        setUserData(data);
        
        // Aggiorna form con i dati salvati localmente
        setFormData(prevFormData => ({
          ...prevFormData,
          phone: data.phone || '',
          birthdate: data.birthdate || '',
          gender: data.gender || '',
          height: data.height || '',
          weight: data.weight || '',
          allergies: data.allergies || '',
          conditions: data.conditions || '',
          medications: data.medications || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || '',
          doctorName: data.doctorName || '',
          doctorPhone: data.doctorPhone || '',
          insuranceProvider: data.insuranceProvider || '',
          insuranceNumber: data.insuranceNumber || '',
          bloodType: data.bloodType || '',
          notes: data.notes || '',
        }));
        
        // Inizializza impostazioni di notifica e privacy
        if (data.notificationSettings) {
          setNotificationSettings(data.notificationSettings);
        }
        
        if (data.privacySettings) {
          setPrivacySettings(data.privacySettings);
        }

        // Inizializza impostazione lingua
        if (data.language) {
          setLanguage(data.language);
        }
      }
    }
  }, [user]);

  // Non renderizzare nulla durante il caricamento o se l'utente non è autenticato
  if (loading || !user) {
    return <div className="loading">Caricamento profilo...</div>;
  }

  const userId = user.id;
  const userName = user.name || 'Utente';

  // Gestisce il cambio di sezione
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // Gestisce i cambiamenti nei campi del form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Gestisce i cambiamenti nelle impostazioni di notifica
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    });
  };

  // Gestisce i cambiamenti nelle impostazioni di privacy
  const handlePrivacyChange = (e) => {
    const { name, checked } = e.target;
    setPrivacySettings({
      ...privacySettings,
      [name]: checked
    });
  };

  // Gestisce il cambiamento della lingua
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    // Usa la funzione dal contesto utente per aggiornare la lingua
    updateLanguage(newLang)
        .then(result => {
          if (!result.success) {
            console.error('Errore nel cambio lingua:', result.error);
          }
        });
  };

  // Salva le modifiche al profilo
  const handleSaveProfile = async () => {
    const updatedUserData = {
      ...userData,
      ...formData,
      notificationSettings,
      privacySettings,
      language
    };
    
    // Salva i dati localmente
    saveUserData(userId, updatedUserData);
    setUserData(updatedUserData);
    
    // Aggiorna il nome dell'utente in Firebase (solo se è cambiato)
    if (formData.name !== userName) {
      try {
        const result = await updateProfile({ name: formData.name });
          if (!result.success) {
          console.error('Errore nell\'aggiornamento del profilo:', result.error);
          alert('Si è verificato un errore nell\'aggiornamento del nome: ' + result.error);
          return;
        }
      } catch (error) {
        console.error('Errore durante l\'aggiornamento del profilo:', error);
        alert('Si è verificato un errore nell\'aggiornamento del nome.');
        return;
      }
    }
    
    setIsEditing(false);
    
    // Assicurati che la lingua sia aggiornata
    updateLanguage(language);
    
    // Mostra messaggio di conferma
    alert('Profilo aggiornato con successo!');
  };

  // Esporta i dati dell'utente in formato JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `salus_data_${userId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Elimina l'account dell'utente
  const handleDeleteAccount = async () => {
    if (window.confirm('Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata.')) {
      try {
        // Elimina i dati locali
      localStorage.removeItem(`user_${userId}`);
        
        // Fa il logout dell'utente (in un'implementazione completa, qui si chiamerebbe un'API per eliminare l'account)
        await logout();
      
      // Reindirizza alla pagina di login
        navigate('/login');
      } catch (error) {
        console.error('Errore durante l\'eliminazione dell\'account:', error);
        alert('Si è verificato un errore durante l\'eliminazione dell\'account. Riprova più tardi.');
      }
    }
  };

  // Renderizza la sezione del profilo
  const renderProfileSection = () => {
    return (
      <div className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fas fa-user-circle fa-5x"></i>
          </div>
          <div className="profile-info">
            <h2>{userName}</h2>
            <p>ID: {userId}</p>
            <p>Email: {userData.email || 'Non specificata'}</p>
          </div>
          <button 
            className="edit-profile-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Annulla' : 'Modifica Profilo'}
          </button>
        </div>
        
        {isEditing ? (
          <div className="profile-form">
            <h3>Informazioni Personali</h3>
            <div className="form-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Telefono</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Data di Nascita</label>
              <input 
                type="date" 
                name="birthdate" 
                value={formData.birthdate} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Genere</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleInputChange}
              >
                <option value="">Seleziona</option>
                <option value="male">Maschio</option>
                <option value="female">Femmina</option>
                <option value="other">Altro</option>
                <option value="prefer-not-to-say">Preferisco non specificare</option>
              </select>
            </div>
            
            <h3>Informazioni Mediche</h3>
            <div className="form-group">
              <label>Altezza (cm)</label>
              <input 
                type="number" 
                name="height" 
                value={formData.height} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Peso (kg)</label>
              <input 
                type="number" 
                name="weight" 
                value={formData.weight} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Gruppo Sanguigno</label>
              <select 
                name="bloodType" 
                value={formData.bloodType} 
                onChange={handleInputChange}
              >
                <option value="">Seleziona</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="0+">0+</option>
                <option value="0-">0-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Allergie</label>
              <textarea 
                name="allergies" 
                value={formData.allergies} 
                onChange={handleInputChange} 
                placeholder="Elenca le tue allergie..."
              ></textarea>
            </div>
            <div className="form-group">
              <label>Condizioni Croniche</label>
              <textarea 
                name="conditions" 
                value={formData.conditions} 
                onChange={handleInputChange} 
                placeholder="Elenca le tue condizioni mediche..."
              ></textarea>
            </div>
            <div className="form-group">
              <label>Farmaci Attuali</label>
              <textarea 
                name="medications" 
                value={formData.medications} 
                onChange={handleInputChange} 
                placeholder="Elenca i farmaci che stai assumendo..."
              ></textarea>
            </div>
            
            <h3>Contatti di Emergenza</h3>
            <div className="form-group">
              <label>Nome Contatto</label>
              <input 
                type="text" 
                name="emergencyContact" 
                value={formData.emergencyContact} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Telefono Contatto</label>
              <input 
                type="tel" 
                name="emergencyPhone" 
                value={formData.emergencyPhone} 
                onChange={handleInputChange} 
              />
            </div>
            
            <h3>Informazioni Medico</h3>
            <div className="form-group">
              <label>Nome Medico</label>
              <input 
                type="text" 
                name="doctorName" 
                value={formData.doctorName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Telefono Medico</label>
              <input 
                type="tel" 
                name="doctorPhone" 
                value={formData.doctorPhone} 
                onChange={handleInputChange} 
              />
            </div>
            
            <h3>Assicurazione</h3>
            <div className="form-group">
              <label>Compagnia Assicurativa</label>
              <input 
                type="text" 
                name="insuranceProvider" 
                value={formData.insuranceProvider} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Numero Polizza</label>
              <input 
                type="text" 
                name="insuranceNumber" 
                value={formData.insuranceNumber} 
                onChange={handleInputChange} 
              />
            </div>
            
            <h3>Note Aggiuntive</h3>
            <div className="form-group">
              <textarea 
                name="notes" 
                value={formData.notes} 
                onChange={handleInputChange} 
                placeholder="Eventuali note o informazioni aggiuntive..."
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                className="save-btn"
                onClick={handleSaveProfile}
              >
                Salva Modifiche
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Annulla
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-details">
            <div className="profile-card">
              <h3>Informazioni Personali</h3>
              <p><strong>Nome:</strong> {userData.name || userName}</p>
              <p><strong>Email:</strong> {userData.email || 'Non specificata'}</p>
              <p><strong>Telefono:</strong> {userData.phone || 'Non specificato'}</p>
              <p><strong>Data di nascita:</strong> {userData.birthdate || 'Non specificata'}</p>
              <p><strong>Genere:</strong> {
                userData.gender === 'male' ? 'Maschio' : 
                userData.gender === 'female' ? 'Femmina' : 
                userData.gender === 'other' ? 'Altro' : 
                userData.gender === 'prefer-not-to-say' ? 'Preferisco non specificare' : 
                'Non specificato'
              }</p>
            </div>
            
            <div className="profile-card">
              <h3>Informazioni Mediche</h3>
              <p><strong>Altezza:</strong> {userData.height ? `${userData.height} cm` : 'Non specificata'}</p>
              <p><strong>Peso:</strong> {userData.weight ? `${userData.weight} kg` : 'Non specificato'}</p>
              <p><strong>Gruppo Sanguigno:</strong> {userData.bloodType || 'Non specificato'}</p>
              <p><strong>Allergie:</strong> {userData.allergies || 'Nessuna allergia specificata'}</p>
              <p><strong>Condizioni croniche:</strong> {userData.conditions || 'Nessuna condizione specificata'}</p>
              <p><strong>Farmaci:</strong> {userData.medications || 'Nessun farmaco specificato'}</p>
            </div>
            
            <div className="profile-card">
              <h3>Contatti di Emergenza</h3>
              <p><strong>Nome:</strong> {userData.emergencyContact || 'Non specificato'}</p>
              <p><strong>Telefono:</strong> {userData.emergencyPhone || 'Non specificato'}</p>
            </div>
            
            <div className="profile-card">
              <h3>Informazioni Medico</h3>
              <p><strong>Nome Medico:</strong> {userData.doctorName || 'Non specificato'}</p>
              <p><strong>Telefono Medico:</strong> {userData.doctorPhone || 'Non specificato'}</p>
            </div>
            
            <div className="profile-card">
              <h3>Assicurazione</h3>
              <p><strong>Compagnia:</strong> {userData.insuranceProvider || 'Non specificata'}</p>
              <p><strong>Numero Polizza:</strong> {userData.insuranceNumber || 'Non specificato'}</p>
            </div>
            
            {userData.notes && (
              <div className="profile-card">
                <h3>Note Aggiuntive</h3>
                <p>{userData.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizza la sezione delle notifiche
  const renderNotificationsSection = () => {
    return (
      <div className="notifications-section">
        <h2>Impostazioni Notifiche</h2>
        <p className="section-description">Gestisci come e quando ricevere notifiche dall'app Salus.</p>
        
        <div className="settings-card">
          <h3>Canali di Notifica</h3>
          <div className="settings-item">
            <div className="settings-info">
              <h4>Notifiche Email</h4>
              <p>Ricevi aggiornamenti e promemoria via email</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                name="emailNotifications" 
                checked={notificationSettings.emailNotifications} 
                onChange={handleNotificationChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="settings-item">
            <div className="settings-info">
              <h4>Notifiche Push</h4>
              <p>Ricevi notifiche nel browser o sul dispositivo mobile</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                name="pushNotifications" 
                checked={notificationSettings.pushNotifications} 
                onChange={handleNotificationChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Tipo di Notifiche</h3>
          <div className="settings-item">
            <div className="settings-info">
              <h4>Promemoria Farmaci</h4>
              <p>Ricevi promemoria per l'assunzione dei farmaci programmati</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                name="medicationReminders" 
                checked={notificationSettings.medicationReminders} 
                onChange={handleNotificationChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="settings-item">
            <div className="settings-info">
              <h4>Promemoria Appuntamenti</h4>
              <p>Ricevi promemoria per gli appuntamenti medici programmati</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                name="appointmentReminders" 
                checked={notificationSettings.appointmentReminders} 
                onChange={handleNotificationChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="settings-item">
            <div className="settings-info">
              <h4>Aggiornamenti Dati</h4>
              <p>Ricevi notifiche su aggiornamenti importanti nei tuoi dati medici</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                name="dataUpdates" 
                checked={notificationSettings.dataUpdates} 
                onChange={handleNotificationChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        
        <button 
          className="save-settings-btn"
          onClick={handleSaveProfile}
        >
          Salva Impostazioni
        </button>
      </div>
    );
  };

  // Renderizza la sezione della privacy
  const renderPrivacySection = () => {
    return (
      <div className="privacy-section">
        <h2>Privacy e Sicurezza</h2>
        <p className="section-description">Gestisci come i tuoi dati sono condivisi e protetti.</p>
        
        <div className="settings-card">
          <h3>Condivisione Dati</h3>
          <div className="settings-item">
            <div className="settings-info">
              <h4>Condivisione col Medico</h4>
              <p>Consenti al tuo medico di accedere ai tuoi dati medici</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                name="shareDataWithDoctor" 
                checked={privacySettings.shareDataWithDoctor} 
                onChange={handlePrivacyChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="settings-item">
            <div className="settings-info">
              <h4>Dati Anonimi per Ricerca</h4>
              <p>Consenti l'utilizzo anonimo dei tuoi dati per scopi di ricerca</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                name="allowAnonymousDataUse" 
                checked={privacySettings.allowAnonymousDataUse} 
                onChange={handlePrivacyChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Memorizzazione Dati</h3>
          <div className="settings-item">
            <div className="settings-info">
              <h4>Memorizzazione Locale</h4>
              <p>Memorizza i dati localmente sul dispositivo</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                name="storeDataLocally" 
                checked={privacySettings.storeDataLocally} 
                onChange={handlePrivacyChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Sicurezza Account</h3>
          <div className="settings-item">
            <div className="settings-info">
              <h4>Autenticazione a Due Fattori</h4>
              <p>Attiva l'autenticazione a due fattori per maggiore sicurezza</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                name="twoFactorAuth" 
                checked={privacySettings.twoFactorAuth} 
                onChange={handlePrivacyChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Lingua dell'Applicazione</h3>
          <div className="settings-item language-selection">
            <div className="settings-info">
              <h4>Seleziona la Lingua</h4>
              <p>Scegli la lingua in cui visualizzare l'applicazione</p>
            </div>
            <div className="language-options">
              <select
                value={language}
                onChange={handleLanguageChange}
                className="language-select"
              >
                <option value="it">Italiano</option>
                <option value="en">English (Inglese)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="settings-card">
          <h3>Gestione Dati</h3>
          <button 
            className="export-data-btn"
            onClick={handleExportData}
          >
            Esporta i Miei Dati
          </button>
          
          <button 
            className="delete-account-btn"
            onClick={handleDeleteAccount}
          >
            Elimina Account
          </button>
        </div>
        
        <button 
          className="save-settings-btn"
          onClick={handleSaveProfile}
        >
          Salva Impostazioni
        </button>
      </div>
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <h2>Impostazioni</h2>
        <ul className="profile-menu">
          <li 
            className={activeSection === 'profile' ? 'active' : ''}
            onClick={() => handleSectionChange('profile')}
          >
            <i className="fas fa-user"></i>
            <span>Profilo</span>
          </li>
          <li 
            className={activeSection === 'notifications' ? 'active' : ''}
            onClick={() => handleSectionChange('notifications')}
          >
            <i className="fas fa-bell"></i>
            <span>Notifiche</span>
          </li>
          <li 
            className={activeSection === 'privacy' ? 'active' : ''}
            onClick={() => handleSectionChange('privacy')}
          >
            <i className="fas fa-shield-alt"></i>
            <span>Privacy e Sicurezza</span>
          </li>
        </ul>
      </div>
      
      <div className="profile-content">
        {activeSection === 'profile' && renderProfileSection()}
        {activeSection === 'notifications' && renderNotificationsSection()}
        {activeSection === 'privacy' && renderPrivacySection()}
      </div>
    </div>
  );
}

export default Profile; 