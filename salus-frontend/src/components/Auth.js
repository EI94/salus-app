import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/Auth.css';

function Auth({ onLogin, mockAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authService, setAuthService] = useState(null);
  const { t, i18n } = useTranslation();

  // Funzione per cambiare la lingua
  const handleLanguageChange = async (e) => {
    const newLanguage = e.target.value;
    await i18n.changeLanguage(newLanguage);
    
    // Aggiorna la lingua nel backend se l'utente è autenticato
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await fetch('http://localhost:5000/api/users/language', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(token).token}`
          },
          body: JSON.stringify({ language: newLanguage })
        });
      } catch (error) {
        console.error('Errore durante l\'aggiornamento della lingua:', error);
      }
    }
  };

  // Funzione per validare l'email
  const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Servizio di autenticazione locale
  const localAuthService = {
    login: async (email, password) => {
      console.log('Tentativo di login con:', { email, password });
      
      // Simula un'attesa per l'API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        // Ricerca utente registrato nel localStorage
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const user = users.find(u => u.email === email);
        
        if (!user) {
          throw new Error(t('userNotFound'));
        }
        
        if (user.password !== password) {
          throw new Error(t('invalidPassword'));
        }
        
        // Crea token JWT simulato con scadenza
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 ore
        
        const token = {
          token: `user-${user.id}-${now.getTime()}`,
          expires: expiryDate.toISOString()
        };
        
        // Salva nel localStorage i dati correnti di autenticazione
        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          language: user.language || i18n.language,
          authenticated: true,
          lastLogin: new Date().toISOString()
        }));
        
        localStorage.setItem('authToken', JSON.stringify(token));
        
        return { 
          success: true, 
          userData: { 
            id: user.id, 
            name: user.name,
            email: user.email,
            language: user.language || i18n.language
          }, 
          token: token.token
        };
      } catch (error) {
        console.error('Errore login:', error);
        throw error;
      }
    },
    
    register: async (name, email, password) => {
      console.log('Tentativo di registrazione con:', { name, email, password });
      
      // Simula un'attesa per l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Verifica se l'utente esiste già
        const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        if (users.some(u => u.email === email)) {
          throw new Error(t('emailAlreadyRegistered'));
        }
        
        // Crea nuovo utente
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = { 
          id: userId, 
          name, 
          email, 
          password,
          language: i18n.language, // Salva la lingua selezionata
          registrationDate: new Date().toISOString()
        };
        
        // Salva l'utente nel localStorage
        users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // Inizializza i dati dell'utente
        localStorage.setItem(`userData_${userId}`, JSON.stringify({
          name,
          email,
          language: i18n.language,
          createdAt: new Date().toISOString()
        }));
        
        // Crea token JWT simulato
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 ore
        
        const token = {
          token: `user-${userId}-${now.getTime()}`,
          expires: expiryDate.toISOString()
        };
        
        // Salva nel localStorage i dati correnti di autenticazione
        localStorage.setItem('currentUser', JSON.stringify({
          id: userId,
          name,
          email,
          language: i18n.language, // Usa la lingua selezionata
          authenticated: true,
          lastLogin: new Date().toISOString()
        }));
        
        localStorage.setItem('authToken', JSON.stringify(token));
        
        return { 
          success: true, 
          userData: { 
            id: userId, 
            name,
            email,
            language: i18n.language
          }, 
          token: token.token
        };
      } catch (error) {
        console.error('Errore registrazione:', error);
        throw error;
      }
    },
    
    // Funzione per verificare validità del token
    verifyToken: () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        if (!storedToken) return false;
        
        const token = JSON.parse(storedToken);
        const now = new Date();
        const expiryDate = new Date(token.expires);
        
        return now < expiryDate;
      } catch (error) {
        console.error('Errore nella verifica del token:', error);
        return false;
      }
    },
    
    // Funzione per recuperare utente attualmente autenticato
    getCurrentUser: () => {
      try {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return null;
        
        return JSON.parse(currentUser);
      } catch (error) {
        console.error('Errore nel recupero dell\'utente corrente:', error);
        return null;
      }
    }
  };

  // Inizializza il servizio di autenticazione
  useEffect(() => {
    // Utilizza l'authService fornito o il nostro servizio locale
    setAuthService(mockAuth || localAuthService);
  }, [mockAuth]);

  // Verifica se esiste già una sessione attiva
  useEffect(() => {
    if (!authService) return; // Evita l'esecuzione se authService non è ancora inizializzato
    
    const checkExistingAuth = () => {
      try {
        if (localAuthService.verifyToken()) {
          const currentUser = localAuthService.getCurrentUser();
          if (currentUser && currentUser.authenticated) {
            // Se esiste un token valido, effettua il login automatico
            onLogin(currentUser, JSON.parse(localStorage.getItem('authToken')).token);
          }
        }
      } catch (error) {
        console.error('Errore durante la verifica dell\'autenticazione:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    };
    
    checkExistingAuth();
  }, [authService, onLogin]);

  // Gestione del form di registrazione
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validazione dei dati base
    if (!name || !email || !password || !confirmPassword) {
      setError(t('allFieldsRequired'));
      return;
    }
    
    if (!isValidEmail(email)) {
      setError(t('emailFormatError'));
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }
    
    if (password.length < 6) {
      setError(t('passwordLengthError'));
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.register(name, email, password);
      console.log('Registrazione completata:', response);
      
      if (response && response.success) {
        // Mostra messaggio di successo
        setError('');
        
        // Registrazione riuscita, effettua login automatico
        handleLoginAfterRegistration(response.userData, response.token);
      } else {
        throw new Error(t('genericError'));
      }
    } catch (error) {
      console.log('Errore durante la registrazione:', error);
      setError(error.message || t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  // Gestione del login automatico dopo la registrazione
  const handleLoginAfterRegistration = (userData, token) => {
    // Dopo la registrazione, effettua automaticamente il login
    if (onLogin && typeof onLogin === 'function') {
      onLogin(userData, token);
    } else {
      setError('Impossibile effettuare il login automatico dopo la registrazione');
    }
  };

  // Gestione del form di login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validazione dei dati base
    if (!email || !password) {
      setError(t('emailPasswordRequired'));
      return;
    }
    
    if (!isValidEmail(email)) {
      setError(t('emailFormatError'));
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.login(email, password);
      console.log('Login completato:', response);
      
      if (response && response.success && response.userData && response.token) {
        // Login riuscito
        setError('');
        
        if (onLogin && typeof onLogin === 'function') {
          onLogin(response.userData, response.token);
        } else {
          throw new Error('Callback onLogin non disponibile');
        }
      } else {
        throw new Error(t('genericError'));
      }
    } catch (error) {
      console.log('Errore durante il login:', error);
      setError(error.message || t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  // Cambio tra login e registrazione
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/assets/icons/logo.svg" alt="Salus" className="auth-logo" />
          <h1>{t('appTitle')}</h1>
          <p className="app-description">
            {t('appDescription')}
          </p>
        </div>
        
        <div className="language-selector">
          <label>{t('languageSelector')}</label>
          <select value={i18n.language} onChange={handleLanguageChange}>
            <option value="it">{t('italian')}</option>
            <option value="en">{t('english')}</option>
            <option value="hi">{t('hindi')}</option>
          </select>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            {t('login')}
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            {t('register')}
          </button>
        </div>
        
        {isLogin ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">{t('email')}</label>
              <input 
                type="email" 
                id="login-email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="login-password">{t('password')}</label>
              <input 
                type="password" 
                id="login-password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                disabled={loading}
              />
            </div>
            
            <div className="form-action">
              <a href="#forgot-password" className="forgot-password">
                {t('forgotPassword')}
              </a>
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? t('loginLoading') : t('loginBtn')}
            </button>
            
            <div className="auth-toggle">
              {t('noAccount')} <button type="button" onClick={toggleAuthMode}>{t('register')}</button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="register-name">{t('name')}</label>
              <input 
                type="text" 
                id="register-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="register-email">{t('email')}</label>
              <input 
                type="email" 
                id="register-email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="register-password">{t('password')}</label>
              <input
                type="password"
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm-password">{t('confirmPassword')}</label>
              <input
                type="password"
                id="register-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('confirmPasswordPlaceholder')}
                disabled={loading}
              />
            </div>

            <div className="form-terms">
              <input
                type="checkbox"
                id="terms"
                required
                disabled={loading}
              />
              <label htmlFor="terms">
                {t('termsText')} <a href="#terms">{t('termsLink')}</a> {t('privacyText')} <a href="#privacy">{t('privacyLink')}</a>
              </label>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? t('registerLoading') : t('registerBtn')}
            </button>

            <div className="auth-toggle">
              {t('haveAccount')} <button type="button" onClick={toggleAuthMode}>{t('login')}</button>
            </div>
          </form>
        )}
      </div>

      <div className="auth-features">
        <div className="features-header">
          <h2>{t('featuresTitle')}</h2>
          <p>{t('featuresDescription')}</p>
        </div>

        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h3>{t('featureSymptoms')}</h3>
            <p>{t('featureSymptomsDesc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-pills"></i>
            </div>
            <h3>{t('featureMedications')}</h3>
            <p>{t('featureMedicationsDesc')}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>{t('featureAI')}</h3>
            <p>{t('featureAIDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth; 