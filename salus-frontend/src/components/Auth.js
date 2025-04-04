import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Componente di debug per mostrare informazioni sull'ambiente
const DebugInfo = () => {
  const [showDebug, setShowDebug] = useState(false);
  
  const debugStyle = {
    position: 'fixed',
    bottom: showDebug ? '20px' : '-1px',
    right: '20px',
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: showDebug ? '15px' : '5px',
    borderRadius: '5px',
    fontSize: '12px',
    fontFamily: 'monospace',
    zIndex: 9999,
    maxWidth: '400px',
    maxHeight: showDebug ? '400px' : '20px',
    overflow: 'auto',
    transition: 'all 0.3s ease',
    border: '1px solid #666',
    cursor: 'pointer'
  };
  
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };
  
  // Ottengo alcune informazioni utili per il debug
  const hostname = window.location.hostname;
  const fullUrl = window.location.href;
  
  // URL DIRETTO CORRETTO (dovrebbe essere usato per registrazione/login)
  const directLoginUrl = 'https://salus-backend.onrender.com/api/auth/login';
  const directRegisterUrl = 'https://salus-backend.onrender.com/api/auth/register';
  
  // URL tramite normalizePath
  const normalizedPath = normalizePath('/auth/register');
  const fullApiPath = `${apiUrl}${normalizedPath}`;
  
  // URL che causa errore 405
  const problemUrl = '/api/api/auth/register';
  
  return (
    <div style={debugStyle} onClick={toggleDebug}>
      {showDebug ? (
        <>
          <h4 style={{ margin: '0 0 8px 0' }}>Informazioni Debug</h4>
          <p style={{ margin: '2px 0' }}><strong>Hostname:</strong> {hostname}</p>
          <p style={{ margin: '2px 0' }}><strong>URL Completo:</strong> {fullUrl}</p>
          <p style={{ margin: '2px 0' }}><strong>API URL:</strong> {apiUrl}</p>
          
          <p style={{ margin: '8px 0 2px 0', color: '#ff6b6b' }}><strong>URL PROBLEMA:</strong> {problemUrl}</p>
          
          <p style={{ margin: '8px 0 2px 0', color: '#63E6BE' }}><strong>URL DIRETTI CORRETTI:</strong></p>
          <p style={{ margin: '2px 0 2px 15px', color: '#63E6BE' }}>Login: {directLoginUrl}</p>
          <p style={{ margin: '2px 0 2px 15px', color: '#63E6BE' }}>Register: {directRegisterUrl}</p>
          
          <p style={{ margin: '8px 0 2px 0' }}><strong>Percorso Normalizzato:</strong> {normalizedPath}</p>
          <p style={{ margin: '2px 0' }}><strong>URL API Completo:</strong> {fullApiPath}</p>
          
          <p style={{ margin: '8px 0 2px 0' }}><strong>Storage:</strong></p>
          <p style={{ margin: '2px 0 2px 15px' }}><strong>localStorage Token:</strong> {localStorage.getItem('token') ? '✓ Presente' : '❌ Assente'}</p>
          <p style={{ margin: '2px 0 2px 15px' }}><strong>sessionStorage Token:</strong> {sessionStorage.getItem('token') ? '✓ Presente' : '❌ Assente'}</p>
          <p style={{ margin: '2px 0' }}><strong>React App API URL:</strong> {process.env.REACT_APP_API_URL || 'Non impostato'}</p>
          <p style={{ margin: '10px 0 2px', fontStyle: 'italic' }}>Per risolvere il problema, utilizza gli URL diretti anziché quelli normalizzati</p>
          <p style={{ margin: '10px 0 2px' }}>Clicca per nascondere</p>
        </>
      ) : (
        <p style={{ margin: '2px' }}>Debug Info (clicca per espandere)</p>
      )}
    </div>
  );
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

  // Componente Auth caricato
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
      // Utilizziamo il metodo register dal context utente
      const response = await userContext.register(email, password, name);
      
      if (response.success) {
        setRegistrationSuccess(true);
        setMessage({
          type: 'success',
          text: t('registrationSuccess')
        });
        
        // Verifichiamo subito se l'utente è stato impostato
        if (userContext.user) {
          console.log("Utente registrato con successo:", userContext.user);
        } else {
          console.log("Utente non disponibile dopo registrazione");
        }
      } else {
        setAuthError(new Error(response.error || t('registrationError')));
      }
    } catch (error) {
      setAuthError(error);
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
      
      // URL DIRETTO HARDCODED per reset password
      const DIRECT_URL = 'https://salus-backend.onrender.com/auth/forgot-password';
      console.log('URL diretto per reset password:', DIRECT_URL);
      
      // Usa fetch invece di axios per evitare problemi
      const response = await fetch(DIRECT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nella richiesta di recupero password');
      }
      
      setResetEmailSent(true);
      setMessage({
        type: 'success',
        text: t('passwordResetEmailSent')
      });
      
    } catch (error) {
      console.error('Errore recupero password:', error);
      setMessage({
        type: 'error',
        text: getErrorMessage(error) || t('passwordResetError')
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
      
      // URL DIRETTO HARDCODED per invio email di verifica
      const DIRECT_URL = 'https://salus-backend.onrender.com/auth/resend-verification';
      console.log('URL diretto per invio email di verifica:', DIRECT_URL);
      
      // Usa fetch invece di axios per evitare problemi
      const response = await fetch(DIRECT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore nella richiesta di nuovo invio email');
      }
      
      setVerificationEmailSent(true);
      setMessage({
        type: 'success',
        text: t('verificationEmailSent')
      });
      
    } catch (error) {
      console.error('Errore invio email verifica:', error);
      setMessage({
        type: 'error',
        text: getErrorMessage(error) || t('verificationEmailError')
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
      
      {/* Pulsante di login diretto per debug */}
      <button
        type="button"
        className="auth-button debug-button"
        style={{
          backgroundColor: '#2a9d8f',
          marginTop: '10px',
          fontSize: '0.8rem',
          padding: '8px 16px'
        }}
        onClick={async () => {
          if (!validateForm()) return;
          
          setIsSubmitting(true);
          setAuthError(null);
          
          try {
            console.log('Tentativo login diretto con fetch');
            const DIRECT_URL = 'https://salus-backend.onrender.com/auth/login';
            console.log('URL diretto:', DIRECT_URL);
            
            const response = await fetch(DIRECT_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                email,
                password
              })
            });
            
            console.log('Risposta login STATUS:', response.status);
            console.log('Risposta login OK:', response.ok);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Risposta errore server:', errorText);
              throw new Error(`Errore server: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Risposta JSON:', data);
            
            if (data && data.token) {
              // Salva token in base alla scelta "remember me"
              if (rememberMe) {
                localStorage.setItem('token', data.token);
              } else {
                sessionStorage.setItem('token', data.token);
              }
              
              // Aggiorna contesto utente
              userContext.setUser(data.user);
              
              // Redirige alla dashboard
              navigate('/dashboard', { replace: true });
            } else {
              throw new Error('Risposta dal server non valida');
            }
          } catch (error) {
            console.error('Errore login diretto:', error);
            setAuthError(error);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        Login Diretto (Debug)
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
      
      <div className="form-group">
        <label htmlFor="language">{t('language')}</label>
        <div className="input-field">
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="it">{t('italian')}</option>
            <option value="en">{t('english')}</option>
            <option value="hi">{t('hindi')}</option>
          </select>
        </div>
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
      
      {/* Pulsante di registrazione diretta per debug */}
      <button
        type="button"
        className="auth-button debug-button"
        style={{
          backgroundColor: '#2a9d8f',
          marginTop: '10px',
          fontSize: '0.8rem',
          padding: '8px 16px'
        }}
        onClick={async () => {
          if (!validateForm()) return;
          
          setIsSubmitting(true);
          setAuthError(null);
          
          try {
            console.log('Tentativo registrazione diretta con fetch');
            const DIRECT_URL = 'https://salus-backend.onrender.com/auth/register';
            console.log('URL diretto:', DIRECT_URL);
            
            const response = await fetch(DIRECT_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                email,
                password,
                name
              })
            });
            
            console.log('Risposta registrazione STATUS:', response.status);
            console.log('Risposta registrazione OK:', response.ok);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Risposta errore server:', errorText);
              throw new Error(`Errore server: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Risposta JSON:', data);
            
            if (data && data.token) {
              // Salva token
              localStorage.setItem('token', data.token);
              // Aggiorna contesto utente
              userContext.setUser(data.user);
              
              setRegistrationSuccess(true);
              setMessage({
                type: 'success',
                text: t('registrationSuccess')
              });
            } else {
              throw new Error('Risposta dal server non valida');
            }
          } catch (error) {
            console.error('Errore registrazione diretta:', error);
            setAuthError(error);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        Registrazione Diretta (Debug)
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
      <DebugInfo />
      <div className="auth-left">
        <div className="auth-brand">
          <img src="/assets/images/logo.svg" alt="Salus Logo" className="auth-logo" />
          <h1>{t('appTitle')}</h1>
          <p>{t('appDescription')}</p>
        </div>
        
        <div className="auth-features">
          <h2>{t('appFeatures')}</h2>
          
          <div className="feature-item">
            <div className="feature-icon">
              <HeartPulseIcon />
            </div>
            <div className="feature-text">
              <h3>{t('symptomTracking')}</h3>
              <p>{t('symptomTrackingDesc')}</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <MedicationIcon />
            </div>
            <div className="feature-text">
              <h3>{t('medicationManagement')}</h3>
              <p>{t('medicationManagementDesc')}</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <AIIcon />
            </div>
            <div className="feature-text">
              <h3>{t('aiAssistant')}</h3>
              <p>{t('aiAssistantDesc')}</p>
            </div>
          </div>
        </div>
        
        <div className="language-selector">
          <label htmlFor="language-selector">{t('language')}:</label>
          <select
            id="language-selector"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="it">{t('italian')}</option>
            <option value="en">{t('english')}</option>
            <option value="hi">{t('hindi')}</option>
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