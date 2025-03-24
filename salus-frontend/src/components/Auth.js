import React, { useState, useEffect } from 'react';
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
  const [language, setLanguage] = useState(localStorage.getItem('userLanguage') || 'italian');

  // Traduzione dei testi in base alla lingua selezionata
  const translations = {
    italian: {
      login: "Accedi",
      register: "Registrati",
      emailPlaceholder: "La tua email",
      passwordPlaceholder: "La tua password",
      namePlaceholder: "Il tuo nome",
      confirmPasswordPlaceholder: "Conferma la password",
      forgotPassword: "Password dimenticata?",
      noAccount: "Non hai un account?",
      haveAccount: "Hai già un account?",
      loginBtn: "Accedi",
      registerBtn: "Registrati",
      loginLoading: "Accesso in corso...",
      registerLoading: "Registrazione in corso...",
      termsText: "Accetto i",
      termsLink: "Termini di Servizio",
      privacyText: "e la",
      privacyLink: "Privacy Policy",
      languageSelector: "Lingua:",
      italian: "Italiano",
      english: "Inglese",
      hindi: "Hindi",
      allFieldsRequired: "Tutti i campi sono obbligatori",
      passwordMismatch: "Le password non corrispondono",
      passwordLengthError: "La password deve essere lunga almeno 6 caratteri",
      emailPasswordRequired: "Email e password sono obbligatori",
      emailFormatError: "Inserisci un indirizzo email valido",
      userNotFound: "Utente non trovato. Controlla l'email o registrati",
      invalidPassword: "Password non valida. Riprova",
      emailAlreadyRegistered: "Email già registrata. Prova ad accedere",
      registrationSuccess: "Registrazione completata con successo!",
      loginSuccess: "Login effettuato con successo!",
      genericError: "Si è verificato un errore. Riprova più tardi",
      appTitle: "Salus",
      appDescription: "La tua piattaforma personale per il monitoraggio della salute",
      featuresTitle: "Funzionalità principali",
      featuresDescription: "Salus ti aiuta a monitorare e gestire la tua salute in modo semplice ed efficace",
      featureSymptoms: "Monitoraggio sintomi",
      featureSymptomsDesc: "Tieni traccia dei tuoi sintomi nel tempo e visualizza l'andamento",
      featureMedications: "Gestione farmaci",
      featureMedicationsDesc: "Organizza e ricorda i tuoi farmaci con notifiche personalizzate",
      featureAI: "Assistente IA",
      featureAIDesc: "Ricevi consigli personalizzati basati sui tuoi dati di salute"
    },
    english: {
      login: "Login",
      register: "Sign Up",
      emailPlaceholder: "Your email",
      passwordPlaceholder: "Your password",
      namePlaceholder: "Your name",
      confirmPasswordPlaceholder: "Confirm password",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      loginBtn: "Login",
      registerBtn: "Sign Up",
      loginLoading: "Logging in...",
      registerLoading: "Signing up...",
      termsText: "I accept the",
      termsLink: "Terms of Service",
      privacyText: "and",
      privacyLink: "Privacy Policy",
      languageSelector: "Language:",
      italian: "Italian",
      english: "English",
      hindi: "Hindi",
      allFieldsRequired: "All fields are required",
      passwordMismatch: "Passwords do not match",
      passwordLengthError: "Password must be at least 6 characters long",
      emailPasswordRequired: "Email and password are required",
      emailFormatError: "Please enter a valid email address",
      userNotFound: "User not found. Check your email or sign up",
      invalidPassword: "Invalid password. Please try again",
      emailAlreadyRegistered: "Email already registered. Try logging in instead",
      registrationSuccess: "Registration completed successfully!",
      loginSuccess: "Login successful!",
      genericError: "An error occurred. Please try again later",
      appTitle: "Salus",
      appDescription: "Your personal health monitoring platform",
      featuresTitle: "Main Features",
      featuresDescription: "Salus helps you monitor and manage your health simply and effectively",
      featureSymptoms: "Symptom Monitoring",
      featureSymptomsDesc: "Track your symptoms over time and visualize trends",
      featureMedications: "Medication Management",
      featureMedicationsDesc: "Organize and remember your medications with custom notifications",
      featureAI: "AI Assistant",
      featureAIDesc: "Receive personalized advice based on your health data"
    },
    hindi: {
      login: "लॉग इन करें",
      register: "साइन अप करें",
      emailPlaceholder: "आपका ईमेल",
      passwordPlaceholder: "आपका पासवर्ड",
      namePlaceholder: "आपका नाम",
      confirmPasswordPlaceholder: "पासवर्ड की पुष्टि करें",
      forgotPassword: "पासवर्ड भूल गए?",
      noAccount: "खाता नहीं है?",
      haveAccount: "पहले से ही खाता है?",
      loginBtn: "लॉग इन करें",
      registerBtn: "साइन अप करें",
      loginLoading: "लॉग इन हो रहा है...",
      registerLoading: "साइन अप हो रहा है...",
      termsText: "मैं स्वीकार करता हूं",
      termsLink: "सेवा की शर्तें",
      privacyText: "और",
      privacyLink: "गोपनीयता नीति",
      languageSelector: "भाषा:",
      italian: "इतालवी",
      english: "अंग्रे़ी",
      hindi: "हिंदी",
      allFieldsRequired: "सभी फ़ील्ड आवश्यक हैं",
      passwordMismatch: "पासवर्ड मेल नहीं खाते",
      passwordLengthError: "पासवर्ड कम से कम 6 अक्षर लंबा होना चाहिए",
      emailPasswordRequired: "ईमेल और पासवर्ड आवश्यक हैं",
      emailFormatError: "कृपया एक वैध ईमेल पता दर्ज करें",
      userNotFound: "उपयोगकर्ता नहीं मिला। अपना ईमेल जांचें या साइन अप करें",
      invalidPassword: "अमान्य पासवर्ड। कृपया पुन: प्रयास करें",
      emailAlreadyRegistered: "ईमेल पहले से पंजीकृत है। इसके बजाय लॉगिन करने का प्रयास करें",
      registrationSuccess: "पंजीकरण सफलतापूर्वक पूरा हुआ!",
      loginSuccess: "लॉगिन सफल!",
      genericError: "एक त्रुटि हुई। कृपया बाद में पुन: प्रयास करें",
      appTitle: "सेलस",
      appDescription: "आपका व्यक्तिगत स्वास्थ्य निगरानी प्लेटफॉर्म",
      featuresTitle: "मुख्य विशेषताएं",
      featuresDescription: "सेलस आपको अपने स्वास्थ्य की निगरानी और प्रबंधन सरल और प्रभावी ढंग से करने में मदद करता है",
      featureSymptoms: "लक्षण निगरानी",
      featureSymptomsDesc: "समय के साथ अपने लक्षणों को ट्रैक करें और रुझानों को देखें",
      featureMedications: "दवा प्रबंधन",
      featureMedicationsDesc: "कस्टम नोटिफिकेशन के साथ अपनी दवाओं को व्यवस्थित करें और याद रखें",
      featureAI: "AI सहायक",
      featureAIDesc: "अपने स्वास्थ्य डेटा के आधार पर व्यक्तिगत सलाह प्राप्त करें"
    }
  };

  const t = translations[language];

  // Funzione per cambiare la lingua
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('userLanguage', newLanguage);
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
          throw new Error(t.userNotFound);
        }
        
        if (user.password !== password) {
          throw new Error(t.invalidPassword);
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
          language: user.language || language,
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
            language: user.language || language
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
          throw new Error(t.emailAlreadyRegistered);
        }
        
        // Crea nuovo utente
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = { 
          id: userId, 
          name, 
          email, 
          password, // Nota: in un'app reale, la password dovrebbe essere criptata
          language,
          registrationDate: new Date().toISOString()
        };
        
        // Salva l'utente nel localStorage
        users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // Inizializza i dati dell'utente
        localStorage.setItem(`userData_${userId}`, JSON.stringify({
          name,
          email,
          language,
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
          language,
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
            language
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
      setError(t.allFieldsRequired);
      return;
    }
    
    if (!isValidEmail(email)) {
      setError(t.emailFormatError);
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }
    
    if (password.length < 6) {
      setError(t.passwordLengthError);
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
        throw new Error(t.genericError);
      }
    } catch (error) {
      console.log('Errore durante la registrazione:', error);
      setError(error.message || t.genericError);
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
      setError(t.emailPasswordRequired);
      return;
    }
    
    if (!isValidEmail(email)) {
      setError(t.emailFormatError);
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
        throw new Error(t.genericError);
      }
    } catch (error) {
      console.log('Errore durante il login:', error);
      setError(error.message || t.genericError);
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
          <h1>{t.appTitle}</h1>
          <p className="app-description">
            {t.appDescription}
          </p>
        </div>
        
        <div className="language-selector">
          <label>{t.languageSelector}</label>
          <select value={language} onChange={handleLanguageChange}>
            <option value="italian">{t.italian}</option>
            <option value="english">{t.english}</option>
            <option value="hindi">{t.hindi}</option>
          </select>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            {t.login}
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            {t.register}
          </button>
        </div>
        
        {isLogin ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input 
                type="email" 
                id="login-email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input 
                type="password" 
                id="login-password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                disabled={loading}
              />
            </div>
            
            <div className="form-action">
              <a href="#forgot-password" className="forgot-password">
                {t.forgotPassword}
              </a>
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? t.loginLoading : t.loginBtn}
            </button>
            
            <div className="auth-toggle">
              {t.noAccount} <button type="button" onClick={toggleAuthMode}>{t.register}</button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="register-name">Nome completo</label>
              <input 
                type="text" 
                id="register-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input 
                type="email" 
                id="register-email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                type="password"
                id="register-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm-password">Conferma password</label>
              <input
                type="password"
                id="register-confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPasswordPlaceholder}
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
                {t.termsText} <a href="#terms">{t.termsLink}</a> {t.privacyText} <a href="#privacy">{t.privacyLink}</a>
              </label>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? t.registerLoading : t.registerBtn}
            </button>

            <div className="auth-toggle">
              {t.haveAccount} <button type="button" onClick={toggleAuthMode}>{t.login}</button>
            </div>
          </form>
        )}
      </div>

      <div className="auth-features">
        <div className="features-header">
          <h2>{t.featuresTitle}</h2>
          <p>{t.featuresDescription}</p>
        </div>

        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h3>{t.featureSymptoms}</h3>
            <p>{t.featureSymptomsDesc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-pills"></i>
            </div>
            <h3>{t.featureMedications}</h3>
            <p>{t.featureMedicationsDesc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>{t.featureAI}</h3>
            <p>{t.featureAIDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth; 