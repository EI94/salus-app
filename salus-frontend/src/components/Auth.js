import React, { useState } from 'react';
import API from '../api';

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
    setLoading(true);
    setError('');
    
    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password
      });
      
      const { userId, name: userName } = response.data;
      
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      
      if (onLogin) {
        onLogin(userId, userName);
      }
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      setError('Errore durante la registrazione: ' + (error.response?.data?.message || 'Controlla i tuoi dati e riprova.'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await API.post('/auth/login', {
        email,
        password
      });
      
      const { userId, name: userName } = response.data;
      
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', userName);
      
      if (onLogin) {
        onLogin(userId, userName);
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      setError('Errore durante il login: ' + (error.response?.data?.message || 'Credenziali non valide.'));
      
      // Modalità demo
      handleTemporaryAccess();
    } finally {
      setLoading(false);
    }
  };
  
  const handleTemporaryAccess = () => {
    const tempUserId = 'temp-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('userId', tempUserId);
    localStorage.setItem('userName', 'Ospite');
    
    if (onLogin) {
      onLogin(tempUserId, 'Ospite');
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
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
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
              <>
                {isRegistering ? (
                  <>
                    <i className="fas fa-user-plus"></i> Registrati
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i> Accedi
                  </>
                )}
              </>
            )}
          </button>
          
          {!isRegistering && (
            <button 
              type="button" 
              className="auth-submit-button"
              style={{ marginTop: '10px', backgroundColor: '#22c55e' }}
              onClick={handleTemporaryAccess}
            >
              <i className="fas fa-rocket"></i> Accedi in modalità demo
            </button>
          )}
        </form>
        
        <div className="auth-separator">
          <span>oppure</span>
        </div>
        
        <button className="auth-social-button">
          <img src="/google-icon.png" alt="Google" />
          Continua con Google
        </button>
        
        <button className="auth-social-button">
          <img src="/apple-icon.png" alt="Apple" />
          Continua con Apple
        </button>
        
        <div className="auth-footer">
          {isRegistering ? (
            <>
              Hai già un account?{' '}
              <a href="#login" onClick={(e) => { e.preventDefault(); setIsRegistering(false); }}>
                Accedi
              </a>
            </>
          ) : (
            <>
              Non hai un account?{' '}
              <a href="#register" onClick={(e) => { e.preventDefault(); setIsRegistering(true); }}>
                Registrati
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth; 