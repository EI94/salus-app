import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { loadUserData } from './utils/dataManager';

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
    try {
      // Qui in futuro: chiamata API reale
      console.log('Login con:', email, password);
      
      // Simula risposta del server
      const userData = { 
        id: 'user123', 
        name: 'Mario Rossi',
        email: email
      };
      const token = 'fake-jwt-token-123456789';
      
      return { success: true, userData, token };
    } catch (error) {
      console.error('Errore login:', error);
      return { success: false, error: error.message };
    }
  },
  
  register: async (name, email, password) => {
    try {
      // Qui in futuro: chiamata API reale
      console.log('Registrazione:', name, email, password);
      
      // Simula risposta del server
      const userData = { 
        id: 'user123', 
        name: name,
        email: email
      };
      const token = 'fake-jwt-token-123456789';
      
      return { success: true, userData, token };
    } catch (error) {
      console.error('Errore registrazione:', error);
      return { success: false, error: error.message };
    }
  }
};

// Layout che include la barra di navigazione e il layout comune
function Layout({ userId, userName, onLogout, hasNotifications, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAIWidget, setShowAIWidget] = useState(false);

  // Determina quale pagina è attiva in base all'URL
  const getActivePageClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <img src="/assets/icons/logo.svg" alt="Salus" className="logo" />
          <h1>Salus</h1>
        </div>
        <div className="header-right">
          <button className="header-button">
            <i className="fas fa-bell"></i>
          </button>
          <button className="header-button" onClick={() => setShowAIWidget(!showAIWidget)}>
            <i className="fas fa-robot"></i>
          </button>
          <button className="header-button">
            <i className="fas fa-user"></i>
          </button>
        </div>
      </header>
      
      <div className="main-container">
        <nav className="sidebar">
          <a 
            href="/dashboard" 
            className={getActivePageClass('/dashboard')}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </a>
          <a 
            href="/sintomi" 
            className={getActivePageClass('/sintomi')}
          >
            <i className="fas fa-heartbeat"></i>
            <span>Sintomi</span>
          </a>
          <a 
            href="/farmaci" 
            className={getActivePageClass('/farmaci')}
          >
            <i className="fas fa-pills"></i>
            <span>Farmaci</span>
          </a>
          <a 
            href="/benessere" 
            className={getActivePageClass('/benessere')}
          >
            <i className="fas fa-spa"></i>
            <span>Benessere</span>
          </a>
          <a 
            href="/assistente" 
            className={getActivePageClass('/assistente')}
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
          <AIAssistant />
        </div>
      )}
      
      {/* Centro notifiche */}
      <NotificationCenter />
    </div>
  );
}

// Funzione principale dell'app
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Carica lo stato di autenticazione e dati utente al mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    
    if (storedToken && storedUserId) {
      setIsAuthenticated(true);
      setToken(storedToken);
      setUserId(storedUserId);
      setUserName(storedUserName || 'Utente');
      
      // Carica i dati dell'utente
      const data = loadUserData(storedUserId);
      setUserData(data);
    }
  }, []);

  // Gestore del login
  const handleLogin = (userData, token) => {
    // Salva dati utente e token in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userName', userData.name || 'Utente');
    
    // Aggiorna stato
    setIsAuthenticated(true);
    setUserId(userData.id);
    setUserName(userData.name || 'Utente');
    setToken(token);
    
    // Carica i dati dell'utente
    const data = loadUserData(userData.id);
    setUserData(data);
  };

  // Gestore del logout
  const handleLogout = () => {
    // Rimuovi token e dati utente da localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    // Aggiorna stato
    setIsAuthenticated(false);
    setUserId(null);
    setUserName('');
    setToken(null);
    setUserData(null);
  };

  // Mostra il loader durante il caricamento iniziale
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} mockAuth={mockAuth} />;
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
              <Home userId={userId} userName={userName} userData={userData} />
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
                <AIAssistant />
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