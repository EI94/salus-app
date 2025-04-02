import React, { useState, useEffect, useContext } from 'react';
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
import { loadUserData } from './utils/dataManager';
import { useTranslation } from 'react-i18next';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { UserProvider, UserContext } from './context/UserContext';

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
      console.log('Mock login con:', email, password);
      
      // Simula un'attesa per l'API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Cerca l'utente nel localStorage (utilizziamo lo stesso sistema del componente Auth)
      const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Utente non trovato');
      }
      
      if (user.password !== password) {
        throw new Error('Password non valida');
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
        language: user.language || 'italian',
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
          language: user.language || 'italian'
        }, 
        token: token.token
      };
    } catch (error) {
      console.error('Errore login:', error);
      return { success: false, error: error.message };
    }
  },
  
  register: async (name, email, password) => {
    try {
      console.log('Mock registrazione con:', name, email, password);
      
      // Simula un'attesa per l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verifica se l'utente esiste già
      const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      if (users.some(u => u.email === email)) {
        throw new Error('Email già registrata');
      }
      
      // Crea nuovo utente
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = { 
        id: userId, 
        name, 
        email, 
        password, // Nota: in un'app reale, la password dovrebbe essere criptata
        language: localStorage.getItem('userLanguage') || 'italian',
        registrationDate: new Date().toISOString()
      };
      
      // Salva l'utente nel localStorage
      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
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
        language: localStorage.getItem('userLanguage') || 'italian',
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
          language: localStorage.getItem('userLanguage') || 'italian'
        }, 
        token: token.token
      };
    } catch (error) {
      console.error('Errore registrazione:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Aggiunta delle funzioni necessarie per l'integrazione con il componente Auth
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

// Componente per rotte protette (solo per utenti autenticati)
const ProtectedRoute = ({ children }) => {
  const userContext = useContext(UserContext);
  
  // Verifica se il contesto utente è disponibile e se l'utente è autenticato
  if (!userContext || !userContext.isAuthenticated()) {
    console.log("Utente non autenticato, reindirizzamento al login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("Utente autenticato, accesso consentito alla rotta protetta:", children.type?.name);
  return children;
};

// Componente per rotte pubbliche (non accessibili se autenticati)
const PublicRoute = ({ children }) => {
  const userContext = useContext(UserContext);
  
  // Se l'utente è già autenticato, reindirizza alla dashboard
  if (userContext && userContext.isAuthenticated()) {
    console.log("Utente già autenticato, reindirizzamento alla dashboard da PublicRoute");
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
  const navigate = useNavigate();
  const location = useLocation();
  const userContext = useContext(UserContext);
  const [showAIWidget, setShowAIWidget] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = React.useRef(null);
  
  // Gestisce i click fuori dal menu profilo per chiuderlo
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Determina quale pagina è attiva in base all'URL
  const getActivePageClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  // Logout handler
  const handleLogout = () => {
    userContext.logout();
    navigate('/login', { replace: true });
  };
  
  const userName = userContext?.user?.name || 'Utente';
  const userId = userContext?.user?.id || 'ID';
  const hasNotifications = false; // Sostituire con logica notifiche reale
  
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <img src="/assets/icons/logo.svg" alt="Salus" className="logo" />
          <h1>Salus</h1>
        </div>
        <div className="header-right">
          <button 
            className="header-button" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifiche"
          >
            <i className="fas fa-bell"></i>
            {hasNotifications && <span className="notification-badge"></span>}
          </button>
          <button 
            className="header-button" 
            onClick={() => setShowAIWidget(!showAIWidget)}
            title="Assistente IA"
          >
            <i className="fas fa-robot"></i>
          </button>
          <div className="profile-menu-container" ref={profileMenuRef}>
            <button 
              className="header-button" 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Il tuo profilo"
            >
              <i className="fas fa-user"></i>
            </button>
            
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="profile-info">
                    <h4>{userName}</h4>
                    <p>ID: {userId}</p>
                  </div>
                </div>
                <ul className="profile-menu-items">
                  <li onClick={() => navigate('/profile')}>
                    <i className="fas fa-id-card"></i>
                    <span>Il mio profilo</span>
                  </li>
                  <li onClick={() => navigate('/settings')}>
                    <i className="fas fa-cog"></i>
                    <span>Impostazioni</span>
                  </li>
                  <li className="divider"></li>
                  <li className="logout-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Esci</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="main-container">
        <nav className="sidebar">
          <Link 
            to="/dashboard" 
            className={getActivePageClass('/dashboard')}
          >
            <i className="fas fa-home"></i>
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/sintomi" 
            className={getActivePageClass('/sintomi')}
          >
            <i className="fas fa-heartbeat"></i>
            <span>Sintomi</span>
          </Link>
          <Link 
            to="/farmaci" 
            className={getActivePageClass('/farmaci')}
          >
            <i className="fas fa-pills"></i>
            <span>Farmaci</span>
          </Link>
          <Link 
            to="/benessere" 
            className={getActivePageClass('/benessere')}
          >
            <i className="fas fa-spa"></i>
            <span>Benessere</span>
          </Link>
          <Link 
            to="/assistente" 
            className={getActivePageClass('/assistente')}
          >
            <i className="fas fa-robot"></i>
            <span>Assistente</span>
          </Link>
          
          <div className="sidebar-bottom">
            <button 
              className="ai-toggle-button"
              onClick={() => setShowAIWidget(!showAIWidget)}
            >
              <i className="fas fa-robot"></i>
              <span>Assistente Rapido</span>
            </button>
            
            <button 
              className="logout-button"
              onClick={handleLogout}
              title="Esci dall'applicazione"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Esci</span>
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