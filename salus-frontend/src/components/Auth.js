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

  // Verifica se il servizio di autenticazione è disponibile all'avvio
  useEffect(() => {
    // Per questo esempio, assumiamo che mockAuth sia sempre disponibile
    setAuthService(mockAuth || {
      login: async (email, password) => {
        // Implementazione di sicurezza di base per i test
        console.log('Tentativo di login con:', { email, password });
        console.log('Auth service disponibile:', !!mockAuth);
        
        // Simula un'attesa per l'API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Accetta qualsiasi email/password per test
        const userData = { 
          id: 'user123', 
          name: 'Utente Test',
          email: email
        };
        const token = 'fake-jwt-token-123456789';
        
        console.log('Login completato:', { userData, token });
        return { success: true, userData, token };
      },
      
      register: async (name, email, password) => {
        // Implementazione di sicurezza di base per i test
        console.log('Tentativo di registrazione con:', { name, email, password });
        console.log('Auth service disponibile:', !!mockAuth);
        
        // Simula un'attesa per l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Accetta qualsiasi registrazione per test
        const userData = { 
          id: 'user123', 
          name: name,
          email: email
        };
        const token = 'fake-jwt-token-123456789';
        
        console.log('Registrazione completata:', { userData, token });
        return { success: true, userData, token };
      }
    });
  }, [mockAuth]);

  // Gestione del form di registrazione
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validazione dei dati base
    if (!name || !email || !password || !confirmPassword) {
      setError('Tutti i campi sono obbligatori');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }
    
    if (password.length < 6) {
      setError('La password deve essere lunga almeno 6 caratteri');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.register(name, email, password);
      console.log('Registrazione completata:', response);
      
      if (response && response.success) {
        // Registrazione riuscita
        handleLoginAfterRegistration(response.userData, response.token);
      } else {
        throw new Error('Registrazione fallita - Dati utente non validi');
      }
    } catch (error) {
      console.log('Errore durante la registrazione:', error);
      setError(error.message || 'Errore durante la registrazione');
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
      setError('Email e password sono obbligatori');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await authService.login(email, password);
      console.log('Login completato:', response);
      
      if (response && response.success && response.userData && response.token) {
        // Login riuscito
        if (onLogin && typeof onLogin === 'function') {
          onLogin(response.userData, response.token);
        } else {
          throw new Error('Callback onLogin non disponibile');
        }
      } else {
        throw new Error('Dati utente non validi');
      }
    } catch (error) {
      console.log('Errore durante il login:', error);
      setError(error.message || 'Errore durante il login');
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
          <h1>Salus</h1>
          <p className="app-description">
            La tua piattaforma personale per il monitoraggio della salute
          </p>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Accedi
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Registrati
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
                placeholder="La tua email"
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
                placeholder="La tua password"
                disabled={loading}
              />
            </div>
            
            <div className="form-action">
              <a href="#forgot-password" className="forgot-password">
                Password dimenticata?
              </a>
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
            
            <div className="auth-toggle">
              Non hai un account? <button type="button" onClick={toggleAuthMode}>Registrati</button>
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
                placeholder="Il tuo nome"
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
                placeholder="La tua email"
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
                placeholder="Crea una password"
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
                placeholder="Conferma la password"
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
                Accetto i <a href="#terms">Termini di Servizio</a> e la <a href="#privacy">Privacy Policy</a>
              </label>
            </div>
            
            {error && <div className="auth-error">{error}</div>}
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
            
            <div className="auth-toggle">
              Hai già un account? <button type="button" onClick={toggleAuthMode}>Accedi</button>
            </div>
          </form>
        )}
      </div>
      
      <div className="auth-features">
        <div className="features-header">
          <h2>Funzionalità principali</h2>
          <p>Salus ti aiuta a monitorare e gestire la tua salute in modo semplice ed efficace</p>
        </div>
        
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-heartbeat"></i>
            </div>
            <h3>Monitoraggio sintomi</h3>
            <p>Tieni traccia dei tuoi sintomi nel tempo e visualizza l'andamento</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-pills"></i>
            </div>
            <h3>Gestione farmaci</h3>
            <p>Organizza e ricorda i tuoi farmaci con notifiche personalizzate</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>Assistente IA</h3>
            <p>Ricevi consigli personalizzati basati sui tuoi dati di salute</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Statistiche e report</h3>
            <p>Visualizza grafici e report dettagliati sul tuo stato di salute</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth; 