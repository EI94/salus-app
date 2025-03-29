import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';
import { UserContext } from '../context/UserContext';
import { apiUrl } from '../api';

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
  // Inizializzazione hooks
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  
  // Stati per il form
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Default a true per migliore UX
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [authInProgress, setAuthInProgress] = useState(false);
  
  // Controllo token esistente al caricamento
  useEffect(() => {
    try {
      if (userContext && userContext.isAuthenticated()) {
        console.log('Utente già autenticato, reindirizzamento alla dashboard');
        navigate('/dashboard');
      } else {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Token trovato, verifica autenticazione');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.log('Errore durante verifica autenticazione:', error);
    }
  }, [navigate, userContext]);

  // Validazione form avanzata
  const validateForm = () => {
    const newErrors = {};
    
    // Validazione email
    if (!email) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Inserisci un indirizzo email valido';
    }
    
    // Validazione password
    if (!password) {
      newErrors.password = 'La password è obbligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La password deve contenere almeno 6 caratteri';
    }
    
    // Validazione conferma password (solo per registrazione)
    if (!isLogin) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Conferma la tua password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Le password non corrispondono';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestione invio form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (authInProgress) {
      console.log('Autenticazione già in corso, ignoro invio form');
      return;
    }
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    setAuthInProgress(true);
    
    try {
      let result;
      
      if (isLogin) {
        // Login tramite context
        if (userContext && userContext.login) {
          console.log('Tentativo login tramite UserContext');
          result = await userContext.login(email, password, rememberMe);
        } else {
          console.log('UserContext non disponibile, fallback a chiamata diretta');
          // Fallback se il context non è disponibile
          const response = await axios.post(`${apiUrl}/api/auth/login`, {
            email,
            password
          });
          
          const { token, user } = response.data;
          
          // Salva token e dati utente
          if (rememberMe) {
            localStorage.setItem('token', token);
          } else {
            sessionStorage.setItem('token', token);
          }
          
          // Salva i dati utente nel localStorage per persistenza
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          result = { success: true };
        }
      } else {
        // Registrazione tramite context
        if (userContext && userContext.register) {
          console.log('Tentativo registrazione tramite UserContext');
          result = await userContext.register(email, password);
        } else {
          console.log('UserContext non disponibile, fallback a chiamata diretta');
          // Fallback se il context non è disponibile
          const response = await axios.post(`${apiUrl}/api/auth/register`, {
            email,
            password
          });
          
          const { token, user } = response.data;
          
          // Salva token e dati utente
          localStorage.setItem('token', token);
          
          // Salva i dati utente nel localStorage per persistenza
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          result = { success: true };
        }
      }
      
      if (result && result.success) {
        console.log('Autenticazione completata con successo');
        
        setMessage({
          type: 'success',
          text: isLogin ? 'Accesso effettuato con successo!' : 'Registrazione completata con successo!'
        });
        
        // Reindirizza dopo un breve ritardo
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else if (result && result.error) {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      
      // Ottieni un messaggio di errore user-friendly
      const errorMessage = getErrorMessage(error);
      
      // Solo se abbiamo un messaggio di errore lo mostriamo all'utente
      if (errorMessage) {
        setMessage({
          type: 'error',
          text: errorMessage
        });
      }
      
      // Gestione speciale per alcuni errori
      if (error.response?.status === 401) {
        setErrors({ password: 'Password errata' });
      } else if (error.response?.status === 404) {
        setErrors({ email: 'Email non trovata' });
      } else if (error.response?.status === 409) {
        setErrors({ email: 'Email già registrata' });
        // Suggerisci di effettuare il login
        setMessage({
          type: 'error',
          text: 'Questo indirizzo email è già registrato. Vuoi accedere?'
        });
        // Aggiungi un pulsante di switch al login
        setTimeout(() => {
          if (!isLogin) setIsLogin(true);
        }, 2000);
      }
      
    } finally {
      setLoading(false);
      setAuthInProgress(false);
    }
  };

  // Login con Google
  const handleGoogleLogin = () => {
    alert('Funzionalità in fase di sviluppo');
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
              La piattaforma che rivoluziona il modo di prendersi cura di sé, con strumenti avanzati per monitorare la tua salute in modo semplice ed efficace.
            </p>
          </div>
          
          <div className="brand-features">
            <h2>Funzionalità principali</h2>
            
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-title">
                  <HeartPulseIcon />
                  <span>Traccia i tuoi sintomi</span>
                </div>
                <p className="feature-description">Monitora facilmente i tuoi sintomi nel tempo e ottieni analisi dettagliate sul tuo stato di salute.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-title">
                  <MedicationIcon />
                  <span>Gestisci i farmaci</span>
                </div>
                <p className="feature-description">Tieni traccia dei tuoi farmaci, inclusi dosaggi e orari di assunzione, con promemoria intelligenti.</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-title">
                  <AIIcon />
                  <span>Analisi intelligente</span>
                </div>
                <p className="feature-description">Algoritmi avanzati che analizzano i tuoi dati per fornirti informazioni personalizzate e utili.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sezione destra - Form di autenticazione */}
        <div className="auth-form-section">
          <div className="auth-header">
            <h2 className="auth-title">{isLogin ? 'Accedi' : 'Registrati'}</h2>
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
              <label htmlFor="email">Email</label>
              <div className="form-control">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Inserisci la tua email"
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="form-control">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci la tua password"
                  className={errors.password ? 'error' : ''}
                />
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
              {!isLogin && (
                <span className="password-hint">
                  Usa almeno 8 caratteri con lettere maiuscole, numeri e simboli
                </span>
              )}
            </div>
            
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Conferma password</label>
                <div className="form-control">
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Conferma la tua password"
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
                  <label htmlFor="rememberMe">Ricordami</label>
                </div>
                <a href="#recupero" className="forgot-password">
                  Password dimenticata?
                </a>
              </div>
            )}
            
            <button type="submit" className="submit-button" disabled={loading || authInProgress}>
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                isLogin ? 'Accedi' : 'Registrati'
              )}
            </button>
          </form>
          
          <div className="divider">
            <span>oppure</span>
          </div>
          
          <div className="social-buttons">
            <button className="social-button" onClick={handleGoogleLogin}>
              <GoogleIcon />
              <span>Continua con Google</span>
            </button>
          </div>
          
          <div className="auth-toggle">
            {isLogin ? 'Non hai un account?' : 'Hai già un account?'}
            <button type="button" onClick={toggleAuthMode}>
              {isLogin ? 'Registrati' : 'Accedi'}
            </button>
          </div>
          
          <div className="auth-footer">
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#termini">Termini di servizio</a>
              <a href="#supporto">Supporto</a>
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