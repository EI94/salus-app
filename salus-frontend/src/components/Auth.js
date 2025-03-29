import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../styles/Auth.css';
import { UserContext } from '../context/UserContext';
import { apiUrl } from '../api';

// SVG Icons come componenti per un aspetto professionale
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
  </svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#4285F4" />
    <path d="M7.545,9.909v3.434H4.111v-3.434H7.545z" fill="#34A853" />
    <path d="M12.545,22c2.661,0,4.892-0.874,6.526-2.364l-3.184-2.466 c-0.885,0.617-2.024,0.98-3.342,0.98c-2.575,0-4.755-1.742-5.531-4.08l-3.292,2.655C5.201,19.999,8.629,22,12.545,22z" fill="#FBBC05" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
    <path d="M20.9,2H3.1C2.5,2,2,2.5,2,3.1v17.8C2,21.5,2.5,22,3.1,22h9.58v-7.75h-2.6v-3h2.6V9.17c0-2.57,1.57-3.97,3.86-3.97 c1.1,0,2.04,0.08,2.32,0.12v2.68l-1.59,0c-1.25,0-1.49,0.59-1.49,1.47v1.92h2.98l-0.39,3h-2.59V22h5.09c0.6,0,1.1-0.5,1.1-1.1 V3.1C22,2.5,21.5,2,20.9,2z" fill="#1877F2" />
  </svg>
);

const HeartPulseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z M7.5,5C5.54,5 4,6.54 4,8.5C4,11.45 7.4,14.47 12,18.7C16.6,14.47 20,11.45 20,8.5C20,6.54 18.46,5 16.5,5C14.96,5 13.5,6 12.92,7.33H11.07C10.5,6 9.04,5 7.5,5Z M10,8A1,1 0 0,0 9,9A1,1 0 0,0 10,10A1,1 0 0,0 11,9A1,1 0 0,0 10,8M14,8A1,1 0 0,0 13,9A1,1 0 0,0 14,10A1,1 0 0,0 15,9A1,1 0 0,0 14,8M12,13A1,1 0 0,0 11,14A1,1 0 0,0 12,15A1,1 0 0,0 13,14A1,1 0 0,0 12,13Z" />
  </svg>
);

const MedicationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M19.5,6.5L17.5,4.5L6.5,15.5L8.5,17.5L19.5,6.5M7,4A3,3 0 0,0 4,7A3,3 0 0,0 7,10A3,3 0 0,0 10,7A3,3 0 0,0 7,4M17,20A3,3 0 0,0 20,17A3,3 0 0,0 17,14A3,3 0 0,0 14,17A3,3 0 0,0 17,20M17,4.5A1.5,1.5 0 0,0 15.5,6A1.5,1.5 0 0,0 17,7.5A1.5,1.5 0 0,0 18.5,6A1.5,1.5 0 0,0 17,4.5M7,17.5A1.5,1.5 0 0,0 5.5,19A1.5,1.5 0 0,0 7,20.5A1.5,1.5 0 0,0 8.5,19A1.5,1.5 0 0,0 7,17.5Z" />
  </svg>
);

const AIIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M21,15.61L19.59,17L14.58,12L19.59,7L21,8.39L17.44,12L21,15.61M3,6H16V8H3V6M3,13V11H16V13H3M3,18V16H16V18H3Z" />
  </svg>
);

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

// Immagini delle bandiere per il selettore di lingua
const flags = {
  it: 'https://flagcdn.com/w40/it.png',
  en: 'https://flagcdn.com/w40/gb.png',
  hi: 'https://flagcdn.com/w40/in.png'
};

const Auth = () => {
  // Sicurezza per evitare errori nel contesto di build
  let navigate = undefined;
  let userContext = undefined;
  
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate();
  } catch (error) {
    console.log('Navigate non disponibile in questo contesto');
  }
  
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    userContext = React.useContext(UserContext);
  } catch (error) {
    console.log('UserContext non disponibile in questo contesto');
  }
  
  // Inizializzazione traduzioni
  const { t, i18n } = useTranslation();
  
  // Stati per il form
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Opzioni di lingua disponibili
  const languages = [
    { code: 'it', name: 'Italiano' },
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' }
  ];
  
  // Funzioni sicure per navigate e setUserData
  const safeNavigate = (path) => {
    if (navigate && typeof navigate === 'function') {
      try {
        navigate(path);
      } catch (error) {
        console.log('Errore durante la navigazione:', error);
      }
    }
  };
  
  const safeSetUserData = (data) => {
    if (userContext && typeof userContext.setUserData === 'function') {
      try {
        userContext.setUserData(data);
      } catch (error) {
        console.log('Errore durante l\'impostazione dei dati utente:', error);
      }
    }
  };

  // Cambio lingua
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('preferredLanguage', lng);
    setShowLanguage(false);
  };

  // Controllo token esistente al caricamento
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        safeNavigate('/dashboard');
      }
      
      // Imposta la lingua preferita all'avvio
      const storedLang = localStorage.getItem('preferredLanguage');
      if (storedLang) {
        i18n.changeLanguage(storedLang);
      }
    } catch (error) {
      console.log('Errore durante l\'inizializzazione:', error);
    }
  }, []);

  // Validazione form
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = t('errorEmailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('errorEmailInvalid');
    }
    
    if (!password) {
      newErrors.password = t('errorPasswordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('errorPasswordLength');
    }
    
    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = t('errorPasswordMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestione invio form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      let response;
      
      if (isLogin) {
        // Login
        response = await axios.post(`${apiUrl}/api/users/login`, {
          email,
          password
        });
        
        setMessage({
          type: 'success',
          text: t('loginSuccess')
        });
      } else {
        // Registrazione
        response = await axios.post(`${apiUrl}/api/users/register`, {
          email,
          password
        });
        
        setMessage({
          type: 'success',
          text: t('registerSuccess')
        });
      }
      
      const { token, user } = response.data;
      
      // Salva token e dati utente
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }
      
      // Aggiorna il contesto con i dati utente
      safeSetUserData(user);
      
      // Reindirizza dopo un breve ritardo
      setTimeout(() => {
        safeNavigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || t('errorGeneric')
      });
    } finally {
      setLoading(false);
    }
  };

  // Login con Google
  const handleGoogleLogin = () => {
    alert(t('featureInDevelopment'));
  };

  // Login con Facebook
  const handleFacebookLogin = () => {
    alert(t('featureInDevelopment'));
  };

  // Toggle tra login e registrazione
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setMessage({ type: '', text: '' });
    setErrors({});
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Sezione sinistra - Brand e features */}
        <div className="auth-brand">
          <div className="brand-header">
            <div className="brand-logo">
              <img src="/logo.svg" alt="Salus Logo" />
              <h1>Salus</h1>
            </div>
            
            <p className="brand-description">
              {t('appDescription')}
            </p>
          </div>
          
          <div className="brand-features">
            <h2>{t('featuresTitle')}</h2>
            
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-title">
                  <HeartPulseIcon />
                  <span>{t('featureSymptoms')}</span>
                </div>
                <p className="feature-description">{t('featureSymptomsDesc')}</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-title">
                  <MedicationIcon />
                  <span>{t('featureMedications')}</span>
                </div>
                <p className="feature-description">{t('featureMedicationsDesc')}</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-title">
                  <AIIcon />
                  <span>{t('featureAI')}</span>
                </div>
                <p className="feature-description">{t('featureAIDesc')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sezione destra - Form di autenticazione */}
        <div className="auth-form-section">
          <div className="auth-header">
            <h2 className="auth-title">{isLogin ? t('login') : t('register')}</h2>
            
            {/* Selettore lingua */}
            <div className="language-selector">
              <button 
                className="language-button" 
                onClick={() => setShowLanguage(!showLanguage)}
              >
                <GlobeIcon />
                <span>{languages.find(lang => lang.code === i18n.language)?.name || 'Language'}</span>
              </button>
              
              {showLanguage && (
                <div className="language-dropdown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                      onClick={() => changeLanguage(lang.code)}
                    >
                      <img src={flags[lang.code]} alt={lang.name} />
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Messaggi di errore/successo */}
          {message.text && (
            <div className={`auth-message ${message.type}`}>
              {message.type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
              <span>{message.text}</span>
            </div>
          )}
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">{t('email')}</label>
              <div className="form-control">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">{t('password')}</label>
              <div className="form-control">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className={errors.password ? 'error' : ''}
                />
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                <div className="form-control">
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('confirmPasswordPlaceholder')}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>
            )}
            
            {isLogin && (
              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="rememberMe">{t('rememberMe')}</label>
                </div>
                <a href="#forgot" className="forgot-password">
                  {t('forgotPassword')}
                </a>
              </div>
            )}
            
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                isLogin ? t('loginBtn') : t('registerBtn')
              )}
            </button>
          </form>
          
          <div className="divider">
            <span>{t('or')}</span>
          </div>
          
          <div className="social-buttons">
            <button className="social-button" onClick={handleGoogleLogin}>
              <GoogleIcon />
              <span>{t('loginWithGoogle')}</span>
            </button>
            
            <button className="social-button" onClick={handleFacebookLogin}>
              <FacebookIcon />
              <span>{t('loginWithFacebook')}</span>
            </button>
          </div>
          
          <div className="auth-toggle">
            {isLogin ? t('noAccount') : t('hasAccount')}
            <button type="button" onClick={toggleAuthMode}>
              {isLogin ? t('register') : t('login')}
            </button>
          </div>
          
          <div className="auth-footer">
            <div className="footer-links">
              <a href="#privacy">{t('privacyPolicy')}</a>
              <a href="#terms">{t('termsOfService')}</a>
              <a href="#help">{t('helpCenter')}</a>
            </div>
            <div className="copyright">
              © {new Date().getFullYear()} Salus Health Technologies
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 