import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../styles/Auth.css';
import { UserContext } from '../context/UserContext';
import { apiUrl } from '../api';

// Importazione immagini
import salusLogo from '../assets/images/logo.svg';
import patternSvg from '../assets/images/pattern.svg';

const Auth = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setUserData } = useContext(UserContext);
  
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
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
  ];

  // Cambio lingua
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('preferredLanguage', lng);
    setShowLanguage(false);
  };

  // Imposta l'URL del pattern come variabile CSS
  useEffect(() => {
    document.documentElement.style.setProperty('--pattern-url', `url(${patternSvg})`);
  }, []);

  // Controllo token esistente al caricamento
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
    
    // Imposta la lingua preferita all'avvio
    const storedLang = localStorage.getItem('preferredLanguage');
    if (storedLang) {
      i18n.changeLanguage(storedLang);
    }
  }, [navigate, i18n]);

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
      setUserData(user);
      
      // Reindirizza dopo un breve ritardo
      setTimeout(() => {
        navigate('/dashboard');
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
    // Implementazione del login con Google
    alert(t('featureInDevelopment'));
  };

  // Login con Facebook
  const handleFacebookLogin = () => {
    // Implementazione del login con Facebook
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
      <div className="auth-content">
        {/* Sezione sinistra - Brand e features */}
        <div className="auth-left">
          <div className="auth-logo">
            <img src={salusLogo} alt="Salus Logo" />
            <h1>Salus</h1>
          </div>
          
          <p className="auth-description">
            {t('appDescription')}
          </p>
          
          <div className="auth-features">
            <h2>{t('featuresTitle')}</h2>
            <p>{t('featuresDescription')}</p>
            
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">❤️</span>
                <h3>{t('featureSymptoms')}</h3>
                <p>{t('featureSymptomsDesc')}</p>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">💊</span>
                <h3>{t('featureMedications')}</h3>
                <p>{t('featureMedicationsDesc')}</p>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <h3>{t('featureAI')}</h3>
                <p>{t('featureAIDesc')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sezione destra - Form di autenticazione */}
        <div className="auth-right">
          {/* Selettore lingua */}
          <div className="language-selector">
            <button 
              className="language-button" 
              onClick={() => setShowLanguage(!showLanguage)}
            >
              <span>🌐</span>
              {languages.find(lang => lang.code === i18n.language)?.name || 'Language'}
            </button>
            
            {showLanguage && (
              <div className="language-dropdown">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    <span>{lang.flag}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="auth-form-container">
            <h2>{isLogin ? t('login') : t('register')}</h2>
            
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <form className="auth-form" onSubmit={handleSubmit}>
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
            
            <div className="social-login">
              <div className="divider">
                <span>{t('or')}</span>
              </div>
              
              <div className="social-buttons">
                <button className="social-button google" onClick={handleGoogleLogin}>
                  <span className="social-icon">G</span>
                  {t('loginWithGoogle')}
                </button>
                
                <button className="social-button facebook" onClick={handleFacebookLogin}>
                  <span className="social-icon">f</span>
                  {t('loginWithFacebook')}
                </button>
              </div>
            </div>
            
            <div className="auth-toggle">
              <p>
                {isLogin ? t('noAccount') : t('hasAccount')}
                <button type="button" onClick={toggleAuthMode}>
                  {isLogin ? t('register') : t('login')}
                </button>
              </p>
            </div>
          </div>
          
          <div className="auth-footer">
            <div className="footer-links">
              <a href="#privacy">{t('privacyPolicy')}</a>
              <span className="divider">•</span>
              <a href="#terms">{t('termsAndConditions')}</a>
              <span className="divider">•</span>
              <a href="#cookie">{t('cookiePolicy')}</a>
            </div>
            <div className="copyright">
              {t('copyright')} © {new Date().getFullYear()} Salus
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 