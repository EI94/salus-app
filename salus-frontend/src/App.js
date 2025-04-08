import React, { useState, useEffect, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import Auth from './components/Auth';
import SymptomTracker from './components/SymptomTracker';
import MedicationTracker from './components/MedicationTracker';
import WellnessTracker from './components/WellnessTracker';
import AIAssistant from './components/AIAssistant';
import NotificationCenter from './components/NotificationCenter';
// import Home from './components/Home';
import Profile from './components/Profile';
import FeedbackWidget from './components/FeedbackWidget';
import './styles/complete-app.css'; /* Tutti gli stili dell'app */
import './App.css';  /* File minimo solo per compatibilità */
// import api from './api';
import { useTranslation } from 'react-i18next';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import { UserProvider, UserContext } from './context/UserContext';
import MedicationReminder from './components/MedicationReminder';
import SymptomAnalytics from './components/SymptomAnalytics';
import AppointmentManager from './components/AppointmentManager';

// Componente per rotte protette (solo per utenti autenticati)
const ProtectedRoute = ({ children }) => {
  const userContext = useContext(UserContext);
  
  // Verifica se il contesto utente è disponibile e se l'utente è autenticato
  if (!userContext || !userContext.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente per rotte pubbliche (non accessibili se autenticati)
const PublicRoute = ({ children }) => {
  const userContext = useContext(UserContext);
  
  // Se l'utente è già autenticato, reindirizza alla dashboard
  if (userContext && userContext.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Componente per reindirizzamento dalla root
const RootRedirect = () => {
  const userContext = useContext(UserContext);
  
  if (userContext && userContext.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

// Layout che include la barra di navigazione e il layout comune
function Layout({ children }) {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIWidget, setShowAIWidget] = useState(false);
  const { user, logout } = useContext(UserContext);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Forza l'applicazione a usare l'italiano all'avvio del componente
  useEffect(() => {
    // Imposta la lingua italiana
    i18n.changeLanguage('it');
    
    // Salva la scelta nella localStorage
    localStorage.setItem('userLanguage', 'it');
    console.log('Lingua forzata a italiano');
  }, [i18n]);
  
  // Determina quale pagina è attiva in base all'URL
  const getActivePageClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Traduzioni fisse come fallback se i18n non funziona correttamente
  const menuLabels = {
    dashboard: "Dashboard",
    symptoms: "Sintomi",
    medications: "Farmaci",
    wellness: "Benessere",
    profile: "Profilo",
    settings: "Impostazioni",
    aiAssistant: "Assistente IA",
    notifications: "Notifiche",
    quickAssistant: "Assistente Rapido",
    logout: "Esci"
  };
  
  // Funzione helper per ottenere la traduzione o usare il fallback
  const getTranslation = (key, fallback) => {
    const translation = t(key, fallback);
    // Se la traduzione è uguale alla chiave, usa il fallback
    return translation === key ? menuLabels[key] || fallback : translation;
  };
  
  return (
    <div className="app-layout">
      <div className="sidebar-wrapper">
        <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`} ref={sidebarRef}>
          <div className="sidebar-header">
            <div className="app-logo">
              <img src="/logo-light.svg" alt="Salus Logo" />
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
              <h3>{user?.name || getTranslation('guest', 'Ospite')}</h3>
              <p>{user?.email || ''}</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li>
                <Link to="/dashboard" className={getActivePageClass('/dashboard')}>
                  <i className="fas fa-home"></i>
                  <span>{getTranslation('dashboard', 'Dashboard')}</span>
                </Link>
              </li>
              <li>
                <Link to="/sintomi" className={getActivePageClass('/sintomi')}>
                  <i className="fas fa-heartbeat"></i>
                  <span>{getTranslation('symptoms', 'Sintomi')}</span>
                </Link>
              </li>
              <li>
                <Link to="/farmaci" className={getActivePageClass('/farmaci')}>
                  <i className="fas fa-pills"></i>
                  <span>{getTranslation('medications', 'Farmaci')}</span>
                </Link>
              </li>
              <li>
                <Link to="/benessere" className={getActivePageClass('/benessere')}>
                  <i className="fas fa-heart"></i>
                  <span>{getTranslation('wellness', 'Benessere')}</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className={getActivePageClass('/profile')}>
                  <i className="fas fa-user"></i>
                  <span>{getTranslation('profile', 'Profilo')}</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className={getActivePageClass('/settings')}>
                  <i className="fas fa-cog"></i>
                  <span>{getTranslation('settings', 'Impostazioni')}</span>
                </Link>
              </li>
              <li>
                <Link to="/assistente" className={getActivePageClass('/assistente')}>
                  <i className="fas fa-robot"></i>
                  <span>{getTranslation('aiAssistant', 'Assistente IA')}</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="sidebar-footer">
            <button 
              className="notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
              title={getTranslation('notifications', 'Notifiche')}
            >
              <i className="fas fa-bell"></i>
              <span>{getTranslation('notifications', 'Notifiche')}</span>
            </button>
            
            <button 
              className="assistant-button"
              onClick={() => setShowAIWidget(!showAIWidget)}
              title={getTranslation('quickAssistant', 'Assistente Rapido')}
            >
              <i className="fas fa-robot"></i>
              <span>{getTranslation('quickAssistant', 'Assistente Rapido')}</span>
            </button>
            
            <button 
              className="logout-button"
              onClick={handleLogout}
              title={getTranslation('logout', 'Esci dall\'applicazione')}
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>{getTranslation('logout', 'Esci')}</span>
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
      
      {/* Aggiungi le nuove rotte */}
      <Route path="/medication-reminders" element={
        <ProtectedRoute>
          <Layout>
            <MedicationReminder />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/symptom-analytics" element={
        <ProtectedRoute>
          <Layout>
            <SymptomAnalytics />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/appointments" element={
        <ProtectedRoute>
          <Layout>
            <AppointmentManager />
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