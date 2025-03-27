import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import '../styles/Auth.css';

// Validazione email
const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const Auth = ({ onLogin, mockAuth }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('userLanguage') || 'it';
  });

  // Carica la lingua salvata
  useEffect(() => {
    changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  // Gestisce il cambio di lingua
  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    changeLanguage(lang);
    setShowLanguageSelector(false);
  };

  // Validazione del form
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) newErrors.email = t('emailRequired');
    else if (!isValidEmail(email)) newErrors.email = t('invalidEmail');
    
    if (!password) newErrors.password = t('passwordRequired');
    else if (password.length < 6) newErrors.password = t('passwordTooShort');
    
    if (!isLogin) {
      if (!name) newErrors.name = t('nameRequired');
      
      if (password !== confirmPassword) {
        newErrors.confirmPassword = t('passwordsDoNotMatch');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestione del submit del form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      let response;
      
      if (isLogin) {
        // Login
        response = await mockAuth.login(email, password);
        
        if (response.success) {
          setMessage({ text: t('loginSuccess'), type: 'success' });
          // Salva l'utente in localStorage se "ricordami" è selezionato
          if (rememberMe) {
            localStorage.setItem('rememberEmail', email);
          } else {
            localStorage.removeItem('rememberEmail');
          }
          onLogin(response.userData, response.token);
        } else {
          setMessage({ text: response.error || t('loginError'), type: 'error' });
        }
      } else {
        // Registrazione
        response = await mockAuth.register(name, email, password);
        
        if (response.success) {
          setMessage({ text: t('registerSuccess'), type: 'success' });
          onLogin(response.userData, response.token);
        } else {
          setMessage({ text: response.error || t('registerError'), type: 'error' });
        }
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Carica email salvata se "ricordami" era selezionato
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Toggle tra login e registrazione
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setMessage({ text: '', type: '' });
  };

  // Render per le caratteristiche dell'app
  const renderFeatures = () => (
    <div className="auth-features">
      <h2>{t('featuresTitle')}</h2>
      <p>{t('featuresDescription')}</p>
      
      <div className="feature-list">
        <div className="feature-item">
          <span className="feature-emoji">❤️</span>
          <h3>{t('featureSymptoms')}</h3>
          <p>{t('featureSymptomsDesc')}</p>
        </div>
        
        <div className="feature-item">
          <span className="feature-emoji">💊</span>
          <h3>{t('featureMedications')}</h3>
          <p>{t('featureMedicationsDesc')}</p>
        </div>
        
        <div className="feature-item">
          <span className="feature-emoji">🤖</span>
          <h3>{t('featureAI')}</h3>
          <p>{t('featureAIDesc')}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-left">
          {/* Logo e titolo */}
          <div className="auth-logo">
            <img src="/assets/icons/logo.svg" alt="Salus" />
            <h1>{t('appTitle')}</h1>
          </div>
          
          {/* Descrizione dell'app */}
          <p className="auth-description">{t('appDescription')}</p>
          
          {/* Caratteristiche dell'app */}
          {renderFeatures()}
        </div>
        
        <div className="auth-right">
          {/* Selettore lingua */}
          <div className="language-selector">
            <button 
              className="language-button"
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            >
              <span>🌐</span>
              <span>{t('languageSelector')}</span>
            </button>
            
            {showLanguageSelector && (
              <div className="language-dropdown">
                <button 
                  className={`language-option ${selectedLanguage === 'it' ? 'active' : ''}`} 
                  onClick={() => handleLanguageChange('it')}
                >
                  <span>🇮🇹</span> {t('italian')}
                </button>
                <button 
                  className={`language-option ${selectedLanguage === 'en' ? 'active' : ''}`} 
                  onClick={() => handleLanguageChange('en')}
                >
                  <span>🇬🇧</span> {t('english')}
                </button>
                <button 
                  className={`language-option ${selectedLanguage === 'hi' ? 'active' : ''}`} 
                  onClick={() => handleLanguageChange('hi')}
                >
                  <span>🇮🇳</span> {t('hindi')}
                </button>
              </div>
            )}
          </div>
          
          {/* Form di autenticazione */}
          <div className="auth-form-container">
            <h2>{isLogin ? t('login') : t('register')}</h2>
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Campo nome (solo registrazione) */}
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">{t('name')}</label>
                  <div className="input-with-icon">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      className={errors.name ? 'error' : ''}
                    />
                  </div>
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
              )}
              
              {/* Campo email */}
              <div className="form-group">
                <label htmlFor="email">{t('email')}</label>
                <div className="input-with-icon">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              
              {/* Campo password */}
              <div className="form-group">
                <label htmlFor="password">{t('password')}</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className={errors.password ? 'error' : ''}
                  />
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              
              {/* Campo conferma password (solo registrazione) */}
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                  <div className="input-with-icon">
                    <span className="input-icon">🔒</span>
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
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>
              )}
              
              {/* Opzioni aggiuntive per il login */}
              {isLogin && (
                <div className="form-options">
                  <div className="remember-me">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <label htmlFor="rememberMe">{t('rememberMe')}</label>
                  </div>
                  <a href="#" className="forgot-password">
                    {t('forgotPassword')}
                  </a>
                </div>
              )}
              
              {/* Pulsante di invio */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  isLogin ? t('loginBtn') : t('registerBtn')
                )}
              </button>
              
              {/* Opzioni di login social */}
              <div className="social-login">
                <div className="divider">
                  <span>{t('or')}</span>
                </div>
                
                <button type="button" className="social-button google">
                  <span className="social-icon">G</span>
                  {t('loginWithGoogle')}
                </button>
                
                <button type="button" className="social-button facebook">
                  <span className="social-icon">f</span>
                  {t('loginWithFacebook')}
                </button>
              </div>
            </form>
            
            {/* Toggle tra login e registrazione */}
            <div className="auth-toggle">
              <p>
                {isLogin ? t('noAccount') : t('hasAccount')}
                <button onClick={toggleAuthMode}>
                  {isLogin ? t('register') : t('login')}
                </button>
              </p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="auth-footer">
            <div className="footer-links">
              <a href="#">{t('privacyPolicy')}</a>
              <span className="divider">•</span>
              <a href="#">{t('termsAndConditions')}</a>
              <span className="divider">•</span>
              <a href="#">{t('cookiePolicy')}</a>
            </div>
            <p className="copyright">{t('copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 