import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Auth from './components/Auth';
import SymptomTracker from './components/SymptomTracker';
import MedicationTracker from './components/MedicationTracker';
import WellnessTracker from './components/WellnessTracker';
import AIAssistant from './components/AIAssistant';
import NotificationCenter from './components/NotificationCenter';
import Home from './components/Home';
import './App.css';
import API from './api';

// Configurazione di base per axios
const API_BASE = axios.create({
  // Utilizziamo un mock JSON server locale o jsonplaceholder per i test
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor per aggiungere il token di autenticazione alle richieste
API_BASE.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire le risposte
API_BASE.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Se il token è scaduto (status 401), logout automatico
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Mock login e registrazione per testing senza API reale
const mockAuth = {
  login: async (email, password) => {
    // Verifica credenziali di test
    if (email === 'test@example.com' && password === 'password') {
      return {
        userId: 'user-123',
        userName: 'Utente Test',
        token: 'mock-jwt-token'
      };
    }
    // Per qualsiasi altra combinazione, permetti l'accesso per scopi di demo
    return {
      userId: 'user-' + Math.floor(Math.random() * 1000),
      userName: email.split('@')[0],
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
    };
  },
  
  register: async (name, email, password) => {
    // Simula registrazione con successo
    return {
      userId: 'user-' + Math.floor(Math.random() * 1000),
      userName: name,
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
    };
  }
};

// Layout che include la barra di navigazione e il layout comune
function Layout({ userId, userName, onLogout, hasNotifications, children }) {
  const location = useLocation();
  const [showAIWidget, setShowAIWidget] = useState(false);

  // Determina la pagina attiva basandosi sull'URL
  const getActivePage = (pathname) => {
    const path = pathname.split('/')[1] || 'dashboard';
    return path;
  };

  const activePage = getActivePage(location.pathname);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-logo">
          <img src="/logo.png" alt="Salus" className="logo" />
          <h1>Salus</h1>
        </div>
        <div className="header-user">
          <span className="user-name">{userName}</span>
          <button className="logout-button" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </header>
      
      <div className="main-container">
        <nav className="sidebar">
          <a 
            href="/dashboard" 
            className={activePage === 'dashboard' ? 'active' : ''}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </a>
          <a 
            href="/sintomi" 
            className={activePage === 'sintomi' ? 'active' : ''}
          >
            <i className="fas fa-heartbeat"></i>
            <span>Sintomi</span>
          </a>
          <a 
            href="/farmaci" 
            className={activePage === 'farmaci' ? 'active' : ''}
          >
            <i className="fas fa-pills"></i>
            <span>Farmaci</span>
          </a>
          <a 
            href="/benessere" 
            className={activePage === 'benessere' ? 'active' : ''}
          >
            <i className="fas fa-spa"></i>
            <span>Benessere</span>
          </a>
          <a 
            href="/assistente" 
            className={activePage === 'assistente' ? 'active' : ''}
          >
            <i className="fas fa-robot"></i>
            <span>Assistente</span>
          </a>
          
          <div className="sidebar-bottom">
            <button 
              className="ai-toggle-button"
              onClick={() => setShowAIWidget(!showAIWidget)}
            >
              <i className="fas fa-robot"></i>
              <span>Assistente Rapido</span>
            </button>
          </div>
        </nav>
        
        <main className="content">
          {children}
        </main>
      </div>
      
      {/* Assistente AI compatto sempre visibile */}
      {showAIWidget && (
        <div className="ai-widget-container">
          <AIAssistant userId={userId} />
        </div>
      )}
      
      {/* Centro notifiche */}
      <NotificationCenter />
    </div>
  );
}

// Funzione principale dell'app
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [hasNotifications, setHasNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se esiste già una sessione
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    const token = localStorage.getItem('token');

    if (storedUserId && token) {
      setUserId(storedUserId);
      setUserName(storedUserName || 'Utente');
      setIsLoggedIn(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = (userId, userName, token) => {
    // Salva dati di autenticazione
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
    localStorage.setItem('token', token);
    
    // Aggiorna lo stato
    setUserId(userId);
    setUserName(userName);
    setIsLoggedIn(true);
    
    // Notifica di login riuscito
    window.dispatchEvent(new CustomEvent('salus:notification', {
      detail: { 
        type: 'success',
        message: 'Login effettuato con successo!'
      }
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    setUserId(null);
    setUserName('');
    setIsLoggedIn(false);
    
    // Notifica di logout
    window.dispatchEvent(new CustomEvent('salus:notification', {
      detail: { 
        type: 'info',
        message: 'Logout effettuato con successo.'
      }
    }));
  };

  // Mostra il loader durante il caricamento iniziale
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  // Se l'utente non è loggato, mostra il componente di autenticazione
  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  // Se l'utente è loggato, mostra l'app con tutte le funzionalità
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Layout userId={userId} userName={userName} onLogout={handleLogout} hasNotifications={hasNotifications}>
              <Home userId={userId} userName={userName} />
            </Layout>
          }
        />
        <Route
          path="/sintomi"
          element={
            <Layout userId={userId} userName={userName} onLogout={handleLogout} hasNotifications={hasNotifications}>
              <SymptomTracker userId={userId} />
            </Layout>
          }
        />
        <Route
          path="/farmaci"
          element={
            <Layout userId={userId} userName={userName} onLogout={handleLogout} hasNotifications={hasNotifications}>
              <MedicationTracker userId={userId} />
            </Layout>
          }
        />
        <Route
          path="/benessere"
          element={
            <Layout userId={userId} userName={userName} onLogout={handleLogout} hasNotifications={hasNotifications}>
              <WellnessTracker userId={userId} />
            </Layout>
          }
        />
        <Route
          path="/assistente"
          element={
            <Layout userId={userId} userName={userName} onLogout={handleLogout} hasNotifications={hasNotifications}>
              <div className="assistant-container">
                <AIAssistant userId={userId} />
              </div>
            </Layout>
          }
        />
        {/* Fallback per percorsi non gestiti */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 