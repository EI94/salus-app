import React, { useState, useEffect, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Auth from './components/Auth';
import SymptomTracker from './components/SymptomTracker';
import MedicationTracker from './components/MedicationTracker';
import WellnessTracker from './components/WellnessTracker';
import AIAssistant from './components/AIAssistant';
import NotificationCenter from './components/NotificationCenter';
import Home from './components/Home';
import Profile from './components/Profile';
import FeedbackWidget from './components/FeedbackWidget';
import './styles/complete-app.css'; /* Tutti gli stili dell'app */
import './App.css';  /* File minimo solo per compatibilità */
import API from './api';
import { useTranslation } from 'react-i18next';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { UserProvider, UserContext } from './context/UserContext';

// Configurazione di base per axios
const API_BASE = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://www.wearesalusapp.com/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor per aggiungere il token di autenticazione alle richieste
API_BASE.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Componente per rotte protette (solo per utenti autenticati)
const ProtectedRoute = ({ children }) => {
  const userContext = useContext(UserContext);
  
  // Verifica se il contesto utente è disponibile e se l'utente è autenticato
  if (!userContext || !userContext.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente per rotte pubbliche (non accessibili se autenticati)
const PublicRoute = ({ children }) => {
  const userContext = useContext(UserContext);
  
  // Se l'utente è già autenticato, reindirizza alla dashboard
  if (userContext && userContext.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Componente per reindirizzamento dalla root
const RootRedirect = () => {
  const userContext = useContext(UserContext);
  
  if (userContext && userContext.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

// Layout che include la barra di navigazione e il layout comune
function Layout({ children }) {
  const { t } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIWidget, setShowAIWidget] = useState(false);
  const { user, logout } = useContext(UserContext);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determina quale pagina è attiva in base all'URL
  const getActivePageClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="app-layout">
      <div className="sidebar-wrapper">
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`} ref={sidebarRef}>
          <div className="sidebar-header">
            <div className="app-logo">
              <img src="/logo-light.png" alt="Salus Logo" />
              <h1>Salus</h1>
            </div>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
              <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
            </button>
          </div>
          
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user-circle"></i>
            </div>
            <div className="user-details">
              <h3>{user?.name || t('guest', 'Ospite')}</h3>
              <p>{user?.email || ''}</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li>
                <Link to="/dashboard" className={getActivePageClass('/dashboard')}>
                  <i className="fas fa-home"></i>
                  <span>{t('dashboard', 'Dashboard')}</span>
                </Link>
              </li>
              <li>
                <Link to="/sintomi" className={getActivePageClass('/sintomi')}>
                  <i className="fas fa-heartbeat"></i>
                  <span>{t('symptoms', 'Sintomi')}</span>
                </Link>
              </li>
              <li>
                <Link to="/farmaci" className={getActivePageClass('/farmaci')}>
                  <i className="fas fa-pills"></i>
                  <span>{t('medications', 'Farmaci')}</span>
                </Link>
              </li>
              <li>
                <Link to="/benessere" className={getActivePageClass('/benessere')}>
                  <i className="fas fa-heart"></i>
                  <span>{t('wellness', 'Benessere')}</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className={getActivePageClass('/profile')}>
                  <i className="fas fa-user"></i>
                  <span>{t('profile', 'Profilo')}</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className={getActivePageClass('/settings')}>
                  <i className="fas fa-cog"></i>
                  <span>{t('settings', 'Impostazioni')}</span>
                </Link>
              </li>
              <li>
                <Link to="/assistente" className={getActivePageClass('/assistente')}>
                  <i className="fas fa-robot"></i>
                  <span>{t('aiAssistant', 'Assistente IA')}</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="sidebar-footer">
            <button 
              className="notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
              title={t('notifications', 'Notifiche')}
            >
              <i className="fas fa-bell"></i>
              <span>{t('notifications', 'Notifiche')}</span>
            </button>
            
            <button 
              className="assistant-button"
              onClick={() => setShowAIWidget(!showAIWidget)}
              title={t('quickAssistant', 'Assistente Rapido')}
            >
              <i className="fas fa-robot"></i>
              <span>{t('quickAssistant', 'Assistente Rapido')}</span>
            </button>
            
            <button 
              className="logout-button"
              onClick={handleLogout}
              title={t('logout', 'Esci dall\'applicazione')}
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>{t('logout', 'Esci')}</span>
            </button>
          </div>
        </div>
        
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
      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
      
      {/* Widget di feedback */}
      <FeedbackWidget />
    </div>
  );
}

// Componente principale dell'applicazione
function AppContent() {
  // Funzionalità interne che richiedono hook di routing
  return (
    <Routes>
      {/* Reindirizzamento dalla root */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Pagine pubbliche */}
      <Route path="/login" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      
      {/* Rotte protette */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/sintomi" element={
        <ProtectedRoute>
          <Layout>
            <SymptomTracker />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/farmaci" element={
        <ProtectedRoute>
          <Layout>
            <MedicationTracker />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/benessere" element={
        <ProtectedRoute>
          <Layout>
            <WellnessTracker />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/assistente" element={
        <ProtectedRoute>
          <Layout>
            <AIAssistant />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Fallback per rotte inesistenti */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Applicazione principale
function App() {
  return (
    <HashRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </HashRouter>
  );
}

export default App; 