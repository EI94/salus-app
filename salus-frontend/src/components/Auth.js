import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';
import { UserContext } from '../context/UserContext';
import { apiUrl, normalizePath } from '../api';
import { apiPost } from '../utils/apiHelper';
import { useTranslation } from 'react-i18next';

// Icone SVG solo per la sezione delle feature
const HeartPulseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
  </svg>
);

const MedicationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M19.5,6.5L17.5,4.5L6.5,15.5L8.5,17.5L19.5,6.5M7,4A3,3 0 0,0 4,7A3,3 0 0,0 7,10A3,3 0 0,0 10,7A3,3 0 0,0 7,4M17,20A3,3 0 0,0 20,17A3,3 0 0,0 17,14A3,3 0 0,0 14,17A3,3 0 0,0 17,20Z" />
  </svg>
);

const AIIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M21,15.61L19.59,17L14.58,12L19.59,7L21,8.39L17.44,12L21,15.61M3,6H16V8H3V6M3,13V11H16V13H3M3,18V16H16V18H3Z" />
  </svg>
);

// Mappa dei codici di errore per messaggi user-friendly
const ERROR_MESSAGES = {
  'auth/email-already-exists': 'Questo indirizzo email è già registrato. Prova ad accedere.',
  'auth/user-not-found': 'Nessun account trovato con questa email. Registrati per creare un account.',
  'auth/wrong-password': 'Password errata. Riprova o usa "Password dimenticata?".',
  'auth/invalid-email': 'L\'indirizzo email non è valido. Controlla e riprova.',
  'auth/weak-password': 'La password è troppo debole. Deve contenere almeno 6 caratteri.',
  'auth/network-request-failed': 'Errore di connessione. Verifica la tua connessione internet.',
  'auth/too-many-requests': 'Troppi tentativi falliti. Riprova più tardi.',
  'auth/expired-token': 'La sessione è scaduta. Accedi nuovamente.',
  'default': 'Si è verificato un errore. Riprova più tardi.'
};

const Auth = () => {
  const { t, i18n } = useTranslation();
  
  // Funzione per tradurre i codici di errore in messaggi user-friendly
  const getErrorMessage = (error) => {
    if (!error) return '';
    
    // Controlla se l'errore proviene dal server e ha un messaggio
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    
    // Altrimenti usa il messaggio generico dell'errore
    return error.message || t('genericError');
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState(i18n.language);
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Stati per il form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Controllo iniziale dell'autenticazione
  useEffect(() => {
    console.log("Componente Auth caricato");
    return () => {};
  }, [userContext]);

  // Reindirizzamento automatico se utente già autenticato
  useEffect(() => {
    if (userContext && userContext.user) {
      console.log('Utente già autenticato, reindirizzamento al dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [userContext?.user, navigate]);

  // Effetto per reindirizzare dopo registrazione
  useEffect(() => {
    if (registrationSuccess && userContext?.user) {
      console.log('Registrazione completata con successo, reindirizzamento al dashboard');
      
      // Piccolo ritardo per assicurarsi che l'utente veda il messaggio di successo
      const redirectTimer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [registrationSuccess, userContext?.user, navigate]);

  // Validazione form
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('emailInvalid');
    }
    
    if (!password) {
      newErrors.password = t('passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('passwordTooShort');
    }
    
    if (!isLogin) {
      if (!name) {
        newErrors.name = t('nameRequired');
      }
      
      if (!confirmPassword) {
        newErrors.confirmPassword = t('confirmPasswordRequired');
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = t('passwordsDoNotMatch');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestione cambio lingua
  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
    localStorage.setItem('userLanguage', selectedLanguage);
  };

  // Cambio tra login e registrazione
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setAuthError(null);
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setVerificationEmailSent(false);
    setRegistrationSuccess(false);
  };

  // Gestione login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setAuthError(null);
    setMessage({ type: '', text: '' });
    
    try {
      console.log('Tentativo login tramite Firebase Auth');
      const response = await userContext.login(email, password, rememberMe);
      
      if (response.success) {
        console.log('Autenticazione completata con successo');
        // Il reindirizzamento alla dashboard è gestito dal router
      } else {
        const errorMessage = response.error || t('loginError');
        setAuthError(new Error(errorMessage));
        setMessage({
          type: 'error',
          text: errorMessage
        });
        console.log('Auth error:', errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || t('loginError');
      setAuthError(error);
      setMessage({
        type: 'error',
        text: errorMessage
      });
      console.log('Auth error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestione registrazione
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setAuthError(null);
    setMessage({ type: '', text: '' });
    
    try {
      console.log('Tentativo registrazione tramite Firebase Auth');
      const response = await userContext.register(email, password, name);
      
      if (response.success) {
        setRegistrationSuccess(true);
        setMessage({
          type: 'success',
          text: response.message || t('registrationSuccess')
        });
        
        // Verifichiamo subito se l'utente è stato impostato
        if (userContext.user) {
          console.log("Utente registrato con successo:", userContext.user);
        } else {
          console.log("Utente non disponibile dopo registrazione, è richiesta verifica email");
        }
      } else {
        const errorMessage = response.error || t('registrationError');
        setAuthError(new Error(errorMessage));
        setMessage({
          type: 'error',
          text: errorMessage
        });
      }
    } catch (error) {
      const errorMessage = error.message || t('registrationError');
      setAuthError(error);
      setMessage({
        type: 'error',
        text: errorMessage
      });
      console.log('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestione richiesta password dimenticata
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Verifica che l'email sia valida
    if (!email) {
      setErrors({ email: t('emailRequired') });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      console.log('Invio richiesta recupero password per:', email);
      
      // Utilizzo del servizio Firebase Auth tramite context
      const response = await userContext.forgotPassword(email);
      
      if (response.success) {
        setResetEmailSent(true);
        setMessage({
          type: 'success',
          text: t('passwordResetEmailSent')
        });
      } else {
        throw new Error(response.error || 'Errore nella richiesta di recupero password');
      }
    } catch (error) {
      console.error('Errore recupero password:', error);
      setMessage({
        type: 'error',
        text: error.message || t('passwordResetError')
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Gestione richiesta nuovo invio email di verifica
  const handleResendVerification = async () => {
    if (!email) {
      setErrors({ email: t('emailRequired') });
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      console.log('Richiesta nuovo invio email di verifica per:', email);
      
      // Utilizzo del servizio Firebase Auth tramite context
      const response = await userContext.sendVerificationEmail();
      
      if (response.success) {
        setVerificationEmailSent(true);
        setMessage({
          type: 'success',
          text: t('verificationEmailSent')
        });
      } else {
        throw new Error(response.error || 'Errore nella richiesta di nuovo invio email');
      }
    } catch (error) {
      console.error('Errore invio email verifica:', error);
      setMessage({
        type: 'error',
        text: error.message || t('verificationEmailError')
      });
    } finally {
      setLoading(false);
    }
  };

  // Rendering del form specifico in base allo stato
  const renderForm = () => {
    if (showForgotPassword) {
      return renderForgotPasswordForm();
    } else if (verificationEmailSent) {
      return renderVerificationSentMessage();
    } else if (resetEmailSent) {
      return renderResetEmailSentMessage();
    } else if (registrationSuccess) {
      return renderRegistrationSuccessMessage();
    } else if (isLogin) {
      return renderLoginForm();
    } else {
      return renderRegisterForm();
    }
  };

  // Form di login
  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="auth-form">
      <div className="form-group">
        <label htmlFor="email">{t('email')}</label>
        <div className="input-field">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'error' : ''}
            placeholder={t('enterEmail')}
          />
        </div>
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">{t('password')}</label>
        <div className="input-field">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? 'error' : ''}
            placeholder={t('enterPassword')}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.password && <div className="error-message">{errors.password}</div>}
      </div>
      
      <div className="form-group form-inline">
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe" className="checkbox-label">{t('rememberMe')}</label>
        </div>
        
        <button
          type="button"
          className="forgot-password-link"
          onClick={() => {
            setShowForgotPassword(true);
            setAuthError(null);
          }}
        >
          {t('forgotPassword')}
        </button>
      </div>
      
      {authError && (
        <div className="error-box">
          <span>⚠</span>
          <p>
            {authError.message === 'Email o password non valide' 
              ? t('invalidCredentials') 
              : authError.message}
          </p>
          {authError.message.includes('Email non verificata') && (
            <button
              type="button"
              className="resend-verification-link"
              onClick={handleResendVerification}
            >
              {t('resendVerificationEmail')}
            </button>
          )}
        </div>
      )}
      
      <button
        type="submit"
        className="auth-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('loggingIn') : t('login')}
      </button>
      
      <div className="auth-footer">
        <p>{t('noAccount')}</p>
        <button
          type="button"
          className="auth-toggle-button"
          onClick={toggleForm}
        >
          {t('createAccount')}
        </button>
      </div>
    </form>
  );

  // Form di registrazione
  const renderRegisterForm = () => (
    <form onSubmit={handleRegister} className="auth-form">
      <div className="form-group">
        <label htmlFor="name">{t('name')}</label>
        <div className="input-field">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? 'error' : ''}
            placeholder={t('enterName')}
          />
        </div>
        {errors.name && <div className="error-message">{errors.name}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="email">{t('email')}</label>
        <div className="input-field">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'error' : ''}
            placeholder={t('enterEmail')}
          />
        </div>
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">{t('password')}</label>
        <div className="input-field">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? 'error' : ''}
            placeholder={t('enterPassword')}
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.password && <div className="error-message">{errors.password}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
        <div className="input-field">
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.confirmPassword ? 'error' : ''}
            placeholder={t('confirmPassword')}
          />
        </div>
        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
      </div>
      
      {authError && (
        <div className="error-box">
          <span>⚠</span>
          <p>{authError.message}</p>
        </div>
      )}
      
      <button
        type="submit"
        className="auth-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('registering') : t('register')}
      </button>
      
      <div className="auth-footer">
        <p>{t('alreadyAccount')}</p>
        <button
          type="button"
          className="auth-toggle-button"
          onClick={toggleForm}
        >
          {t('login')}
        </button>
      </div>
    </form>
  );

  // Form di recupero password
  const renderForgotPasswordForm = () => (
    <div className="auth-form">
      <div className="auth-form-header">
        <h2>{t('forgotPassword')}</h2>
        <p>{t('forgotPasswordInstructions')}</p>
      </div>
      
      <form onSubmit={handleForgotPassword}>
        <div className="form-group">
          <label htmlFor="email">{t('email')}</label>
          <div className="input-field">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder={t('enterEmail')}
            />
          </div>
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
        
        {authError && (
          <div className="error-box">
            <span>⚠</span>
            <p>{authError.message}</p>
          </div>
        )}
        
        <button
          type="submit"
          className="auth-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('sending') : t('sendResetLink')}
        </button>
        
        <div className="auth-footer">
          <button
            type="button"
            className="back-to-login-link"
            onClick={() => {
              setShowForgotPassword(false);
              setAuthError(null);
            }}
          >
            ← {t('backToLogin')}
          </button>
        </div>
      </form>
    </div>
  );

  // Messaggio di email inviata per recupero password
  const renderResetEmailSentMessage = () => (
    <div className="auth-form">
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h2>{t('resetLinkSent')}</h2>
        <p>{t('resetLinkInstructions')}</p>
        <button
          type="button"
          className="auth-button"
          onClick={() => {
            setShowForgotPassword(false);
            setResetEmailSent(false);
            setAuthError(null);
          }}
        >
          {t('backToLogin')}
        </button>
      </div>
    </div>
  );

  // Messaggio di email di verifica inviata
  const renderVerificationSentMessage = () => (
    <div className="auth-form">
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h2>{t('verificationLinkSent')}</h2>
        <p>{t('verificationLinkInstructions')}</p>
        <button
          type="button"
          className="auth-button"
          onClick={() => {
            setVerificationEmailSent(false);
            setAuthError(null);
          }}
        >
          {t('backToLogin')}
        </button>
      </div>
    </div>
  );

  // Messaggio di registrazione completata
  const renderRegistrationSuccessMessage = () => (
    <div className="auth-form">
      <div className="success-message">
        <div className="success-icon">✓</div>
        <h2>{t('registrationSuccess')}</h2>
        <p>{t('registrationSuccessInstructions')}</p>
        <button
          type="button"
          className="auth-button"
          onClick={() => {
            setIsLogin(true);
            setRegistrationSuccess(false);
          }}
        >
          {t('continueToLogin')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-brand">
          <img src="/logo-light.svg" alt="Salus Logo" className="auth-logo" />
          <h1>{t('appTitle', 'Salus')}</h1>
          <p>{t('appDescription', 'Monitora la tua salute in modo semplice e intuitivo')}</p>
        </div>
        
        <div className="auth-features">
          <h2>{t('appFeatures', 'Funzionalità')}</h2>
          
          <div className="feature-item">
            <div className="feature-icon">
              <HeartPulseIcon />
            </div>
            <div className="feature-text">
              <h3>{t('symptomTracking', 'Tracciamento sintomi')}</h3>
              <p>{t('symptomTrackingDesc', 'Tieni traccia dei tuoi sintomi e monitora la tua salute')}</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <MedicationIcon />
            </div>
            <div className="feature-text">
              <h3>{t('medicationManagement', 'Gestione farmaci')}</h3>
              <p>{t('medicationManagementDesc', 'Gestisci i tuoi farmaci e ricevi promemoria')}</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <AIIcon />
            </div>
            <div className="feature-text">
              <h3>{t('aiAssistant', 'Assistente IA')}</h3>
              <p>{t('aiAssistantDesc', 'Ricevi consigli personalizzati basati sui tuoi dati')}</p>
            </div>
          </div>
        </div>
        
        <div className="language-selector">
          <label htmlFor="language-selector">{t('language', 'Lingua')}:</label>
          <select
            id="language-selector"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="it">{t('italian', 'Italiano')}</option>
            <option value="en">{t('english', 'Inglese')}</option>
            <option value="hi">{t('hindi', 'Hindi')}</option>
          </select>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-header">
            <h2>{isLogin ? t('login', 'Accedi') : t('createAccount', 'Crea account')}</h2>
            <p>{isLogin ? t('loginToAccount', 'Accedi al tuo account') : t('fillDetails', 'Compila i dettagli per registrarti')}</p>
          </div>
          
          {message.text && (
            <div className={`message-box ${message.type}`}>
              <span>{message.type === 'success' ? '✓' : message.type === 'warning' ? '⚠' : '⚠'}</span>
              <div>{message.text}</div>
            </div>
          )}
          
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default Auth; 