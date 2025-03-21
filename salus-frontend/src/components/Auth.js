import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

// Immagini salute e benessere
const healthImages = [
  '/assets/images/health1.jpg',
  '/assets/images/health2.jpg',
  '/assets/images/health3.jpg'
];

// Frasi motivazionali
const motivationalQuotes = [
  "Prendi il controllo della tua salute con Salus",
  "Il tuo benessere, la nostra priorità",
  "Una vita sana inizia con piccoli passi quotidiani",
  "Monitora, comprendi, migliora il tuo benessere"
];

// Configurazione di base di axios
const API = axios.create({
  baseURL: 'https://api.salusapp.it', // URL di base dell'API
  timeout: 15000, // 15 secondi
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const Auth = ({ onLogin, mockAuth }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quote, setQuote] = useState('');
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Effetto per cambiare la citazione e lo sfondo
  useEffect(() => {
    // Seleziona citazione casuale all'inizio
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
    
    // Cambia sfondo e citazione ogni 10 secondi
    const interval = setInterval(() => {
      setBackgroundIndex(prev => (prev + 1) % healthImages.length);
      const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setQuote(newQuote);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validazione input
    if (!name.trim()) {
      setError('Inserisci il tuo nome');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Inserisci un indirizzo email valido');
      return;
    }
    
    if (password.length < 6) {
      setError('La password deve contenere almeno 6 caratteri');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Utilizziamo il mock invece dell'API reale
      const userData = await mockAuth.register(name, email, password);
      setSuccess('Registrazione completata con successo!');

      // Salva i dati utente e token
      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('userName', userData.userName);
      localStorage.setItem('token', userData.token);

      // Breve pausa per mostrare il messaggio di successo
      setTimeout(() => {
        if (onLogin) {
          onLogin(userData.userId, userData.userName);
        }
      }, 1000);
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      setError('Errore durante la registrazione. Controlla i tuoi dati e riprova.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validazione input
    if (!email.trim() || !email.includes('@')) {
      setError('Inserisci un indirizzo email valido');
      return;
    }
    
    if (!password.trim()) {
      setError('Inserisci la password');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Utilizziamo il mock invece dell'API reale
      const userData = await mockAuth.login(email, password);
      setSuccess('Accesso effettuato con successo!');

      // Salva i dati utente e token
      localStorage.setItem('userId', userData.userId);
      localStorage.setItem('userName', userData.userName);
      localStorage.setItem('token', userData.token);

      // Breve pausa per mostrare il messaggio di successo
      setTimeout(() => {
        if (onLogin) {
          onLogin(userData.userId, userData.userName);
        }
      }, 1000);
    } catch (error) {
      console.error('Errore durante il login:', error);
      setError('Credenziali non valide. Controlla email e password.');
    } finally {
      setLoading(false);
    }
  };
  
  // Form di accesso demo rapido
  const handleDemoLogin = () => {
    setLoading(true);
    setError('');
    setSuccess('Accesso demo in corso...');
    
    setTimeout(() => {
      const demoUser = {
        userId: 'demo-user',
        userName: 'Utente Demo',
        token: 'demo-token'
      };
      
      localStorage.setItem('userId', demoUser.userId);
      localStorage.setItem('userName', demoUser.userName);
      localStorage.setItem('token', demoUser.token);
      
      onLogin(demoUser.userId, demoUser.userName);
    }, 1500);
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div 
          className="auth-image" 
          style={{backgroundImage: `url(${healthImages[backgroundIndex]})`}}
        >
          <div className="auth-overlay">
            <div className="brand-container">
              <div className="brand-logo">
                <img src="/logo.svg" alt="Salus Logo" />
                <span>Salus</span>
              </div>
              <div className="brand-tagline">La tua salute, nelle tue mani</div>
            </div>
            
            <div className="quote-container">
              <div className="quote fade-in">{quote}</div>
              <div className="quote-author">Salus Health</div>
            </div>
            
            <div className="features-preview">
              <div className="feature-item">
                <i className="fas fa-chart-line"></i>
                <span>Traccia i tuoi sintomi</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-pills"></i>
                <span>Gestisci i tuoi farmaci</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-brain"></i>
                <span>Monitora il tuo benessere</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <h2 className="auth-title slide-in">
              {isRegistering ? 'Crea il tuo account' : 'Bentornato'}
            </h2>
            <p className="auth-subtitle slide-in">
              {isRegistering 
                ? 'Inizia il tuo percorso verso una salute migliore' 
                : 'Accedi per continuare il tuo percorso di benessere'}
            </p>
            
            {error && (
              <div className="message-box error-message slide-in">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            
            {success && (
              <div className="message-box success-message slide-in">
                <i className="fas fa-check-circle"></i> {success}
              </div>
            )}
            
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="auth-form">
              {isRegistering && (
                <div className="form-group slide-in">
                  <label className="form-label">Il tuo nome</label>
                  <div className="input-with-icon">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Come ti chiami?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="form-group slide-in">
                <label className="form-label">Email</label>
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="La tua email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group slide-in">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <i className="fas fa-lock"></i>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="La tua password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className={`auth-button primary-button slide-in ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="loader"></div>
                ) : (
                  isRegistering ? 'Registrati ora' : 'Accedi'
                )}
              </button>
              
              <div className="auth-separator slide-in">
                <span>oppure</span>
              </div>
            </form>
            
            <div className="social-auth slide-in">
              <button className="auth-button social-button google">
                <img src="/assets/icons/google-icon.svg" alt="Google" />
                <span>Continua con Google</span>
              </button>
              <button className="auth-button social-button apple">
                <img src="/assets/icons/apple-icon.svg" alt="Apple" />
                <span>Continua con Apple</span>
              </button>
            </div>
            
            <div className="demo-access slide-in">
              <button 
                className="auth-button demo-button"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                <i className="fas fa-bolt"></i>
                <span>Prova Salus senza registrazione</span>
              </button>
            </div>
            
            <div className="auth-toggle slide-in">
              {isRegistering ? (
                <>
                  Hai già un account?{' '}
                  <button
                    className="toggle-button"
                    onClick={() => setIsRegistering(false)}
                    type="button"
                  >
                    Accedi
                  </button>
                </>
              ) : (
                <>
                  Non hai un account?{' '}
                  <button
                    className="toggle-button"
                    onClick={() => setIsRegistering(true)}
                    type="button"
                  >
                    Registrati ora
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="auth-footer">
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Termini</a>
              <a href="#help">Aiuto</a>
            </div>
            <div className="footer-copy">&copy; 2025 Salus Health App</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 