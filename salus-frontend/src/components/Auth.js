import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';
import { UserContext } from '../context/UserContext';
import { apiUrl } from '../api';
import { useTranslation } from 'react-i18next';

// Icone in formato SVG
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

// Funzione per tradurre i codici di errore in messaggi user-friendly
const getErrorMessage = (error) => {
  console.log('Tipo errore:', error);
  
  // Caso errore 405 (Method Not Allowed)
  if (error.response && error.response.status === 405) {
    // Non mostriamo errore all'utente per errori 405 poiché usiamo la modalità offline
    return null;
  }
  
  // Estrai il codice di errore o messaggio dalla risposta
  const errorCode = error?.response?.data?.error?.code || 
                    error?.response?.data?.code ||
                    error?.code || 
                    'default';
  
  // Check se l'errore contiene un messaggio personalizzato dal server
  const serverMessage = error?.response?.data?.message;
  
  // Check per errori di utente già esistente nella registrazione
  if (serverMessage && serverMessage.includes('già registrato')) {
    return 'Questo indirizzo email è già registrato. Prova ad accedere.';
  }
  
  // Check per errori di credenziali errate nel login
  if (serverMessage && serverMessage.includes('credenziali')) {
    return 'Email o password errata. Riprova.';
  }
  
  // Se error.message contiene qualcosa di utile
  if (error.message && !error.message.includes('Error') && !error.message.includes('fail')) {
    return error.message;
  }
  
  // Altrimenti usa la nostra mappa di errori
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES['default'];
};

const Auth = () => {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState(i18n.language);
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [authInProgress, setAuthInProgress] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Stati per il form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Componente Auth caricato
  useEffect(() => {
    console.log("Componente Auth caricato");
    return () => {};
  }, [userContext]);

  // Validazione form avanzata
  const validateForm = () => {
    const newErrors = {};
    
    // Validazione email
    if (!email) {
      newErrors.email = t('emailRequired');
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = t('invalidEmail');
    }
    
    // Validazione password
    if (!password) {
      newErrors.password = t('passwordRequired');
    } else if (!isLogin && password.length < 8) {
      newErrors.password = t('passwordMinLength');
    }
    
    // Validazione aggiuntiva per registrazione
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
    
    try {
      console.log('Tentativo login tramite UserContext');
      const response = await userContext.login(email, password, rememberMe);
      
      if (response.success) {
        console.log('Autenticazione completata con successo');
        // Il reindirizzamento alla dashboard è gestito dal router
      } else if (response.needsVerification) {
        setMessage({
          type: 'warning',
          text: t('emailNotVerified')
        });
        setVerificationEmailSent(false);
      } else {
        const errorMessage = response.error || t('loginError');
        setAuthError(new Error(errorMessage));
        console.log('Auth error:', new Error(errorMessage));
      }
    } catch (error) {
      setAuthError(error);
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
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          language
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRegistrationSuccess(true);
        setMessage({
          type: 'success',
          text: t('registrationSuccess')
        });
        
        // Salviamo il token ricevuto
        if (data.token) {
          if (rememberMe) {
            localStorage.setItem('token', data.token);
          } else {
            sessionStorage.setItem('token', data.token);
          }
          
          // Salviamo i dati utente ricevuti
          if (data.user) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            // Aggiorniamo il contesto utente
            // Questo non è necessario se l'utente deve verificare l'email prima
            // userContext.updateUserData(data.user);
          }
        }
      } else {
        setAuthError(new Error(data.message || t('registrationError')));
      }
    } catch (error) {
      setAuthError(error);
      console.log('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestione richiesta reset password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Validazione email
    if (!email) {
      setErrors({ email: t('emailRequired') });
      return;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setErrors({ email: t('invalidEmail') });
      return;
    }
    
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResetEmailSent(true);
        setMessage({
          type: 'success',
          text: t('resetEmailSent')
        });
      } else {
        setAuthError(new Error(data.message || t('resetRequestError')));
      }
    } catch (error) {
      setAuthError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestione richiesta nuovo link di verifica
  const handleResendVerification = async (e) => {
    e.preventDefault();
    
    // Validazione email
    if (!email) {
      setErrors({ email: t('emailRequired') });
      return;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setErrors({ email: t('invalidEmail') });
      return;
    }
    
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      const response = await fetch(`${apiUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setVerificationEmailSent(true);
        setMessage({
          type: 'success',
          text: t('verificationEmailSent')
        });
      } else {
        setAuthError(new Error(data.message || t('verificationRequestError')));
      }
    } catch (error) {
      setAuthError(error);
    } finally {
      setIsSubmitting(false);
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
        <div className="input-with-icon">
          <i className="fas fa-envelope"></i>
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
        <div className="input-with-icon">
          <i className="fas fa-lock"></i>
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
            <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
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
          <i className="fas fa-exclamation-circle"></i>
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
        {isSubmitting ? (
          <span><i className="fas fa-spinner fa-spin"></i> {t('loggingIn')}</span>
        ) : (
          t('login')
        )}
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
        <div className="input-with-icon">
          <i className="fas fa-user"></i>
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
        <div className="input-with-icon">
          <i className="fas fa-envelope"></i>
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
        <div className="input-with-icon">
          <i className="fas fa-lock"></i>
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
            <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {errors.password && <div className="error-message">{errors.password}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
        <div className="input-with-icon">
          <i className="fas fa-lock"></i>
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
      
      <div className="form-group">
        <label htmlFor="language">{t('language')}</label>
        <div className="input-with-icon">
          <i className="fas fa-globe"></i>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="italian">Italiano</option>
            <option value="english">English</option>
            <option value="spanish">Español</option>
            <option value="french">Français</option>
            <option value="german">Deutsch</option>
          </select>
        </div>
      </div>
      
      {authError && (
        <div className="error-box">
          <i className="fas fa-exclamation-circle"></i>
          <p>{authError.message}</p>
        </div>
      )}
      
      <button
        type="submit"
        className="auth-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span><i className="fas fa-spinner fa-spin"></i> {t('registering')}</span>
        ) : (
          t('register')
        )}
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
          <div className="input-with-icon">
            <i className="fas fa-envelope"></i>
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
            <i className="fas fa-exclamation-circle"></i>
            <p>{authError.message}</p>
          </div>
        )}
        
        <button
          type="submit"
          className="auth-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span><i className="fas fa-spinner fa-spin"></i> {t('sending')}</span>
          ) : (
            t('sendResetLink')
          )}
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
            <i className="fas fa-arrow-left"></i> {t('backToLogin')}
          </button>
        </div>
      </form>
    </div>
  );

  // Messaggio di email inviata per recupero password
  const renderResetEmailSentMessage = () => (
    <div className="auth-form">
      <div className="success-message">
        <i className="fas fa-check-circle"></i>
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
        <i className="fas fa-check-circle"></i>
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
        <i className="fas fa-check-circle"></i>
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
          <img src="/assets/images/logo.svg" alt="Salus" className="auth-logo" />
          <h1>Salus</h1>
        </div>
        
        <div className="auth-features">
          <h2>{t('appFeatures')}</h2>
          
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-heartbeat"></i>
            </div>
            <div className="feature-text">
              <h3>{t('symptomTracking')}</h3>
              <p>{t('symptomTrackingDesc')}</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-pills"></i>
            </div>
            <div className="feature-text">
              <h3>{t('medicationManagement')}</h3>
              <p>{t('medicationManagementDesc')}</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-brain"></i>
            </div>
            <div className="feature-text">
              <h3>{t('aiAssistant')}</h3>
              <p>{t('aiAssistantDesc')}</p>
            </div>
          </div>
        </div>
        
        <div className="language-selector">
          <label htmlFor="language-select">{t('language')}: </label>
          <select 
            id="language-select" 
            value={language} 
            onChange={handleLanguageChange}
          >
            <option value="italian">Italiano</option>
            <option value="english">English</option>
            <option value="spanish">Español</option>
            <option value="french">Français</option>
            <option value="german">Deutsch</option>
          </select>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-header">
            <h2>{isLogin ? t('login') : t('createAccount')}</h2>
            <p>{isLogin ? t('loginToAccount') : t('fillDetails')}</p>
          </div>
          
          {message.text && (
            <div className={`message-box ${message.type}`}>
              <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
              <p>{message.text}</p>
            </div>
          )}
          
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default Auth; 