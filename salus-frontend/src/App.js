import React, { useState, useEffect } from 'react';
import API from './api';
import SymptomTracker from './SymptomTracker';
import AIAssistant from './AIAssistant';
import WellnessTracker from './WellnessTracker';
import MedicationTracker from './MedicationTracker';
import NotificationCenter from './NotificationCenter';
import AIAssistantWidget from './AIAssistantWidget';
import { useTranslation } from 'react-i18next';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('symptoms');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'it');
  const [showSettings, setShowSettings] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const { t, i18n } = useTranslation();

  // Salva la lingua nelle preferenze e aggiorna i18n
  useEffect(() => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Controlla lo stato della connessione
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Applica la modalità dark se attiva
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Simulazione di notifiche (in un'app reale, questo verrebbe dal backend)
  useEffect(() => {
    if (userId) {
      const interval = setInterval(() => {
        // Simula la ricezione casuale di notifiche
        if (Math.random() > 0.9) {
          setNotificationCount(prev => prev + 1);
        }
      }, 60000); // Controlla ogni minuto

      return () => clearInterval(interval);
    }
  }, [userId]);

  // Mostra il modal di benvenuto una volta al primo accesso
  useEffect(() => {
    if (userId && !localStorage.getItem('welcomeShown')) {
      setShowWelcomeModal(true);
      localStorage.setItem('welcomeShown', 'true');
    }
  }, [userId]);

  // Funzioni per le impostazioni
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setShowSettings(false);
  };

  // Funzione per la registrazione
  const handleRegister = async (name, emailValue, passwordValue) => {
    try {
      // Validazione dei campi
      if (!name || name.length < 3) {
        alert(t('nameValidation'));
        return;
      }
      
      if (!emailValue || !emailValue.includes('@')) {
        alert(t('emailValidation'));
        return;
      }
      
      if (!passwordValue || passwordValue.length < 6) {
        alert(t('passwordValidation'));
        return;
      }
      
      // Modifica l'endpoint per usare la versione corretta dell'API
      await API.post('/user/register', { name: name, email: emailValue, password: passwordValue });
      alert(t('confirmEmail'));
      setIsRegistering(false);
    } catch (error) {
      console.error(error);
      alert('Errore durante la registrazione: ' + (error.response?.data?.message || error.message));
    }
  };

  // Funzione per il login
  const handleLogin = async (emailValue, passwordValue) => {
    try {
      if (!emailValue || !passwordValue) {
        alert(t('Compila tutti i campi richiesti'));
        return;
      }
      
      console.log('Tentativo di login con:', { email: emailValue });
      
      const response = await API.post('/user/login', { 
        email: emailValue, 
        password: passwordValue 
      });
      
      console.log('Risposta login:', response.data);
      const { userId, name } = response.data;
      
      // Salva le credenziali dell'utente
      setUserId(userId);
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name);
      
      // Reset dei campi
      setEmail('');
      setPassword('');
      
      showToast('Login effettuato con successo', 'success');
    } catch (error) {
      console.error('Errore durante il login:', error);
      
      let errorMessage = 'Errore durante il login';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Email o password non validi';
        } else if (error.response.status === 401) {
          errorMessage = 'Non autorizzato. Verifica le tue credenziali.';
        } else if (error.response.status === 404) {
          errorMessage = 'Utente non trovato';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Impossibile raggiungere il server. Controlla la tua connessione.';
      }
      
      alert(errorMessage);
    }
  };

  const handleLogout = () => {
    setUserId(null);
    setEmail('');
    setPassword('');
    setMenuOpen(false);
    showToast('Logout effettuato');
  };

  // Funzione per mostrare toast notifications
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} slide-in-up`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // Gestisce la chiusura del menu quando si seleziona una tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  // Funzione per aprire e chiudere il pannello delle notifiche
  const toggleNotificationCenter = () => {
    setShowNotificationCenter(prev => !prev);
    // Quando apriamo il pannello, azzeriamo il contatore di notifiche
    if (!showNotificationCenter) {
      setNotificationCount(0);
    }
  };

  // Nuovo componente LoginForm con design migliorato
  const LoginForm = ({ isRegister, setIsRegister, handleLogin, handleRegister }) => {
    // Stato per il form
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Validazione del form
    const validateForm = () => {
      const errors = {};
      
      if (isRegister && !formData.name.trim()) {
        errors.name = t('nameRequired');
      }
      
      if (!formData.email.trim()) {
        errors.email = t('emailRequired');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = t('emailInvalid');
      }
      
      if (!formData.password) {
        errors.password = t('passwordRequired');
      } else if (formData.password.length < 6) {
        errors.password = t('passwordTooShort');
      }
      
      if (isRegister && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t('passwordsMustMatch');
      }
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };
    
    // Gestione del cambiamento dei campi del form
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Resetta l'errore quando l'utente modifica il campo
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: null
        });
      }
    };
    
    // Gestione dell'invio del form
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (validateForm()) {
        setIsLoading(true);
        
        try {
          if (isRegister) {
            await handleRegister(formData.name, formData.email, formData.password);
          } else {
            await handleLogin(formData.email, formData.password);
          }
        } catch (error) {
          console.error('Errore:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
    
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-card-inner">
            <div className="auth-header">
              <h2 className="auth-title">{isRegister ? t('register') : t('login')}</h2>
              <p className="auth-subtitle">
                {isRegister 
                  ? t('createAccountToTrackHealth') 
                  : t('welcomeBack')}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="auth-form">
              {isRegister && (
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    {t('name')}
                  </label>
                  <div className="input-group">
                    <span className="input-icon">
                      <i className="fas fa-user"></i>
                    </span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      placeholder={t('enterYourName')}
                    />
                  </div>
                  {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  {t('email')}
                </label>
                <div className="input-group">
                  <span className="input-icon">
                    <i className="fas fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                    placeholder={t('enterYourEmail')}
                  />
                </div>
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  {t('password')}
                </label>
                <div className="input-group">
                  <span className="input-icon">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                    placeholder={t('enterYourPassword')}
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={togglePasswordVisibility}
                  >
                    <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                  </button>
                </div>
                {formErrors.password && <div className="error-message">{formErrors.password}</div>}
              </div>
              
              {isRegister && (
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    {t('confirmPassword')}
                  </label>
                  <div className="input-group">
                    <span className="input-icon">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`form-control ${formErrors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder={t('confirmYourPassword')}
                    />
                  </div>
                  {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
                </div>
              )}
              
              {!isRegister && (
                <div className="form-group text-right">
                  <a href="#" className="forgot-password">
                    {t('forgotPassword')}
                  </a>
                </div>
              )}
              
              <button
                type="submit"
                className={`auth-submit-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <span>
                    {isRegister ? t('register') : t('login')}
                    <i className="fas fa-arrow-right"></i>
                  </span>
                )}
              </button>
            </form>
            
            <div className="auth-separator">
              <span>{t('or')}</span>
            </div>
            
            <div className="social-login">
              <button type="button" className="social-button google">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
                {t('continueWithGoogle')}
              </button>
              <button type="button" className="social-button apple">
                <i className="fab fa-apple"></i>
                {t('continueWithApple')}
              </button>
            </div>
            
            <div className="auth-footer">
              <p>
                {isRegister ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                <button
                  type="button"
                  className="auth-toggle-button"
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? t('login') : t('register')}
                </button>
              </p>
            </div>
          </div>
        </div>
        
        <div className="auth-illustration">
          <img 
            src="https://img.freepik.com/free-vector/health-medical-insurance-composition_1284-53823.jpg?w=900&t=st=1710867742~exp=1710868342~hmac=cc0e148d9db440c6b4ee2f8f4e7d3f5c6abdb3de2eba7adfea57ff22c72f1302" 
            alt="Health monitoring illustration" 
            className="illustration-image"
          />
          <div className="illustration-content">
            <h2>{t('healthMonitoringMadeEasy')}</h2>
            <ul className="feature-list">
              <li>
                <i className="fas fa-check-circle"></i>
                {t('trackSymptoms')}
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                {t('monitorMedications')}
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                {t('aiAssistant')}
              </li>
              <li>
                <i className="fas fa-check-circle"></i>
                {t('healthInsights')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header con menu mobile */}
      {userId && (
        <header className="app-header">
          <div className="container d-flex justify-between align-center">
            <h1 className="logo" onClick={() => handleTabChange('symptoms')} style={{ cursor: 'pointer' }}>
              <i className="fas fa-heartbeat" style={{ color: 'var(--primary-600)', marginRight: '10px' }}></i>
              <span className="hide-sm">Salus</span>
            </h1>
            
            <div className="header-actions d-flex align-center">
              {/* Indicatore stato connessione */}
              <div className="connection-status mx-3" title={isOnline ? 'Online' : 'Offline'}>
                <i className={`fas fa-wifi ${isOnline ? 'text-success' : 'text-danger'}`}></i>
              </div>
              
              {/* Switch Dark Mode */}
              <button 
                className="btn btn-icon mx-2" 
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? 'Passa alla modalità chiara' : 'Passa alla modalità scura'}
              >
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>
              
              {/* Notifiche - Ora cliccabile */}
              <div 
                className={`notifications mx-2 ${notificationCount > 0 ? 'pulse-dot pulse-animation' : ''}`}
                onClick={toggleNotificationCenter}
                title="Apri notifiche"
              >
                <i className="fas fa-bell"></i>
                {notificationCount > 0 && (
                  <span className="badge badge-danger">{notificationCount}</span>
                )}
              </div>
              
              {/* Menu hamburger (solo mobile) */}
              <button className="btn btn-icon hide-lg" onClick={() => setMenuOpen(!menuOpen)}>
                <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
              
              {/* Pulsante logout (visibile solo su desktop) */}
              <button onClick={handleLogout} className="btn btn-outline hide-sm mx-2">
                <i className="fas fa-sign-out-alt"></i>
                <span className="ml-2">Logout</span>
              </button>
              
              {/* Aggiunta icona impostazioni */}
              <div className="settings-icon" onClick={toggleSettings}>
                <i className="fas fa-cog"></i>
              </div>
            </div>
          </div>
          
          {/* Menu mobile */}
          {menuOpen && (
            <div className="mobile-menu slide-in-up">
              <nav>
                <ul>
                  <li onClick={() => handleTabChange('symptoms')}>
                    <i className="fas fa-notes-medical"></i> Sintomi
                  </li>
                  <li onClick={() => handleTabChange('wellness')}>
                    <i className="fas fa-spa"></i> Benessere
                  </li>
                  <li onClick={() => handleTabChange('medications')}>
                    <i className="fas fa-pills"></i> Medicinali
                  </li>
                  <li onClick={() => handleTabChange('assistant')}>
                    <i className="fas fa-robot"></i> Assistente IA
                  </li>
                  <li onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </header>
      )}

      {/* Pannello impostazioni */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2 className="settings-title">{t('settings')}</h2>
              <button className="settings-close" onClick={() => setShowSettings(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Barra di progresso completamento profilo */}
            <div className="profile-completion">
              <div className="profile-completion-text">
                <h4>Completamento Profilo</h4>
                <span>70%</span>
              </div>
              <div className="profile-completion-bar">
                <div className="profile-completion-progress" style={{width: '70%'}}></div>
              </div>
              <p className="profile-completion-tip">
                <i className="fas fa-info-circle"></i> 
                Completa il tuo profilo per sbloccare tutte le funzionalità
              </p>
            </div>

            {/* Categorie impostazioni */}
            <div className="settings-categories">
              <div className="settings-category active">
                <i className="fas fa-user-circle"></i>
                <span>Profilo</span>
              </div>
              <div className="settings-category">
                <i className="fas fa-palette"></i>
                <span>Aspetto</span>
              </div>
              <div className="settings-category">
                <i className="fas fa-bell"></i>
                <span>Notifiche</span>
              </div>
              <div className="settings-category">
                <i className="fas fa-shield-alt"></i>
                <span>Privacy</span>
              </div>
            </div>

            {/* Sezione profilo */}
            <div className="settings-section">
              <h3 className="settings-section-title">
                <i className="fas fa-user-circle"></i> Profilo
              </h3>

              {/* Avatar e nome utente */}
              <div className="profile-card">
                <div className="profile-avatar">
                  <div className="avatar-circle">
                    {username ? username.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="avatar-edit">
                    <i className="fas fa-camera"></i>
                  </div>
                </div>
                <div className="profile-info">
                  <h4>{username || "Utente Salus"}</h4>
                  <p>{email || "email@esempio.com"}</p>
                  <button className="btn-edit-profile">
                    <i className="fas fa-pen"></i> Modifica Profilo
                  </button>
                </div>
              </div>

              {/* Lingua */}
              <div className="settings-card">
                <div className="setting-card-header">
                  <i className="fas fa-globe"></i>
                  <h4>{t('language')}</h4>
                </div>
                <div className="language-selector">
                  <div className={`language-option ${language === 'it' ? 'active' : ''}`} 
                       onClick={() => changeLanguage('it')}>
                    <div className="language-flag">🇮🇹</div>
                    <div className="language-label">Italiano</div>
                    {language === 'it' && <i className="fas fa-check"></i>}
                  </div>
                  <div className={`language-option ${language === 'en' ? 'active' : ''}`} 
                       onClick={() => changeLanguage('en')}>
                    <div className="language-flag">🇬🇧</div>
                    <div className="language-label">English</div>
                    {language === 'en' && <i className="fas fa-check"></i>}
                  </div>
                  <div className={`language-option ${language === 'es' ? 'active' : ''}`} 
                       onClick={() => changeLanguage('es')}>
                    <div className="language-flag">🇪🇸</div>
                    <div className="language-label">Español</div>
                    {language === 'es' && <i className="fas fa-check"></i>}
                  </div>
                </div>
              </div>

              {/* Aspetto */}
              <div className="settings-card">
                <div className="setting-card-header">
                  <i className="fas fa-moon"></i>
                  <h4>{t('darkMode')}</h4>
                </div>
                <div className="theme-preview">
                  <div className={`theme-option ${!darkMode ? 'active' : ''}`} 
                       onClick={() => setDarkMode(false)}>
                    <div className="theme-preview-light">
                      <div className="theme-preview-header"></div>
                      <div className="theme-preview-content">
                        <div className="theme-preview-line"></div>
                        <div className="theme-preview-line"></div>
                      </div>
                    </div>
                    <div className="theme-label">Chiaro</div>
                    {!darkMode && <i className="fas fa-check-circle"></i>}
                  </div>
                  <div className={`theme-option ${darkMode ? 'active' : ''}`} 
                       onClick={() => setDarkMode(true)}>
                    <div className="theme-preview-dark">
                      <div className="theme-preview-header"></div>
                      <div className="theme-preview-content">
                        <div className="theme-preview-line"></div>
                        <div className="theme-preview-line"></div>
                      </div>
                    </div>
                    <div className="theme-label">Scuro</div>
                    {darkMode && <i className="fas fa-check-circle"></i>}
                  </div>
                </div>
              </div>

              {/* Notifiche */}
              <div className="settings-card">
                <div className="setting-card-header">
                  <i className="fas fa-bell"></i>
                  <h4>Notifiche</h4>
                </div>
                <div className="setting-toggle-row">
                  <div>
                    <h5>Promemoria farmaci</h5>
                    <p className="setting-description">Ricevi notifiche quando è ora di prendere i tuoi farmaci</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={true} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="setting-toggle-row">
                  <div>
                    <h5>Aggiornamenti giornalieri</h5>
                    <p className="setting-description">Ricevi un riepilogo giornaliero del tuo stato di salute</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={false} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="setting-toggle-row">
                  <div>
                    <h5>Suggerimenti Salus</h5>
                    <p className="setting-description">Ricevi consigli personalizzati basati sui tuoi dati</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={true} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              {/* Privacy e sicurezza */}
              <div className="settings-card">
                <div className="setting-card-header">
                  <i className="fas fa-shield-alt"></i>
                  <h4>Privacy e Sicurezza</h4>
                </div>
                <div className="setting-toggle-row">
                  <div>
                    <h5>Condivisione dati anonimi</h5>
                    <p className="setting-description">Aiuta a migliorare Salus condividendo dati anonimi</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={false} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="setting-toggle-row">
                  <div>
                    <h5>Autenticazione a due fattori</h5>
                    <p className="setting-description">Aumenta la sicurezza del tuo account</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" checked={false} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <button className="btn-text privacy-link" onClick={() => window.open('/privacy-policy', '_blank')}>
                  <i className="fas fa-external-link-alt"></i> Leggi la nostra Privacy Policy
                </button>
              </div>

              {/* Supporto */}
              <div className="settings-card">
                <div className="setting-card-header">
                  <i className="fas fa-question-circle"></i>
                  <h4>Supporto</h4>
                </div>
                <button className="support-option" onClick={() => window.open('/guida', '_blank')}>
                  <i className="fas fa-book"></i> Guida all'uso
                </button>
                <button className="support-option" onClick={() => window.open('/contatti', '_blank')}>
                  <i className="fas fa-envelope"></i> Contatta supporto
                </button>
                <button className="support-option" onClick={() => window.open('/segnala-problema', '_blank')}>
                  <i className="fas fa-bug"></i> Segnala un problema
                </button>
              </div>
            </div>

            {/* Pulsante logout */}
            <button className="logout-button" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> {t('logout')}
            </button>
          </div>
        </div>
      )}

      <main className="app-content">
        <div className="container">
          {!userId ? (
            <LoginForm
              isRegister={isRegistering}
              setIsRegister={(value) => {
                setIsRegistering(value);
                setEmail('');
                setPassword('');
              }}
              handleLogin={handleLogin}
              handleRegister={handleRegister}
            />
          ) : (
            <>
              {/* Dashboard */}
              <div className="dashboard fade-in">
                {/* Tab navigation per desktop */}
                <div className="tabs hide-sm">
                  <div 
                    className={`tab ${activeTab === 'symptoms' ? 'active' : ''}`}
                    onClick={() => setActiveTab('symptoms')}
                  >
                    <i className="fas fa-notes-medical"></i> {t('symptoms')}
                  </div>
                  <div 
                    className={`tab ${activeTab === 'wellness' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wellness')}
                  >
                    <i className="fas fa-spa"></i> {t('wellness')}
                  </div>
                  <div 
                    className={`tab ${activeTab === 'medications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('medications')}
                  >
                    <i className="fas fa-pills"></i> {t('medications')}
                  </div>
                  <div 
                    className={`tab ${activeTab === 'assistant' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assistant')}
                  >
                    <i className="fas fa-robot"></i> {t('assistant')}
                  </div>
                </div>
                
                {/* Contenuto della tab */}
                <div className="tab-content slide-in-up">
                  {activeTab === 'symptoms' && <SymptomTracker userId={userId} />}
                  {activeTab === 'wellness' && <WellnessTracker userId={userId} />}
                  {activeTab === 'medications' && <MedicationTracker userId={userId} />}
                  {activeTab === 'assistant' && <AIAssistant userId={userId} />}
                </div>
              </div>
              
              {/* Navigazione inferiore mobile */}
              <nav className="bottom-nav hide-lg">
                <div 
                  className={`bottom-nav-item ${activeTab === 'symptoms' ? 'active' : ''}`}
                  onClick={() => setActiveTab('symptoms')}
                >
                  <i className="fas fa-notes-medical bottom-nav-icon"></i>
                  <span className="bottom-nav-label">{t('symptoms')}</span>
                </div>
                <div 
                  className={`bottom-nav-item ${activeTab === 'wellness' ? 'active' : ''}`}
                  onClick={() => setActiveTab('wellness')}
                >
                  <i className="fas fa-spa bottom-nav-icon"></i>
                  <span className="bottom-nav-label">{t('wellness')}</span>
                </div>
                <div 
                  className={`bottom-nav-item ${activeTab === 'medications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('medications')}
                >
                  <i className="fas fa-pills bottom-nav-icon"></i>
                  <span className="bottom-nav-label">{t('medications')}</span>
                </div>
                <div 
                  className={`bottom-nav-item ${activeTab === 'assistant' ? 'active' : ''}`}
                  onClick={() => setActiveTab('assistant')}
                >
                  <i className="fas fa-robot bottom-nav-icon"></i>
                  <span className="bottom-nav-label">{t('assistant')}</span>
                </div>
              </nav>

              {/* Widget Assistente AI sempre disponibile */}
              <AIAssistantWidget 
                userId={userId}
                language={language}
                darkMode={darkMode}
              />
            </>
          )}
        </div>
      </main>
      
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="modal-overlay fade-in">
          <div className="modal-container slide-in-up">
            <div className="modal-header">
              <h3><i className="fas fa-hand-sparkles"></i> {t('welcomeTitle')}</h3>
              <button className="btn-close" onClick={() => setShowWelcomeModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>{t('welcomeMessage')}</p>
              
              {/* Disclaimer medico nel modal di benvenuto */}
              <div className="welcome-disclaimer">
                <div className="disclaimer-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="disclaimer-content">
                  <h4>Informativa importante sulla salute</h4>
                  <p>
                    Salus è progettato per il monitoraggio personale della salute ma <strong>non sostituisce il parere medico professionale</strong>.
                    Nessuna informazione fornita dall'app, inclusi grafici, suggerimenti o interazioni con l'assistente AI, 
                    deve essere considerata un consiglio, una diagnosi o un trattamento medico.
                  </p>
                  <p>
                    In caso di problemi di salute, consulta sempre un medico qualificato.
                    In caso di emergenza, contatta immediatamente il servizio di emergenza locale.
                  </p>
                  <div className="disclaimer-checkbox">
                    <input type="checkbox" id="disclaimer-agreement" defaultChecked />
                    <label htmlFor="disclaimer-agreement">
                      Ho compreso che Salus non sostituisce il parere medico professionale
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="welcome-features">
                <div className="feature">
                  <div className="feature-icon">
                    <i className="fas fa-notes-medical"></i>
                  </div>
                  <div className="feature-text">
                    <h4>{t('symptoms')}</h4>
                    <p>Registra i tuoi sintomi e monitora la loro evoluzione nel tempo.</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <i className="fas fa-spa"></i>
                  </div>
                  <div className="feature-text">
                    <h4>{t('wellness')}</h4>
                    <p>Annota il tuo umore, sonno e attività quotidiane.</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <i className="fas fa-pills"></i>
                  </div>
                  <div className="feature-text">
                    <h4>{t('medications')}</h4>
                    <p>Tieni traccia dei tuoi medicinali e ricevi promemoria.</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="feature-text">
                    <h4>{t('assistant')}</h4>
                    <p>Chiedi consigli e ottieni risposte personalizzate sul tuo stato di salute.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowWelcomeModal(false)}>
                {t('welcomeTitle')} <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="offline-indicator">
          <i className="fas fa-wifi-slash"></i> Sei offline. Alcune funzionalità potrebbero non essere disponibili.
        </div>
      )}
      
      <footer className="app-footer">
        <div className="container">
          <p className="text-center">
            <i className="fas fa-heartbeat"></i> Salus &copy; 2025 - La tua salute al primo posto
          </p>
        </div>
      </footer>
      
      {/* Toast container */}
      <div id="toast-container"></div>
      
      {/* CSS per componenti aggiuntivi */}
      <style>{`
        /* Stili per il menu mobile */
        .mobile-menu {
          position: absolute;
          top: var(--header-height);
          left: 0;
          right: 0;
          background-color: var(--white);
          box-shadow: var(--shadow-md);
          z-index: 100;
        }
        
        .mobile-menu ul {
          list-style: none;
          padding: 0;
        }
        
        .mobile-menu li {
          padding: var(--space-4);
          border-bottom: 1px solid var(--gray-200);
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        
        .mobile-menu li:hover {
          background-color: var(--gray-100);
        }
        
        .mobile-menu li i {
          margin-right: var(--space-3);
          color: var(--primary-600);
          width: 20px;
          text-align: center;
        }
        
        /* Toast notifications */
        #toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
        }
        
        .toast {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-2);
          box-shadow: var(--shadow-md);
          min-width: 250px;
          position: relative;
          overflow: hidden;
        }
        
        .toast-success {
          background-color: var(--success);
          color: white;
        }
        
        .toast-error {
          background-color: var(--danger);
          color: white;
        }
        
        .toast-info {
          background-color: var(--info);
          color: white;
        }
        
        .toast-warning {
          background-color: var(--warning);
          color: var(--gray-900);
        }
        
        .fade-out {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-container {
          background-color: var(--white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow-y: auto;
        }
        
        .modal-header {
          padding: var(--space-4);
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-body {
          padding: var(--space-4);
        }
        
        .modal-footer {
          padding: var(--space-4);
          border-top: 1px solid var(--gray-200);
          display: flex;
          justify-content: flex-end;
        }
        
        .btn-close {
          background: none;
          border: none;
          font-size: var(--font-size-xl);
          cursor: pointer;
          color: var(--gray-600);
        }
        
        .btn-close:hover {
          color: var(--gray-900);
        }
        
        /* Welcome modal */
        .welcome-features {
          margin-top: var(--space-4);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
        }
        
        .feature {
          display: flex;
          align-items: flex-start;
          margin-bottom: var(--space-3);
        }
        
        .feature-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background-color: var(--primary-100);
          color: var(--primary-600);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--space-3);
          font-size: var(--font-size-lg);
        }
        
        .feature-text h4 {
          margin-bottom: var(--space-1);
          color: var(--gray-900);
        }
        
        .feature-text p {
          color: var(--gray-600);
          font-size: var(--font-size-sm);
        }
        
        /* Offline indicator */
        .offline-indicator {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: var(--danger);
          color: white;
          text-align: center;
          padding: var(--space-2);
          z-index: 1001;
        }
        
        /* Footer */
        .app-footer {
          background-color: var(--gray-900);
          color: var(--white);
          padding: var(--space-4) 0;
          margin-top: var(--space-6);
        }
        
        /* Utilitari */
        .w-100 { width: 100%; }
        .mt-4 { margin-top: var(--space-4); }
        .ml-2 { margin-left: var(--space-2); }
        .text-muted { color: var(--gray-600); }
        .text-primary { color: var(--primary-600); }
        .text-success { color: var(--success); }
        .text-danger { color: var(--danger); }
        
        /* Animazioni aggiuntive per elementi interattivi */
        .btn-primary:active,
        .btn-secondary:active,
        .btn-danger:active {
          transform: scale(0.98);
        }
        
        @media (max-width: 768px) {
          .welcome-features {
            grid-template-columns: 1fr;
          }
        }
        
        /* Stili per il disclaimer medico */
        .medical-disclaimer {
          background-color: #f8f9fa;
          border-left: 4px solid #dc3545;
          margin: 1rem;
          padding: 1rem;
          border-radius: 5px;
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        
        .disclaimer-icon {
          font-size: 1.5rem;
          color: #dc3545;
          flex-shrink: 0;
        }
        
        .disclaimer-content h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          color: #dc3545;
          font-size: 1rem;
        }
        
        .disclaimer-content p {
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #555;
        }
        
        .disclaimer-warning {
          font-weight: 500;
          color: #555;
        }
        
        .disclaimer-warning strong {
          color: #dc3545;
        }
        
        /* Stili per il disclaimer nel modal di benvenuto */
        .welcome-disclaimer {
          background-color: #f8f9fa;
          border: 1px solid #dc3545;
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0 20px;
          display: flex;
          gap: 15px;
        }
        
        .welcome-disclaimer .disclaimer-icon {
          font-size: 2rem;
          color: #dc3545;
          flex-shrink: 0;
        }
        
        .welcome-disclaimer h4 {
          color: #dc3545;
          margin-top: 0;
          margin-bottom: 8px;
        }
        
        .welcome-disclaimer p {
          margin-bottom: 10px;
          color: #555;
        }
        
        .disclaimer-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: 10px;
        }
        
        .disclaimer-checkbox input {
          margin-top: 3px;
        }
        
        .disclaimer-checkbox label {
          font-weight: 600;
          color: #333;
        }
      `}</style>

      {/* Componente Centro Notifiche */}
      {userId && (
        <NotificationCenter
          userId={userId}
          isOpen={showNotificationCenter}
          onClose={() => setShowNotificationCenter(false)}
          language={language}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App; 