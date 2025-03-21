import React, { useState } from 'react';
import axios from 'axios';

// Configurazione di base di axios
const API = axios.create({
  baseURL: 'https://api.salusapp.it', // URL di base dell'API
  timeout: 15000, // 15 secondi
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const Auth = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
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

    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password
      });

      const { userId, userName, token } = response.data;

      // Salva i dati utente e token
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('token', token);

      if (onLogin) {
        onLogin(userId, userName);
      }
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      
      if (error.response && error.response.status === 409) {
        setError('Email già registrata. Prova ad accedere.');
      } else {
        setError('Errore durante la registrazione. Controlla i tuoi dati e riprova.');
      }
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

    try {
      const response = await API.post('/auth/login', {
        email,
        password
      });

      const { userId, userName, token } = response.data;

      // Salva i dati utente e token
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      localStorage.setItem('token', token);

      if (onLogin) {
        onLogin(userId, userName);
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      
      if (error.response && error.response.status === 401) {
        setError('Credenziali non valide. Controlla email e password.');
      } else {
        setError('Errore di connessione. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.svg" alt="Salus Logo" />
          <span className="auth-logo-text">Salus</span>
        </div>
        
        <h2 className="auth-title">
          {isRegistering ? 'Crea un account' : 'Accedi'}
        </h2>
        <p className="auth-subtitle">
          {isRegistering 
            ? 'Registrati per iniziare a monitorare la tua salute' 
            : 'Accedi per continuare il tuo percorso di salute'}
        </p>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="auth-form">
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                type="text"
                className="form-input"
                placeholder="Il tuo nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="La tua email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
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
          
          <button 
            type="submit" 
            className={`auth-submit-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              isRegistering ? 'Registrati' : 'Accedi'
            )}
          </button>
        </form>
        
        <div className="auth-separator">
          <span>oppure</span>
        </div>
        
        <div className="auth-providers">
          <button className="provider-button apple">
            <img src="/assets/icons/apple-icon.svg" alt="Apple" className="provider-icon" />
            Continua con Apple
          </button>
          <button className="provider-button google">
            <img src="/assets/icons/google-icon.svg" alt="Google" className="provider-icon" />
            Continua con Google
          </button>
        </div>
        
        <div className="auth-toggle">
          {isRegistering ? (
            <>
              Hai già un account?{' '}
              <span
                className="auth-toggle-link"
                onClick={() => setIsRegistering(false)}
              >
                Accedi
              </span>
            </>
          ) : (
            <>
              Non hai un account?{' '}
              <span
                className="auth-toggle-link"
                onClick={() => setIsRegistering(true)}
              >
                Registrati
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth; 